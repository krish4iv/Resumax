// src/components/documents/Glass.jsx

export default function Glass({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag
      className={`rounded-3xl border border-white/12 bg-white/5 backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}