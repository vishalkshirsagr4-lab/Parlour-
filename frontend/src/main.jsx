import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { registerServiceWorker } from './serviceWorkerRegistration'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id'}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

registerServiceWorker()
