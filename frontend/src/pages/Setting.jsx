import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import MainLayout from "../components/layout/MainLayout.jsx"
import { updateProfile } from "../services/profile.service.js"
import { setUser } from "../store/slice/authSlice.js"
import { toggleTheme } from "../store/slice/themeSlice.js"
import { logoutUser } from "../store/slice/authThunks.js"
import {
  User, Moon, Sun, LogOut, Check, Loader2, AlertTriangle
} from "lucide-react"

const inputStyle = "w-full px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/40 focus:bg-white/[0.07] transition-all"
const labelStyle = "block text-xs font-medium text-slate-400 mb-1.5"

function Glass({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

function AccountSection({ user, onSave }) {
  const [name, setName] = useState(user?.name || "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Glass className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <User size={15} className="text-cyan-300" /> Account
        </p>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          {saving && <><Loader2 size={11} className="animate-spin" /> Saving…</>}
          {saved && <><Check size={11} className="text-emerald-400" /> Saved</>}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <label className={labelStyle}>Full Name</label>
          <input className={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <label className={labelStyle}>Email</label>
          <input className={`${inputStyle} opacity-60 cursor-not-allowed`} value={user?.email || ""} disabled />
          <p className="text-[11px] text-slate-600 mt-1">Email is linked to your account and can't be changed here.</p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="mt-4 px-5 py-2.5 rounded-xl bg-pink-500 text-white text-sm font-bold hover:bg-pink-400 transition-all disabled:opacity-50"
      >
        Save Changes
      </button>
    </Glass>
  )
}

function AppearanceSection() {
  const dispatch = useDispatch()
  const { isDark } = useSelector(state => state.theme)

  return (
    <Glass className="p-6">
      <p className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
        {isDark ? <Moon size={15} className="text-cyan-300" /> : <Sun size={15} className="text-amber-300" />}
        Appearance
      </p>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white">Dark mode</p>
          <p className="text-xs text-slate-500 mt-0.5">Toggle between light and dark theme</p>
        </div>
        <button
          onClick={() => dispatch(toggleTheme())}
          className={`relative w-11 h-6 rounded-full transition-colors ${isDark ? "bg-cyan-500" : "bg-white/10"}`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              isDark ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </Glass>
  )
}

function DangerZone() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)

  async function handleLogout() {
    await dispatch(logoutUser())
    navigate("/login")
  }

  return (
    <Glass className="p-6 border-rose-500/20">
      <p className="text-sm font-semibold text-rose-300 flex items-center gap-2 mb-4">
        <AlertTriangle size={15} /> Account
      </p>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-all"
        >
          <LogOut size={14} /> Log out
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-300">Are you sure?</p>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-400 transition-all"
          >
            Yes, log out
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      )}
    </Glass>
  )
}

export default function Settings() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  async function handleAccountSave(data) {
    const result = await updateProfile(data)
    dispatch(setUser({ ...user, ...result.user }))
  }

  return (
    <MainLayout>
      <div className="space-y-5 animate-fade-in max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your account and preferences.</p>
        </div>

        <AccountSection user={user} onSave={handleAccountSave} />
        <AppearanceSection />
        <DangerZone />
      </div>
    </MainLayout>
  )
}