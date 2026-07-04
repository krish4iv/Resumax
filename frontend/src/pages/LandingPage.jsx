import { Bot, BarChart2, FileText, User, Zap, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { theme } from '../theme/index.js'

const features = [
  { icon: Bot,       label: 'AI Job Matching',    desc: 'Personalized recommendations based on your skills and preferences' },
  { icon: BarChart2, label: 'Skill Gap Analysis', desc: 'Know exactly what skills to learn to land your dream job'          },
  { icon: FileText,  label: 'Resume Builder',     desc: 'AI-powered resume creation with multiple professional templates'   },
]

const steps = [
  { number: '01', icon: User,        label: 'Create Profile',  desc: 'Add your skills, experience and job preferences'  },
  { number: '02', icon: Zap,         label: 'Get Matched',     desc: 'Our AI finds the best matching jobs for you'      },
  { number: '03', icon: TrendingUp,  label: 'Apply & Grow',    desc: 'Track applications and improve your career path'  },
]

const LandingPage = () => {
  return (
    <div
      className="min-h-screen text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0f1e 0%, #1a0a2e 50%, #0f0f1e 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-[150px] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-5 border-b border-white/10">
        <span className={`text-xl font-bold ${theme.gradientText}`}>Resumax</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className={theme.btnGlass}>Login</Link>
          <Link to="/register" className={theme.btnPrimary}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-28">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-blue-500/30 text-blue-400 bg-blue-500/10">
          ✨ AI-Powered Career Platform
        </span>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Find Your{' '}
          <span className={theme.gradientText}>Dream Job</span>
          <br />with AI
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl">
          Resumax uses artificial intelligence to match you with the perfect role,
          analyze your skill gaps, and build a stunning resume.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register" className={theme.btnPrimary}>
            Get Started Free →
          </Link>
          <Link to="/jobs" className={theme.btnGlass}>
            Browse Jobs
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything you need to{' '}
            <span className={theme.gradientText}>land your dream job</span>
          </h2>
          <p className="text-slate-400">Powerful AI tools built for modern job seekers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-6 rounded-2xl text-center transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="inline-flex p-3 rounded-xl bg-blue-500/10 mb-4">
                <Icon size={24} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">
            How it <span className={theme.gradientText}>works</span>
          </h2>
          <p className="text-slate-400">Get started in 3 simple steps</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map(({ number, icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-6 rounded-2xl relative"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-5xl font-bold text-white/10 absolute top-4 right-4">
                {number}
              </span>
              <div className="inline-flex p-3 rounded-xl bg-violet-500/10 mb-4">
                <Icon size={24} className="text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-8 py-20 text-center">
        <div
          className="max-w-2xl mx-auto p-12 rounded-3xl"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to find your{' '}
            <span className={theme.gradientText}>dream job?</span>
          </h2>
          <p className="text-slate-400 mb-8">
            Join thousands of professionals already using Resumax
          </p>
          <Link to="/register" className={theme.btnPrimary}>
            Start for Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-6 border-t border-white/10 text-center">
        <p className="text-sm text-slate-500">
          © 2025 Resumax. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default LandingPage