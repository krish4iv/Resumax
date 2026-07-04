import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'

const ProtectedRoutes = ({ children }) => {
  const { user, initialized } = useSelector((state) => state.auth)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-blue-500" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default ProtectedRoutes