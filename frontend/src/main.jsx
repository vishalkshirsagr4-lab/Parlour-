import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { registerServiceWorker } from './serviceWorkerRegistration'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={'893091028944-s3r8q3kqfv70gikmol4rdb0cmreqr5u7.apps.googleusercontent.com'}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)

registerServiceWorker()
