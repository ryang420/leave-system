import React, { useState, useEffect, useRef } from 'react'
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material'
import { io } from 'socket.io-client'

function App() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState(null)
  const [username, setUsername] = useState('')
  const [isJoined, setIsJoined] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const messageAreaRef = useRef(null)

  useEffect(() => {
    const newSocket = io('http://localhost:8000', {
      path: '/ws/socket.io'
    })
    
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket')
    })

    newSocket.on('message', (data) => {
      setMessages(prev => [...prev, data])
    })

    newSocket.on('user_joined', (data) => {
      setOnlineUsers(data.online_users)
      setMessages(prev => [...prev, {
        system: true,
        message: `${data.username} joined the chat`
      }])
    })

    newSocket.on('user_left', (data) => {
      setOnlineUsers(data.online_users)
      setMessages(prev => [...prev, {
        system: true,
        message: `${data.username} left the chat`
      }])
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.scrollTop = messageAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleJoin = () => {
    if (username.trim() && socket) {
      socket.emit('join', { username: username.trim() }, (response) => {
        if (response.status === 'success') {
          setIsJoined(true)
          setOnlineUsers(response.online_users)
        }
      })
    }
  }

  const handleSend = () => {
    if (newMessage.trim() && socket && isJoined) {
      socket.emit('message', {
        message: newMessage.trim(),
        timestamp: new Date().toISOString()
      })
      setNewMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isJoined) {
        handleJoin()
      } else {
        handleSend()
      }
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
      p: 2
    }}>
      <Container maxWidth="md" sx={{ my: 'auto' }}>
        <Dialog 
          open={!isJoined} 
          onClose={() => {}}
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <DialogTitle sx={{
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            Join Leave Request System Chat
          </DialogTitle>
          <DialogContent sx={{ mt: 2, minWidth: '300px' }}>
            <TextField
              autoFocus
              margin="dense"
              label="Enter your username"
              fullWidth
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleJoin}
              disabled={!username.trim()}
              variant="contained"
              fullWidth
            >
              Join Chat
            </Button>
          </DialogActions>
        </Dialog>

        <Grid container spacing={2}>
          <Grid item xs={9}>
            <Paper 
              elevation={3} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  p: 2, 
                  textAlign: 'center', 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500
                }}
              >
                Leave Request System
              </Typography>
              <Box 
                ref={messageAreaRef} 
                sx={{ 
                  height: '65vh',
                  overflowY: 'auto', 
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  bgcolor: '#ffffff'
                }}
              >
                {messages.map((msg, index) => (
                  msg.system ? (
                    <Box
                      key={index}
                      sx={{
                        py: 1,
                        px: 2,
                        textAlign: 'center',
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                        bgcolor: 'rgba(0, 0, 0, 0.04)',
                        borderRadius: 1,
                        alignSelf: 'center'
                      }}
                    >
                      {msg.message}
                    </Box>
                  ) : (
                    <Box
                      key={index}
                      sx={{
                        alignSelf: msg.username === username ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5
                      }}
                    >
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          px: 1,
                          color: 'text.secondary',
                          alignSelf: msg.username === username ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {msg.username}
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: msg.username === username ? 'primary.main' : 'grey.100',
                          color: msg.username === username ? 'white' : 'text.primary',
                          borderRadius: 2,
                          boxShadow: 1
                        }}
                      >
                        <Typography variant="body1">
                          {msg.message}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          px: 1,
                          color: 'text.secondary',
                          alignSelf: msg.username === username ? 'flex-end' : 'flex-start'
                        }}
                      >
                        {formatTime(msg.timestamp)}
                      </Typography>
                    </Box>
                  )
                ))}
              </Box>
              <Box 
                sx={{ 
                  p: 2, 
                  bgcolor: 'background.paper',
                  borderTop: 1,
                  borderColor: 'divider'
                }}
              >
                <Grid container spacing={1}>
                  <Grid item xs>
                    <TextField
                      fullWidth
                      variant="outlined"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={!isJoined}
                      size="small"
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || !isJoined}
                      sx={{ px: 3, height: '40px' }}
                    >
                      Send
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper 
              elevation={3} 
              sx={{ 
                height: '100%',
                borderRadius: 2,
                overflow: 'hidden'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  p: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500
                }}
              >
                Online Users ({onlineUsers.length})
              </Typography>
              <List sx={{ 
                overflow: 'auto',
                height: 'calc(65vh + 48px)',
                bgcolor: '#ffffff'
              }}>
                {onlineUsers.map((user, index) => (
                  <React.Fragment key={user}>
                    <ListItem>
                      <ListItemText 
                        primary={user} 
                        secondary={user === username ? '(You)' : ''}
                        primaryTypographyProps={{
                          fontWeight: user === username ? 600 : 400
                        }}
                      />
                    </ListItem>
                    {index < onlineUsers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default App
