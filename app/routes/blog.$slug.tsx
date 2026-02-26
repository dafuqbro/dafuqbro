import { Link, useLoaderData } from "react-router";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { getDB, markdownToHtml, readingTime, CATEGORIES } from "~/lib/db";
import type { Post } from "~/lib/db";

const SITE_URL = "https://dafuqbro.com";
const SITE_NAME = "DaFuqBro";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) return [{ title: "Post Not Found — DaFuqBro" }];

  const { post, url } = data;
  const description = post.excerpt || post.title;
  const ogImage = `${SITE_URL}/og-blog.png`;

  return [
    // Basic
    { title: `${post.title} — ${SITE_NAME} Blog` },
    { name: "description", content: description },

    // Canonical
    { tagName: "link", rel: "canonical", href: url },

    // Open Graph
    { property: "og:type", content: "article" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: post.title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:locale", content: "en_US" },

    // Article meta
    ...(post.published_at
      ? [{ property: "article:published_time", content: post.published_at }]
      : []),
    ...(post.updated_at
      ? [{ property: "article:modified_time", content: post.updated_at }]
      : []),
    { property: "article:section", content: post.category },
    { property: "article:author", content: SITE_URL },

    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },

    // Robots
    { name: "robots", content: "index, follow" },
  ];
};

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const post = await db
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'")
    .bind(params.slug)
    .first<Post>();

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const rt = readingTime(post.content);
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
  const cat = catMap[post.category];

  // JSON-LD: BlogPosting schema
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || post.title,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    },
    articleSection: cat?.label || post.category,
    wordCount: post.content.split(/\s+/).length,
    timeRequired: `PT${rt}M`,
    inLanguage: "en-US",
    isAccessibleForFree: true,
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return {
    post,
    html: markdownToHtml(post.content),
    url,
    rt,
    articleLd: JSON.stringify(articleLd),
    breadcrumbLd: JSON.stringify(breadcrumbLd),
  };
}

export default function BlogPost() {
  const { post, html, url, rt, articleLd, breadcrumbLd } =
    useLoaderData<typeof loader>();
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
  const cat = catMap[post.category];

  return (
    <>
      <Header />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: articleLd }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbLd }}
      />

      <main className="relative z-1">
        <article className="max-w-[720px] mx-auto px-5 py-12">
          {/* Breadcrumb nav (visible + semantic) */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[#71717a] text-[0.82rem] mb-8 flex-wrap"
          >
            <Link to="/" className="hover:text-[#a1a1aa] transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/blog" className="hover:text-[#a1a1aa] transition-colors">
              Blog
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#a1a1aa] truncate max-w-[240px]">
              {post.title}
            </span>
          </nav>

          {/* Post header */}
          <header className="mb-10">
            <span
              className="text-[3.5rem] block mb-4"
              role="img"
              aria-label="post cover"
            >
              {post.cover_emoji}
            </span>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="font-['JetBrains_Mono'] text-[0.7rem] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#facc15" + "15", color: "#facc15" }}
              >
                {cat?.emoji} {cat?.label || post.category}
              </span>
              <time
                dateTime={post.published_at || ""}
                className="text-[#71717a] text-[0.75rem] font-['JetBrains_Mono']"
              >
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </time>
              <span className="text-[#71717a] text-[0.75rem]" aria-hidden="true">
                ·
              </span>
              <span className="text-[#71717a] text-[0.75rem] font-['JetBrains_Mono']">
                {rt} min read
              </span>
            </div>

            <h1 className="font-['Outfit'] font-extrabold text-[clamp(1.8rem,5vw,2.5rem)] tracking-tight leading-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-[#a1a1aa] text-[1.1rem] leading-relaxed italic">
                {post.excerpt}
              </p>
            )}
          </header>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-10" role="separator" />

          {/* Content */}
          <div
            className="
              [&_h1]:font-['Outfit'] [&_h1]:font-bold [&_h1]:text-[1.6rem] [&_h1]:mt-10 [&_h1]:mb-4 [&_h1]:text-[#f4f4f5]
              [&_h2]:font-['Outfit'] [&_h2]:font-bold [&_h2]:text-[1.35rem] [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[#f4f4f5]
              [&_h3]:font-['Outfit'] [&_h3]:font-semibold [&_h3]:text-[1.1rem] [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[#f4f4f5]
              [&_p]:text-[#a1a1aa] [&_p]:text-[1rem] [&_p]:leading-[1.8] [&_p]:mb-5
              [&_a]:text-[#facc15] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#fde047]
              [&_strong]:text-[#f4f4f5] [&_strong]:font-semibold
              [&_em]:text-[#a1a1aa]
              [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.88rem] [&_code]:font-['JetBrains_Mono'] [&_code]:text-[#facc15]
              [&_pre]:bg-[#0a0a0f] [&_pre]:p-5 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-6 [&_pre]:border [&_pre]:border-white/[0.06]
              [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[#a1a1aa]
              [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#facc15]/40 [&_blockquote]:pl-5 [&_blockquote]:text-[#71717a] [&_blockquote]:italic [&_blockquote]:my-6
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:text-[#a1a1aa]
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:text-[#a1a1aa]
              [&_li]:mb-2 [&_li]:text-[1rem] [&_li]:leading-[1.7]
              [&_hr]:border-white/[0.06] [&_hr]:my-8
              [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Share section */}
          <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
            <p className="text-[#71717a] text-[0.88rem] mb-3">
              Enjoyed this? Share it with someone who needs it.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-[0.82rem] text-[#a1a1aa] hover:bg-white/[0.1] hover:text-[#f4f4f5] transition-all"
              >
                𝕏 Post
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-[0.82rem] text-[#a1a1aa] hover:bg-white/[0.1] hover:text-[#f4f4f5] transition-all"
              >
                Telegram
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-[0.82rem] text-[#a1a1aa] hover:bg-white/[0.1] hover:text-[#f4f4f5] transition-all"
              >
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(url);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-[0.82rem] text-[#a1a1aa] hover:bg-white/[0.1] hover:text-[#f4f4f5] transition-all cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Footer nav */}
          <div className="h-px bg-white/[0.06] my-10" />
          <div className="flex justify-between items-center">
            <Link
              to="/blog"
              className="text-[#71717a] text-[0.88rem] hover:text-[#a1a1aa] transition-colors"
            >
              ← All Posts
            </Link>
            <Link
              to="/"
              className="text-[#71717a] text-[0.88rem] hover:text-[#a1a1aa] transition-colors"
            >
              Try Our Tools →
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
