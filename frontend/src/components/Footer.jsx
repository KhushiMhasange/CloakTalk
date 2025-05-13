import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
      return(
        <div>
            <div className="footer flex justify-between mt-16 p-4 align-center bg-zinc-950">
                <ul className="flex flex-row gap-8 text-2xl">
                    <a href="https://github.com/KhushiMhasange/CloakTalk" className='hover:text-[var(--accent-y)]'><FontAwesomeIcon icon={faGithub} /></a>
                    <a href="https://x.com/KhushiMhasange" className='hover:text-[var(--accent-p)]'><FontAwesomeIcon icon={faXTwitter} /></a>
                </ul>
                <p>© 2025 CloakTalk. All rights reserved</p>
            </div>
        </div>
      );
}