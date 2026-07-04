import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loginUser } from '../store/slice/authThunks.js'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/authLayout.jsx'
import { theme } from '../theme/index.js'
import { Loader2, Mail, Lock } from 'lucide-react'

const Login = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    const response = await dispatch(loginUser({ email, password }))
    if (loginUser.fulfilled.match(response)) {
      navigate('/dashboard')
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 ${theme.btnPrimary} flex items-center justify-center gap-2`}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Signing in...</>
              : 'Sign In'
            }
          </button>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>

      </form>
    </AuthLayout>
  )
}

export default Login