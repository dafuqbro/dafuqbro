import { Link } from "react-router";
import { useState, useEffect } from "react";

export function Header() {
  const [count, setCount] = useState(42069);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 3) + 1);
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-white/[0.06]">
      <div className="max-w-[1120px] mx-auto px-5 py-5 flex justify-between items-center">
        <Link
          to="/"
          className="font-['Outfit'] font-black text-[1.6rem] tracking-tight bg-gradient-to-br from-[#facc15] to-[#f472b6] bg-clip-text text-transparent"
        >
          DaFuqBro
          <span className="text-[#71717a] font-medium text-[0.85rem] ml-1.5 tracking-wide bg-none [-webkit-text-fill-color:#71717a]">
            .com
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/blog" className="text-[#a1a1aa] text-[0.85rem] font-medium hover:text-white transition-colors hidden sm:block">
            Blog
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 font-['JetBrains_Mono'] text-[0.78rem] text-[#71717a] bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.06]">
            <div className="w-1.5 h-1.5 bg-[#4ade80] rounded-full animate-pulse-dot" />
            <span>{count.toLocaleString()}</span> cards generated
          </div>
        </div>
      </div>
    </header>
  );
}
