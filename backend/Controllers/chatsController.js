import Chat from '../Models/chat.js';

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
