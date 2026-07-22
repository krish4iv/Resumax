// src/components/landing/Pricing.jsx
import { useState } from "react";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import Glass from "./Glass.jsx";
import Reveal from "./Reveal.jsx";

const PLUS = [
  "Unlimited resume analyses",
  "Draft a resume from scratch",
  "LinkedIn optimizer",
  "X profile optimizer",
  "GitHub optimizer",
  "Social post generator",
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [plan, setPlan] = useState("premium");
  const price = yearly ? 4 : 5;

  return (
    <section id="pricing" className="relative py-32 px-6 sm:px-10">
      <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> SUBSCRIPTION
          </span>
          <h2 className="mt-6 font-display text-4xl sm:text-5xl font-bold text-white">Simple, honest pricing.</h2>
          <p className="mt-4 max-w-md text-slate-400">
            No hidden fees, no dark patterns. Upgrade the moment it's worth it to you, cancel just as easily.
          </p>
        </Reveal>

        <Reveal delay={140}>
          <Glass className="p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">Select a plan</p>
              <div className="flex items-center rounded-full border border-white/10 bg-black/30 p-1 text-xs">
                <button
                  onClick={() => setYearly(false)}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${!yearly ? "bg-white text-black" : "text-slate-400"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setYearly(true)}
                  className={`rounded-full px-3 py-1.5 font-medium transition-colors ${yearly ? "bg-white text-black" : "text-slate-400"}`}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => setPlan("free")}
                className={`w-full text-left rounded-2xl border p-4 flex items-center justify-between transition-colors ${
                  plan === "free" ? "border-white/30 bg-white/[0.06]" : "border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-4 w-4 rounded-full border ${
                      plan === "free" ? "border-white bg-white" : "border-white/30"
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-white">Free</p>
                    <p className="text-xs text-slate-400">Test the waters of our ATS engine.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">$0</p>
                  <p className="text-[10px] text-slate-500">per user/mo</p>
                </div>
              </button>

              <button
                onClick={() => setPlan("premium")}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${
                  plan === "premium" ? "border-emerald-300/40 bg-emerald-400/[0.06]" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-4 w-4 rounded-full border grid place-items-center ${
                        plan === "premium" ? "border-emerald-300 bg-emerald-300" : "border-white/30"
                      }`}
                    >
                      {plan === "premium" && <Check size={10} className="text-black" />}
                    </span>
                    <div>
                      <p className="font-semibold text-white flex items-center gap-2">
                        Premium
                        <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-300">POPULAR</span>
                      </p>
                      <p className="text-xs text-slate-400">Unlimited access, full optimizer suite.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${price}</p>
                    <p className="text-[10px] text-slate-500">per user/mo</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PLUS.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check size={12} className="text-emerald-300 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
              </button>
            </div>

            {/* Fix: <Link> renders an inline <a> by default, so the
                `w-full`/`py-3`/text-centering classes on it were silently
                ignored (an inline element doesn't respect width, and its
                content wasn't centered) — the button looked/behaved
                shrunk-to-content instead of as a full-width CTA. Making it
                `flex` with centered content makes it lay out and click
                exactly like the other buttons in the page. */}
            <Link
              to="/register"
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-white py-3 text-sm font-bold text-black transition-transform duration-300 hover:scale-[1.02] active:scale-95"
            >
              CONTINUE
            </Link>
            <p className="mt-3 text-center text-[11px] text-slate-500">Cancel anytime. No long-term contract.</p>
          </Glass>
        </Reveal>
      </div>
    </section>
  );
}