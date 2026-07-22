// src/components/landing/Pipeline.jsx
import Glass from "./Glass.jsx";
import ScrollDeck from "./ScrollDeck.jsx";

const PIPELINE = [
  {
    n: "01",
    title: "Upload & parse",
    body: "Drop in your resume and the job post — parsing starts the moment both land.",
  },
  {
    n: "02",
    title: "Token mapping",
    body: "Every line is broken into tokens and checked against the role's real requirements.",
  },
  {
    n: "03",
    title: "Deep analysis",
    body: "Your experience is mapped against the role's hidden competency model. Gaps surface.",
  },
  {
    n: "04",
    title: "Nova asks questions",
    body: "Before rewriting, Nova interviews you — uncovers metrics, quantifies vague bullets.",
  },
  {
    n: "05",
    title: "Bullet rewriter",
    body: "Every weak bullet rewritten with your real context — action-verb led, STAR-calibrated.",
  },
  {
    n: "06",
    title: "Export & track",
    body: "Download ATS-ready, then follow every application through the pipeline board.",
  },
];

export default function Pipeline() {
  return (
    <ScrollDeck
      id="work"
      eyebrow="PRECISION PIPELINE"
      heading="The Precision Pipeline"
      sub="A six-stage engine that dissects your history to find exactly what the role is actually asking for."
      items={PIPELINE}
      cardHeightClass="min-h-[300px]"
      renderCard={(step) => (
        // Hover now uses translate + scale only (matches Engine's hover
        // language below). The previous `rotate-x-3` utility isn't a real
        // Tailwind class, so it silently did nothing — the card only ever
        // translated on hover, while Engine's cards scaled too, which is
        // what made the two decks feel inconsistent with each other.
        <Glass className="group min-h-[300px] w-full p-7 flex flex-col transition-all duration-500 hover:-translate-y-3 hover:scale-[1.03] hover:border-cyan-400/40 hover:bg-white/[0.08]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/30 text-xs font-bold text-white transition-all duration-500 group-hover:scale-125 group-hover:bg-cyan-400 group-hover:text-black">
            {step.n}
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
          <p className="mt-2.5 text-sm leading-relaxed text-slate-400">{step.body}</p>
        </Glass>
      )}
    />
  );
}