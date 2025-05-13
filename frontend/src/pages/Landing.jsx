import Navbar from '/src/components/Navbar';
import Footer from '/src/components/Footer';
import { motion } from "motion/react"
import { Link } from 'react-router-dom';

export default function Landing() {
      return(
        <div>
            {<Navbar/>}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <div className="Landing flex flex-col my-36 gap-4 cursor-pointer">
              {/* Hero-Main */}
              <h1 className='text-7xl font-extrabold main-head'>Say It Without a Name</h1>
              <h2 className='text-2xl hover:text-gray-300'><Link to="/login" className="cursor-pointer hover:text-[var(--accent-y)]">Log in</Link> with your college ID and connect with your peers without revealing your identity.</h2>
              <div className='ewlative flex flex-row text-lg justify-center font-bold gap-8'>
                <p className='text-[var(--accent-p)]'>Study Groups </p>
                <p className='text-[var(--accent-y)]'>Fun Discussions</p>
                <p className='text-[var(--accent-p)]'>Resource Sharing</p>
                <img className="absolute top-40 right-84 invert" src="/img/star.svg" alt="star" width={40} />
                <img className="absolute top-110 left-132 invert" src="/img/star2.svg" alt="star" width={40} />
                <img className="absolute top-110 left-184 invert" src="/img/chat.svg" alt="chat" width={40} />
                <img className="absolute top-30 left-152 invert" src="/img/heart.svg" alt="heart"width={40}  />
                <img className="absolute top-90 left-72" src="/img/flower.svg" alt="flower" width={40} />
                <img className="absolute top-40 left-84 invert" src="/img/chat.svg" alt="chat" width={40} />
                <img className="absolute top-86 right-60 invert" src="/img/user.svg" alt="user" width={40} />
              </div>
            </div>
            {/* Middle-section */}
            <div className='flex flex-row gap-12 items-center tracking-wider'>
            <div className='relative bg-[linear-gradient(270deg,#fff59a,#ffafcf)] rounded-full blur-xs chat-img w-120 h-120'></div>
            <img className="absolute" src="/img/Theme.png" alt="chat" width={500}/>
                <div><p className='flex flex-row gap-2 text-3xl text-left font-semi-bold'>Still looking for <h1 className='text-[var(--accent-y)] font-extrabold'> your people</h1></p> 
                <p className='text-3xl text-left font-semi-bold'>on campus <span className='font-bold text-[var(--accent-p)]'>?</span>
                  <p className='text-xl text-left font-semi-bold py-2 w-148'>Form groups, connect with , <span className='font-extrabold text-[var(--accent-p)]'>like-minded folks</span> and be part of conversations that matter—whether it’s tech, anime, design, music, memes, or midnight food debates.</p>
                </p>
                </div>
            </div>
            {/* final-section */}
            <div className='flex flex-row gap-12 items-center tracking-wider'>
                <div><p className='flex flex-row gap-2 text-3xl text-left font-semi-bold'>&quot;Speak Your Mind—<span className='font-extrabold text-[var(--accent-p)]'>No Strings Attached!</span>”</p> 
                <p className='text-3xl text-left font-semi-bold'>
                  <p className='text-xl text-left font-semi-bold py-2 w-180'>Discussions, where every thought gets it&apos;s spotlight. Whether it’s a conspiracy theory, an aggresive rant, or your latest campus gossip, post it here and watch the conversation come alive—<span className='font-extrabold text-[var(--accent-y)]'>completely anonymously.</span></p>
                </p>
                </div>
                <div className='relative bg-[linear-gradient(270deg,#ffafcf,#fff59a)] rounded-lg blur-sm w-120 h-164'></div>
                <img className='absolute right-12' src="/img/post.png" alt="chat" width={400}/>
            </div>
            </motion.div>
            {<Footer/>}
        </div>
      );
};