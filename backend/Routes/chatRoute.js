import express from 'express';
import createOrGetChat from '../Controllers/chatsController.js';
import authenticateToken from '../server.js';
import Chat from '../Models/chat.js';
import Message from '../Models/messages.js';
const router = express.Router();

router.post('/create-or-get', authenticateToken, createOrGetChat);

router.get('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId; 
  
      const chats = await Chat.find({ participants: userId })
        .populate('participants') 
        .sort({ updatedAt: -1 });
      
      const transformedChats = chats.map(chat => {
        const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);

        return {
          userId: otherParticipant._id,
          username: otherParticipant.anonymousUsername,
          pfp: otherParticipant.anonymousPfp,
          followersCount: otherParticipant.followersCount || 0,
          followingCount: otherParticipant.followingCount || 0,
          lastMessage: chat.lastMessage?.text || 'Start your conversation...',
          timestamp: chat.lastMessage?.timestamp || chat.createdAt,
          unread: 0, 
          chatId: chat._id
        };
      });
      console.log('Fetched chats for user:', userId, 'Chats:', transformedChats);
      res.status(200).json(transformedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ message: 'Server error while fetching chats' });
    }
  });

router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this chat' });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .limit(100); 

    const transformedMessages = messages.map(msg => ({
      id: msg._id,
      chatId: msg.chatId,
      senderId: msg.senderId,
      message: msg.text,
      timestamp: msg.createdAt,
      isCurrentUser: msg.senderId.toString() === userId
    }));

    res.status(200).json(transformedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
});

export default router;