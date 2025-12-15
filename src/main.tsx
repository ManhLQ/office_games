import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// CRITICAL: Import games to register them BEFORE rendering
// This ensures GameRegistry is populated when components try to use it
import './games'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
