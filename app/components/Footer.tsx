export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 relative z-1">
      <div className="max-w-[1120px] mx-auto px-5 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
        <p className="text-[#71717a] text-[0.82rem]">
          © 2026 DaFuqBro.com — made for screenshots, not financial advice
        </p>
        <div className="flex gap-5">
          <a href="https://twitter.com/dafuqbro" target="_blank" rel="noopener" className="text-[#71717a] text-[0.82rem] hover:text-[#a1a1aa] transition-colors">
            Twitter
          </a>
          <a href="#" className="text-[#71717a] text-[0.82rem] hover:text-[#a1a1aa] transition-colors">
            About
          </a>
          <a href="#" className="text-[#71717a] text-[0.82rem] hover:text-[#a1a1aa] transition-colors">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
