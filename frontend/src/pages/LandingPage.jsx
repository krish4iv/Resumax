// src/pages/LandingPage.jsx
import { useEffect, useState } from "react";
import Aurora from "../components/landing/Aurora.jsx";
import Nav, { NAV_ITEMS } from "../components/landing/Nav.jsx";
import Hero from "../components/landing/Hero.jsx";
import Pipeline from "../components/landing/Pipeline.jsx";
import Engine from "../components/landing/Engine.jsx";
import Features from "../components/landing/Features.jsx";
import Nova from "../components/landing/Nova.jsx";
import Pricing from "../components/landing/Pricing.jsx";
import FAQ from "../components/landing/Faq.jsx";
import Footer from "../components/landing/Footer.jsx";

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