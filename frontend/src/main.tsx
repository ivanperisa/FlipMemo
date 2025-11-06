import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { LearningProvider } from './context/LearningContext.tsx'


const GOOGLE_CLIENT_ID = import.meta.env.VITE_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <LearningProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </LearningProvider>
  </GoogleOAuthProvider>
)
