from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List
import json

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Store active connections and their usernames
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.usernames: Dict[WebSocket, str] = {}

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[username] = websocket
        self.usernames[websocket] = username
        await self.broadcast_user_list()
        await self.broadcast_message(
            {"type": "system", "content": f"{username} joined the chat"}
        )

    async def disconnect(self, websocket: WebSocket):
        username = self.usernames.get(websocket)
        if username:
            del self.active_connections[username]
            del self.usernames[websocket]
            await self.broadcast_user_list()
            await self.broadcast_message(
                {"type": "system", "content": f"{username} left the chat"}
            )

    async def broadcast_message(self, message: dict):
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except WebSocketDisconnect:
                pass

    async def broadcast_user_list(self):
        users = list(self.active_connections.keys())
        for connection in self.active_connections.values():
            try:
                await connection.send_json({"type": "users", "users": users})
            except WebSocketDisconnect:
                pass


manager = ConnectionManager()


@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await manager.broadcast_message(
                {
                    "type": "chat",
                    "sender": username,
                    "content": message.get("content", ""),
                    "timestamp": message.get("timestamp", ""),
                }
            )
    except WebSocketDisconnect:
        await manager.disconnect(websocket)


# FastAPI routes
@app.get("/")
async def root():
    return {"message": "Leave Request System API"}
