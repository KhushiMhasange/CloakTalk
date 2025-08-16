import { useState, useRef, useEffect, useContext } from 'react';
import {UserContext} from '../context/userContext';
import { useLocation } from 'react-router-dom';
import axiosInstance from  '../../axiosInstance';
import UserSearchTrigger from './UserSearch';
import { io } from "socket.io-client";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faUserPlus } from '@fortawesome/free-solid-svg-icons';


export default function Chats() {
  const { user } = useContext(UserContext);
  //info about the current url, like state data passed (during navigation)
  const location = useLocation(); 
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);
  const [chatUsers,setChatUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      console.log("No token found, socket connection failed");
      return;
    }
    
    socketRef.current = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected successfully!');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error("Socket connection error:", err.message);
      
      if (err.message === "Unauthorized") {
        console.log("Token expired, reconnecting...");
        //token expiration logic
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
      
      // Clean up temporary messages on error
      if (error.message === 'Failed to send message') {
        cleanupTempMessages();
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user?.userId]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axiosInstance.get(`/api/chats`);
        setChatUsers(res.data); 
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };
  
    fetchChats();
  }, []);   
  
  useEffect(() => {
    if (location.state?.selectedUser) {
      const selectedUser = location.state.selectedUser;
      
      const existingChat = chatUsers.find(chatUser => 
        chatUser.userId === selectedUser._id
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        fetchMessages(existingChat.chatId);
      } else {
        createNewChat(selectedUser);
      }
      
      window.history.replaceState({}, document.title);
    }
  }, [chatUsers, location.state]);

  const createNewChat = async (selectedUser) => {
    try {
      const response = await axiosInstance.post('/api/chats/create-or-get', {
        participantId: selectedUser._id
      });
      
      const newChat = {
        userId: selectedUser._id,
        username: selectedUser.anonymousUsername,
        pfp: selectedUser.anonymousPfp,
        followersCount: selectedUser.followersCount,
        followingCount: selectedUser.followingCount,
        lastMessage: 'Start your conversation...',
        timestamp: new Date(),
        unread: 0,
        chatId: response.data.chatId
      };
      
      setChatUsers(prev => [...prev, newChat]);
      setSelectedChat(newChat);
      
      socketRef.current?.emit('join', response.data.chatId);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axiosInstance.get(`/api/chats/${chatId}/messages`);
      setMessages(prev => ({
        ...prev,
        [chatId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };


  const handleSendMessage = () => {
    if (message.trim() && selectedChat) {
      const tempId = `temp_${Date.now()}_${Math.random()}`;
      
      const newMessage = {
        id: tempId,
        chatId: selectedChat.chatId,
        senderId: user?.userId,
        message: message.trim(),
        timestamp: new Date(),
        isCurrentUser: true,
        isTemp: true
      };

      socketRef.current?.emit('sendMessage', {
        chatId: selectedChat.chatId, 
        text: message.trim()
      });
      
      setMessages(prev => ({
        ...prev,
        [selectedChat.chatId]: [...(prev[selectedChat.chatId] || []), newMessage]
      }));
      
      setTimeout(() => {
        setMessages(prev => {
          const chatId = selectedChat.chatId;
          if (prev[chatId]) {
            const updatedMessages = prev[chatId].filter(msg => msg.id !== tempId);
            return {
              ...prev,
              [chatId]: updatedMessages
            };
          }
          return prev;
        });
      }, 5000);
      
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (socketRef.current) {
      //reciving message
      socketRef.current.on('message', (message) => {
        
        setMessages(prev => {
          const chatId = message.chatId;
          
          // replace temp message
          const isFromCurrentUser = message.senderId === user?.userId;
          
          if (isFromCurrentUser) {
            const tempMessageIndex = prev[chatId]?.findIndex(msg => 
              msg.isTemp && 
              msg.message === message.message && 
              msg.senderId === message.senderId
            );
            
            if (tempMessageIndex !== undefined && tempMessageIndex !== -1) {
              console.log('Replacing temporary message with real one:', message);
              const updatedMessages = [...(prev[chatId] || [])];
              updatedMessages[tempMessageIndex] = {
                id: message.id,
                chatId: message.chatId,
                senderId: message.senderId,
                message: message.message,
                timestamp: message.timestamp,
                isCurrentUser: true,
                isTemp: false
              };
              
              return {
                ...prev,
                [chatId]: updatedMessages
              };
            }
          }
          
          // Check if message already exists 
          const existingMessage = prev[chatId]?.find(msg => 
            msg.id === message.id
          );
          
          if (existingMessage) {
            console.log('Message already exists, skipping duplicate:', message);
            return prev;
          }
          
          const formattedMessage = {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            message: message.message,
            timestamp: message.timestamp,
            isCurrentUser: message.senderId === user?.userId,
            isTemp: false
          };
          
          console.log('Adding new message to UI:', formattedMessage);
          return {
            ...prev,
            [chatId]: [...(prev[chatId] || []), formattedMessage]
          };
        });
      });

    }
  }, [socketRef.current, selectedChat, user?.userId]);


  const cleanupTempMessages = () => {
    setMessages(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(chatId => {
        cleaned[chatId] = prev[chatId].filter(msg => !msg.isTemp);
      });
      return cleaned;
    });
  };

  useEffect(() => {
    if (selectedChat) {
      cleanupTempMessages();
    }
  }, [selectedChat]);

  // Add room check to selectChat
  const selectChat = (chatUser) => {
    console.log('Selecting chat:', chatUser);
    
    // Leave previous chat 
    if (selectedChat?.chatId) {
      console.log('Leaving previous chat room:', selectedChat.chatId);
      socketRef.current?.emit('leave', selectedChat.chatId);
    }
    
    // Join new chat room
    console.log('Joining chat room:', chatUser.chatId);
    socketRef.current?.emit('join', chatUser.chatId);
    
    setSelectedChat(chatUser);
    
    if (!messages[chatUser.chatId]) {
      console.log('Fetching messages for chat:', chatUser.chatId);
      fetchMessages(chatUser.chatId);
    } else {
      console.log('Messages already loaded for chat:', chatUser.chatId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-screen text-white">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none; /* IE and Edge */
              scrollbar-width: none; /* Firefox */
            }
          `,
        }}
      />
      {/* Chat List */}
      <div className="w-full md:w-1/3 border-r border-zinc-700 flex flex-col">
        <div className="flex justify-between p-3 border-b border-zinc-700">
          <h1 className="flex  gap-2 text-2xl font-bold bg-[var(--accent-y)] bg-clip-text text-transparent">
            <img src="./img/CloakTalk.png" alt="logo" className='w-8 h-8 rounded-full' />Messages
          </h1>  
            <UserSearchTrigger/>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chatUsers.map((chatUser) => (
            <div
              key={chatUser.userId}
              onClick={() => selectChat(chatUser)}
              className={`p-4 cursor-pointer transition-all duration-200 hover:bg-zinc-700/50 border-b border-zinc-700/50 ${
                selectedChat?.userId === chatUser.userId 
                  ? 'bg-gradient-to-r from-zinc-800/50 border-r-4 border-[#e771a1]' 
                  : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-[var(--accent-p)] shadow-lg transform transition-all duration-300 hover:scale-105">
                 <img src={chatUser.pfp || '/img/user.svg'} alt={chatUser.username} className="w-full h-full scale-125 object-cover object-center" />
                 </div>
                  {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#121212]"></div> */}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white truncate">{chatUser.username}</h3>
                    <span className="text-xs text-zinc-400">{formatTime(chatUser.timestamp)}</span>
                  </div>
                  <p className="text-sm text-zinc-400 truncate text-left">{chatUser.lastMessage}</p>
                </div>
                {chatUser.unread > 0 && (
                  <div className="w-5 h-5 bg-[#e771a1] rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{chatUser.unread}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages section */}
      <div className={`flex-1 flex flex-col ${selectedChat ? 'block' : 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            <div className="p-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900/70">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className=" md:hidden p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentcolor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="w-12 h-12 overflow-hidden rounded-full border-2 border-[var(--accent-p)] shadow-lg transform transition-all duration-300 hover:scale-105">
                 <img src={selectedChat.pfp || '/img/user.svg'} alt={selectedChat.username} className="w-full h-full scale-125 object-cover object-center" />
                 </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedChat.username}</h2>
                  {/* <p className="text-sm text-green-500">Online</p> */}
                </div>
              </div>
            </div>

      
            <div className="flex-1 overflow-y-scroll  hide-scrollbar p-4 space-y-4">
              {(messages[selectedChat.chatId] || []).map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex animate-fade-in-up ${msg.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-white shadow-lg font-semibold ${
                    msg.isCurrentUser
                      ? 'bg-gradient-to-r from-[#9a4567] to-[#f995bd] text-right rounded-br-md'
                      : 'bg-zinc-800 rounded-bl-md text-left'
                  }`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.isCurrentUser ? 'text-zinc-300 text-right ' : 'text-zinc-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-zinc-800 bg-gradient-to-r from-zinc-900/70">
              <div className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleKeyPress}
                    placeholder="Type a message..."
                    className={`w-full px-4 py-3 bg-zinc-900 text-white rounded-xl border border-zinc-700 focus:outline-none focus:ring-1 focus:ring-[var(--accent-p)] transition-all`}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="px-1 py-2.5 border-2 border-zinc-700 bg-gradient-to-r from-[var(--accent-p)] to-[var(--accent-y)] text-white rounded-full hover:from-pink-300 hover:to-yellow-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <img src="./img/send.svg" alt="send message icon" className='w-10 h-8 mr-1' />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-[#ffafcf] to-[#fff59a] rounded-full border-2 border-zinc-700 flex items-center justify-center">
                <img src="./img/dm.svg" alt="messages" className='w-12 h-12' />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Select a chat to start messaging</h3>
              <p className="text-zinc-400">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>

  );
}
