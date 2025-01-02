import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, TextField, Button, List, ListItem, ListItemText, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Box, IconButton, Avatar } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import PersonIcon from '@mui/icons-material/Person';

const AppContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const ChatContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '90vh',
  maxHeight: '1200px',
  minHeight: '800px',
  display: 'flex',
  gap: theme.spacing(3),
}));

const MainChat = styled(Paper)(({ theme }) => ({
  flex: '1 1 auto',
  maxWidth: '75%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  background: alpha('#fff', 0.8),
  backdropFilter: 'blur(10px)',
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha(theme.palette.primary.main, 0.05),
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '4px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, isself }) => ({
  maxWidth: '60%',
  minWidth: '200px',
  alignSelf: isself ? 'flex-end' : 'flex-start',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  animation: isself ? 'slideLeft 0.3s ease' : 'slideRight 0.3s ease',
  '@keyframes slideRight': {
    from: { transform: 'translateX(-20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  '@keyframes slideLeft': {
    from: { transform: 'translateX(20px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
}));

const MessageContent = styled(Paper)(({ theme, isself }) => ({
  padding: theme.spacing(2, 3),
  borderRadius: theme.spacing(2),
  background: isself ? theme.palette.primary.main : '#fff',
  color: isself ? '#fff' : 'inherit',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  fontSize: '1rem',
  lineHeight: 1.5,
  '&:before': {
    content: '""',
    position: 'absolute',
    bottom: '12px',
    [isself ? 'right' : 'left']: -10,
    borderStyle: 'solid',
    borderWidth: '10px 10px 0',
    borderColor: `${isself ? theme.palette.primary.main : '#fff'} transparent transparent`,
    transform: isself ? 'rotate(-45deg)' : 'rotate(45deg)',
  },
}));

const SystemMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  color: theme.palette.text.secondary,
  padding: theme.spacing(1.5),
  margin: theme.spacing(1.5, 0),
  fontSize: '0.95rem',
  fontStyle: 'italic',
  background: alpha(theme.palette.primary.main, 0.05),
  borderRadius: theme.spacing(1.5),
  maxWidth: '70%',
  alignSelf: 'center',
  animation: 'fadeIn 0.5s ease',
  '@keyframes fadeIn': {
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
}));

const UsersList = styled(Paper)(({ theme }) => ({
  width: '350px',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  background: alpha('#fff', 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
}));

const UsersHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: alpha(theme.palette.primary.main, 0.1),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const UserListContent = styled(List)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '3px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.3),
    },
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  background: alpha('#fff', 0.5),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    background: alpha('#fff', 0.9),
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    minWidth: '400px',
  },
}));

function App() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [showDialog, setShowDialog] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [wsConnection, setWsConnection] = useState(null);
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const connectWebSocket = (username) => {
    const ws = new WebSocket(`ws://localhost:8000/ws/${username}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'chat':
          setMessages(prev => [...prev, {
            type: 'chat',
            sender: data.sender,
            content: data.content,
            timestamp: data.timestamp
          }]);
          break;
        case 'system':
          setMessages(prev => [...prev, {
            type: 'system',
            content: data.content
          }]);
          break;
        case 'users':
          setOnlineUsers(data.users);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
      setShowDialog(true);
    };

    setWsConnection(ws);
  };

  const handleJoin = () => {
    if (username.trim()) {
      connectWebSocket(username);
      setShowDialog(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && wsConnection) {
      const messageData = {
        content: newMessage,
        timestamp: new Date().toISOString()
      };
      wsConnection.send(JSON.stringify(messageData));
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
    <AppContainer maxWidth="xl">
      <ChatContainer>
        <MainChat elevation={0}>
          <ChatHeader>
            <Typography variant="h5" sx={{ fontWeight: 500 }}>
              Leave Request System Chat
            </Typography>
          </ChatHeader>
          <MessageContainer ref={messageContainerRef}>
            {messages.map((msg, index) => (
              msg.type === 'system' ? (
                <SystemMessage key={index}>
                  {msg.content}
                </SystemMessage>
              ) : (
                <MessageBubble key={index} isself={msg.sender === username}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      px: 1.5, 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    {msg.sender}
                  </Typography>
                  <MessageContent isself={msg.sender === username}>
                    <Typography>{msg.content}</Typography>
                  </MessageContent>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      px: 1.5, 
                      color: 'text.secondary',
                      alignSelf: msg.sender === username ? 'flex-end' : 'flex-start',
                      fontSize: '0.85rem'
                    }}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </MessageBubble>
              )
            ))}
          </MessageContainer>
          <InputContainer>
            <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="medium"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={!wsConnection}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha('#fff', 0.8),
                    fontSize: '1rem',
                  }
                }}
              />
              <IconButton 
                type="submit" 
                color="primary" 
                disabled={!wsConnection || !newMessage.trim()}
                sx={{ 
                  width: 56,
                  height: 56,
                  bgcolor: theme => alpha(theme.palette.primary.main, 0.1),
                  '&:hover': { 
                    bgcolor: theme => alpha(theme.palette.primary.main, 0.2)
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </InputContainer>
        </MainChat>

        <UsersList elevation={0}>
          <UsersHeader>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Online Users ({onlineUsers.length})
            </Typography>
          </UsersHeader>
          <UserListContent>
            {onlineUsers.map((user) => (
              <ListItem key={user} sx={{ py: 1.5 }}>
                <Avatar 
                  sx={{ 
                    mr: 2,
                    width: 48,
                    height: 48,
                    bgcolor: user === username ? 'primary.main' : 'grey.300',
                    fontSize: '1.2rem'
                  }}
                >
                  <PersonIcon fontSize="inherit" />
                </Avatar>
                <ListItemText 
                  primary={user} 
                  secondary={user === username ? '(You)' : null}
                  primaryTypographyProps={{
                    fontWeight: user === username ? 600 : 400,
                    fontSize: '1.1rem'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.9rem'
                  }}
                />
              </ListItem>
            ))}
          </UserListContent>
        </UsersList>
      </ChatContainer>

      <StyledDialog open={showDialog} onClose={() => {}} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontWeight: 500,
          fontSize: '1.5rem',
          pb: 1
        }}>
          Join the Chat
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
            placeholder="Enter your username..."
            sx={{
              mt: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '1.1rem',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2 }}>
          <Button 
            onClick={handleJoin} 
            disabled={!username.trim()}
            variant="contained"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 6,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Join Chat
          </Button>
        </DialogActions>
      </StyledDialog>
    </AppContainer>
  );
}

export default App;
