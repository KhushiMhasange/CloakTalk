import Footer from '/src/components/Footer';
import { useContext } from "react";
import {UserContext} from '../context/userContext';

export default function Profile() {
      const {user} = useContext(UserContext);
      return(
        <div>
           
            <div className="mt-16 w-[40rem] mx-auto">
                <div className='flex justify-between items-center'>
                <h1 className="text-3xl">{user.username}</h1>
                <div className="w-60 h-60 overflow-hidden rounded-full border-2 border-white">
                    <img src={user.pfp} alt="user pfp"
                         className="w-full h-full scale-125 object-cover object-center"/>
                </div> 
                </div>
            </div>
            {<Footer/>}
        </div>
      );
}