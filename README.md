# Leave Request System

A modern leave request system with real-time chat functionality built using FastAPI and React.

## Features

- Real-time chat using FastAPI's native WebSocket support
- Modern, responsive UI optimized for desktop screens
- User presence tracking
- System notifications for user join/leave events
- Glassmorphic design with smooth animations

## Tech Stack

### Backend
- FastAPI (Web framework)
- Uvicorn (ASGI server)
- WebSockets (Native FastAPI WebSocket support)
- Python 3.8+

### Frontend
- React 18
- Material-UI (MUI) v5
- Native WebSocket API
- Styled Components (via MUI styled)

## Recent Updates

- Migrated from Socket.IO to FastAPI's native WebSocket support
- Enhanced UI with glassmorphism effects and modern design patterns
- Optimized layout for desktop screens
- Improved message display and user list components
- Added smooth animations and transitions

## Installation

### Backend Setup
1. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
```

2. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

### Frontend Setup
1. Install dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Environment Variables

### Backend
- No additional environment variables required

### Frontend
- No additional environment variables required

## Architecture

### WebSocket Implementation
The chat system uses FastAPI's built-in WebSocket support for real-time communication:
- Backend manages WebSocket connections through a `ConnectionManager` class
- Frontend uses the native WebSocket API for connection handling
- Messages are broadcasted to all connected clients
- System messages notify users of join/leave events

### UI Components
- Modern glassmorphic design with blur effects
- Responsive message bubbles with animations
- User list with avatars and online status
- Optimized layout for desktop screens
- Custom scrollbars and smooth transitions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
