import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser } from '../store/slice/authThunks.js'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/authLayout.jsx'
import { theme } from '../theme/index.js'
import { Loader2, Mail, Lock, User } from 'lucide-react'

const Register = () => {
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!name || !email || !password) {
      setLocalError('All fields are required')
      return
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters')
      return
    }

    const response = await dispatch(registerUser({ email, password, name }))
    if (registerUser.fulfilled.match(response)) {
      navigate('/profile-setup')
    }
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
  }

  const fields = [
    { icon: User,  label: 'Full Name', type: 'text',     value: name,     setter: setName,     placeholder: 'John Doe' },
    { icon: Mail,  label: 'Email',     type: 'email',    value: email,    setter: setEmail,    placeholder: 'you@example.com' },
    { icon: Lock,  label: 'Password',  type: 'password', value: password, setter: setPassword, placeholder: '••••••••' },
  ]

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Create account
          </h1>
          <p className="text-sm text-slate-400">
            Start your career journey for free
          </p>
        </div>

        {/* Error */}
        {(error || localError) && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{localError || error}</p>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-4">
          {fields.map(({ icon: Icon, label, type, value, setter, placeholder }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 ${theme.btnPrimary} flex items-center justify-center gap-2`}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Creating account...</>
              : 'Create Account'
            }
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>

      </form>
    </AuthLayout>
  )
}

export default Register