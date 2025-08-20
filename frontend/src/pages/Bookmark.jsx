import Post from '/src/components/Post';
import { useContext } from 'react';
import {UserContext} from '../context/userContext';
import { Link } from 'react-router-dom';

export default function Bookmarks() {
    const { user } = useContext(UserContext);
    if(!user){
        return(
            <div><Link to='/log-in'>Login</Link> to view this page !!</div>
        )
    }
    return (
        <div>
         <div className='flex justify-between'>
        <div className="flex gap-2 items-center">
          <img src="/img/CloakTalk-logo.png" className="h-5 transition hover:scale-110"></img>
        </div>
        <div className='flex'>
          <h3 className="p-1 font-bold text-[var(--accent-p)]">{user.username}</h3>
          <div className="w-8 h-8 overflow-hidden rounded-full">
            <img src={user.pfp} alt="user pfp"
              className="w-full h-full scale-125 object-cover object-center" />
          </div>
        </div>
        </div>
        <div className='flex flex-col items-center'>
        <h1 className='text-2xl font-bold text-[var(--accent-p)] flex gap-2'>Your Bookmarks <img src="img/bookmarkFilled.svg" alt="bookmark svg" className='w-8 h-8' /> </h1>
            <div className='mt-8 p-3 items-center rounded-3xl w-full max-w-4xl bg-zinc-900'>
                <div className="p-1 bg-zinc-900 rounded-2xl border border-gray-200 shadow-inner">
                    <Post refreshPostsTrigger={0} userId={user.userId} isBookmarked={true} />
                </div>
            </div>
       </div>
       </div>
    )
}