/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTimes, faUser, faUserCheck, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import axiosInstance from '../../axiosInstance';
// import { io } from 'socket.io-client';

const UserSearch = ({ onClose, groupChat }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [followStates, setFollowStates] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]); //for group chat
  const [groupName, setGroupName] = useState('');
  const popupRef = useRef(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/users/all');
      setUsers(response.data);
      console.log(response.data);
      const initialFollowStates = {};
      response.data.forEach(user => {
        initialFollowStates[user._id] = user.isFollowing;
      });
      setFollowStates(initialFollowStates);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (selectedUser) => {
    if (groupChat) {
      setSelectedUsers(prev => {
        const isSelected = prev.find(u => u._id === selectedUser._id);
        if (isSelected) {
          return prev.filter(u => u._id !== selectedUser._id);
        } else {
          return [...prev, selectedUser];
        }
      });
    } else {
      try {
        const response = await axiosInstance.post('/api/chats/create-or-get', {
          participantId: selectedUser._id
        });

        const chatId = response.data.chatId;
        const token = localStorage.getItem('token');

        onClose();

        navigate('/chat', {
          state: {
            selectedChatId: chatId,
            selectedUser: selectedUser
          }
        });

      } catch (error) {
        console.error('Error starting chat:', error);
        onClose();
        navigate('/chat', {
          state: {
            selectedUser: selectedUser
          }
        });
      }
    }
  };

  const handleCreateGroupChat = async () => {
    if (selectedUsers.length < 2) {
      alert('Please select at least 2 users for a group chat');
      return;
    }
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }
    try {
      const response = await axiosInstance.post('/api/chats/create-group', {
        participantIds: selectedUsers.map(u => u._id),
        groupName: groupName.trim()
      });

      const chatId = response.data.chatId;

      onClose();
      navigate('/chat', {
        state: {
          selectedChatId: chatId,
          isGroupChat: true,
          selectedUsers: selectedUsers
        }
      });

    } catch (error) {
      console.error('Error creating group chat:', error);
      alert('Failed to create group chat. Please try again.');
    }
  };


  const handleFollow = async (userId) => {
    try {
      const isCurrentlyFollowing = followStates[userId];
      const endpoint = `/api/users/follow/${userId}`;

      if (isCurrentlyFollowing) {
        await axiosInstance.delete(endpoint);
      } else {
        await axiosInstance.post(endpoint);
      }

      setFollowStates(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing
      }));

      setUsers(prev => prev.map(user =>
        user._id === userId
          ? { ...user, isFollowing: !isCurrentlyFollowing }
          : user
      ));
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.anonymousUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const followingUsers = filteredUsers.filter(user => user.isFollowing);
  const otherUsers = filteredUsers.filter(user => !user.isFollowing);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
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
      <div
        ref={popupRef}
        className="bg-zinc-950 overflow-y-scroll hide-scrollbar rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] mx-4 overflow-hidden border border-zinc-800"
      >

        <div className="flex items-center justify-between p-4 px-6 border-b border-zinc-700">
          <h2 className="text-xl font-bold text-[var(--accent-y)]">
            {groupChat ? 'Create Group Chat' : 'Find Users'}
          </h2>
          <button
            onClick={onClose}
            className="px-2 py-0.5 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {groupChat && (
          <div className="px-6 py-3 bg-zinc-900/50 border-b border-zinc-700">
            <div className="mb-3">
              <label className="block text-sm text-left pl-1 font-medium text-zinc-300 mb-2">
                Group Name *
              </label>
              <div className='flex gap-2'>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="w-2/3 px-3 py-1 bg-zinc-900 text-white rounded-lg border border-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#ffafcf] focus:border-transparent transition-all"
                maxLength={50}
              />
              {selectedUsers.length >= 2 && (
                <button
                  onClick={handleCreateGroupChat}
                  className="px-2 py-1 bg-gradient-to-r from-[#9a4567] to-[#f995bd]  text-white rounded-lg font-semibold text-sm hover:from-[#d46590] hover:to-[#ffb3d1] shadow-lg hover:scale-95 transition-all"
                >
                  Create Group
                </button>
              )}
              </div>
            </div>
            {/* <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-300">
                Selected: {selectedUsers.length} users
              </span>
            </div> */}
            {selectedUsers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user._id} className="flex items-center gap-2 bg-zinc-800 px-3 py-1 rounded-2xl">
                    <div className="w-5 h-5 overflow-hidden rounded-full border-2 border-[var(--accent-p)] shadow-lg transform transition-all duration-300 hover:scale-105">
                    <img src={user.anonymousPfp} alt={user.anonymousUsername} className="w-full h-full scale-125 object-cover object-center" />
                    </div>
                    <span className="text-xs text-white">{user.anonymousUsername}</span>
                    <button
                      onClick={() => setSelectedUsers(prev => prev.filter(u => u._id !== user._id))}
                      className="text-zinc-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-4 pb-1">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-900 text-white rounded-xl border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#ffafcf] focus:border-transparent transition-all"
          />
        </div>

        {/* Users List */}
        <div className="overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#ffafcf] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              {followingUsers.length > 0 && (
                <div>
                  <div className="px-6 py-3 mt-2 bg-zinc-900/50">
                    <h3 className="text-sm font-semibold text-[#fff59a] flex items-center gap-2">
                      <FontAwesomeIcon icon={faUserCheck} />
                      Following ({followingUsers.length})
                    </h3>
                  </div>
                  {followingUsers.map(user => (
                    <UserItem
                      key={user._id}
                      user={user}
                      isFollowing={followStates[user._id]}
                      onFollow={() => handleFollow(user._id)}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              )}
              {otherUsers.length > 0 && (
                <div>
                  {followingUsers.length > 0 && (
                    <div className="px-6 py-3 bg-zinc-800/50 border-t border-zinc-700">
                      <h3 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                        <FontAwesomeIcon icon={faUser} />
                        Discover ({otherUsers.length})
                      </h3>
                    </div>
                  )}
                  {otherUsers.map(user => (
                    <UserItem
                      key={user._id}
                      user={user}
                      isFollowing={followStates[user._id]}
                      onFollow={() => handleFollow(user._id)}
                      onStartChat={handleStartChat}
                    />
                  ))}
                </div>
              )}

              {filteredUsers.length === 0 && !loading && (
                <div className="text-center py-8 text-zinc-400">
                  <FontAwesomeIcon icon={faUser} className="text-4xl mb-4" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const UserItem = ({ user, isFollowing, onFollow, onStartChat, groupChat, isSelected }) => {
  return (
    <div className={`flex items-center p-4 hover:bg-zinc-900/50 transition-colors border-b border-zinc-800/50 ${groupChat && isSelected ? 'bg-zinc-800/70' : ''
      }`}>
      <div className="w-12 h-12 overflow-hidden rounded-full cursor-pointer"
        onClick={() => onStartChat(user)}>
        {groupChat && (
          <div className={`absolute w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${isSelected ? 'bg-[#ffafcf]' : 'bg-zinc-700'
            }`}>
            {isSelected && (
              <span className="text-white text-xs font-bold">✓</span>
            )}
          </div>
        )}
        <img src={user.anonymousPfp}
          alt={user.anonymousUsername}
          className="w-full h-full scale-125 object-cover object-center" />
      </div>
      <div className="flex-1 ml-3 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white truncate">
            {user.anonymousUsername}
          </h3>
          {isFollowing && (
            <span className="px-2 py-1 text-xs bg-[#fff59a]/20 text-[#fff59a] rounded-full">
              Following
            </span>
          )}
        </div>
        {user.bio && (
          <p className="text-sm text-zinc-400 truncate text-left">{user.bio}</p>
        )}
      </div>
      {!groupChat && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFollow();
          }}
          className={`ml-3 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${isFollowing
              ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
              : 'bg-gradient-to-r from-[#9a4567] to-[#f995bd]  text-white hover:from-[#d46590] hover:to-[#ffb3d1] shadow-lg hover:scale-95'
            }`}
        >
          {isFollowing ? 'Unfollow' : 'Follow'}
        </button>
      )}
    </div>
  );
};

// Main component with trigger
export default function UserSearchTrigger() {
  const [showPopup, setShowPopup] = useState(false);
  const [groupChat, setGroupChat] = useState(false);

  const handleUserSearch = () => {
    setShowPopup(true);
  };

  return (
    <>
      <div onClick={handleUserSearch} className="cursor-pointer flex gap-4">
        <FontAwesomeIcon icon={faUserPlus} onClick={() => setGroupChat(false)} className="text-[var(--accent-y)] text-lg pt-2 hover:scale-110 transition-transform" />
        <FontAwesomeIcon icon={faUserGroup} onClick={() => setGroupChat(true)} className="text-[var(--accent-y)] text-lg pt-2 hover:scale-110 transition-transform" />
      </div>

      {showPopup && (
        <UserSearch onClose={() => setShowPopup(false)} groupChat={groupChat} />
      )}
    </>
  );
}
