import json
import os
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2AuthorizationCodeBearer
from starlette.config import Config
from starlette.middleware.sessions import SessionMiddleware
import requests
from dotenv import load_dotenv
import json
import os
import time
from fastapi import BackgroundTasks
from contextlib import asynccontextmanager
import threading
from threading import Semaphore

BACKUP_FILE = "backup.json"

# Discord OAuth2 configuration
DISCORD_CLIENT_ID = os.getenv("DISCORD_CLIENT_ID")
DISCORD_CLIENT_SECRET = os.getenv("DISCORD_CLIENT_SECRET")
DISCORD_REDIRECT_URI = os.getenv("DISCORD_REDIRECT_URI")

DATABASE = {}  # Simple in-memory database to store user data
BACKUP_INTERVAL = 60  # Interval in seconds to save the database to a file
stop_event = threading.Event()
def backup_database():
    """Periodically saves the database to a JSON file."""
    while not stop_event.is_set():
        with open(BACKUP_FILE, "w") as file:
            json.dump(DATABASE, file)
        stop_event.wait(BACKUP_INTERVAL)

    # backup the database one last time before stopping
    with open(BACKUP_FILE, "w") as file:
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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Session middleware
app.add_middleware(SessionMiddleware, secret_key="your_secret_key")


@app.get("/")
async def home():
    return {"message": "Welcome to the FastAPI Discord Auth Example"}

@app.get("/login")
async def login():
    discord_oauth_url = (
        f"https://discord.com/api/oauth2/authorize?client_id={DISCORD_CLIENT_ID}"
        f"&redirect_uri={DISCORD_REDIRECT_URI}&response_type=code&scope=identify"
    )
    return RedirectResponse(discord_oauth_url)

@app.get("/callback")
async def callback(request: Request, code: str):
    """Handles Discord OAuth2 callback."""
    token_url = "https://discord.com/api/oauth2/token"
    data = {
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": DISCORD_REDIRECT_URI,
        "scope": "identify"
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    response = requests.post(token_url, data=data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to authenticate with Discord")

    token_data = response.json()
    access_token = token_data.get("access_token")

    user_data = get_discord_user(access_token)
    if not user_data:
        raise HTTPException(status_code=400, detail="Failed to fetch user data")

    user_id = user_data["id"]
    request.session["user"] = user_id

    if user_id not in DATABASE:
        DATABASE[user_id] = {"data": {}}

    return RedirectResponse("/dashboard.html")

def get_discord_user(access_token):
    """Fetches Discord user data using the access token."""
    user_url = "https://discord.com/api/users/@me"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(user_url, headers=headers)

    if response.status_code == 200:
        return response.json()
    return None

@app.get("/user")
async def get_user(request: Request):
    """Gets the currently logged-in user's ID."""
    user_id = request.session.get("user")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")
    return {"user_id": user_id, "data": DATABASE.get(user_id, {}).get("data", {})}

@app.post("/store")
async def store_data(request: Request):
    """Stores a JSON object for the logged-in user."""
    user_id = request.session.get("user")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not logged in")

    data = await request.json()
    DATABASE[user_id]["data"] = data
    return {"message": "Data stored successfully"}

@app.get("/logout")
async def logout(request: Request):
    """Logs out the user."""
    request.session.clear()
    return RedirectResponse("/")


