// src/components/landing/Footer.jsx
import { Sparkles } from "lucide-react";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Work", id: "work" },
      { label: "Engine", id: "engine" },
      { label: "Features", id: "features" },
      { label: "Pricing", id: "pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Meet Nova", id: "nova" },
      { label: "FAQ", id: "faq" },
      { label: "Home", id: "home" },
    ],
  },
];

export default function Footer({ onNavigate }) {
  return (
    <footer className="relative px-6 pb-40 pt-10 sm:px-10">
      <Reveal>
        <Glass className="overflow-hidden p-8 sm:p-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.85fr_0.85fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 text-lg font-semibold tracking-wide text-white">
                <Sparkles size={16} className="text-cyan-300" />
                RESUMAX
              </span>
              <p className="mt-3 max-w-xs text-sm text-slate-400">
                Your resume, engineered for impact — rewritten line by line until it earns the interview.
              </p>
            </div>

            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-xs font-semibold tracking-widest text-slate-500">{col.title.toUpperCase()}</p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.id}>
                      <button
                        onClick={() => onNavigate(l.id)}
                        className="text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {l.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} ResuMax. All rights reserved.</p>
            <div className="flex gap-2 text-xs text-slate-500">
              <span>Privacy</span>
              <span className="text-slate-700">·</span>
              <span>Terms</span>
            </div>
          </div>
        </Glass>
      </Reveal>
    </footer>
  );
}