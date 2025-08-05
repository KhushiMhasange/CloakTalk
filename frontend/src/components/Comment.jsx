import { useState, useContext, useRef, useEffect,useMemo} from 'react';
import { UserContext } from '../context/userContext';
import axiosInstance from '../../axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

// eslint-disable-next-line react/prop-types
export default function Comment({ postId, commentId = "root" }) {
    const [comments, setComments] = useState([]);
    const { user } = useContext(UserContext);
    const [showOptions, setShowOptions] = useState(null);
    const menuRef = useRef(null);
    const [commentInput, setCommentInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
     const [openReplies, setOpenReplies] = useState(new Set());
    // const [replyTo, setReplyTo] = useState(null);
    
    useEffect(() => {
        async function fetchComments() {
            try {
                const res = await axiosInstance.get(`/api/posts/${postId}/comments`);
                setComments(res.data);
                
            } catch (err) {
                console.error('Failed to fetch comments', err);
            }
        }
        if (postId) fetchComments();
    }, [postId]);

        const filteredComments = useMemo(() => {
        if (commentId !== "root") {
            return comments.filter(comment => comment.parentCommentId === commentId);
        } else {
            return comments.filter(comment => !comment.parentCommentId);
        }
    }, [comments, commentId]);

    // Hide options menu on outside click
    useEffect(() => {
        const handleClickOut = (e) => {
            if (showOptions && menuRef.current && !menuRef.current.contains(e.target)) {
                setShowOptions(null);
            }
        };
        document.addEventListener('mousedown', handleClickOut);
        return () => document.removeEventListener('mousedown', handleClickOut);
    }, [showOptions]);

    async function handleDeleteComment(id) {
        try {
            await axiosInstance.delete(`/api/posts/${postId}/comments/${id}`);
            setComments(prev => prev.filter(comment => comment._id !== id));
            setShowOptions(null);
        } catch (err) {
            console.error('Failed to delete comment', err);
            alert('Failed to delete comment');
            setShowOptions(null);
        }
    }

    async function handleLike(commentId) {
        try {
            const currentComment = comments.find(comment => comment._id === commentId);
            
            if (currentComment?.isLikedByCurrentUser) {
                await axiosInstance.delete(`/api/posts/comments/${commentId}/like`);
            } else {
                await axiosInstance.post(`/api/posts/comments/${commentId}/like`);
            }
    
            setComments(prevComments =>
                prevComments.map(comment => {
                    if (comment._id !== commentId) return comment;
                    return {
                        ...comment,
                        isLikedByCurrentUser: !comment.isLikedByCurrentUser,
                        likesCount: comment.isLikedByCurrentUser 
                            ? (comment.likesCount || 1) - 1 
                            : (comment.likesCount || 0) + 1,
                    };
                })
            );
    
        } catch (error) {
            console.log(error);
        }
    }

    const handleBookmark = async (commentId) => {
    try {
        const currentComment = comments.find(comment => comment._id === commentId);
        if (currentComment?.hasBookmarked) {
            await axiosInstance.delete(`/api/posts/comments/${commentId}/bookmark`);
        } else {
            await axiosInstance.post(`/api/posts/comments/${commentId}/bookmark`);
        }
        setComments(prevComments =>
            prevComments.map(comment => {
                if (comment._id !== commentId) return comment;
                return {
                    ...comment,
                    hasBookmarked: !comment.hasBookmarked,
                    bookmarksCount: comment.hasBookmarked
                        ? (comment.bookmarksCount || 1) - 1
                        : (comment.bookmarksCount || 0) + 1
                };
            })
        );
    } catch (error) {
        console.log(error);
    }
    };
    

    async function handleSubmitComment(e) {
        e.preventDefault();
        if (!commentInput.trim()) return;
        setSubmitting(true);
        setError("");
        try {
            if(commentId=="root"){
               const res = await axiosInstance.post(`/api/posts/${postId}/comments`, { content: commentInput });
               setComments(prev => [res.data, ...prev]);
               setCommentInput("");
            }
            else{
               const res = await axiosInstance.post(`/api/posts/${postId}/comments`, { 
                content: commentInput, 
                parentCommentId :commentId,
                replyingToUserId : commentId.UserId});
                setComments(prev => [res.data, ...prev]);
                setCommentInput("");
            }
            
        } catch (err) {
            setError("Failed to add comment",err);
        } finally {
            setSubmitting(false);
        }
    }

    if(!postId) return(<></>);
    else{
    return (  
        <div className="pt-4">
            <form onSubmit={handleSubmitComment} className="flex gap-2 items-start">
                <div className="w-8 h-8 overflow-hidden rounded-full mt-1">
                    <img src={user?.pfp || '/img/user.svg'} alt="user pfp" className="w-full h-full bg-zinc-800 scale-125 object-cover object-center" />
                </div>
                <div className="flex-1">
                    <textarea
                        className="w-full px-2 py-2 rounded bg-zinc-900 text-white resize-none focus:outline-none"
                        placeholder="Add a comment..."
                        value={commentInput}
                        onChange={e => setCommentInput(e.target.value)}
                        disabled={submitting}
                        rows={1}
                        onInput={e => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />
                    {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
                </div>
                <button
                    type="submit"
                    className="px-3 py-1 font-bold rounded-xl text-[#e771a1] border-2 border-zinc-100 cursor-pointer bg-[var(--accent-y)] transition hover:scale-94 mt-1 disabled:opacity-80"
                    disabled={!commentInput.trim() || submitting}
                >
                    {submitting ? 'Posting...' : (commentId==="root" ? 'comment':'reply')}
                </button>
            </form>

            {filteredComments.map((comment) => (
                <div key={comment._id} className="p-4 ml-2 border-l-1 border-zinc-700">
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex gap-2 p-1 items-center">
                            <div className="w-8 h-8 overflow-hidden rounded-full">
                                <img src={comment.anonymousPfp} alt="user pfp" className="w-full h-full scale-125 object-cover object-center" />
                            </div>
                            <h3 className="font-bold text-[var(--accent-p)] text-left">{comment.anonymousUsername}
                                <p id="post-timestamp" className="text-white tracking-widest">{
                                    new Date(comment.createdAt).toLocaleString(undefined, {
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
                        <div className="relative p-1" ref={showOptions === comment._id ? menuRef : null}>
                            <FontAwesomeIcon icon={faEllipsis} className="cursor-pointer" onClick={() => setShowOptions(showOptions === comment._id ? null : comment._id)} />
                            {showOptions === comment._id && (
                                <div className="absolute right-0 bg-zinc-900 px-2 py-1 rounded-md w-30"
                                    onMouseLeave={() => setShowOptions(null)}
                                    onMouseEnter={() => setShowOptions(comment._id)} >
                                    <ul>
                                        {user.userId === comment.userId && (
                                            <li className="text-red-400 hover:bg-zinc-800 p-1 rounded">
                                                <button className="cursor-pointer" onClick={() => handleDeleteComment(comment._id)}>
                                                    Delete comment
                                                </button>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Lato, sans-serif' }} className="text-left p-1">
                            {comment.replyingToUserId && (
                                <strong className="text-blue-400">@{comment.replyingToUserId} </strong>
                            )}
                            {comment.content}
                        </pre>
                    </div>
                    <div className="mt-4">
                        <ul className="tags flex gap-8 p-1 justify-between">
                            <li className="flex gap-2 text-lg text-[var(--accent-p)] cursor-pointer" onClick={() => handleLike(comment._id)}>
                                <img src={comment.isLikedByCurrentUser ? "/img/likeFilled.svg" : "/img/like.svg"} alt="like" className="w-5" /><p>{comment.likesCount || 0}</p>
                            </li>
                            <li className="flex gap-2 text-lg text-[var(--accent-p)] cursor-pointer"  onClick={() => {
                                setOpenReplies(prev => {
                                const newSet = new Set(prev);
                                if (newSet.has(comment._id)) {
                                    newSet.delete(comment._id);
                                } else {
                                    newSet.add(comment._id);
                                }
                                return newSet;
                                })}}>
                                <img src="/img/comment.svg" alt="reply" className="w-5"/>
                                <p className='text-white'>{comment.directRepliesCount || 0}</p>
                            </li>
                            <li
                                className="flex gap-2 text-lg text-[var(--accent-p)] cursor-pointer"
                                onClick={() => handleBookmark(comment._id)}
                            >
                                <img
                                    src={comment.hasBookmarked ? "/img/bookmarkFilled.svg" : "/img/bookmark.svg"}
                                    alt="bookmark"
                                    className="w-5"
                                />
                                <p className="text-[var(--accent-y)]">{comment.bookmarksCount || 0}</p>
                            </li>
                        </ul>
                    </div>
                     <div>
                    {openReplies.has(comment._id) && <Comment postId={postId} commentId={comment._id} />}
                     </div>
                </div>
            ))}
            
        </div>
    );
    }
}
    