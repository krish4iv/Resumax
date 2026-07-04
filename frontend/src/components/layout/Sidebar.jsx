import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logoutUser } from '../../store/slice/authThunks.js'
import { theme } from '../../theme/index.js'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Newspaper,
  User,
  LogOut
} from 'lucide-react'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Briefcase,       label: 'Jobs',      to: '/jobs'      },
  { icon: FileText,        label: 'Resume',    to: '/resume'    },
  { icon: Newspaper,       label: 'News',      to: '/news'      },
  { icon: User,            label: 'Profile',   to: '/profile-setup' },
]

const Sidebar = () => {
  const dispatch = useDispatch()

  return (
    <aside className={theme.sidebar}>
      <div className="flex flex-col h-full">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <span className={`text-xl font-bold ${theme.gradientText}`}>
            Resumax
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Career Intelligence
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${theme.sidebarLink} ${isActive
                  ? theme.sidebarLinkActive
                  : theme.sidebarLinkInactive
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout at bottom */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => dispatch(logoutUser())}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200`}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </aside>
  )
}

export default Sidebar