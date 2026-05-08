import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'

inject()
import './index.css'
import App from './App.jsx'
import Admin from './Admin.jsx'

// /admin 경로면 관리자 페이지, 아니면 일반 앱
const isAdmin = window.location.pathname === '/admin'

createRoot(document.getElementById('root')).render(
  <>
  {isAdmin ? <Admin /> : <App />}
</>,
)
