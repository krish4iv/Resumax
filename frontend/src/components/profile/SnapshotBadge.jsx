// src/components/profile/SnapshotBadge.jsx

export default function SnapshotBadge({ label, value }) {
  if (!value) return null
  return (
    <div className="px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm text-white truncate">{value}</p>
    </div>
  )
}