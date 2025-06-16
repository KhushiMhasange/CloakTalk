import { useState,useContext,useRef,useEffect,useCallback } from 'react';
import {UserContext} from '../context/userContext';
import axiosInstance from '../../axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import Pdf from '../pdf';

// eslint-disable-next-line react/prop-types
export default function Post({ refreshPostsTrigger,id}) {
    
    const [posts,setPosts] = useState([]);
    const {user} = useContext(UserContext);
    const [showOptions,setShowOptions] = useState(null);
    const menuRef = useRef(null);
    const BaseUrl = 'http://localhost:3000';

    const  fetchPosts = useCallback(async()=>{
        try{
            let res;
            if(id){
                 res = await axiosInstance.get(`/posts/${id}`);
            }else  res = await axiosInstance.get('/posts');
            setPosts(res.data);
        }
        catch(err){
            console.error('Failed to fetch posts',err);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[refreshPostsTrigger]);

    useEffect(()=>{
        fetchPosts();
    },[fetchPosts]);
    

    useEffect(()=>{
        const handleClickOut = (e) =>{
            if(showOptions && menuRef.current && !menuRef.current.contains(e.target)){
                setShowOptions(null);
            }
        };
        document.addEventListener('mousedown',handleClickOut);
        return() => document.removeEventListener('mousedown',handleClickOut);
    },[showOptions]);
    
    async function handleDeletePost(id){
        console.log("clicked delete post");
        try{
            const res = await axiosInstance.delete(`/posts/${id}`);
            console.log("Delete response",res.data);

            setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
            setShowOptions(null);
        }
        catch(err){
            console.error('Failed to delete post',err);
            alert('Failed to delete post');
            setShowOptions(null);
        }
    }

    return(
        <div className="bg-zinc-950 px-2">
            {posts.map((post)=>(
            <div key={post.id} className='p-2 py-4 border-b-1 border-zinc-700'>
            <div className='flex flex-row justify-between items-center'>
                <div className="flex gap-2 p-1 items-center">
                    <div className="w-8 h-8 overflow-hidden rounded-full">
                        <img src={post.anonymousPfp} alt="user pfp"
                        className="w-full h-full scale-125 object-cover object-center"/>
                    </div> 
                    <h3 className="font-bold text-[var(--accent-p)] text-left">{post.anonymousUsername}
                        <p id="post-timestamp" className="text-white tracking-widest">{new Date(post.createdAt).toLocaleString()}</p>
                    </h3>
                </div>
              
                <div className='relative p-1' ref={showOptions === post._id ? menuRef:null}>
                    <FontAwesomeIcon icon={faEllipsis} className='cursor-pointer' onClick={() => setShowOptions(showOptions === post._id ? null : post._id)}/>
                    {showOptions===post._id &&(
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
                        </ul>
                        </div>
                    )}
                </div>
            </div>
            <div>
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'Lato, sans-serif'}} className="text-left p-1">{post.content} </pre>
            </div>
            
            {post.mediaPath && post.mediaType && (
                <div className="media-preview my-2 p-2 border border-zinc-700 rounded relative">
                    {post.mediaType.startsWith('image/') && (
                        <img src={`${BaseUrl}${post.mediaPath}`} alt="Post Media" className="max-w-full max-h-64 object-contain mx-auto" />
                    )}
                    {post.mediaType.startsWith('video/') && (
                        <video src={`${BaseUrl}${post.mediaPath}`} controls className="max-w-full max-h-64 object-contain mx-auto" />
                    )}
                    {(post.mediaType === 'application/pdf' || post.mediaType === 'text/plain') && (
                        <div className="text-center p-4 bg-zinc-800 rounded">
                            <p className="text-zinc-400">Document attached: {post.mediaType === 'application/pdf' ? 'PDF File' : 'Text File'}</p>
                            <Pdf file={`${BaseUrl}${post.mediaPath}`}/>
                            <a href={`${BaseUrl}${post.mediaPath}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline mt-2 inline-block">
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            )}

            <div>
                <ul className="tags flex gap-8 p-1">
                    <li className="flex gap-1 text-lg text-[var(--accent-p)]"><img src="/img/like.svg" alt="upload picture" className="w-6"/><p>16</p></li>
                    <li className="flex gap-1 text-lg"><img src="/img/comment.svg" alt="upload video" className="w-7"/><p>2</p></li>
                    <li className="flex gap-1 text-lg text-[var(--accent-y)]"><img  src="/img/bookmark.svg" alt="upload pdf" className="w-6"/><p>1</p></li>   
                </ul>
            </div>
            </div>
            ))}
        </div>
    )
}