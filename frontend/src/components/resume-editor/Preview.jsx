// src/components/resume-editor/Preview.jsx

/* ---------------------------------------------------------------
   Live preview
----------------------------------------------------------------*/
export default function Preview({ content }) {
  const { personal, summary, education, experience, projects, skills } = content
  const personalLinks = personal.links || []

  const skillsByCategory = (skills || []).reduce((acc, s) => {
    const cat = s.category || "Other"
    acc[cat] = acc[cat] || []
    acc[cat].push(s.name)
    return acc
  }, {})

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-8 min-h-[600px] shadow-2xl">
      <div className="text-center border-b border-slate-200 pb-4 mb-4">
        <h1 className="text-2xl font-bold">{personal.name || "Your Name"}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {[personal.email, personal.phone, ...personalLinks.map(l => l.url)].filter(Boolean).join(" | ")}
        </p>
      </div>

      {summary && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {education?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Education</h2>
          {education.map((e, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{e.school || "School"}</span>
                <span className="text-slate-500 text-xs">
                  {e.start_date}{e.start_date ? " – " : ""}{e.current ? "Present" : e.end_date}
                </span>
              </div>
              <p className="text-xs text-slate-600">{[e.degree, e.field].filter(Boolean).join(", ")}</p>
            </div>
          ))}
        </div>
      )}

      {experience?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Experience</h2>
          {experience.map((e, i) => (
            <div key={i} className="mb-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">{e.role || "Role"} — {e.company}{e.location ? ` (${e.location})` : ""}</span>
                <span className="text-slate-500 text-xs">{e.start_date}{e.start_date ? " – " : ""}{e.current ? "Present" : e.end_date}</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                {(e.bullets || []).filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {projects?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="mb-2.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold">
                  {p.name}{p.tech ? ` | ${p.tech}` : ""}
                </span>
                <span className="text-slate-500 text-xs">{p.start_date}{p.start_date ? " – " : ""}{p.current ? "Present" : p.end_date}</span>
              </div>
              {p.links?.length > 0 && (
                <p className="text-xs text-blue-600 mt-0.5">
                  {p.links.map((l, li) => (
                    <span key={li}>
                      {li > 0 && " | "}
                      {l.label}: {l.url}
                    </span>
                  ))}
                </p>
              )}
              <ul className="list-disc list-inside text-xs text-slate-700 mt-1 space-y-0.5">
                {(p.bullets || []).filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {skills?.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wide text-slate-700 border-b border-slate-200 pb-1 mb-1.5">Skills</h2>
          {Object.entries(skillsByCategory).map(([cat, names]) => (
            <p key={cat} className="text-xs text-slate-700 mb-0.5">
              <span className="font-semibold">{cat}:</span> {names.join(", ")}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}