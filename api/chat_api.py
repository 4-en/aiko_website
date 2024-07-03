# websocket chat server using FastAPI

from fastapi import FastAPI, WebSocket, APIRouter, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import os
import time
import asyncio
import json

LOG_DIR = "logs"

if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)


class Message:
    def __init__(self, username: str, message: str):
        self.username = username
        self.message = message
        self.timestamp = time.time()

    def __str__(self):
        return f"{self.username}: {self.message}"
    
    def csv(self):
        return f"{self.timestamp},{self.username},{self.message}\n"
    
    def json(self):
        return json.dumps({
            "timestamp": self.timestamp,
            "username": self.username,
            "message": self.message
        })
    
    @staticmethod
    def from_csv(csv_string: str):
        timestamp, username, message = csv_string.strip().split(",")
        message = Message(username, message)
        message.timestamp = float(timestamp)
        return message
    
    @staticmethod
    def from_dict(data: dict):
        message = Message(data["username"], data["message"])
        if "timestamp" in data:
            message.timestamp = data["timestamp"]
        else:
            message.timestamp = time.time()
        return message
    
    def __lt__(self, other):
        return self.timestamp < other.timestamp
    
    def __eq__(self, other):
        return self.timestamp == other.timestamp
    
    def __gt__(self, other):
        return self.timestamp > other.timestamp
    
    def __le__(self, other):
        return self.timestamp <= other.timestamp
    
    def __ge__(self, other):
        return self.timestamp >= other.timestamp
    
    def __ne__(self, other):
        return self.timestamp != other.timestamp
    
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Message):
        message = message.json()
        for connection in self.active_connections:
            await connection.send_text(message)
    

chat_log = []
last_saved = time.time()

def save_chat_log():
    global chat_log
    global last_saved

    date = time.strftime("%Y-%m-%d")
    filename = f"{LOG_DIR}/{date}.csv"
    if os.path.exists(filename):
        with open(filename, "a") as file:
            for message in chat_log:
                if message.timestamp > last_saved:
                    file.write(message.csv())
    else:
        with open(filename, "w") as file:
            for message in chat_log:
                if message.timestamp > last_saved:
                    file.write(message.csv())

    chat_log = chat_log[-100:]
    last_saved = time.time()




chat_app = APIRouter()


@chat_app.get("/")
async def get():
    return HTMLResponse("""
        <html>
            <body>
                <h1>Chat Server</hh1>
                <p>Open the browser console to see the chat messages.</p>
                <script>
                    var ws = new WebSocket("ws://localhost:8000/ws/chat");
                    ws.onmessage = function(event) {
                        console.log(event.data);
                    };
                    
                    function sendMessage(name, message) {
                        ws.send(JSON.stringify({username: name, message: message}));
                    }
                        
                    function getChatLog() {
                        fetch("/chat/log")
                            .then(response => response.json())
                            .then(data => console.log(data));
                    }
                </script>
            </body>
        </html>
    """)

manager = ConnectionManager()

# get chat log
@chat_app.get("/chat/log")
async def get_chat_log():
    return [message.json() for message in chat_log]


# chat websocket
@chat_app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = Message.from_dict(json.loads(data))
            chat_log.append(message)
            await manager.broadcast(message)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    app = FastAPI()
    app.include_router(chat_app)
    uvicorn.run(app, host="0.0.0.0", port=8000)


