// src/components/landing/Nav.jsx
import { Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import Glass from "./Glass.jsx";

export const NAV_ITEMS = [
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

export default function Nav({ active, onNavigate }) {
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