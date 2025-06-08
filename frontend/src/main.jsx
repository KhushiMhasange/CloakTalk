import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { UserProvider } from './context/userContext';
import './index.css';
import App from './App.jsx'

const clientId = import.meta.env.VITE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
    <GoogleOAuthProvider clientId={clientId}>
      <App/>
    </GoogleOAuthProvider>
    </UserProvider>
  </StrictMode>
)
