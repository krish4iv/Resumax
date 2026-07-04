import { Link as RouterLink } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slice/authThunks.js'
import { toggleTheme } from '../../store/slice/themeSlice.js'
import { theme } from '../../theme/index.js'
import { Sun, Moon, LogOut, LayoutDashboard, Briefcase } from 'lucide-react'

const Navbar = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { isDark } = useSelector((state) => state.theme)

  return (
    <nav className={theme.navbar}>
      {/* Logo */}
      <RouterLink to="/">
        <span className={`text-xl font-bold ${theme.gradientText}`}>
          Resumax
        </span>
      </RouterLink>

      {/* Right side */}
      <div className="flex items-center gap-3">

        {/* Dark mode toggle */}
        <button
          onClick={() => {
            dispatch(toggleTheme())
            console.log('dark class on html:', document.documentElement.classList.contains('dark'))
            console.log('isDark state:', !isDark)
          }}
          className={`p-2 rounded-xl ${theme.btnGlass}`}
        >
          {isDark
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} className="text-slate-600" />
          }
        </button>

        {user ? (
          <>
            {/* Nav links */}
            <RouterLink to="/dashboard" className={theme.btnGlass}>
              <span className="flex items-center gap-2">
                <LayoutDashboard size={15} />
                Dashboard
              </span>
            </RouterLink>

            <RouterLink to="/jobs" className={theme.btnGlass}>
              <span className="flex items-center gap-2">
                <Briefcase size={15} />
                Jobs
              </span>
            </RouterLink>

            {/* User email */}
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden md:block">
              {user.email}
            </span>

            {/* Logout */}
            <button
              onClick={() => dispatch(logoutUser())}
              className={`flex items-center gap-2 ${theme.btnDanger}`}
            >
              <LogOut size={15} />
              Logout
            </button>
          </>
        ) : (
          <>
            <RouterLink to="/login" className={theme.btnGlass}>
              Login
            </RouterLink>
            <RouterLink to="/register" className={theme.btnPrimary}>
              Get Started
            </RouterLink>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar