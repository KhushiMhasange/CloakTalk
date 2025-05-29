import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="997523725546-2ubhs0k1v2pdsl06k2o1u32vf4s1e2i4.apps.googleusercontent.com">
      <App/>
    </GoogleOAuthProvider>
  </StrictMode>
)
