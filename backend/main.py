from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from typing import Dict, Set

# Create a Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:5173']  # Only define CORS here
)

# Create FastAPI app
app = FastAPI()

# Create Socket.IO app
socket_app = socketio.ASGIApp(sio, app)

# Store active users and their session IDs
active_users: Dict[str, str] = {}  # {sid: username}
online_users: Set[str] = set()

# Socket.IO events
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    if sid in active_users:
        username = active_users[sid]
        online_users.remove(username)
        del active_users[sid]
        await sio.emit('user_left', {'username': username, 'online_users': list(online_users)})
    print(f"Client disconnected: {sid}")

@sio.event
async def join(sid, data):
    username = data.get('username')
    if username:
        active_users[sid] = username
        online_users.add(username)
        # Notify all clients about the new user
        await sio.emit('user_joined', {
            'username': username,
            'online_users': list(online_users)
        })
        return {'status': 'success', 'online_users': list(online_users)}
    return {'status': 'error', 'message': 'Username is required'}

@sio.event
async def message(sid, data):
    if sid in active_users:
        username = active_users[sid]
        message_data = {
            'username': username,
            'message': data['message'],
            'timestamp': data['timestamp']
        }
        await sio.emit('message', message_data)

# FastAPI routes
@app.get("/")
async def root():
    return {"message": "Leave Request System API"}

# Mount Socket.IO app
app.mount("/ws", socket_app)
