import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/slice/authThunks.js'
import { toggleSidebar } from '../../store/slice/themeSlice.js'
import {
  PanelLeftClose, PanelLeft, Search, Sparkles,
  Home, Bot, Route, Briefcase, FileText, Target, User,
  Map, Rocket, BookOpen, Building2, MessagesSquare,
  ClipboardList, Settings, LogOut,
} from "lucide-react"

const MAIN_ITEMS = [
  { id: "home",      label: "Home",      icon: Home,          route: "/dashboard" },
  { id: "atlas",     label: "Atlas",     icon: Bot,           route: "/atlas"     },
  { id: "path",      label: "Path",      icon: Route,         route: "/path"      },
  { id: "jobs",      label: "Jobs",      icon: Briefcase,     route: "/jobs"      },
  { id: "resume",    label: "Resume",    icon: FileText,      route: "/resume-builder/new"    },
  { id: "interview", label: "Interview", icon: Target,        route: "/interview" },
  { id: "profile",   label: "Profile",   icon: User,          route: "/profile"   },
  { id: "documents", label: "Documents", icon: FileText,      route: "/documents" },
]

const RESOURCE_ITEMS = [
  { id: "roadmaps",      label: "Roadmaps",      icon: Map,           route: "/roadmaps"      },
  { id: "projects",      label: "Projects",      icon: Rocket,        route: "/projects"      },
  { id: "guides",        label: "Guides",        icon: BookOpen,      route: "/guides"        },
  { id: "system-design", label: "System Design", icon: Building2,     route: "/system-design" },
  { id: "behavioral",    label: "Behavioral Qs", icon: MessagesSquare,route: "/behavioral"    },
  { id: "templates",     label: "Templates",     icon: ClipboardList, route: "/templates"     },
]

function NavItem({ item, collapsed }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.route}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        `group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-medium leading-tight transition-colors duration-200 ${
          isActive
            ? "bg-white/[0.09] text-white"
            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
        } ${collapsed ? "justify-center" : ""}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-cyan-300 to-violet-400" />
          )}
          <Icon size={16} className={isActive ? "text-cyan-200 shrink-0" : "shrink-0"} strokeWidth={1.8} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children, collapsed }) {
  if (collapsed) return <div className="my-1.5 h-px w-6 bg-white/10 mx-auto" />
  return (
    <p className="px-3 pb-1 pt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </p>
  )
}

export default function Sidebar() {
  const dispatch = useDispatch()
  const { sidebarCollapsed: collapsed } = useSelector(state => state.theme)

  return (
    <aside className={`fixed left-0 top-0 flex h-screen flex-col border-r border-white/[0.08] bg-[#05060c]/90 backdrop-blur-2xl transition-all duration-300 z-50 ${collapsed ? "w-[76px]" : "w-64"}`}>

      {/* Header */}
      <div className="flex shrink-0 items-center gap-2 px-5.5 py-2.5 justify-between">
        
        {!collapsed && (
          <span className="flex items-center gap-1.5 text-sm font-semibold tracking-wide text-white">
            <Sparkles size={13} className="text-cyan-300" />
            RESUMAX
          </span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="shrink-0 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          style={{ right: 0 }}
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 pb-1.5">
        {collapsed ? (
          <button className="flex h-8 w-full items-center justify-center rounded-lg border border-white/10 bg-black/20 text-slate-400 hover:text-white transition-colors">
            <Search size={15} />
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2.5 py-1.5">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-[13px] text-slate-200 placeholder:text-slate-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* Nav — no overflow/scroll: sized to always fit in one screen */}
      <nav className="flex-1 min-h-0 px-3">
        <SectionLabel collapsed={collapsed}>Main</SectionLabel>
        <div className="space-y-2.5">
          {MAIN_ITEMS.map(item => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}
        </div>
        <div className="h-px bg-white/10 my-2"></div>
        <SectionLabel collapsed={collapsed}>Resources</SectionLabel>
        <div className="space-y-0.5">
          {RESOURCE_ITEMS.map(item => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-0.5 border-t border-white/[0.08] px-3 py-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-medium leading-tight transition-colors ${
              isActive ? "bg-white/[0.09] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
            } ${collapsed ? "justify-center" : ""}`
          }
        >
          <Settings size={16} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={() => dispatch(logoutUser())}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-[13px] font-medium leading-tight text-rose-300/80 transition-colors hover:bg-rose-500/[0.08] hover:text-rose-300 ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}