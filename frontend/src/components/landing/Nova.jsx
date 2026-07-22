// src/components/landing/Nova.jsx
import React, { useState } from "react";
import { MessageSquare, Brain, Sparkles, Mic } from "lucide-react";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";
import { useZoomRegister } from "./hooks.js";

export default function Nova() {
  const [persona, setPersona] = useState("Frustrated Job Seeker");
  const personas = ["Anxious Beginner", "Confident Expert", "Frustrated Job Seeker"];
  const [confidence, setConfidence] = useState("Hesitant");
  const register = useZoomRegister();

  return (
    <section id="nova" className="relative py-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> BEHAVIORAL AI
          </span>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl font-bold text-white">Meet Nova.</h2>
          <p className="mt-4 text-slate-400">
            She doesn't just answer questions — she reads how you communicate, and adapts in real time.
          </p>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[0.85fr_1.15fr] gap-6 items-start">
          <Glass ref={register(0)} className="p-6" style={{ willChange: "transform, opacity" }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400/25 to-violet-500/25 flex items-center justify-center">
                <Brain size={16} className="text-cyan-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Behavioral profiling engine</p>
                <p className="text-xs text-slate-500">Reads tone before it replies</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-slate-500">
              {[MessageSquare, Brain, Sparkles, Mic].map((Icon, i) => (
                <React.Fragment key={i}>
                  <div className="h-10 w-10 rounded-xl border border-white/10 bg-black/30 flex items-center justify-center">
                    <Icon size={15} />
                  </div>
                  {i < 3 && <div className="h-px flex-1 bg-white/10 mx-1.5" />}
                </React.Fragment>
              ))}
            </div>

            <p className="mt-6 text-xs font-semibold tracking-wide text-slate-400">CONFIDENCE</p>
            <div className="mt-3 flex gap-2">
              {["Hesitant", "Balanced", "Assertive"].map((c) => (
                <button
                  key={c}
                  onClick={() => setConfidence(c)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    confidence === c ? "bg-white text-black" : "bg-white/5 text-slate-300 border border-white/10"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </Glass>

          <Glass ref={register(1)} className="p-6" style={{ willChange: "transform, opacity" }}>
            <div className="flex flex-wrap gap-2">
              {personas.map((p) => (
                <button
                  key={p}
                  onClick={() => setPersona(p)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    persona === p ? "bg-white text-black" : "bg-white/5 text-slate-300 border border-white/10"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400/40 to-violet-500/40" />
              <div>
                <p className="text-sm font-semibold text-white">Nova</p>
                <p className="text-[11px] text-emerald-300">Adapting to your style…</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-white/10 px-4 py-3 text-sm text-slate-100">
                {persona === "Frustrated Job Seeker" &&
                  "This is so frustrating. Every company ghosts me. My resume is fine, I just have bad luck."}
                {persona === "Anxious Beginner" &&
                  "I don't really have much experience yet — I'm not sure my resume is good enough to even send."}
                {persona === "Confident Expert" &&
                  "I know the role well. Just want the resume tightened so it reads as senior, not just experienced."}
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-black/30 border border-white/10 px-4 py-3 text-sm text-slate-300">
                {persona === "Frustrated Job Seeker" &&
                  "I hear you — ghosting is genuinely the worst part of the search. Let's look at your opening bullet; that's usually where interest gets lost first."}
                {persona === "Anxious Beginner" &&
                  "Experience isn't the only signal recruiters weigh. Let's find the projects that show real judgment, even early on."}
                {persona === "Confident Expert" &&
                  "Got it — we'll cut the summary and lead with scope and scale instead. Send over your biggest win."}
              </div>
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}