# Leave Request System Chat

A real-time chat application built with React and FastAPI, designed for leave request communication.

## Features

- Real-time messaging using Socket.IO
- Multiple user support
- Modern UI with Material-UI
- User join/leave notifications
- Online users list
- Message timestamps
- Responsive design

## Tech Stack

### Frontend
- React (Vite)
- Material-UI
- Socket.IO Client

### Backend
- FastAPI
- Python Socket.IO
- Python 3.x

## Setup

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the server:
```bash
uvicorn main:app --reload
```

The backend server will run on http://localhost:8000

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend application will be available at http://localhost:5173

## Usage

1. Open the application in your browser
2. Enter your username to join the chat
3. Start sending messages
4. View online users in the sidebar
5. System notifications will appear when users join or leave

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
