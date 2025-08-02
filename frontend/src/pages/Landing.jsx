import Navbar from '/src/components/Navbar';
import Footer from '/src/components/Footer';
import { motion } from "motion/react"
import { Link } from 'react-router-dom';

export default function Landing() {
  const Right = {
  initial: { opacity: 0, x: 100 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.8 },
  viewport: { once: true, amount: 0.25 },
  };

  const Left = {
  initial: { opacity: 0, x: -100 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.8 },
  viewport: { once: true, amount: 0.25 },
  };

  return(
  <div>
  {<Navbar/>}
  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
  {/* Landing Section */}
  <div className="Landing flex flex-col my-36 gap-4 cursor-pointer">
    <motion.h1 initial={{ opacity: 0, y:50 }} whileInView={{ opacity: 1, y:0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className='text-5xl md:text-7xl font-extrabold main-head'>Say It Without a Name</motion.h1>
    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1}} transition={{ delay: 0.5 }} viewport={{ once: true }} className='text-xl md:text-2xl hover:text-gray-300'>
      <Link to="/login" className="cursor-pointer hover:text-[var(--accent-y)]">Log in</Link> with your college ID and connect with your peers without revealing your identity.
    </motion.h2>
    <div className='ewlative flex flex-row md:text-lg justify-center font-bold gap-8'>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1}} transition={{ delay: 1 }} viewport={{ once: true }} className='text-[var(--accent-p)]'>Study Groups </motion.p>
        <motion.p  initial={{ opacity: 0 }} whileInView={{ opacity: 1}} transition={{ delay: 0.7 }} viewport={{ once: true }} className='text-[var(--accent-y)]'>Fun Discussions</motion.p>
        <motion.p  initial={{ opacity: 0 }} whileInView={{ opacity: 1}} transition={{ delay: 1 }} viewport={{ once: true }} className='text-[var(--accent-p)]'>Resource Sharing</motion.p>
        <motion.img {...Left} transition={{delay: 0.5}} className="absolute md:block md:top-40 md:right-84 invert" src="/img/star.svg" alt="star" width={40} />
        <motion.img {...Right} transition={{delay: 0.7}} className="absolute md:block md:top-110 left-132 invert" src="/img/star2.svg" alt="star" width={40} />
        <motion.img {...Right} transition={{delay: 1.5 }} className="absolute md:block md:top-110 md:left-184 invert" src="/img/chat.svg" alt="chat" width={40} />
        <motion.img {...Right} transition={{delay: 1.7}} className="absolute md:block md:top-30 md:left-152 invert" src="/img/heart.svg" alt="heart"width={40}  />
        <motion.img {...Right} transition={{delay: 0.5}} className="absolute md:block md:top-90 md:left-72" src="/img/flower.svg" alt="flower" width={40} />
        <motion.img {...Right} transition={{delay: 1.2}} className="absolute md:block md:top-40 md:left-84 invert" src="/img/chat.svg" alt="chat" width={40} />
        <motion.img {...Right} transition={{delay: 2}} className="absolute md:block md:top-86 md:right-60 invert" src="/img/user.svg" alt="user" width={40} />
    </div>
  </div>

  {/* Middle-section */}
  <div className='flex flex-row gap-12 items-center tracking-wider'>
    <motion.div
      className='relative bg-[linear-gradient(270deg,#fff59a,#ffafcf)] rounded-full blur-xs chat-img w-120 h-120'
      {...Left}
    />
    <motion.img
      className="absolute"
      src="/img/Theme.png"
      alt="chat"
      width={500}
      {...Right}
    />
    <motion.div {...Left}>
      <p className='flex flex-row gap-2 text-3xl text-left font-semi-bold'>Still looking for <h1 className='text-[var(--accent-y)] font-extrabold'> your people</h1></p> 
      <p className='text-3xl text-left font-semi-bold'>
        on campus <span className='font-bold text-[var(--accent-p)]'>?</span>
        <p className='text-xl text-left font-semi-bold py-2 w-148'>Form groups, connect with <span className='font-extrabold text-[var(--accent-p)]'>like-minded folks</span> and be part of conversations that matter—whether it’s tech, anime, design, music, memes, or midnight food debates.</p>
      </p>
    </motion.div>
  </div>

  {/* Final-section */}
  <div className='flex flex-row gap-12 items-center tracking-wider'>
    <motion.div {...Right}>
      <p className='flex flex-row gap-2 text-3xl text-left font-semi-bold'>
        “Speak Your Mind—<span className='font-extrabold text-[var(--accent-p)]'>No Strings Attached!</span>”
      </p> 
      <p className='text-3xl text-left font-semi-bold'>
        <p className='text-xl text-left font-semi-bold py-2 w-180'>Discussions, where every thought gets its spotlight Whether it’s a conspiracy theory, an aggresive rant, or your latest campus gossip, post it here and watch the conversation come alive— <span className='font-extrabold text-[var(--accent-y)]'>completely anonymously.</span></p>
      </p>
    </motion.div>

    <motion.div
      className='relative bg-[linear-gradient(270deg,#ffafcf,#fff59a)] rounded-lg blur-sm w-120 h-164'
      {...Right}
    />

    <motion.img
      className='absolute right-12'
      src="/img/post.png"
      alt="chat"
      width={400}
      {...Left}
    />
  </div>
</motion.div>

{<Footer/>}
</div>
);
};

