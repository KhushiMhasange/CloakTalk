import express from 'express';
import createOrGetChat, { createGroupChat } from '../Controllers/chatsController.js';
import authenticateToken from '../server.js';
import Chat from '../Models/chat.js';
import Message from '../Models/messages.js';
const router = express.Router();

router.post('/create-or-get', authenticateToken, createOrGetChat);

router.post('/create-group', authenticateToken, createGroupChat);

router.get('/', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId; 
  
      const chats = await Chat.find({ participants: userId })
        .populate('participants') 
        .sort({ updatedAt: -1 });
      
      const transformedChats = chats.map(chat => {
        if (chat.isGroupChat) {
       
          const otherParticipants = chat.participants.filter(p => p._id.toString() !== userId);
          return {
            chatId: chat._id,
            isGroupChat: true,
            groupName: chat.groupName,
            groupPfp : chat.groupPfp,
            participants: otherParticipants.map(p => ({
              userId: p._id,
              username: p.anonymousUsername,
              pfp: p.anonymousPfp
            })),
            participantCount: chat.participants.length,
            lastMessage: chat.lastMessage?.text || 'Group chat created',
            timestamp: chat.lastMessage?.timestamp || chat.createdAt,
            unread: 0
          };
        } else {
          const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
          return {
            chatId: chat._id,
            isGroupChat: false,
            userId: otherParticipant._id,
            username: otherParticipant.anonymousUsername,
            pfp: otherParticipant.anonymousPfp,
            followersCount: otherParticipant.followersCount || 0,
            followingCount: otherParticipant.followingCount || 0,
            lastMessage: chat.lastMessage?.text || 'Start your conversation...',
            timestamp: chat.lastMessage?.timestamp || chat.createdAt,
            unread: 0
          };
        }
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

router.get('/:chatId/details', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.userId;

    const chat = await Chat.findById(chatId).populate('participants');
    if (!chat || !chat.participants.includes(userId)) {
      return res.status(403).json({ message: 'Access denied to this chat' });
    }

    if (chat.isGroupChat) {
      const otherParticipants = chat.participants.filter(p => p._id.toString() !== userId);
      res.json({
        chatId: chat._id,
        isGroupChat: true,
        groupName: chat.groupName,
        participants: otherParticipants.map(p => ({
          userId: p._id,
          username: p.anonymousUsername,
          pfp: p.anonymousPfp
        })),
        participantCount: chat.participants.length,
        createdAt: chat.createdAt
      });
    } else {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
      res.json({
        chatId: chat._id,
        isGroupChat: false,
        userId: otherParticipant._id,
        username: otherParticipant.anonymousUsername,
        pfp: otherParticipant.anonymousPfp
      });
    }
  } catch (error) {
    console.error('Error fetching chat details:', error);
    res.status(500).json({ message: 'Server error while fetching chat details' });
  }
});

export default router;