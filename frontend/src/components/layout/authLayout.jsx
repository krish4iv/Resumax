const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-slate-900 via-purple-950 to-slate-900 px-4">

      {/* Ambient glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 blur-[150px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500 blur-[150px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-500 blur-[120px] opacity-10 pointer-events-none" />

      {/* Logo top */}
      <div className="absolute top-8 left-8">
        <span className="text-xl font-bold bg-linear-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
          Resumax
        </span>
      </div>

      {/* Glass card */}
      <div className="relative z-10 w-full max-w-[420px] rounded-2xl p-10"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default AuthLayout