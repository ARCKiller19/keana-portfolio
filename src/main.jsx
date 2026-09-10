import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './reference-polish.css'
import './navbar-panel.css'
import './floating-navbar.css'
import './hero-balance.css'
import './contact-balance.css'
import './interface-cues.css'
import './motion-signoffs.css'
import './responsive-guardrails.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
