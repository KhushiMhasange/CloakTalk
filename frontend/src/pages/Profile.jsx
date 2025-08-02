import Footer from '/src/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Post from '/src/components/Post';
// import axiosInstance from '../../axiosInstance';
import { useContext } from "react";
import { UserContext } from '../context/userContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useContext(UserContext);
  if (!user) {
    return (
      <div><Link to='/log-in'>Login</Link> to view this page !!</div>
    )
  }

  return (
    <div>
      <div className='flex justify-between'>
        <div className="flex gap-2 items-center">
          <img src="/img/CloakTalk-logo.png" className="h-5 transition hover:scale-110"></img>
          {/* <h3 className="p-1 font-bold text-xl text-[var(--accent-y)] "> </h3> */}
        </div>
        <div className='flex'>
          <h3 className="p-1 font-bold text-[var(--accent-p)]">{user.username}</h3>
          <div className="w-8 h-8 overflow-hidden rounded-full">
            <img src={user.pfp} alt="user pfp"
              className="w-full h-full scale-125 object-cover object-center" />
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className='mt-8 p-4 items-center rounded-3xl w-full max-w-4xl bg-zinc-900'>
          <div className="w-full max-w-4xl bg-zinc-950 border border-white p-8 pb-6 rounded-2xl shadow-xl animate-fade-in-up">
            <div className='flex items-center gap-8'>
              <div className="w-40 h-40 sm:w-48 sm:h-48 overflow-hidden rounded-full border-4 border-[var(--accent-p)] shadow-lg transform transition-all duration-300 hover:scale-105">
                <img src={user.pfp} alt="user pfp" className="w-full h-full scale-125 object-cover object-center" />
              </div>
              <div className='w-[32rem] flex flex-col items-start text-left'>
                <h1 className="text-4xl mb-2 sm:text-5xl font-extrabold text-[var(--accent-y)]">
                  {user.username}
                </h1>
                <p>Write about yourself Idk what is it anything you want okayyyy anything else you want to add ???<FontAwesomeIcon icon={faEdit} className='px-4 w-6 text-white' /></p>
              </div>

            </div>
            <div className="flex p-2 justify-center text-xl ">
              Your Posts
            </div>
            <div className="p-4 bg-zinc-900 rounded-b-2xl border border-zinc-800 shadow-inner">
              <Post refreshPostsTrigger={0} userId={user.userId} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}