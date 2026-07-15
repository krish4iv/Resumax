import MainLayout from "../layout/MainLayout.jsx"

function Glass({ className = "", children, ...rest }) {
  return (
    <div className={`rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl ${className}`} {...rest}>
      {children}
    </div>
  )
}

export default function ResourceListPage({ eyebrow, title, subtitle, groups }) {
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl">
        <div>
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500 mb-1">{eyebrow}</p>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {groups.map(group => (
          <Glass key={group.heading} className="p-6">
            <p className="text-sm font-semibold text-white mb-1">{group.heading}</p>
            {group.description && (
              <p className="text-xs text-slate-500 mb-4">{group.description}</p>
            )}
            <div className="space-y-2">
              {group.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 shrink-0 mt-0.5">
                      {item.badge}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Glass>
        ))}
      </div>
    </MainLayout>
  )
}