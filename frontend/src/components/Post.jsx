export default function Feed() {
    return(
        <div className="bg-zinc-950 p-2">
            <div className="flex gap-2 p-1 items-center">
                <img src="/img/user.jpg" alt="user pfp" className="w-8 h-8 rounded-full"></img>
                <h3 className="font-bold text-[var(--accent-p)] text-left">Green-swan
                    <p id="post-timestamp" className="text-white tracking-widest">11:11p.m 31/05/2025</p>
                </h3>
            </div>
            <div>
            <p className="text-left p-1">Built a simple portfolio website using HTML and CSS Hosted it using Amazon S3 static website hosting feature Configured public access, permissions, and tested the live site.Check the project documentation on medium </p>
            </div>
            <div>
                <ul className="tags flex gap-8 p-1">
                    <li className="flex gap-1 text-lg text-[var(--accent-p)]"><img src="/img/like.svg" alt="upload picture" className="w-6"/><p>16</p></li>
                    <li className="flex gap-1 text-lg"><img src="/img/comment.svg" alt="upload video" className="w-7"/><p>2</p></li>
                    <li className="flex gap-1 text-lg text-[var(--accent-y)]"><img  src="/img/bookmark.svg" alt="upload pdf" className="w-6"/><p>1</p></li>   
                </ul>
            </div>
        </div>
    )
}