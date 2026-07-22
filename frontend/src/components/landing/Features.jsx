// src/components/landing/Features.jsx
import { Gauge, Radar, Download, ShieldCheck, Layers, Brain } from "lucide-react";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";
import { useZoomRegister, useGlobalZoomLoop } from "./hooks.js";

const FEATURES = [
  { icon: Gauge, title: "Real-time score", body: "Watch your match score climb as edits land." },
  { icon: Radar, title: "Gap detection", body: "Flags missing skills before a recruiter notices." },
  { icon: Download, title: "Multi-format export", body: "PDF, DOCX, or plain text — pick per application." },
  { icon: ShieldCheck, title: "Private by default", body: "Your history is never used to train external models." },
  { icon: Layers, title: "Version history", body: "Every rewrite is saved, so nothing is ever lost." },
  { icon: Brain, title: "Role-aware tone", body: "Calibrates voice to startup, enterprise, or agency roles." },
];

export default function Features() {
  const register = useZoomRegister();
  // This is the one section that starts the shared zoom rAF loop — Nova
  // below registers its own cards into the same registry but relies on
  // this call rather than starting a second loop.
  useGlobalZoomLoop();
  return (
    <section id="features" className="relative py-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-xl">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white">Built for the whole search.</h2>
          <p className="mt-4 text-slate-400">Everything past the first rewrite — the parts of the job hunt that usually get ignored.</p>
        </Reveal>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <Glass
              key={f.title}
              ref={register(i)}
              className="p-6 h-full hover:bg-white/[0.08] transition-colors duration-300"
              style={{ willChange: "transform, opacity" }}
            >
              <f.icon size={20} className="text-emerald-300" />
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{f.body}</p>
            </Glass>
          ))}
        </div>
      </div>
    </section>
  );
}