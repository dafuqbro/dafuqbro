import { Link } from "react-router";
import { useState, useEffect } from "react";

export function MascotHead({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="52" r="38" fill="#8B7EA8" />
      <path d="M16 52 Q12 20 50 10 Q88 20 84 52 L87 64 Q87 70 78 72 L50 78 L22 72 Q13 70 13 64 Z" fill="#1E1A35" />
      <path d="M22 72 Q22 64 30 57 Q42 47 50 44 Q58 47 70 57 Q78 64 78 72" fill="none" stroke="#2A2640" strokeWidth="2" />
      <path d="M20 34 L12 10 L36 26" fill="#1E1A35" />
      <path d="M22 31 L16 13 L33 25" fill="#F5C518" />
      <path d="M80 34 L88 10 L64 26" fill="#1E1A35" />
      <path d="M78 31 L84 13 L67 25" fill="#F5C518" />
      <ellipse cx="38" cy="52" rx="10" ry="11" fill="white" />
      <circle cx="41" cy="53" r="6" fill="#1E1A35" />
      <circle cx="43" cy="50" r="2.5" fill="white" />
      <ellipse cx="64" cy="54" rx="8" ry="7" fill="white" />
      <circle cx="66" cy="54" r="5" fill="#1E1A35" />
      <circle cx="68" cy="52" r="2" fill="white" />
      <path d="M27 41 Q35 32 48 37" stroke="#1E1A35" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M56 39 Q67 34 77 41" stroke="#1E1A35" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M40 66 Q50 69 56 65 Q62 61 67 68" stroke="#7A5040" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M58 64 L60 69 L62 64" fill="white" />
    </svg>
  );
}

export function Header() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/track")
      .then((r) => r.json())
      .then((d) => setCount(d.count))
      .catch(() => setCount(0));
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#1E1A35]/80 border-b border-[#3A3555]/60">
      <div className="max-w-[1120px] mx-auto px-5 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center group">
          <img
            src="/logotype.png"
            alt="DaFuqBro"
            className="h-10 sm:h-11 w-auto transition-transform group-hover:scale-105"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[0.82rem] font-semibold text-[#F5C518] bg-[#F5C518]/10 border border-[#F5C518]/20 hover:bg-[#F5C518]/15 transition-all"
          >
            📝 Blog
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 font-['JetBrains_Mono'] text-[0.78rem] text-[#9B95A8] bg-[#2A2640]/60 px-3.5 py-1.5 rounded-full border border-[#3A3555]/60">
            <div className="w-1.5 h-1.5 bg-[#F5C518] rounded-full animate-pulse-dot" />
            <span>{count !== null ? count.toLocaleString() : "—"}</span> cards generated
          </div>
        </div>
      </div>
    </header>
  );
}
