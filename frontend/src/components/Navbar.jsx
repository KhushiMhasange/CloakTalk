import { Link } from 'react-router-dom';

export default function Navbar() {
      return(
        <div>
            <div className="flex justify-between">
                <img src="src/assets/img/CloakTalk-logo.png" alt="logo-cloaktalk" width={160} className='transform hover:scale-105 transition-transform duration-300 ease-in-out'/>
                <ul className="flex justify-end align-center gap-4 text-[var(--accent-p)]">
                <li><Link to="/login" className="cursor-pointer hover:text-[var(--accent-y)]">Log in</Link></li>
                <li><Link to="/sign-up" className="cursor-pointer hover:text-[var(--accent-y)]">Sign up</Link></li>
                </ul>
            </div>
        </div>
      );
}