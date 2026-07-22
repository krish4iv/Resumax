import { Briefcase } from 'lucide-react'

const EmptyState = ({ title, body }) => (
  <div className="text-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
    <Briefcase size={40} className="mx-auto text-slate-600 mb-3" />
    <p className="font-medium text-white text-sm">{title}</p>
    <p className="text-slate-500 text-xs mt-1">{body}</p>
  </div>
)

export default EmptyState