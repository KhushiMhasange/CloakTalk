import Post from '/src/components/Post';
import { useState,useContext,useRef,useEffect } from 'react';
import {UserContext} from '../context/userContext';
import axiosInstance from  '../../axiosInstance';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear,faDownload,faStar } from '@fortawesome/free-solid-svg-icons';

export default function Feed() {
    
    const {user,setUser} = useContext(UserContext);
    const [content, setContent] = useState("");
    const [media, setMedia] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [postRefreshKey, setPostRefreshKey] = useState(0);
    const [showSettings,setShowSettings] = useState(false);
    const pfpRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(()=>{
            const handleClickOut = (e) =>{
                if(showSettings && pfpRef.current && !pfpRef.current.contains(e.target)){
                    setShowSettings(null);
                }
            };
            document.addEventListener('mousedown',handleClickOut);
            return() => document.removeEventListener('mousedown',handleClickOut);
    },[showSettings]);

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    async function handleSubmitPost() {
        if (!content.trim() && !media) {
            alert("Please enter content or select a file to post.");
            return;
        }

        const formData = new FormData();
        if (media) {
            formData.append('media', media); //'media' is key and media is value
        }
        if (content){  
        formData.append('content', content);
        }

        try {
            const res = await axiosInstance.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });
            console.log(res);
            setContent("");
            setMedia(null); 
            setPreview(null);   
            setUploadProgress(0);
            setPostRefreshKey(prevKey => prevKey + 1);
            CreatePost();
        } catch (err) {
            console.error("Error submitting post:", err);
            setUploadProgress(0);
        }
    }

    async function handleLogout(){
         if (!window.confirm("Do you want to log out?")) { 
            return;
        }
        try{
            const res = await axios.delete('http://localhost:4000/logout',{refreshToken: localStorage.getItem('refresh_token')});
            if(res.status===204){
            setUser(null);
            localStorage.clear();
            navigate('/');
            console.log(res);
            }
        }catch(err){
         console.log(err);
        }
    }

    // handleLogout();

    function CreatePost(){
        const post = document.getElementById("addpost");
        post.classList.toggle("hidden");
        setContent("");
        setMedia(null);
        setPreview(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; 
        }
    }
    
     const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif',
                'video/mp4', 'video/quicktime', 'video/avi',
                'application/pdf', 'text/plain'
            ];

            // Add an explicit check for file.type before using includes
            if (!file.type || !allowedTypes.includes(file.type)) {
                alert('Unsupported file type. Please upload an image, video, PDF, or text file.');
                setMedia(null);
                setPreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setMedia(file);
            setPreview(URL.createObjectURL(file));
        } else {
            setMedia(null);
            setPreview(null);
        }
    };

    const triggerFileInput = (accept) => {
        if (fileInputRef.current) {
            fileInputRef.current.accept = accept;
            fileInputRef.current.click();
        }
    };

    const clearMediaSelection = () => {
        setMedia(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return(
       <>
        <div className="Feed-page">
            <div className="flex justify-between pb-4 border-zinc-800">
                <div className="flex gap-2 items-center">
                    <img src="/img/CloakTalk-logo.png"className="h-5 transition hover:scale-110"></img>
                    {/* <h3 className="p-1 font-bold text-xl text-[var(--accent-y)] "> </h3> */}
                </div>
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-[40rem]">
                    <ul className="flex gap-2 p-2 rounded-t-sm justify-start font-bold bg-zinc-900 border-b-2 border-b-zinc-950">
                        <li className="p-1 px-2 bg-zinc-950  rounded-sm">For you</li>
                        <li className="p-1 px-2 bg-zinc-950 rounded-sm">Resources</li>
                        <li className="p-1 px-2 bg-zinc-950 rounded-sm">Yap</li>
                    </ul>
                </div>
                <div className="group relative flex gap-2" ref={pfpRef} onClick={()=>setShowSettings(showSettings===false?true:false)}>
                    <h3 className="p-1 font-bold text-[var(--accent-p)]">{user?.username}</h3>
                    <div className="w-8 h-8 overflow-hidden rounded-full">
                    <img src={user?.pfp} alt="user pfp"
                         className="w-full h-full scale-125 object-cover object-center"/>
                    </div>   
                    {showSettings && (<div className='absolute top-10 right-0 p-2 rounded-lg font-semibold text-black bg-[#f2eaa7] border-2 border-white w-40'>
                        <ul className='text-left'>
                            <li className='p-1 hover:text-[#e771a1]'><Link to='/profile'><FontAwesomeIcon icon={faUser} className='px-2'/>Profile</Link></li>
                            <li className='p-1 hover:text-[#e771a1]'><Link to='/profile'><FontAwesomeIcon icon={faGear} className='px-2' />Settings</Link></li>
                            <li className='p-1 hover:text-[#e771a1]'><Link to='/profile'><FontAwesomeIcon icon={faStar} className='px-2' />About</Link></li>
                            <button className='p-1 text-[#e771a1]' onClick={handleLogout}><FontAwesomeIcon icon={faDownload} className='px-2'/>Log out</button>
                        </ul>
                    </div>) }
                </div>
            </div>
            <div className="bg-zinc-900 rounded w-160 mx-auto p-2 mt-2">
                <button className="group flex gap-2 items-center text-lg px-2 tracking-wide" onClick={CreatePost} >
                    <img src="/img/post.svg" alt="+ to add post" className="w-8 transition group-hover:scale-105" />Share your thoughts...</button>
                <div id="addpost" className="hidden bg-zinc-950 p-2 my-2 rounded">
                    <textarea name="post" id="post-text" className="w-full px-1 resize-none overflow-y-auto no-scrollbar min-h-[3rem] max-h-[20rem] focus:outline-none"
                    rows="6" value={content} onChange={(e) => setContent(e.target.value)} placeholder="I think the best thing a person can do is show up..." 
                    onInput={(e) => {e.target.style.height = "auto";  e.target.style.height = e.target.scrollHeight + "px";}}>
                    </textarea>

                    {preview &&  media && media.type &&(
                            <div className="media-preview my-2 p-2 border border-zinc-700 rounded relative">
                                {media.type.startsWith('image/') && (
                                    <img src={preview} alt="Media Preview" className="max-w-full max-h-64 object-contain mx-auto" />
                                )}
                                {media.type.startsWith('video/') && (
                                    <video src={preview} controls className="max-w-full max-h-64 object-contain mx-auto" />
                                )}
                                {(media.type === 'application/pdf' || media.type === 'text/plain') && (
                                    <div className="text-center p-4 bg-zinc-800 rounded">
                                        <p className="text-zinc-400">File selected: {media.name}</p>
                                        <p className="text-zinc-500">Preview not available for this file type.</p>
                                    </div>
                                )}
                                <button
                                    onClick={clearMediaSelection}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                >
                                    X
                                </button>
                            </div>
                    )}

                    <div className='flex justify-between'>
                    <ul className="tags flex gap-4 px-1">
                         <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                        />
                        <img src="/img/picture.svg" alt="upload picture" className="w-8 cursor-pointer" onClick={() => triggerFileInput('image/*')}/>
                        <img src="/img/vid.svg" alt="upload video" className="w-8 cursor-pointer" onClick={() => triggerFileInput('video/*')} />
                        <img src="/img/pdf.svg" alt="upload pdf" className="w-8 cursor-pointer" onClick={() => triggerFileInput('application/pdf')} />
                        <img src="/img/text.svg" alt="upload text" className="w-8 cursor-pointer" onClick={() => triggerFileInput('text/plain*')} />    
                    </ul>
                    <div className="flex items-center">
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <span className="text-sm text-zinc-400 mr-2">{uploadProgress}%</span>
                                )}
                                <button className="px-4 mx-2 font-bold rounded-xl text-[#e771a1] border-2 border-zinc-100 cursor-pointer bg-[var(--accent-y)] transition hover:scale-94"
                                    onClick={handleSubmitPost}
                                    disabled={!content.trim()  || uploadProgress > 0} >
                                    {uploadProgress > 0 ? 'Uploading...' : 'Post'}
                                </button>
                            </div>
                    </div>
                    <ul className="tags flex gap-2 p-1 pt-2">
                        <li className="px-2 bg-zinc-900  rounded-sm">#Resources</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#General</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Rant</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Advice</li>
                    </ul>
                    
                </div>
            </div>
            <div className="bg-zinc-900 rounded w-[40rem] mx-auto p-2 mt-2"><Post refreshPostsTrigger={postRefreshKey} id={null}/></div>
            
        </div>
       </>
    );
};