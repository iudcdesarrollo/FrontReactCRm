import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx'
import './index.css'
// import Layout from './components/clonHubSpot/campaings/Layaut.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID_GOOGLE}>
      <App />
      {/* <Layout/> */}
    </GoogleOAuthProvider>
  </StrictMode>
)