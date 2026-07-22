// src/components/landing/Aurora.jsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useScrollProgressRef, lerp, smoothingFactor } from "./hooks.js";


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


export default function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#05060c]">
      <div className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-400/15 blur-[130px]" />
      <div className="absolute bottom-0 left-1/4 h-[28rem] w-[28rem] rounded-full bg-emerald-400/10 blur-[130px]" />
      <StarfieldCanvas />
    </div>
  );
}