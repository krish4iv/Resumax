// src/components/landing/ScrollDeck.jsx
import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal.jsx";
import { clamp, lerp, smoothingFactor, usePrefersReducedMotion } from "./hooks.js";


export default function ScrollDeck({
  id,
  eyebrow,
  heading,
  sub,
  items,
  renderCard,
  cardWidthClass = "w-[min(85vw,420px)]",
  cardHeightClass = "min-h-[320px]",
}) {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  cardRefs.current = [];
  const register = (i) => (el) => (cardRefs.current[i] = el);
  const reduced = usePrefersReducedMotion();
  const n = items.length;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let raf;
    let lastTime = performance.now();
    // Per-card smoothed scale/opacity, same approach as useGlobalZoomLoop.
    const smoothed = new WeakMap();

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const section = sectionRef.current;
      const track = trackRef.current;
      if (section && track) {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;
        const scrollableDistance = rect.height - vh;
        const progress = clamp(-rect.top / Math.max(scrollableDistance, 1), 0, 1);

        // --- direct, linear, single-value horizontal drive ---
        const maxShift = Math.max(track.scrollWidth - window.innerWidth, 0);
        const x = reduced ? 0 : -progress * maxShift;
        track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;

        // --- per-card continuous distance-from-center scale/opacity ---
        const centerX = window.innerWidth / 2;
        const k = smoothingFactor(10, dt);
        let closestIdx = 0;
        let closestDist = Infinity;

        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          const cardRect = el.getBoundingClientRect();
          const elCenter = cardRect.left + cardRect.width / 2;
          const dist = Math.abs(elCenter - centerX);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
          }

          const norm = clamp(1 - dist / (window.innerWidth * 0.65), 0, 1);
          const targetScale = 0.88 + 0.14 * norm;
          const targetOpacity = 0.5 + 0.5 * norm;

          const prev = smoothed.get(el) || { scale: targetScale, opacity: targetOpacity };
          const scale = reduced ? 1 : lerp(prev.scale, targetScale, k);
          const opacity = reduced ? 1 : lerp(prev.opacity, targetOpacity, k);
          smoothed.set(el, { scale, opacity });

          el.style.transform = `scale(${scale.toFixed(3)})`;
          el.style.opacity = opacity.toFixed(3);
        });

        setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, n]);

  return (
    <section ref={sectionRef} id={id} className="relative" style={{ height: `${(n + 1) * 70}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <Reveal className="relative z-20 mx-auto mb-12 max-w-2xl px-6 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            {eyebrow}
          </span>
          <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">{heading}</h2>
          {sub && <p className="mt-4 text-slate-400">{sub}</p>}
        </Reveal>

        <div className="relative w-full overflow-hidden">
          <div
            ref={trackRef}
            className="flex items-stretch gap-6 will-change-transform"
            style={{ paddingLeft: "8vw", paddingRight: "8vw" }}
          >
            {items.map((item, i) => (
              <div
                key={i}
                ref={register(i)}
                className={`shrink-0 ${cardWidthClass} ${cardHeightClass}`}
                style={{ willChange: "transform, opacity" }}
              >
                {renderCard(item, i)}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className="h-1 w-8 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i === activeIndex ? "rgba(103,232,249,0.9)" : "rgba(255,255,255,0.1)" }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}