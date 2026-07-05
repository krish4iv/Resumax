import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { initTheme } from './store/slice/themeSlice.js'
import { useAuth } from './hooks/useAuth.js'
import LandingPage from './pages/LandingPage.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Jobs from './pages/Jobs.jsx'
import ProfileSetup from './pages/ProfileSetup.jsx'
import ProtectedRoutes from './components/ProtectedRoutes'
import News from './pages/News'
import ResumeBuilder from './pages/ResumeBuilder'



const App = () => {
  const dispatch = useDispatch()
  useAuth()

  const { isDark } = useSelector((state) => state.theme)

// Sync dark class with Redux state
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark]) 

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/dashboard" element={<ProtectedRoutes><Dashboard /></ProtectedRoutes>} />
      <Route path="/jobs" element={<ProtectedRoutes><Jobs /></ProtectedRoutes>} />
      <Route path="/news" element={<ProtectedRoutes><News /></ProtectedRoutes>} />
      <Route path="/resume" element={<ProtectedRoutes><ResumeBuilder /></ProtectedRoutes>} />
    </Routes>
  )
}

export default App