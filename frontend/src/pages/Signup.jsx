import { useState } from "react";
import axios from 'axios';

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  async function handleSubmit (e){
    e.preventDefault();
    try{
      const response = await axios.post('http://localhost:4000/signup',{email,password});
      console.log(response.data);
    }catch(err){
      console.log(err);
    }
  }

  return (
    <div className="flex items-center bg-zinc-950">
      <form onSubmit={handleSubmit} className="bg-zinc-800 p-6 rounded-lg shadow-md w-80">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        
        <label className="block mb-2">College Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3"
          required
        />
        
        <label className="block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3"
          required
        />

        <button className="w-full bg-zinc-600 text-white p-2 rounded-lg hover:bg-zinc-500">
          Submit
        </button>
      </form>
    </div>
  );
}
