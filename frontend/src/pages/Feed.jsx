import Post from '/src/components/Post';

export default function Feed() {
    function AddPost(){
        const post = document.getElementById("addpost");
        post.classList.toggle("hidden");
    }
    return(
       <>
        <div className="Feed-page">
            <div className="flex  justify-between pb-4 border-zinc-800">
                <div className="flex gap-2 items-center">
                    <img src="/img/CloakTalk-logo.png"className="h-5"></img>
                    {/* <h3 className="p-1 font-bold text-xl text-[var(--accent-y)] "> </h3> */}
                </div>
                <div className="absolute w-160 left-80 top-4">
                    <ul className="flex gap-2 p-2 text-lg rounded-t-sm justify-start bg-zinc-900 border-b-2 border-b-zinc-950">
                        <li className="p-1 px-2 bg-zinc-950  rounded-sm">For you</li>
                        <li className="p-1 px-2 bg-zinc-950 rounded-sm">Resources</li>
                        <li className="p-1 px-2 bg-zinc-950 rounded-sm">Yap</li>
                    </ul>
                </div>
                <div className="flex gap-2">
                    <h3 className="p-1 font-bold text-[var(--accent-p)]">Green-swan</h3>
                    <img src="/img/user.jpg" alt="user pfp" className="w-8 h-8 rounded-full"></img>
                </div>
            </div>
            <div className="bg-zinc-900 rounded w-160 mx-auto p-2 mt-2">
                <button className="group flex gap-2 items-center text-lg px-2 tracking-wide" onClick={AddPost}><img src="/img/post.svg" alt="+ to add post" className="w-8 transition-transform duration-300 group-hover:scale-110" />Share your thoughts...</button>
                <div id="addpost" className="hidden bg-zinc-950 p-2 my-2 rounded">
                    <textarea name="post" id="post-text" className="w-full px-1 resize-none overflow-y-auto no-scrollbar min-h-[3rem] max-h-[20rem] focus:outline-none"
                    rows="6" placeholder="I think the worst part about being in a tier 3 is..." 
                    onInput={(e) => {e.target.style.height = "auto";  e.target.style.height = e.target.scrollHeight + "px";}}>
                    </textarea>
                    <div className='flex justify-between'>
                    <ul className="tags flex gap-4 px-1">
                        <img src="/img/picture.svg" alt="upload picture" className="w-8"/>
                        <img src="/img/vid.svg" alt="upload video" className="w-8" />
                        <img src="/img/pdf.svg" alt="upload pdf" className="w-8" />
                        <img src="/img/text.svg" alt="upload text" className="w-8" />    
                    </ul>
                    <button className='bg-[var(--accent-y)] px-4 mx-2 font-extrabold rounded-xl text-[#e771a1]'>Post</button>
                    </div>
                    <ul className="tags flex gap-2 p-1 pt-2">
                        <li className="px-2 bg-zinc-900  rounded-sm">#Resources</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#General</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Rant</li>
                        <li className="px-2 bg-zinc-900  rounded-sm">#Advice</li>
                    </ul>
                </div>
            </div>
            <div className="bg-zinc-900 rounded w-160 mx-auto p-2 mt-2"><Post/></div>
            
        </div>
       </>
    );
};