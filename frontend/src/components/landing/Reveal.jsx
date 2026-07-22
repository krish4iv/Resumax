// src/components/landing/Reveal.jsx
import { useReveal } from "./hooks.js";

export default function Reveal({ children, delay = 0, y = 28, className = "" }) {
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