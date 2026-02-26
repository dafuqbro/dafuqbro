import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { tools, accentColors } from "~/data/tools";

export const meta: MetaFunction = () => [
  { title: "DaFuqBro — Find Out What's Wrong With You" },
  { name: "description", content: "Unhinged quizzes and generators that expose who you really are. Get shareable, screenshot-worthy results you'll actually want to post." },
  { property: "og:title", content: "DaFuqBro — Find Out What's Wrong With You" },
  { property: "og:description", content: "Unhinged quizzes. Brutal results. Zero chill." },
];

const badgeStyles: Record<string, string> = {
  hot: "bg-[#f87171]/12 text-[#f87171] border-[#f87171]/20",
  new: "bg-[#facc15]/12 text-[#facc15] border-[#facc15]/20",
  soon: "bg-[#71717a]/15 text-[#71717a] border-[#71717a]/20",
};

const badgeLabels: Record<string, string> = {
  hot: "🔥 HOT",
  new: "NEW",
  soon: "SOON",
};

export default function Home() {
  const handleSurprise = () => {
    const active = tools.filter((t) => t.active);
    const random = active[Math.floor(Math.random() * active.length)];
    if (random) window.location.href = `/${random.slug}`;
  };

  return (
    <>
      <Header />
      <main className="relative z-1">
        {/* Ambient glows */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none -top-[200px] -left-[100px] bg-[#22d3ee]" />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none top-[30%] -right-[200px] bg-[#f472b6]" />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none -bottom-[100px] left-[30%] bg-[#facc15]" />

        {/* Hero */}
        <section className="text-center py-20 sm:py-20 px-5">
          <div className="animate-fadeInDown inline-flex items-center gap-2 bg-[#facc15]/8 border border-[#facc15]/15 text-[#facc15] text-[0.82rem] font-semibold px-4.5 py-2 rounded-full mb-7 tracking-wide">
            ⚡ 8 ways to expose yourself
          </div>
          <h1 className="font-['Outfit'] font-black text-[clamp(2.8rem,7vw,4.8rem)] leading-[1.05] tracking-tight mb-5 animate-fadeInUp [animation-delay:0.1s] [animation-fill-mode:both]">
            Find out what's
            <br />
            <span className="bg-gradient-to-br from-[#22d3ee] via-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">
              wrong with you
            </span>
          </h1>
          <p className="text-[#a1a1aa] text-[clamp(1rem,2.5vw,1.2rem)] max-w-[540px] mx-auto mb-9 leading-relaxed animate-fadeInUp [animation-delay:0.2s] [animation-fill-mode:both]">
            Answer a few unhinged questions. Get a brutally honest result. Screenshot it. Post it. Watch your friends lose it.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap animate-fadeInUp [animation-delay:0.3s] [animation-fill-mode:both]">
            <button
              onClick={handleSurprise}
              className="inline-flex items-center gap-2.5 bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#09090b] font-['Outfit'] font-bold text-base px-8 py-3.5 rounded-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(250,204,21,0.3)]"
            >
              <span className="text-xl">🎲</span> Surprise Me
            </button>
            <button
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-white/5 text-[#f4f4f5] font-['Outfit'] font-semibold text-base px-7 py-3.5 rounded-full border border-white/[0.12] cursor-pointer transition-all hover:bg-white/[0.08] hover:border-white/[0.2]"
            >
              Browse all tools ↓
            </button>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="px-5 pb-24 max-w-[1120px] mx-auto">
          <div className="font-['JetBrains_Mono'] text-[0.72rem] text-[#71717a] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
            Pick your poison
            <span className="flex-1 h-px bg-white/[0.06]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool, i) => {
              const inner = (
                <>
                  {tool.badge && (
                    <span className={`absolute top-4 right-4 font-['JetBrains_Mono'] text-[0.65rem] font-semibold px-2.5 py-1 rounded-full border tracking-wide ${badgeStyles[tool.badge]}`}>
                      {badgeLabels[tool.badge]}
                    </span>
                  )}
                  <span className="text-[2.2rem] mb-4 block">{tool.emoji}</span>
                  <h3 className="font-['Outfit'] font-bold text-[1.15rem] tracking-tight mb-2 text-[#f4f4f5]">
                    {tool.name}
                  </h3>
                  <p className="text-[#a1a1aa] text-[0.88rem] leading-relaxed">{tool.description}</p>
                </>
              );

              const baseClass = `relative bg-[#131316] border border-white/[0.06] rounded-2xl p-7 transition-all animate-fadeInUp block`;
              const delay = { animationDelay: `${0.05 * (i + 1)}s` };

              if (!tool.active) {
                return (
                  <div key={tool.slug} className={`${baseClass} opacity-50 cursor-default`} style={delay}>
                    {inner}
                  </div>
                );
              }

              return (
                <Link
                  key={tool.slug}
                  to={`/${tool.slug}`}
                  className={`${baseClass} cursor-pointer hover:border-white/[0.12] hover:-translate-y-1 hover:bg-[#1a1a1f]`}
                  style={delay}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
