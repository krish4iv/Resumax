// src/components/landing/FAQ.jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";

const FAQS = [
  {
    q: "How does the AI optimization work?",
    a: "Nova analyzes your resume against industry benchmarks and ATS rules, then rewrites your bullet points for clarity, impact, and keyword coverage.",
  },
  {
    q: "Is my personal data kept secure?",
    a: "Your documents are encrypted in transit and at rest, and are never used to train models outside your own account.",
  },
  {
    q: "Does this pass ATS systems?",
    a: "Yes — every export is validated against common applicant-tracking parsing rules before it's handed back to you.",
  },
  {
    q: "Can I export to PDF or DOCX?",
    a: "Both, plus a plain-text version formatted for pasting directly into application forms.",
  },
  {
    q: "Does it support different resume formats?",
    a: "Chronological, functional, and hybrid formats are all supported, and Nova will suggest the best fit for your history.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="relative py-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-[0.9fr_1.1fr] gap-14">
        <Reveal>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Got questions?</h2>
          <p className="mt-4 max-w-sm text-slate-400">
            Everything about the analysis pipeline, and exactly how we engineer your next career move.
          </p>
        </Reveal>

        <div className="space-y-3">
          {FAQS.map((f, i) => (
            <Reveal delay={i * 70} key={f.q}>
              <Glass className="overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="font-semibold text-white">{f.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{f.a}</p>
                  </div>
                </div>
              </Glass>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}