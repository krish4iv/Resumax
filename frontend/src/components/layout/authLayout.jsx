import { Sparkles } from 'lucide-react'

// Matches the landing page's Aurora background exactly: same near-black
// base (#05060c) and the same three violet / cyan / emerald blurred blobs,
// just re-sized slightly to sit nicely behind a centered auth card instead
// of a full page of content. No canvas, no Three.js — plain blurred divs,
// same as the landing page.
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#05060c] px-4">

      {/* Ambient glow orbs — same hues as the landing page's Aurora */}
      <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 -right-32 h-[26rem] w-[26rem] rounded-full bg-cyan-400/15 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-[24rem] w-[24rem] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none" />

      {/* Logo top — same mark as the landing page's nav (cyan Sparkles + plain white wordmark), not a gradient */}
      <div className="absolute top-8 left-8 flex items-center gap-1.5">
        <Sparkles size={16} className="text-cyan-300" />
        <span className="text-lg font-semibold tracking-wide text-white">
          RESUMAX
        </span>
      </div>

      {/* Glass card — identical recipe to the landing page's <Glass> component */}
      <div className="relative z-10 w-full max-w-[420px] rounded-3xl border border-white/[0.12] bg-white/[0.055] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] p-10">
        {children}
      </div>
    </div>
  )
}

export default AuthLayout