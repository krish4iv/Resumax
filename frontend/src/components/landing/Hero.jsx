// src/components/landing/Hero.jsx
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";
import { useReveal } from "./hooks.js";

function ScoreRing() {
  const [ref, visible] = useReveal(0.4);
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start;
    const target = 94;
    const duration = 1400;
    let raf;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // ease-out so the ring settles smoothly instead of stopping abruptly
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [visible]);
  const pct = (val / 100) * 360;
  return (
    <div ref={ref} className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0">
      <div
        className="absolute inset-0 rounded-full transition-[background] duration-150"
        style={{
          background: `conic-gradient(from -90deg, #22d3ee 0deg, #a78bfa ${pct}deg, rgba(255,255,255,0.08) ${pct}deg)`,
        }}
      />
      <div className="absolute inset-[6px] rounded-full bg-[#0b0f1a]/95 backdrop-blur-xl flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{val}</span>
        <span className="text-[9px] tracking-[0.2em] text-slate-400">SCORE</span>
      </div>
    </div>
  );
}

export default function Hero({ onNavigate }) {
  return (
    <section id="home" className="relative min-h-screen flex items-center px-6 sm:px-10 pt-32 pb-24">
      <div className="mx-auto max-w-6xl w-full grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI-powered resume engineering
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 font-display text-6xl sm:text-7xl font-bold leading-[0.95] tracking-tight text-white">
              Resu<span className="bg-gradient-to-br from-cyan-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">Max</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-5 max-w-md text-lg text-slate-400">
              Your resume, engineered for impact — rewritten line by line until it earns the interview.
            </p>
          </Reveal>
          <Reveal delay={320}>
            <button
              onClick={() => onNavigate("work")}
              className="mt-9 inline-flex items-center gap-2 group relative overflow-hidden rounded-2xl bg-white px-6 py-3.5 text-sm font-bold tracking-wide text-black transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              START ANALYZING <ArrowRight size={16} />
              <span
                className="absolute inset-0 translate-x-[-100%] bg-white/20 transition-transform duration-700 group-hover:translate-x-full"
              />
            </button>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Glass className="w-full sm:w-64 p-5">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400/40 to-violet-500/40" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-4/5 rounded-full bg-white/15" />
                  <div className="h-2 w-2/5 rounded-full bg-white/10" />
                </div>
              </div>
              <div className="mt-5 space-y-2">
                {[100, 90, 75, 95, 60].map((w, i) => (
                  <div
                    key={i}
                    className="h-2 rounded-full bg-white/10"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </Glass>

            <div className="flex sm:flex-col gap-4 items-center sm:items-start w-full sm:w-auto">
              <ScoreRing />
              <div className="flex flex-row sm:flex-col gap-2 w-full">
                {[
                  ["Keyword coverage", "12 of 12 matched"],
                  ["Skill gaps", "2 flagged for review"],
                  ["ATS format", "Fully compatible"],
                ].map(([t, s], i) => (
                  <Reveal delay={400 + i * 120} key={t}>
                    <Glass className="relative px-4 py-2.5 flex items-center gap-2.5 whitespace-nowrap">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      <span className="text-xs text-slate-200">
                        <span className="font-semibold text-white">{t}</span>
                        <span className="hidden md:inline text-slate-400"> · {s}</span>
                      </span>
                    </Glass>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}