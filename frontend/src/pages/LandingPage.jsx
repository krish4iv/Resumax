import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Sparkles,
  Target,
  Zap,
  FileText,
  MessageSquare,
  Mic,
  Brain,
  Gauge,
  Download,
  ShieldCheck,
  Layers,
  User,
  Radar,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ---------------------------------------------------------------
   Scroll-reveal primitive (framer-motion is unavailable in this
   sandbox, so this hand-rolled IntersectionObserver hook drives
   every "on-scroll" animation in the page).
----------------------------------------------------------------*/
function useReveal(threshold = 0.2) {
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

function Reveal({ children, delay = 0, y = 28, className = "" }) {
  const [ref, visible] = useReveal(0.15);
  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className}`}
      style={{
        transitionDuration: "800ms",
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : `translateY(${y}px)`,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------
   Reduced-motion helper, shared by every scroll-driven effect below.
----------------------------------------------------------------*/
function usePrefersReducedMotion() {
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

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* Frame-rate independent exponential smoothing factor. Given a desired
   "speed" (roughly: how many times per second the value halves the gap
   to its target) and the elapsed time since the last frame, this returns
   the interpolation factor to use in a lerp so motion feels identical at
   30fps, 60fps, or 144fps instead of snapping straight to the raw input
   every frame (which is what produced the jittery, inconsistent card
   motion in the Work/Engine decks). */
function smoothingFactor(speed, dt) {
  return 1 - Math.exp(-speed * dt);
}

/* ---------------------------------------------------------------
   Global zoom-on-scroll registry: every card that opts in (Features,
   Nova, Pricing, FAQ, etc.) registers its DOM node here. ONE shared
   rAF loop scales/fades every registered card by its distance from
   the viewport center — zooms in as it approaches, zooms back out as
   it leaves — instead of each section running its own loop.
----------------------------------------------------------------*/
const zoomTargets = [];
function registerZoomTarget(el) {
  if (el && !zoomTargets.includes(el)) zoomTargets.push(el);
}
function unregisterZoomTarget(el) {
  const idx = zoomTargets.indexOf(el);
  if (idx > -1) zoomTargets.splice(idx, 1);
}

function useGlobalZoomLoop() {
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

function useZoomRegister() {
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
   ScrollDeck v3 — horizontal pinned scroll.

   Switched from the vertical sticky-stack to a horizontal one, on
   request. The mechanism is deliberately simple, for the same reason
   v2 replaced the original carousel: fewer simultaneously-animated,
   interdependent values means fewer places for jitter to creep in.

   1. THE SECTION IS PINNED (`position: sticky; top: 0; h-screen`) for
      a scroll track tall enough to give a comfortable pace, and the
      card row's horizontal position is a single, direct, linear
      function of vertical scroll progress: `translateX = -progress *
      maxShift`. There's no easing, blending, or multi-phase logic in
      that mapping — it's the same one-value proportional technique
      Apple/Stripe use for their horizontal scroll sections, and it's
      inherently steady because the output only ever moves in direct
      proportion to the input.

   2. PER-CARD SCALE/OPACITY reuses the exact smoothing technique
      already used by the Features/Nova zoom loop above (continuous,
      distance-from-viewport-center, exponentially smoothed) rather
      than the old carousel's clamped, sign-switching "diff" formula.
      That loop was never reported as jittery, so this reuses it
      instead of inventing new per-frame math for the cards.

   3. THE ACTIVE-CARD INDICATOR (dots) is just "whichever card is
      currently closest to center", computed in the same pass — no
      separate observer needed for a value that's already available.
----------------------------------------------------------------*/
function ScrollDeck({
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

/* ---------------------------------------------------------------
   Three.js starfield: three depth layers of points that the camera
   flies through as the page scrolls. Scroll progress (0→1 across the
   whole document) drives camera depth, field rotation, FOV, and a
   slow hue drift from violet → cyan → emerald to echo the aurora
   blobs behind it. Respects prefers-reduced-motion by freezing the
   scroll-driven fly-through and keeping only a faint ambient drift.

   `rise` values below are ~8x slower than before per feedback that
   the stars fell/rose too fast — a full wrap now takes roughly a
   minute instead of a few seconds.
----------------------------------------------------------------*/
function useScrollProgressRef() {
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

function StarfieldCanvas() {
  const mountRef = useRef(null);
  const progressRef = useScrollProgressRef();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Use the viewport directly rather than mount.clientWidth/Height —
    // the mount div is a "fixed inset-0" layer, and reading its client
    // box can race with layout on first paint and come back as 0.
    let width = window.innerWidth;
    let height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 300);
    camera.position.z = 10;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err) {
      console.error("Starfield: WebGL unavailable", err);
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    // Three depth layers: near (bigger, sparser, violet), mid (cyan),
    // far (small, dense, white) — gives real parallax as the camera moves.
    // Additive blending + larger sizes so points read clearly against
    // the near-black page background instead of washing out.
    const layerConfigs = [
      { count: 600, spread: 50, depth: 30, size: 0.16, color: 0x9b8cff, dir: 1, rise: 0.03 },
      { count: 800, spread: 80, depth: 55, size: 0.11, color: 0x6ee7d8, dir: -1, rise: 0.02 },
      { count: 1000, spread: 120, depth: 85, size: 0.075, color: 0xf3f4ff, dir: 1, rise: 0.013 },
    ];

    const groups = layerConfigs.map((cfg) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(cfg.count * 3);
      for (let i = 0; i < cfg.count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * cfg.spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * cfg.spread;
        positions[i * 3 + 2] = (Math.random() - 0.5) * cfg.depth - cfg.depth / 3;
      }
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({
        color: cfg.color,
        size: cfg.size,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
        depthTest: false,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geometry, material);
      points.userData.dir = cfg.dir;
      points.userData.rise = cfg.rise;
      points.userData.spread = cfg.spread;
      points.userData.origY = positions.slice(); // copy, y-component read with stride 3
      points.userData.riseOffset = 0;
      const hsl = { h: 0, s: 0, l: 0 };
      points.material.color.getHSL(hsl);
      points.userData.baseHue = hsl.h;
      scene.add(points);
      return points;
    });

    let raf;
    let t = 0;
    // Smoothed scroll progress: same easing idea as ScrollDeck. The
    // starfield's fly-through/FOV/hue drift used to jump 1:1 with the raw
    // scroll offset, which looked like a slightly nervous flicker whenever
    // scroll events arrived unevenly. Easing it removes that without
    // changing the overall motion.
    let smoothedP = progressRef.current;
    let lastTime = performance.now();
    function animate(now) {
      const dt = Math.min((now - (lastTime || now)) / 1000, 0.1);
      lastTime = now;
      t += 0.0016;
      const rawP = progressRef.current;
      smoothedP = reduced ? rawP : lerp(smoothedP, rawP, smoothingFactor(6, dt));
      const p = smoothedP; // 0 → 1 across the page

      groups.forEach((g, i) => {
        const dir = g.userData.dir;
        // gentle ambient spin always running, plus a much larger
        // scroll-driven spin so the field visibly turns as you scroll
        g.rotation.y = t * (0.04 + i * 0.015) * dir + (reduced ? 0 : p * 1.4 * dir);
        g.rotation.x = reduced ? 0 : p * 0.5 * dir;

        // continuous upward drift — each star rises on its own phase and
        // wraps seamlessly back in at the bottom (no synchronized jump).
        // Nearer layers rise faster for a parallax feel. Runs even when
        // the page isn't scrolling; scroll only adds the spin/fly above.
        if (!reduced) {
          const spread = g.userData.spread;
          g.userData.riseOffset += g.userData.rise;
          const offset = g.userData.riseOffset;
          const orig = g.userData.origY;
          const arr = g.geometry.attributes.position.array;
          for (let k = 1; k < arr.length; k += 3) {
            let y = orig[k] - offset;
            y = ((y + spread / 2) % spread + spread) % spread - spread / 2;
            arr[k] = y;
          }
          g.geometry.attributes.position.needsUpdate = true;
        }

        // hue drift per layer: violet → cyan → emerald across scroll
        const hueShift = reduced ? 0 : p * 0.28;
        const baseHue = g.userData.baseHue;
        g.material.color.setHSL((baseHue - hueShift + 1) % 1, 0.7, 0.72);
      });

      // fly the camera through the field as the page scrolls, and
      // widen the FOV slightly for a subtle warp-speed feel
      camera.position.z = 10 - (reduced ? 0 : p * 22);
      camera.fov = 60 + (reduced ? 0 : p * 18);
      camera.updateProjectionMatrix();

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    }
    raf = requestAnimationFrame(animate);

    function onResize() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      groups.forEach((g) => {
        g.geometry.dispose();
        g.material.dispose();
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [progressRef]);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
}

/* ---------------------------------------------------------------
   Ambient background: aurora glow blobs + three.js starfield.

   The starfield canvas is rendered LAST (i.e. on top) inside this
   fixed layer so the three blur blobs, painted first, never cover the
   bright additive star points wherever they overlap.
----------------------------------------------------------------*/
function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05060c]">
      <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-[130px]" />
      <StarfieldCanvas />
    </div>
  );
}

/* ---------------------------------------------------------------
   Glass card wrapper
----------------------------------------------------------------*/
const Glass = React.forwardRef(function Glass({ as: Tag = "div", className = "", children, ...rest }, ref) {
  return (
    <Tag
      ref={ref}
      className={`rounded-3xl border border-white/[0.12] bg-white/[0.055] backdrop-blur-2xl shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] overflow-hidden ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
});

/* ---------------------------------------------------------------
   Nav
----------------------------------------------------------------*/
const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "work", label: "Work" },
  { id: "engine", label: "Engine" },
  { id: "features", label: "Features" },
  { id: "nova", label: "Nova" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },

  { route: "/login", label: "Login" },
  { route: "/register", label: "Register" },
];

function Nav({ active, onNavigate }) {
  return (
    <nav className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 px-2 w-[min(94vw,880px)]">
      <Glass className="flex items-center gap-1 rounded-full px-2 py-2 overflow-x-auto scrollbar-none">
        <span className="hidden sm:flex items-center gap-1.5 pl-3 pr-4 text-sm font-semibold tracking-wide text-white shrink-0">
          <Sparkles size={14} className="text-cyan-300" />
          RESUMAX
        </span>
        {NAV_ITEMS.map(item =>
          item.route ? (
            <Link
              key={item.label}
              to={item.route}
              className="shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium tracking-wide text-slate-300 hover:text-white hover:bg-white/10 transition"
            >
              {item.label}
            </Link>
          ) : (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-medium transition ${
                active === item.id
                  ? "bg-white text-black"
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          )
        )}
        <button className="ml-1 shrink-0 grid place-items-center h-9 w-9 rounded-full border border-white/15 bg-white/5 text-slate-300 hover:text-white transition-colors">
          <User size={15} />
        </button>
      </Glass>
    </nav>
  );
}

/* ---------------------------------------------------------------
   Hero
----------------------------------------------------------------*/
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

function Hero({ onNavigate }) {
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

/* ---------------------------------------------------------------
   Pipeline ("Work")
----------------------------------------------------------------*/
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

function Pipeline() {
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

/* ---------------------------------------------------------------
   Engine
----------------------------------------------------------------*/
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

function Engine() {
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

/* ---------------------------------------------------------------
   Features (bento)
----------------------------------------------------------------*/
const FEATURES = [
  { icon: Gauge, title: "Real-time score", body: "Watch your match score climb as edits land." },
  { icon: Radar, title: "Gap detection", body: "Flags missing skills before a recruiter notices." },
  { icon: Download, title: "Multi-format export", body: "PDF, DOCX, or plain text — pick per application." },
  { icon: ShieldCheck, title: "Private by default", body: "Your history is never used to train external models." },
  { icon: Layers, title: "Version history", body: "Every rewrite is saved, so nothing is ever lost." },
  { icon: Brain, title: "Role-aware tone", body: "Calibrates voice to startup, enterprise, or agency roles." },
];

function Features() {
  const register = useZoomRegister();
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

/* ---------------------------------------------------------------
   Nova (AI persona demo)
----------------------------------------------------------------*/
function Nova() {
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

/* ---------------------------------------------------------------
   Pricing
----------------------------------------------------------------*/
const PLUS = [
  "Unlimited resume analyses",
  "Draft a resume from scratch",
  "LinkedIn optimizer",
  "X profile optimizer",
  "GitHub optimizer",
  "Social post generator",
];

function Pricing() {
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

/* ---------------------------------------------------------------
   FAQ
----------------------------------------------------------------*/
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

function FAQ() {
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

/* ---------------------------------------------------------------
   Footer
----------------------------------------------------------------*/
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

function Footer({ onNavigate }) {
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

/* ---------------------------------------------------------------
   App
----------------------------------------------------------------*/
export default function LandingPage() {
  const [active, setActive] = useState("home");

  useEffect(() => {
    const sections = NAV_ITEMS.map((n) => document.getElementById(n.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  function onNavigate(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="relative min-h-screen font-sans text-slate-200">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&display=swap');
        html, body { background: #05060c; }
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
      `}</style>

      <Aurora />

      <div className="relative z-10">
        <Nav active={active} onNavigate={onNavigate} />

        <Hero onNavigate={onNavigate} />
        <Pipeline onNavigate={onNavigate} />
        <Engine />
        <Features />
        <Nova />
        <Pricing />
        <FAQ />
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}