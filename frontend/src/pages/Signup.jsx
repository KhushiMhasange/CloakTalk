import { useState } from "react";
import Navbar from '/src/components/Navbar';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const borderClass = "border border-t-[var(--accent-p)] border-l-[var(--accent-p)] border-r-[var(--accent-y)] border-b-[var(--accent-y)]";
  const navigate = useNavigate();

  async function handleSignup (res){
    try {
      const response = await axios.post('http://localhost:4000/signup/google', {token: res.credential},);
      console.log("Signup success:", response.data);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.status === 400) {
      alert(err.response.data.message); 
      } else {
      console.error("Signup failed", err);
      alert("Something went wrong. Try again.");
      }
    }
  };
  
async function handleSubmit (e){
  e.preventDefault();
  try{
    const response = await axios.post('http://localhost:4000/signup',{email,password});
    console.log(response.data);
    navigate('/login');
  }catch(err){
    if (err.response && err.response.status === 400) {
      alert(err.response.data.message); 
    } else {
      console.error("Signup failed", err);
      alert("Something went wrong. Try again.");
    }
  }
}

  return (
    <div>
    {<Navbar/>}
        <div className="flex justify-center items-center pt-20">
        <form onSubmit={handleSubmit} className={`bg-zinc-950 p-6  flex flex-col items-start rounded-lg w-80 hover:${borderClass}`}    
              style={{boxShadow:`-1px 3px 8px var(--accent-p),  1px -4px 8px var(--accent-y)`}}>
        <h2 className="text-2xl font-semibold mx-auto mb-6 text-[var(--accent-y)]">Sign Up</h2>
        
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
        className="w-full"
        buttonText="Sign up with Google"
        onSuccess={handleSignup}
        onFailure={handleSignup}
        cookiePolicy={'single_host_origin'}
        />
        </div>
      </form>
    </div>
    </div>
  );
}
