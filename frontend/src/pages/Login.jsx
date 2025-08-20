import { useState,useContext } from "react";
import Navbar from '/src/components/Navbar';
import { UserContext } from '../context/userContext';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState("");
    const {setUser} = useContext(UserContext);
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const borderClass = "border border-t-[var(--accent-p)] border-l-[var(--accent-p)] border-r-[var(--accent-y)] border-b-[var(--accent-y)]";
     
    async function handleSignin (res){
        try {
          const response = await axios.post('http://localhost:4000/signup/google', {token: res.credential},);
          // console.log("Login success:", response.data);
          localStorage.setItem('access_token', response.data.accessToken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          setUser(response.data.user);
          // localStorage.setItem('user',JSON.stringify(response.data.user));
          navigate('/feed');
        } catch (err) {
          if (err.response && err.response.status === 400) {
          alert(err.response.data.message); 
          } else {
          console.error("Login failed", err);
          alert("Something went wrong. Try again.");
          }
        }
      };

    async function handleSubmit(e){
        e.preventDefault();
        try {
          const response = await axios.post('http://localhost:4000/login', {email,password},);
          console.log(response.data);
          localStorage.setItem('access_token', response.data.accesstoken);
          localStorage.setItem('refresh_token', response.data.refreshToken);
          localStorage.setItem('user',JSON.stringify(response.data.user));
          navigate('/feed');
        } catch (err) {
          if (err.response && err.response.status === 400) {
          alert(err.response.data.message); 
          } else {
          console.error("Login failed", err);
          alert("Something went wrong. Try again.");
          }
        }
      };
    return(
        <div>
        {<Navbar/>}
       <div className="flex justify-center items-center pt-20">
       <form onSubmit={handleSubmit} className={`bg-zinc-950 p-6  flex flex-col items-start rounded-lg w-80 hover:${borderClass}`}    
             style={{boxShadow:`-1px 4px 8px var(--accent-p),  1px -3px 8px var(--accent-y)`}}>
        <h2 className="text-2xl font-semibold mx-auto mb-6 text-[var(--accent-y)]">Log In</h2>
        
        <label className="block mb-1">College Email :</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${borderClass} focus:outline-none`}
          required
        />
        
        <label className="block mb-1">Password :</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${borderClass} hover:bg-zinc-950 focus:outline-none`}
          required
        />

        <button className="w-full bg-zinc-900 text-[var(--accent-y)] font-bold p-2 mb-3 rounded hover:text-[var(--accent-p)]">
          Submit
        </button>
        <div className="w-full flex flex-row justify-center bg-white border-1 rounded-sm">
        <GoogleLogin
        buttonText="Log in with Google"
        onSuccess={handleSignin}
        onFailure={handleSignin}
        cookiePolicy={'single_host_origin'}
        />
        </div>
      </form>
    </div>
    </div>
    )
}