import Post from '/src/components/Post';
import { useState,useContext,useRef,useEffect } from 'react';
import {UserContext} from '../context/userContext';
import axiosInstance from  '../../axiosInstance';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faGear,faDownload,faStar } from '@fortawesome/free-solid-svg-icons';

export default function Feed() {
    
    const {user,setUser} = useContext(UserContext);
    const [content, setContent] = useState("");
    const [postRefreshKey, setPostRefreshKey] = useState(0);
    const [showSettings,setShowSettings] = useState(false);
    const pfpRef = useRef(null);

    useEffect(()=>{
            const handleClickOut = (e) =>{
                if(showSettings && pfpRef.current && !pfpRef.current.contains(e.target)){
                    setShowSettings(null);
                }
            };
            document.addEventListener('mousedown',handleClickOut);
            return() => document.removeEventListener('mousedown',handleClickOut);
    },[showSettings]);

    async function handleSubmitPost(){
        try{
           const res = await axiosInstance.post('/posts', { content });
           console.log(res);
           setContent("");
           setPostRefreshKey(prevKey => prevKey + 1);
        }catch(err){
            console.log(err);
        }
        CreatePost();
    }

    async function handleLogout(){
         if (!window.confirm("Do you want to log out?")) { 
            return;
        }
        try{
            const res = await axios.delete('localhost:4000/logout');
            if(res.status===200){
            setUser(null);
            localStorage.clear();
            }
        }catch(err){
         console.log(err);
        }
    }

    function CreatePost(){
        const post = document.getElementById("addpost");
        post.classList.toggle("hidden");
    }

    return(
       <>
        <div className="Feed-page">
            <div className="flex  justify-between pb-4 border-zinc-800">
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
                    <div className='flex justify-between'>
                    <ul className="tags flex gap-4 px-1">
                        <img src="/img/picture.svg" alt="upload picture" className="w-8"/>
                        <img src="/img/vid.svg" alt="upload video" className="w-8" />
                        <img src="/img/pdf.svg" alt="upload pdf" className="w-8" />
                        <img src="/img/text.svg" alt="upload text" className="w-8" />    
                    </ul>
                    <button className="px-4 mx-2 font-bold rounded-xl text-[#e771a1] border-2 border-zinc-100 cursor-pointer bg-[var(--accent-y)] transition hover:scale-94" 
                    onClick={handleSubmitPost}  disabled={content.trim() === ""} >Post</button>
                    </div>
                    <ul className="tags flex gap-2 p-1 pt-2">
                        <li className="px-2 bg-zinc-900  rounded-sm">#Resources</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#General</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Rant</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Advice</li>
                    </ul>
                </div>
            </div>
            <div className="bg-zinc-900 rounded w-[40rem] mx-auto p-2 mt-2"><Post refreshPostsTrigger={postRefreshKey}/></div>
            
        </div>
       </>
    );
};