// src/components/profile/Glass.jsx

export default function Glass({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/4 backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}