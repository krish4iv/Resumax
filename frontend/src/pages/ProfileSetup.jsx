import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../config/firebase.js'
import api from '../services/api.service.js'
import AuthLayout from '../components/layout/authLayout.jsx'
import { theme } from '../theme/index.js'
import { Loader2, MapPin, Briefcase, X, Plus } from 'lucide-react'

const job_roles = [
  "Frontend Developer", "Backend Developer", "React Developer",
  "UI/UX Designer", "Product Manager", "Data Scientist",
  "DevOps Engineer", "QA Engineer", "Mobile Developer",
  "Machine Learning Engineer"
]

const inputStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
}

const ProfileSetup = () => {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [preferredRole, setPreferredRole] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault()
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()])
      }
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!location || !preferredRole || skills.length === 0) {
      setError('All fields are required including at least one skill')
      return
    }
    try {
      setLoading(true)
      const token = await auth.currentUser.getIdToken()
      await api.put('/auth/profile',
        { location, preferred_role: preferredRole, skills },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/dashboard')
    } catch (err) {
      setError('Failed to save profile. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">
            Complete your profile
          </h1>
          <p className="text-sm text-slate-400">
            Help us personalize your experience
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-5">

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Location
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where are you based?"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* Preferred Role */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Preferred Role
            </label>
            <div className="relative">
              <Briefcase size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
              <select
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  ...inputStyle,
                  color: preferredRole ? 'white' : 'rgb(100 116 139)',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              >
                <option value="" style={{ background: '#1a1a2e' }}>
                  Select your preferred role
                </option>
                {job_roles.map((role) => (
                  <option key={role} value={role} style={{ background: '#1a1a2e', color: 'white' }}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Skills
            </label>
            <div className="relative">
              <Plus size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-200"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Press Enter to add each skill
            </p>

            {/* Skill tags */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-blue-300 transition-all duration-200"
                    style={{
                      background: 'rgba(37,99,235,0.2)',
                      border: '1px solid rgba(37,99,235,0.4)',
                    }}
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 ${theme.btnPrimary} flex items-center justify-center gap-2`}
          >
            {loading
              ? <><Loader2 size={15} className="animate-spin" /> Saving...</>
              : 'Save & Continue'
            }
          </button>

        </div>
      </form>
    </AuthLayout>
  )
}

export default ProfileSetup