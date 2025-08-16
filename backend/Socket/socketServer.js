import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../Models/messages.js';
import Chat from '../Models/chat.js';

const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173", 
      methods: ["GET", "POST"]
    }
  });
  
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    
    if (!token) {
      console.log('No token provided');
      return next(new Error("Unauthorized"));
    }
    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log('Token verified successfully, user:', payload.userId);
      socket.user = payload; 
      next();
    } catch (err) {
      console.log('Token verification failed:', err.message);
      next(new Error("Unauthorized"));
    }
  });

  io.on('connection', (socket) => {
    console.log("WebSocket connected! User ID:", socket.user?.userId);
    
    // Store user's current room
    socket.currentRoom = null;
  
    socket.on('sendMessage', async ({ chatId, text }) => {
      try {
        console.log(`User ${socket.user?.userId} sending message to chat ${chatId}:`, text);
        
        if (!chatId) {
          console.error('No chatId provided');
          socket.emit('error', { message: 'Chat ID is required' });
          return;
        }

        const message = await Message.create({
          chatId,
          senderId: socket.user.userId,
          text
        });
    
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: {
            text,
            senderId: socket.user.userId,
            timestamp: new Date()
          }
        });

        const messageToSend = {
          id: message._id,
          chatId: message.chatId,
          senderId: message.senderId,
          message: message.text, 
          timestamp: message.createdAt,
          isCurrentUser: socket.user.userId === message.senderId
        };

        const roomId = chatId.toString();
        
        // Get all sockets in this room
        const room = io.sockets.adapter.rooms.get(roomId);
        console.log(`Emitting message to room ${roomId}. Users in room:`, room ? room.size : 0);
        
        // Emit to the specific chat
        io.to(roomId).emit('message', messageToSend);
        console.log(`Message sent to room ${roomId}:`, messageToSend);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('join', (roomId) => {
      try {
     
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
          console.log(`User ${socket.user?.userId} left room: ${socket.currentRoom}`);
        }
        
        const roomIdStr = roomId.toString();
        socket.join(roomIdStr);
        socket.currentRoom = roomIdStr;
        
        console.log(`User ${socket.user?.userId} joined room: ${roomIdStr}`);
        
        const room = io.sockets.adapter.rooms.get(roomIdStr);
        console.log(`Room ${roomIdStr} now has ${room ? room.size : 0} users`);
        
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });
  
    socket.on('leave', (roomId) => {
      try {
        const roomIdStr = roomId.toString();
        socket.leave(roomIdStr);
        
        if (socket.currentRoom === roomIdStr) {
          socket.currentRoom = null;
        }
        
        console.log(`User ${socket.user?.userId} left room: ${roomIdStr}`);
        
  
        const room = io.sockets.adapter.rooms.get(roomIdStr);
        console.log(`Room ${roomIdStr} now has ${room ? room.size : 0} users`);
        
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });
    
    socket.on('disconnect', () => {
      console.log("WebSocket disconnected! User ID:", socket.user?.userId);
      if (socket.currentRoom) {
        console.log(`User ${socket.user?.userId} was in room: ${socket.currentRoom}`);
      }
    });
  });  
  return io;
};

export default initSocket;



