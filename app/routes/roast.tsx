import { Link } from "react-router";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Roast My Year — DaFuqBro" },
  { name: "description", content: "Your year in review, but make it brutally honest. Get a Wrapped-style roast with a Life Score." },
];

export default function RoastTool() {
  return (
    <>
      <div className="py-4 px-5 flex items-center gap-3 border-b border-white/[0.06] relative z-10">
        <Link to="/" className="text-[#71717a] text-[0.85rem] hover:text-white transition-colors">DaFuqBro</Link>
        <span className="text-[#71717a] text-[0.75rem]">›</span>
        <span className="text-[#a1a1aa] font-semibold text-[0.85rem]">🔥 Roast My Year</span>
      </div>
      <div className="max-w-[640px] mx-auto px-5 py-10 text-center">
        <span className="text-[3.5rem] mb-4 block">🔥</span>
        <h1 className="font-['Outfit'] font-extrabold text-[2rem] tracking-tight mb-2.5">Roast My Year</h1>
        <p className="text-[#a1a1aa] text-[0.95rem] mb-8">Coming very soon — this tool is being rebuilt with extra roast energy.</p>
        <Link to="/" className="text-[#f472b6] font-semibold hover:underline">← Back to all tools</Link>
      </div>
    </>
  );
}
