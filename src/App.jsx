import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import GalleryPage from './components/GalleryPage'
import ConversationPage from './components/ConversationPage'
import { version as APP_VERSION } from '../package.json'


import HomePage from './components/HomePage'

export default function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="conversation" element={<ConversationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem 0',
          background: 'var(--bg-color)',
          color: '#888',
          fontSize: '0.85rem',
        }}
      >
        <div style={{ color: '#888' }}>Version: {APP_VERSION}</div>
        <div style={{ color: '#888' }}>Developed specially for you</div>
      </footer>
    </div>
  )
}