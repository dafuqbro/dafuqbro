import { Link } from "react-router";
import { MascotHead } from "./Header";

export function Footer() {
  return (
    <footer className="border-t border-[#3A3555]/60 py-10 relative z-1">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(139,126,168,0.05),transparent_70%)] pointer-events-none" />
      <div className="max-w-[1120px] mx-auto px-5 flex flex-col items-center gap-4 relative">
        <MascotHead className="w-10 h-10 opacity-60" />
        <div className="text-center">
          <div className="font-['Outfit'] font-black text-[1.1rem] tracking-tight mb-1">
            <span className="text-[#F5C518]">DaFuq</span>
            <span className="text-[#F5F5F7]">Bro</span>
          </div>
          <p className="text-[#6B6580] text-[0.8rem] font-['Outfit'] font-medium">
            Unhinged quizzes. Brutal results. Zero chill.
          </p>
        </div>
        <div className="flex gap-5">
          <Link to="/" className="text-[#9B95A8] text-[0.82rem] hover:text-[#F5C518] transition-colors">Tools</Link>
          <Link to="/blog" className="text-[#9B95A8] text-[0.82rem] hover:text-[#F5C518] transition-colors">Blog</Link>
        </div>
        <p className="text-[#3A3555] text-[0.72rem]">
          © 2026 DaFuqBro.com — find out what's wrong with you
        </p>
      </div>
    </footer>
  );
}
