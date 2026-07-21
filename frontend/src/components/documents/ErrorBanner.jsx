// src/components/documents/ErrorBanner.jsx
import { AlertCircle } from "lucide-react"

export default function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-300">
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}