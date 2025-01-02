import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState(''); 
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const connectWebSocket = (user) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${user}`);
    ws.onopen = () => {
      console.log('WebSocket connection established');
      ws.send(JSON.stringify({ type: 'join', username: user }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'users') {
        setOnlineUsers(data.users);
      } else if (data.type === 'chat') {
        setMessages(prev => [...prev, data]);
      } else if (data.type === 'system') {
        setMessages(prev => [...prev, { type: 'system', content: data.content }]);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setUsername('');
      setWsConnection(null);
    };

    setWsConnection(ws);
  };

  const handleJoin = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername);
      connectWebSocket(tempUsername);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (wsConnection && newMessage.trim()) {
      wsConnection.send(JSON.stringify({
        type: 'chat',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      }));
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl h-[90vh] min-h-[800px] max-h-[1200px] flex gap-3">
        <main className="flex-1 max-w-[75%] flex flex-col overflow-hidden rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm">
          <header className="p-6 border-b border-gray-200/10 bg-primary/5">
            <h1 className="text-2xl font-semibold text-gray-800">Leave Request System Chat</h1>
          </header>

          <div className="flex-1 p-6 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin' }} ref={messageContainerRef}>
            {messages.map((msg, index) => (
              msg.type === 'system' ? (
                <div key={index} className="text-center text-gray-500 italic p-2 bg-primary/5 rounded-lg">
                  {msg.content}
                </div>
              ) : (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                    {msg.sender[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-gray-900">{msg.sender}</span>
                      <span className="text-sm text-gray-500">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-700">{msg.content}</p>
                  </div>
                </div>
              )
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="input flex-1"
                disabled={!wsConnection}
              />
              <button type="submit" className="btn btn-primary" disabled={!wsConnection || !newMessage.trim()}>
                Send
              </button>
            </div>
          </form>
        </main>

        <aside className="w-1/4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Online Users ({onlineUsers.length})</h2>
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user} className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                  {user[0]}
                </div>
                <span className="text-gray-700">{user}</span>
                {user === username && <span className="text-sm text-gray-500">(You)</span>}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {!username && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Join the Chat</h2>
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Enter your username..."
              className="input mb-4"
              autoFocus
            />
            <button
              onClick={handleJoin}
              className="btn btn-primary w-full"
              disabled={!tempUsername.trim()}
            >
              Join Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
