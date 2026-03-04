import { Link, useLoaderData } from "react-router";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { tools, accentColors } from "~/data/tools";

const SITE_URL = "https://dafuqbro.com";
const SITE_NAME = "DaFuqBro";

export const meta: MetaFunction = () => [
  // Basic
  { title: "DaFuqBro — Find Out What's Wrong With You" },
  { name: "description", content: "Unhinged quizzes and generators that expose who you really are. Get shareable, screenshot-worthy results you'll actually want to post." },
  { name: "robots", content: "index, follow" },

  // Canonical
  { tagName: "link", rel: "canonical", href: SITE_URL },

  // Open Graph
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: SITE_NAME },
  { property: "og:title", content: "DaFuqBro — Find Out What's Wrong With You" },
  { property: "og:description", content: "Unhinged quizzes. Brutal results. Zero chill. Find out what's wrong with you." },
  { property: "og:url", content: SITE_URL },
  { property: "og:image", content: `${SITE_URL}/og/home.png` },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { property: "og:image:alt", content: "DaFuqBro — Find Out What's Wrong With You" },
  { property: "og:locale", content: "en_US" },

  // Twitter Card
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "DaFuqBro — Find Out What's Wrong With You" },
  { name: "twitter:description", content: "Unhinged quizzes. Brutal results. Zero chill." },
  { name: "twitter:image", content: `${SITE_URL}/og/home.png` },
  { name: "twitter:image:alt", content: "DaFuqBro — Find Out What's Wrong With You" },
];

const badgeStyles: Record<string, string> = {
  hot: "bg-[#E05544]/12 text-[#E05544] border-[#E05544]/20",
  new: "bg-[#F5C518]/12 text-[#F5C518] border-[#F5C518]/20",
  soon: "bg-[#6B6580]/15 text-[#6B6580] border-[#6B6580]/20",
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

  // JSON-LD structured data: WebSite + Organization
  const websiteLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: "Unhinged quizzes and generators that expose who you really are.",
        inLanguage: "en-US",
        publisher: { "@id": `${SITE_URL}/#org` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon-512.png`,
          width: 512,
          height: 512,
        },
        sameAs: [],
      },
      {
        "@type": "ItemList",
        name: "DaFuqBro Quiz Tools",
        description: "Interactive personality quizzes and generators",
        url: SITE_URL,
        numberOfItems: tools.filter((t) => t.active).length,
        itemListElement: tools
          .filter((t) => t.active)
          .map((tool, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: tool.name,
            description: tool.description,
            url: `${SITE_URL}/${tool.slug}`,
          })),
      },
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: websiteLd }}
      />
      <Header />
      <main className="relative z-1">
        {/* Ambient glows */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.06] pointer-events-none -top-[200px] -left-[100px] bg-[#8B7EA8]" />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none top-[30%] -right-[200px] bg-[#8B7EA8]" />
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.07] pointer-events-none -bottom-[100px] left-[30%] bg-[#F5C518]" />

        {/* Hero */}
        <section className="text-center py-20 sm:py-20 px-5">
          <div className="animate-fadeInDown inline-flex items-center gap-2 bg-[#F5C518]/8 border border-[#F5C518]/15 text-[#F5C518] text-[0.82rem] font-semibold px-4.5 py-2 rounded-full mb-7 tracking-wide">
            ⚡ 8 ways to expose yourself
          </div>
          <h1 className="font-['Outfit'] font-black text-[clamp(2.8rem,7vw,4.8rem)] leading-[1.05] tracking-tight mb-5 animate-fadeInUp [animation-delay:0.1s] [animation-fill-mode:both]">
            Find out what's
            <br />
            <span className="bg-gradient-to-br from-[#F5C518] via-[#A89BC0] to-[#8B7EA8] bg-clip-text text-transparent">
              wrong with you
            </span>
          </h1>
          <p className="text-[#9B95A8] text-[clamp(1rem,2.5vw,1.2rem)] max-w-[540px] mx-auto mb-9 leading-relaxed animate-fadeInUp [animation-delay:0.2s] [animation-fill-mode:both]">
            Answer a few unhinged questions. Get a brutally honest result. Screenshot it. Post it. Watch your friends lose it.
          </p>
          <div className="flex gap-3.5 justify-center flex-wrap animate-fadeInUp [animation-delay:0.3s] [animation-fill-mode:both]">
            <button
              onClick={handleSurprise}
              className="inline-flex items-center gap-2.5 bg-[#F5C518] hover:bg-[#FFD84D] text-[#09090b] font-['Outfit'] font-bold text-base px-8 py-3.5 rounded-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(245,197,24,0.25)]"
            >
              <span className="text-xl">🎲</span> Surprise Me
            </button>
            <button
              onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 bg-[#2A2640]/50 text-[#F5F5F7] font-['Outfit'] font-semibold text-base px-7 py-3.5 rounded-full border border-[#3A3555] cursor-pointer transition-all hover:bg-[#2A2640]/60 hover:border-[#8B7EA8]/30"
            >
              Browse all tools ↓
            </button>
          </div>
        </section>

        {/* Tools Grid */}
        <section id="tools" className="px-5 pb-24 max-w-[1120px] mx-auto">
          <div className="font-['JetBrains_Mono'] text-[0.72rem] text-[#6B6580] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
            Pick your poison
            <span className="flex-1 h-px bg-[#2A2640]/40" />
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
                  <h2 className="font-['Outfit'] font-bold text-[1.15rem] tracking-tight mb-2 text-[#F5F5F7]">
                    {tool.name}
                  </h2>
                  <p className="text-[#9B95A8] text-[0.88rem] leading-relaxed">{tool.description}</p>
                </>
              );

              const baseClass = `relative bg-gradient-to-b from-[#2A2640] to-[#1E1A35] border border-[#3A3555]/50 rounded-2xl p-7 transition-all animate-fadeInUp block`;
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
                  className={`${baseClass} cursor-pointer hover:border-[#F5C518]/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(245,197,24,0.06)]`}
                  style={delay}
                >
                  {inner}
                </Link>
              );
            })}
          </div>
        </section>

        {/* Blog Promo */}
        <section className="px-5 pb-24 max-w-[1120px] mx-auto">
          <div className="font-['JetBrains_Mono'] text-[0.72rem] text-[#6B6580] uppercase tracking-[0.15em] mb-6 flex items-center gap-3">
            From the blog
            <span className="flex-1 h-px bg-[#2A2640]/40" />
          </div>

          <Link
            to="/blog"
            className="group relative overflow-hidden rounded-3xl border border-[#3A3555]/50 bg-gradient-to-b from-[#2A2640] to-[#1E1A35] hover:border-[#F5C518]/20 transition-all block"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full pointer-events-none bg-[radial-gradient(circle,rgba(245,197,24,0.06),transparent_70%)]" />

            <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Left: content */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.72rem] font-semibold bg-[#F5C518]/10 text-[#F5C518] border border-[#F5C518]/15 mb-4 font-['JetBrains_Mono'] uppercase tracking-wider">
                  📝 New
                </div>
                <h2 className="font-['Outfit'] font-extrabold text-[clamp(1.3rem,3vw,1.7rem)] tracking-tight text-[#F5F5F7] mb-2 leading-tight">
                  Guides, Memes &amp; Tool Updates
                </h2>
                <p className="text-[#9B95A8] text-[0.92rem] leading-relaxed max-w-lg">
                  Trendy foods explained, energy types decoded, and brutally honest takes on everything the internet is asking about. New posts every week.
                </p>
              </div>

              {/* Right: CTA + emoji stack */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div className="flex -space-x-2 text-[1.8rem]">
                  <span>🍵</span><span>⚡</span><span>🚨</span><span>💩</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full font-['Outfit'] font-bold text-[0.88rem] text-[#09090b] bg-[#F5C518] group-hover:bg-[#FFD84D] group-hover:shadow-[0_4px_20px_rgba(245,197,24,0.2)] transition-all">
                  Read the Blog →
                </span>
              </div>
            </div>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
