import Footer from '/src/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Post from '/src/components/Post';
import axiosInstance from '../../axiosInstance';
import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from '../context/userContext';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useContext(UserContext);
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const bioTextareaRef = useRef(null);

  const targetUserId = userId || user?.userId;
  const isOwnProfile = !userId || userId === user?.userId;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchProfile = async () => {
      try {
        // console.log('Fetching profile for user:', targetUserId);
        const response = await axiosInstance.get(`/api/users/profile/${targetUserId}`);
        // console.log('Profile response:', response.data);
        const userData = response.data.user;
        // console.log("userData",userData);
        const profileData = {
          userId: userData.userId,
          username: userData.username,
          pfp: userData.pfp ? `http://localhost:5173/${userData.pfp}` : '/img/user.svg',
          bio:userData.bio,
          followingCount: userData.followingCount, 
          followersCount: userData.followersCount,
          isFollowing: userData.isFollowing
        };
        // console.log("Setting profileUser to:", profileData);
        setProfileUser(profileData);
        setIsFollowing(userData.isFollowing);
        setFollowingCount(userData.followingCount);
        setFollowersCount(userData.followersCount);
      } catch (error) {
        console.error('Error fetching profile:', error);
        const fallbackData = {
          userId: targetUserId,
          username: 'Unknown User',
          pfp: '/img/user.svg',
          bio:"About...",
          followingCount: 0,
          followersCount: 0,
          isFollowing: false
        };
        console.log("Setting fallback data:", fallbackData);
        setProfileUser(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetUserId, isOwnProfile, user]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await axiosInstance.delete(`/api/users/follow/${targetUserId}`);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await axiosInstance.post(`/api/users/follow/${targetUserId}`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  const handleBioEdit = () => {
    if (isOwnProfile) {
      setIsEditingBio(true);
      setBioText(profileUser.bio || "Write about yourself...");
      setTimeout(() => {
        bioTextareaRef.current?.focus();
      }, 100);
    }
  };

  const handleBioSave = async () => {
    try {
      const response = await axiosInstance.put(`/api/users/profile/${targetUserId}/bio`, {
        bio: bioText
      });
      
      setProfileUser(prev => ({
        ...prev,
        bio: response.data.bio
      }));
      
      setIsEditingBio(false);
    } catch (error) {
      console.error('Error updating bio:', error);
    }
  };

  const handleBioCancel = () => {
    setIsEditingBio(false);
    setBioText("");
  };

  if (!user) {
    return (
      <div><Link to='/log-in'>Login</Link> to view this page !!</div>
    )
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profileUser) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  return (
    <div>
      <div className='flex justify-between'>
        <div className="flex gap-2 items-center">
          <img src="/img/CloakTalk-logo.png" className="h-5 transition hover:scale-110 cursor-pointer" onClick={() => navigate('/feed')}></img>
          {/* <h3 className="p-1 font-bold text-xl text-[var(--accent-y)] "> </h3> */}
        </div>
        <div className='flex'>
          <h3 className="p-1 font-bold text-[var(--accent-p)]">{user.username}</h3>
          <div className="w-8 h-8 overflow-hidden rounded-full">
            <img src={`http://localhost:5173/${user.pfp}`} alt="user pfp"
              className="w-full h-full scale-125 object-cover object-center" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className='mt-8 p-4 items-center rounded-3xl w-full max-w-4xl bg-zinc-900'>
          <div className="w-full max-w-4xl bg-zinc-950 border border-white p-8 pb-6 rounded-2xl shadow-xl animate-fade-in-up">
            <div className='flex items-center gap-8'>
              <div className="w-40 h-40 sm:w-48 sm:h-48 overflow-hidden rounded-full border-4 border-[var(--accent-p)] shadow-lg transform transition-all duration-300 hover:scale-105">
                <img src={profileUser.pfp || '/img/user.svg'} alt="user pfp" className="w-full h-full scale-125 object-cover object-center" />
              </div>
              <div className='w-[32rem] flex flex-col items-start text-left'>
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--accent-y)]">
                    {profileUser.username}
                  </h1>
                </div>

                <div className="flex items-start gap-2 ">
                  {isEditingBio ? (
                    <div className="flex-1">
                      <textarea
                        ref={bioTextareaRef}
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-800 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-y)]"
                        placeholder="Write about yourself..."
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={handleBioSave}
                          className="px-3 py-1 bg-[var(--accent-y)] text-black rounded-lg text-sm font-semibold hover:bg-yellow-200 transition-colors"
                        >
                        Save
                        </button>
                        <button
                          onClick={handleBioCancel}
                          className="px-3 py-1 bg-zinc-700 text-white rounded-lg text-sm font-semibold hover:bg-zinc-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="flex-1">
                      {profileUser.bio || "About you..."}
                      {isOwnProfile && (
                        <FontAwesomeIcon 
                          icon={faEdit} 
                          className='px-4 w-6 text-white cursor-pointer hover:text-[var(--accent-y)] transition-colors' 
                          onClick={handleBioEdit}
                        />
                      )}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-8 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--accent-p)]">{profileUser.followingCount}</div>
                    <div className="text-sm text-gray-300">Following</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[var(--accent-p)]">{profileUser.followersCount}</div>
                    <div className="text-sm text-gray-300">Followers</div>
                  </div>
                  {!isOwnProfile && (
                    <button
                    onClick={handleFollow}
                    className={`
                      px-6 py-2 rounded-3xl border-2 font-semibold text-white
                      transition-all duration-300 ease-out
                      shadow-lg hover:shadow-2xl
                      transform hover:scale-105 hover:-translate-y-1
                      active:scale-95 active:translate-y-0
                      relative overflow-hidden
                      bg-[#e771a1]
                      before:absolute before:inset-0 before:bg-white/20 before:transform before:scale-0
                      before:transition-transform before:duration-300 before:rounded-3xl
                      hover:before:scale-100
                    `}
                  >
                    <span className="relative z-10">
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </span>
                  </button>
                
                  )}
                </div>
                
                
              </div>
            </div>
            <div className="flex justify-center text-xl pt-2">
              <div className=''>
              <span className='bg-zinc-900 p-2 px-4 rounded-l-xl'>Posts</span>
              <span className='bg-zinc-900 p-2 px-4 rounded-r-xl'>Replies</span>
              </div>   
            </div>
            <div className="p-4 bg-zinc-900 rounded-b-2xl border border-zinc-800 shadow-inner">
              <Post refreshPostsTrigger={0} userId={profileUser.userId} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}