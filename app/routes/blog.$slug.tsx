import { Link, useLoaderData } from "react-router";
import type { MetaFunction, LoaderFunctionArgs } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { getDB, markdownToHtml, readingTime, CATEGORIES } from "~/lib/db";
import type { Post } from "~/lib/db";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.post) return [{ title: "Post Not Found — DaFuqBro" }];
  return [
    { title: `${data.post.title} — DaFuqBro Blog` },
    { name: "description", content: data.post.excerpt || data.post.title },
    { property: "og:title", content: data.post.title },
    { property: "og:description", content: data.post.excerpt },
  ];
};

export async function loader({ params, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const post = await db
    .prepare("SELECT * FROM posts WHERE slug = ? AND status = 'published'")
    .bind(params.slug)
    .first<Post>();

  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }

  return { post, html: markdownToHtml(post.content) };
}

export default function BlogPost() {
  const { post, html } = useLoaderData<typeof loader>();
  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));
  const cat = catMap[post.category];
  const rt = readingTime(post.content);

  return (
    <>
      <Header />
      <main className="relative z-1">
        <article className="max-w-[720px] mx-auto px-5 py-12">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-[#71717a] text-[0.82rem] hover:text-[#a1a1aa] transition-colors mb-8"
          >
            ← Back to Blog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <span className="text-[3.5rem] block mb-4">{post.cover_emoji}</span>

            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span
                className="font-['JetBrains_Mono'] text-[0.7rem] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "#facc15" + "15", color: "#facc15" }}
              >
                {cat?.emoji} {cat?.label || post.category}
              </span>
              <span className="text-[#71717a] text-[0.75rem] font-['JetBrains_Mono']">
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <span className="text-[#71717a] text-[0.75rem]">·</span>
              <span className="text-[#71717a] text-[0.75rem] font-['JetBrains_Mono']">{rt} min read</span>
            </div>

            <h1 className="font-['Outfit'] font-extrabold text-[clamp(1.8rem,5vw,2.5rem)] tracking-tight leading-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-[#a1a1aa] text-[1.1rem] leading-relaxed italic">{post.excerpt}</p>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06] mb-10" />

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
