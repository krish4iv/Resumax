// src/components/landing/hooks.js
import { useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------
   Scroll-reveal primitive (framer-motion is unavailable in this
   sandbox, so this hand-rolled IntersectionObserver hook drives
   every "on-scroll" animation in the page).
----------------------------------------------------------------*/
export function useReveal(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ---------------------------------------------------------------
   Reduced-motion helper, shared by every scroll-driven effect.
----------------------------------------------------------------*/
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* Frame-rate independent exponential smoothing factor. Given a desired
   "speed" (roughly: how many times per second the value halves the gap
   to its target) and the elapsed time since the last frame, this returns
   the interpolation factor to use in a lerp so motion feels identical at
   30fps, 60fps, or 144fps instead of snapping straight to the raw input
   every frame (which is what produced the jittery, inconsistent card
   motion in the Work/Engine decks). */
export function smoothingFactor(speed, dt) {
  return 1 - Math.exp(-speed * dt);
}

/* ---------------------------------------------------------------
   Global zoom-on-scroll registry: every card that opts in (Features,
   Nova, Pricing, FAQ, etc.) registers its DOM node here. ONE shared
   rAF loop scales/fades every registered card by its distance from
   the viewport center — zooms in as it approaches, zooms back out as
   it leaves — instead of each section running its own loop.

   This is intentionally a module-level singleton (not component
   state) so every section that calls useZoomRegister() shares the
   exact same array, and only one rAF loop (started by whichever
   section calls useGlobalZoomLoop — currently Features) ever runs.
----------------------------------------------------------------*/
const zoomTargets = [];
function registerZoomTarget(el) {
  if (el && !zoomTargets.includes(el)) zoomTargets.push(el);
}
function unregisterZoomTarget(el) {
  const idx = zoomTargets.indexOf(el);
  if (idx > -1) zoomTargets.splice(idx, 1);
}

export function useGlobalZoomLoop() {
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    if (reduced) return;
    let raf;
    // Per-element smoothed scale/opacity so this loop glides too, instead
    // of recomputing a hard value from raw geometry every frame.
    const smoothed = new WeakMap();
    let lastTime = performance.now();
    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const vh = window.innerHeight;
      const center = vh / 2;
      const k = smoothingFactor(10, dt);
      for (const el of zoomTargets) {
        if (!el || !el.isConnected) continue;
        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(elCenter - center);
        const norm = clamp(1 - dist / (vh * 0.7), 0, 1); // 1 at center, 0 far away
        const targetScale = 0.86 + 0.18 * norm; // 0.86 → 1.04
        const targetOpacity = 0.4 + 0.6 * norm;

        const prev = smoothed.get(el) || { scale: targetScale, opacity: targetOpacity };
        const scale = lerp(prev.scale, targetScale, k);
        const opacity = lerp(prev.opacity, targetOpacity, k);
        smoothed.set(el, { scale, opacity });

        el.style.transform = `scale(${scale.toFixed(3)})`;
        el.style.opacity = opacity.toFixed(3);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);
}

export function useZoomRegister() {
  const localMap = useRef(new Map());
  useEffect(() => {
    const map = localMap.current;
    return () => {
      map.forEach((el) => unregisterZoomTarget(el));
      map.clear();
    };
  }, []);
  return (i) => (el) => {
    const prev = localMap.current.get(i);
    if (prev && prev !== el) unregisterZoomTarget(prev);
    if (el) registerZoomTarget(el);
    localMap.current.set(i, el);
  };
}

/* ---------------------------------------------------------------
   Document-wide scroll progress (0 -> 1), read by the starfield.
----------------------------------------------------------------*/
export function useScrollProgressRef() {
  const progressRef = useRef(0);
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      progressRef.current = max > 0 ? window.scrollY / max : 0;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return progressRef;
}