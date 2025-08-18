import Chat from '../Models/chat.js';
import { getRandomGroupChatIcon } from '../Utils/randomName.js';

export default async function createOrGetChat(req, res) {
    try {
        const currentUserId = req.user.userId;
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ message: 'Participant ID is required' });
        }

        let existingChat = await Chat.findOne({
            participants: {
                $all: [currentUserId, participantId],
                $size: 2
            }
        });

        if (existingChat) {
            return res.json({ 
                chatId: existingChat._id,
                chat: existingChat,
                isNew: false 
            });
        }

        const newChat = new Chat({
            participants: [currentUserId, participantId],
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            lastMessage: {
                text: 'start chat',
                senderId: currentUserId
            }
        });

        await newChat.save();

        res.json({ 
            chatId: newChat._id,
            chat: newChat,
            isNew: true 
        });

    } catch (error) {
        console.error('Error creating/getting chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function createGroupChat(req, res) {
    try {
        const currentUserId = req.user.userId;
        const { participantIds, groupName } = req.body;

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
            return res.status(400).json({ message: 'At least one participant is required' });
        }

        const allParticipants = participantIds.includes(currentUserId) 
            ? participantIds 
            : [currentUserId, ...participantIds];

        let existingGroupChat = await Chat.findOne({
            participants: {
                $all: allParticipants,
                $size: allParticipants.length
            }
        });

        if (existingGroupChat) {
            return res.json({ 
                chatId: existingGroupChat._id,
                chat: existingGroupChat,
                isNew: false 
            });
        }
        const groupPfp = getRandomGroupChatIcon();
        const newGroupChat = new Chat({
            participants: allParticipants,
            isGroupChat: true,
            groupName: groupName || `Group with ${allParticipants.length} members`,
            groupPfp: groupPfp,
            lastMessage: {
                text: 'Group chat created',
                senderId: currentUserId
            }
        });

        await newGroupChat.save();

        res.json({ 
            chatId: newGroupChat._id,
            chat: newGroupChat,
            isNew: true 
        });

    } catch (error) {
        console.error('Error creating group chat:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
