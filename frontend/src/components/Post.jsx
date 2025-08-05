import { useState, useContext, useRef, useEffect, useCallback } from 'react';
import { UserContext } from '../context/userContext';
import axiosInstance from '../../axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Comment from './Comment';
import Pdf from '../pdf';
import { Link } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
export default function Post({ refreshPostsTrigger, userId, isBookmarked }) {

  const [posts, setPosts] = useState([]);
  const { user } = useContext(UserContext);
  const [showOptions, setShowOptions] = useState(null);
  const menuRef = useRef(null);
  const BaseUrl = 'http://localhost:3000';
  const [openComments, setOpenComments] = useState(new Set());
  const [followStates, setFollowStates] = useState({});

  const fetchPosts = useCallback(async () => {
    try {
      let res;
 
      if (userId && !isBookmarked) {
        res = await axiosInstance.get(`/posts/${userId}`);
      } else if (userId && isBookmarked) {
        res = await axiosInstance.get(`/api/posts/bookmarks?bookmarked=true`);
      } else {
        res = await axiosInstance.get('/posts');
      }
      setPosts(res.data);
    }
    catch (err) {
      console.error('Failed to fetch posts', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshPostsTrigger]);


  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    if (user && user.userId && posts.length > 0) {
      console.log('User:', user);
      console.log('Posts:', posts);
      
      const followStatesData = {};
      posts.forEach(post => {
        if (post.userId !== user.userId) {
          console.log("Inside the loop - Post author:", post.userId, "Current user:", user.userId);
          followStatesData[post.userId] = post.isFollowingAuthor === true;
        }
      });
      
      console.log('Follow states:', followStatesData);
      setFollowStates(followStatesData);
    }
  }, [posts, user]);

  useEffect(() => {
    const handleClickOut = (e) => {
      if (showOptions && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptions(null);
      }
    };
    document.addEventListener('mousedown', handleClickOut);
    return () => document.removeEventListener('mousedown', handleClickOut);
  }, [showOptions]);

  async function handleDeletePost(id) {
    console.log("clicked delete post");
    try {
      const res = await axiosInstance.delete(`/posts/${id}`);
      console.log("Delete response", res.data);

      setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
      setShowOptions(null);
    }
    catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post');
      setShowOptions(null);
    }
  }

  const handleLike = async (postId) => {
    try {
      const currentPost = posts.find(post => post._id === postId);
      
      if (currentPost?.isLikedByCurrentUser) {
        await axiosInstance.delete(`/api/posts/like/${postId}`);
      } else {
        await axiosInstance.post(`/api/posts/like/${postId}`);
      }

      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id !== postId) return post;
          return {
            ...post,
            isLikedByCurrentUser: !post.isLikedByCurrentUser,
            likesCount: post.isLikedByCurrentUser 
              ? (post.likesCount || 1) - 1 
              : (post.likesCount || 0) + 1,
            commentsCount: post.commentsCount || 0
          };
        })
      );
  
    } catch (error) {
      console.log(error);
    }
  };
  

  const handleBookmark = async (postId) => {
    try {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post._id !== postId) return post;
          if (post.hasBookmarked) {
            axiosInstance.delete(`/api/posts/bookmark/${postId}`);
            return {
              ...post,
              hasBookmarked: false,
              bookmarksCount: (post.bookmarksCount || 1) - 1
            };
          } else {
            axiosInstance.post(`/api/posts/bookmark/${postId}`);
            return {
              ...post,
              hasBookmarked: true,
              bookmarksCount: (post.bookmarksCount || 0) + 1
            };
          }
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async (targetUserId) => {
    try {
      const isCurrentlyFollowing = followStates[targetUserId];
      
      if (isCurrentlyFollowing) {
        await axiosInstance.delete(`/api/users/follow/${targetUserId}`);
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: false
        }));
        // Update posts state to reflect the change
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.userId === targetUserId) {
              return { ...post, isFollowingAuthor: false };
            }
            return post;
          })
        );
      } else {
        await axiosInstance.post(`/api/users/follow/${targetUserId}`);
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: true
        }));
        // Update posts state to reflect the change
        setPosts(prevPosts =>
          prevPosts.map(post => {
            if (post.userId === targetUserId) {
              return { ...post, isFollowingAuthor: true };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error('Error following/unfollowing:', error);
    }
  };

  return (
    <div className="bg-zinc-950 px-2">
      {posts.map((post) => (
        <div key={post._id} className='relative p-2 py-4 border-b-1 border-zinc-700'>
          <div className='flex flex-row justify-between items-center'>
            <div className="flex gap-2 p-1 items-center">
              <div className="w-8 h-8 overflow-hidden rounded-full">
                <img src={`http://localhost:5173/${post.anonymousPfp}`} alt="user pfp"
                  className="w-full h-full scale-125 object-cover object-center" />
              </div>
              <h3 className="font-bold text-[var(--accent-p)] text-left">
                <Link 
                  to={`/profile/${post.userId}`} 
                  className="hover:text-[var(--accent-y)] transition-colors duration-200"
                >
                  {post.anonymousUsername}
                </Link>
                <p id="post-timestamp" className="text-white tracking-widest">{
                  new Date(post.createdAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })
                }</p>
              </h3>
            </div>

            <div className='relative p-1' ref={showOptions === post._id ? menuRef : null}>
              <FontAwesomeIcon icon={faEllipsis} className='cursor-pointer' onClick={() => setShowOptions(showOptions === post._id ? null : post._id)} />
              {showOptions === post._id && (
                <div className='absolute right-0 bg-zinc-900 px-2 py-1 rounded-md w-30'
                  onMouseLeave={() => setShowOptions(null)}
                  onMouseEnter={() => setShowOptions(post._id)} >
                  <ul>
                    {user.userId === post.userId && (
                      <li className='text-red-400 hover:bg-zinc-800 p-1 rounded'>
                        <button className="cursor-pointer" onClick={() => handleDeletePost(post._id)}>
                          Delete post
                        </button>
                      </li>
                    )}
                    {user.userId !== post.userId && (
                      <li className='text-[var(--accent-y)] hover:bg-zinc-800 p-1 rounded'>
                        <button 
                          className="cursor-pointer" 
                          onClick={() => handleFollow(post.userId)}
                        >
                          {followStates[post.userId] ? 'Unfollow' : 'Follow'}
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Lato, sans-serif' }} className="text-left p-1">{post.content} </pre>
          </div>

          {post.mediaPath && post.mediaType && (
            <div className="media-preview my-2 p-2  relative">
              {post.mediaType.startsWith('image/') && (
                <img src={`${BaseUrl}${post.mediaPath}`} alt="Post Media" className="max-w-full max-h-72 object-contain mx-auto" />
              )}
              {post.mediaType.startsWith('video/') && (
                <video src={`${BaseUrl}${post.mediaPath}`} controls className="max-w-full max-h-72 object-contain mx-auto" />
              )}
              {(post.mediaType === 'application/pdf' || post.mediaType === 'text/plain') && (
                <div className="text-center ">
                  <div className='pb-2'>
                    <Pdf file={`${BaseUrl}${post.mediaPath}`} />
                  </div>
                  <a href={`${BaseUrl}${post.mediaPath}`} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-y)] hover:text-[var(--accent-p)]">
                    Download File
                  </a>
                </div>
              )}
            </div>
          )}

          <div className='mt-4'>
            <ul className="tags flex gap-8 p-1 justify-between">
              <li className="flex gap-2 text-lg text-[var(--accent-p)] cursor-pointer" onClick={() => handleLike(post._id)}>
                <img src={post.isLikedByCurrentUser ? "/img/likeFilled.svg" : "/img/like.svg"} alt="upload picture" className="w-5" /><p>{post.likesCount || 0}</p>
              </li>
              <li className="flex gap-2 text-lg cursor-pointer" onClick={() => {
                setOpenComments(prev => {
                  const newSet = new Set(prev);
                  if (newSet.has(post._id)) {
                    newSet.delete(post._id);
                  } else {
                    newSet.add(post._id);
                  }
                  return newSet;
                });
              }}>
                <img src="/img/comment.svg" alt="upload video" className="w-6" /><p>{post.commentsCount || 0}</p>
              </li>
              <li className="flex gap-2 text-lg text-[var(--accent-y)] cursor-pointer" onClick={() => handleBookmark(post._id)}>
                <img src={post.hasBookmarked ? "/img/bookmarkFilled.svg" : "/img/bookmark.svg"} alt="upload pdf" className="w-5" /><p>{post.bookmarksCount || 0}</p>
              </li>
            </ul>
          </div>
          <div>
            {openComments.has(post._id) && <Comment postId={post._id} />}
          </div>
        </div>
      ))}

    </div>
  )
}