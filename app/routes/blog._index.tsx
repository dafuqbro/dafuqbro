import { Link, useLoaderData, useSearchParams } from "react-router";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { getDB, CATEGORIES, readingTime } from "~/lib/db";
import type { Post } from "~/lib/db";

const SITE_URL = "https://dafuqbro.com";
const SITE_NAME = "DaFuqBro";

export const meta: MetaFunction = () => {
  const description =
    "Guides, memes, and updates from the DaFuqBro team. Unhinged internet tools explained.";
  const url = `${SITE_URL}/blog`;

  return [
    { title: `Blog — ${SITE_NAME}` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },

    // Open Graph
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: `Blog — ${SITE_NAME}` },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:locale", content: "en_US" },

    // Twitter
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `Blog — ${SITE_NAME}` },
    { name: "twitter:description", content: description },

    // Robots
    { name: "robots", content: "index, follow" },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const url = new URL(request.url);
  const cat = url.searchParams.get("cat");

  let query = "SELECT * FROM posts WHERE status = 'published'";
  const binds: string[] = [];

  if (cat && cat !== "all") {
    query += " AND category = ?";
    binds.push(cat);
  }

  query += " ORDER BY published_at DESC";

  const stmt = binds.length > 0 ? db.prepare(query).bind(...binds) : db.prepare(query);
  const { results } = await stmt.all<Post>();
  const posts = results || [];

  // JSON-LD: Blog + CollectionPage
  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    description: "Guides, memes, and updates from the DaFuqBro team.",
    url: `${SITE_URL}/blog`,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "en-US",
    blogPost: posts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt || p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.published_at || p.created_at,
    })),
  };

  return {
    posts,
    activeCategory: cat || "all",
    blogLd: JSON.stringify(blogLd),
  };
}

export default function BlogIndex() {
  const { posts, activeCategory, blogLd } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

  const allCats = [{ value: "all", label: "All Posts", emoji: "✨" }, ...CATEGORIES];

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: blogLd }}
      />
      <main className="relative z-1">
        <div className="max-w-[840px] mx-auto px-5 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-['Outfit'] font-extrabold text-[2.5rem] tracking-tight mb-3">Blog</h1>
            <p className="text-[#a1a1aa] text-[1rem]">Guides, memes, and updates from the DaFuqBro universe.</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {allCats.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSearchParams(cat.value === "all" ? {} : { cat: cat.value })}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[0.82rem] font-medium transition-all ${
                  activeCategory === cat.value
                    ? "bg-[#facc15]/15 text-[#facc15] border border-[#facc15]/30"
                    : "bg-white/[0.04] text-[#a1a1aa] border border-white/[0.06] hover:bg-white/[0.08]"
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-[3rem] block mb-4">📭</span>
              <p className="text-[#71717a] text-[1rem]">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post: Post) => {
                const cat = catMap[post.category];
                const rt = readingTime(post.content);
                return (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="bg-[#131316] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:-translate-y-0.5 transition-all block"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-[2.2rem] flex-shrink-0">{post.cover_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span
                            className="font-['JetBrains_Mono'] text-[0.65rem] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: "#facc15" + "15",
                              color: "#facc15",
                            }}
                          >
                            {cat?.emoji} {cat?.label || post.category}
                          </span>
                          <span className="text-[#71717a] text-[0.72rem] font-['JetBrains_Mono']">
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : ""}
                          </span>
                          <span className="text-[#71717a] text-[0.72rem]">·</span>
                          <span className="text-[#71717a] text-[0.72rem] font-['JetBrains_Mono']">{rt} min read</span>
                        </div>
                        <h2 className="font-['Outfit'] font-bold text-[1.15rem] text-[#f4f4f5] mb-1.5 tracking-tight">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="text-[#71717a] text-[0.88rem] leading-relaxed line-clamp-2">{post.excerpt}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
