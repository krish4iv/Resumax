// src/components/resume-editor/Glass.jsx

export default function Glass({ className = "", children, ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}