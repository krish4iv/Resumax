// src/components/landing/Engine.jsx
import { Target, Sparkles, Zap, FileText } from "lucide-react";
import Glass from "./Glass.jsx";
import ScrollDeck from "./ScrollDeck.jsx";

const ENGINE_CARDS = [
  {
    icon: Target,
    title: "ATS Parser",
    body: "Ranks your document against the job description's real token limits — no fluff survives.",
    demo: (
      <div className="mt-5 space-y-1.5 text-xs">
        <p className="text-slate-500 line-through">"Responsible for managing the sales team."</p>
        <p className="text-cyan-300">"Directed a 12-person sales team to 118% of quota."</p>
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: "STAR Synthesizer",
    body: "Turns passive duties into aggressive, quantified achievements automatically.",
    demo: (
      <div className="mt-5 flex flex-wrap gap-2">
        {["Situation", "Task", "Action", "Result"].map((t) => (
          <span key={t} className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] text-slate-300">
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: Zap,
    title: "Semantic Skill Matching",
    body: "Cross-references implicit skills with industry vector embeddings, natively.",
    demo: (
      <div className="mt-5 flex flex-wrap gap-2">
        {["React.js", "Node.js", "Docker"].map((t) => (
          <span key={t} className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[11px] text-cyan-200">
            {t}
          </span>
        ))}
      </div>
    ),
  },
  {
    icon: FileText,
    title: "Consistency Validator",
    body: "Catches typos, tense drift, and stray whitespace before a recruiter ever can.",
    demo: (
      <div className="mt-5 text-xs text-slate-400">Scanned 412 tokens · 0 issues remaining</div>
    ),
  },
];

export default function Engine() {
  return (
    <ScrollDeck
      id="engine"
      eyebrow="MICRO-ARCHITECTURE"
      heading="Engineered to win."
      sub="Not a single wrapper — every micro-service is a purpose-built engine designed to read past the ATS."
      items={ENGINE_CARDS}
      cardWidthClass="w-[min(90vw,420px)]"
      cardHeightClass="min-h-[300px]"
      renderCard={(c) => (
        <Glass className="min-h-[300px] w-full p-7 flex flex-col group transition-all duration-500 hover:-translate-y-3 hover:scale-[1.03] hover:bg-white/[0.08] hover:shadow-[0_30px_80px_rgba(0,255,255,0.18)]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 transition-all duration-500 group-hover:rotate-12 group-hover:scale-125">
            <c.icon size={18} className="text-cyan-200" />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-white transition group-hover:text-cyan-300">{c.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.body}</p>
          <div className="mt-auto rounded-full transition duration-300">{c.demo}</div>
        </Glass>
      )}
    />
  );
}