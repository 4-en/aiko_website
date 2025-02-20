import json
import os
from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import requests
from dotenv import load_dotenv
import json
import os
import time
from fastapi import BackgroundTasks
from contextlib import asynccontextmanager
import threading
from threading import Semaphore
from uuid import uuid4
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel, Field


class User(BaseModel):
    id: str
    name: str
    username: str
    global_name: str = ""

load_dotenv()

DB_NAME = "database.json"

# Discord OAuth2 configuration
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")
FRONTEND_URL = os.getenv("FRONTEND_URL")

DATABASE = {}  # Simple in-memory database to store user data
SESSION_DB = {}  # Simple in-memory database to store session data
SESSION_DB_REVERSE = {}  # Simple in-memory database to store session data

# load database from file
try:
    with open(DB_NAME, "r") as file:
        DATABASE = json.load(file)
except FileNotFoundError:
    print("Database file not found, creating a new one.")
    pass
except json.JSONDecodeError:
    print("Database file is empty or corrupted, creating a new one.")
    DATABASE = {}


BACKUP_INTERVAL = 60  # Interval in seconds to save the database to a file
stop_event = threading.Event()
def backup_database():
    """Periodically saves the database to a JSON file."""
    while not stop_event.is_set():
        with open(DB_NAME, "w") as file:
            json.dump(DATABASE, file)
        stop_event.wait(BACKUP_INTERVAL)

    # backup the database one last time before stopping
    with open(DB_NAME, "w") as file:
        json.dump(DATABASE, file)

backup_tread = threading.Thread(target=backup_database, daemon=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    backup_tread.start()
    yield
    # shutdown
    stop_event.set()
    backup_tread.join()



load_dotenv()

app = FastAPI(lifespan=lifespan)

# CORS middleware for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




def unset_token_redirect(redirect_to: str = "/"):
    response = RedirectResponse(redirect_to)
    response.delete_cookie("session_token")
    return response

def unset_token_json():
    response = JSONResponse({"message": "Logged out"})
    response.delete_cookie("session_token")
    return response

def validate_session(request: Request):
    """Validates the session token from cookies."""
    session_token = request.cookies.get("session_token")
    if not session_token or session_token not in SESSION_DB:
        return False
    
    return session_token

def set_data(user_id: str, key: str, value: any):
    if not user_id in DATABASE:
        DATABASE[user_id] = {}
    
    sub_keys = key.split(".")
    data = DATABASE[user_id]
    for sub_key in sub_keys[:-1]:
        if not sub_key in data:
            data[sub_key] = {}
        data = data[sub_key]

    # check if the key already exists
    if sub_keys[-1] in data:
        # check if value type is the same
        if not isinstance(data[sub_keys[-1]], type(value)):
            raise HTTPException(status_code=400, detail="Value type mismatch")
        
    data[sub_keys[-1]] = value

def get_data(user_id: str, key: str, default: any = None):
    if not user_id in DATABASE:
        return default
    
    sub_keys = key.split(".")
    data = DATABASE[user_id]
    for sub_key in sub_keys[:-1]:
        if not sub_key in data:
            return default
        data = data[sub_key]

    return data.get(sub_keys[-1], default)


@app.get("/")
async def home():
    # send basic html page
    html = """
    <html>
    <head>
    <title>Discord OAuth2 Test</title>
    </head>
    <body>
    <h1>Discord OAuth2 Test</h1>
    <p>Click the button below to login with Discord:</p>
    <a href="/login"><button>Login with Discord</button></a>
    </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=200)


# websocket test for chat
from queue import Queue
ws_clients = []
ws_semaphore = Semaphore()
MAX_CHAT_LOG = 100
chat_log = Queue(maxsize=MAX_CHAT_LOG)


@app.websocket("/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    # Extract session_token from cookies
    session_cookie = websocket.headers.get("cookie")
    session_token = None

    if session_cookie:
        cookies = {c.split("=")[0]: c.split("=")[1] for c in session_cookie.split("; ")}
        session_token = cookies.get("session_token")

    if not session_token or session_token not in SESSION_DB:
        await websocket.close()
        return
    
    user_id = SESSION_DB[session_token]
    if user_id not in DATABASE:
        await websocket.close()
        return
    
    name = DATABASE[user_id]["user"]["name"]
    if not name:
        await websocket.close()
        return
    
    # Add to connected clients
    ws_semaphore.acquire()
    ws_clients.append(websocket)
    ws_semaphore.release()

    print("Connected:", name)

    try:
        while True:
            print("Waiting for message")
            data = await websocket.receive_text()
            message = f"{name}: {data}"
            print("Received:", message)  # Debugging received messages
            
            ws_semaphore.acquire()
            
            # Add to chat log
            if chat_log.full():
                chat_log.get()
            chat_log.put(message)  # Store full message

            # Broadcast to all clients
            to_remove = []
            for client in ws_clients[:]:  
                try:
                    await client.send_text(message)
                except WebSocketDisconnect:
                    to_remove.append(client)

            # Remove disconnected clients
            for client in to_remove:
                ws_clients.remove(client)

            ws_semaphore.release()
    
    except WebSocketDisconnect:
        ws_semaphore.acquire()
        ws_clients.remove(websocket)  # Remove client from the list safely
        ws_semaphore.release()

    print("Disconnected:", name)



# get chat history
@app.get("/chat_history")
async def chat_history():
    # return as list of strings
    return list(chat_log.queue)

@app.get("/login")
async def login(redirect: str = "/"):
    discord_oauth_url = (
        f"https://discord.com/api/oauth2/authorize?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={DISCORD_REDIRECT_URI}&response_type=code&scope=identify"
        f"&state={redirect}"
    )
    return RedirectResponse(discord_oauth_url)

@app.get("/callback")
async def callback(request: Request, code: str, state: str="/"):
    """Handles Discord OAuth2 callback."""
    token_url = "https://discord.com/api/oauth2/token"
    data = {
    "client_id": DISCORD_CLIENT_ID,
    "client_secret": DISCORD_CLIENT_SECRET,
    "grant_type": "authorization_code",
    "code": code,  # This is the OAuth code from Discord
    "redirect_uri": DISCORD_REDIRECT_URI,
    "scope": "identify"
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(token_url, data=data, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Discord OAuth failed: {response.text}")

    token_data = response.json()
    access_token = token_data.get("access_token")

    user_data = get_discord_user(access_token)
    if not user_data:
        raise HTTPException(status_code=400, detail="Failed to fetch user data")

    user_id = user_data["id"]
    user_name = user_data.get("username")
    global_name = user_data.get("global_name")

    display_name = global_name or user_name or "Unknown"

    if user_id not in DATABASE:
        DATABASE[user_id] = {"data": {}}

    # Generate a session token (UUID) for the user
    session_token = str(uuid4())

    # Store session in backend memory

    # first check if the user already has a session, if so, remove it
    if user_id in SESSION_DB_REVERSE:
        old_session_token = SESSION_DB_REVERSE[user_id]
        del SESSION_DB[old_session_token]


    SESSION_DB[session_token] = user_id
    SESSION_DB_REVERSE[user_id] = session_token

    # add to db
    user = User(id=user_id, name=display_name, username=user_name, global_name=global_name)
    
    if not user_id in DATABASE:
        DATABASE[user_id] = {}

    set_data(user_id, "user", user.model_dump())

    # Redirect back to the frontend
    response = RedirectResponse(f"{FRONTEND_URL}{state}")
    response.set_cookie("session_token", session_token, httponly=True, secure=True, samesite="none", max_age=60*60*24*31)
    return response

def get_discord_user(access_token):
    """Fetches Discord user data using the access token."""
    user_url = "https://discord.com/api/users/@me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(user_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    return None

@app.get("/debug-cookies")
async def debug_cookies(request: Request):
    return JSONResponse({"cookies": request.cookies})

@app.get("/user")
async def get_user(request: Request):
    """Check if the user is logged in (without exposing user ID)"""
    session_token = request.cookies.get("session_token")
    
    if not session_token or session_token not in SESSION_DB:
        return JSONResponse({"logged_in": False}, status_code=401)
    
    user_id = SESSION_DB[session_token]
    name = get_data(user_id, "user.name", "Unknown")
    
    return {
            "logged_in": True,
            "name": name
            }


@app.post("/store")
async def store_data(request: Request):
    """Store data securely for a logged-in user"""
    session_token = request.cookies.get("session_token")

    if not session_token or session_token not in SESSION_DB:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = SESSION_DB[session_token]  # Retrieve user ID from session
    data = await request.json()

    # Save data associated with this user
    DATABASE[user_id]["data"] = data

    return {"message": "Data stored successfully"}

from wc_highscores import WCHighscores
# init from database
wc_highscores = WCHighscores()
for user_id, user_data in DATABASE.items():
    wc_sim = user_data.get("wc_sim", None)
    if wc_sim:
        wc_highscores.update_player(user_id, user_data["user"]["name"], wc_sim)

@app.post("/save_wc_sim")
async def save_wc_sim(request: Request):
    """Store data securely for a logged-in user"""
    session_token = request.cookies.get("session_token")

    if not session_token or session_token not in SESSION_DB:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = SESSION_DB[session_token]

    raw_body = await request.body()

    body_utf8 = raw_body.decode("utf-8")
    
    if not raw_body or raw_body.strip() == b"":  # Check if the body is empty
        raise HTTPException(status_code=400, detail="Request body is empty")

    try:
        data = json.loads(raw_body.decode("utf-8"))  # Manually parse JSON
    except json.JSONDecodeError as e:
        print("JSON Decode Error:", str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    existing_data = get_data(user_id, "wc_sim", None)

    if existing_data and existing_data.get("saveId", None):
        # TODO: maybe do some checks to avoid overwriting data
        save_id = data.get("saveId", None) # unique id for each save
        passed_time = data.get("time", 0) # time passed in a save
        if save_id:
            existing_save_id = existing_data.get("saveId", None)
            existing_passed_time = existing_data.get("time", 0)
            if existing_save_id and existing_save_id != save_id:
                raise HTTPException(status_code=400, detail="Tried to overwrite existing save with a different saveId. Reset the save first.")
            if existing_passed_time > passed_time:
                raise HTTPException(status_code=400, detail="Tried to save with a lower time than existing save. Did the save not load properly from the server?")
        else:
            raise HTTPException(status_code=400, detail="saveId is required to save data")
        

    # if were here, there is either no existing data or the new data is the newer version of the existing data
    set_data(user_id, "wc_sim", data)

    # update highscores
    wc_highscores.update_player(user_id, DATABASE[user_id]["user"]["name"], data)

    return {"message": "Data stored successfully"}

@app.post("/reset_wc_sim")
async def reset_wc_sim(request: Request):
    """Store data securely for a logged-in user"""
    session_token = request.cookies.get("session_token")

    if not session_token or session_token not in SESSION_DB:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = SESSION_DB[session_token]

    set_data(user_id, "wc_sim", {})

    return {"message": "Data reset successfully"}

@app.get("/load_wc_sim")
async def load_wc_sim(request: Request):
    """Store data securely for a logged-in user"""
    session_token = request.cookies.get("session_token")

    if not session_token or session_token not in SESSION_DB:
        raise HTTPException(status_code=401, detail="Not logged in")

    user_id = SESSION_DB[session_token]

    data = get_data(user_id, "wc_sim", {})

    return data

@app.get("/wc_player_highscores")
async def wc_player_highscores():
    return wc_highscores.get_xp_highscores()

@app.get("/wc_character_highscores")
async def wc_character_highscores():
    return wc_highscores.get_character_highscores()


@app.get("/logout")
async def logout(request: Request):
    """Clears user session on logout"""
    session_token = request.cookies.get("session_token")

    if session_token and session_token in SESSION_DB:
        user_id = SESSION_DB[session_token]
        if user_id in SESSION_DB_REVERSE:
            del SESSION_DB_REVERSE[user_id]
        del SESSION_DB[session_token]  # Remove session from backend

    

    response = RedirectResponse(FRONTEND_URL)
    response.delete_cookie("session_token")  # Remove cookie from frontend
    return response


