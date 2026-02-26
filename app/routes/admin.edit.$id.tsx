import { useState } from "react";
import { Link, redirect, useLoaderData, Form, useNavigation } from "react-router";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getDB, validateSession, getSessionFromCookie, slugify, markdownToHtml, CATEGORIES } from "~/lib/db";
import type { Post } from "~/lib/db";

export const meta: MetaFunction = () => [{ title: "Edit Post — DaFuqBro Admin" }];

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const sessionId = getSessionFromCookie(request);
  if (!(await validateSession(db, sessionId))) return redirect("/admin/login");

  const id = params.id;
  if (id === "new") {
    return { post: null };
  }

  const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<Post>();
  if (!post) return redirect("/admin");
  return { post };
}

export async function action({ request, params, context }: ActionFunctionArgs) {
  const db = getDB(context);
  const sessionId = getSessionFromCookie(request);
  if (!(await validateSession(db, sessionId))) return redirect("/admin/login");

  const form = await request.formData();
  const title = (form.get("title") as string) || "Untitled";
  const slug = slugify(form.get("slug") as string || title);
  const content = (form.get("content") as string) || "";
  const excerpt = (form.get("excerpt") as string) || "";
  const category = (form.get("category") as string) || "guides";
  const cover_emoji = (form.get("cover_emoji") as string) || "📝";
  const status = (form.get("status") as string) || "draft";
  const id = params.id;

  if (id === "new") {
    const publishedAt = status === "published" ? new Date().toISOString() : null;
    const result = await db
      .prepare(
        "INSERT INTO posts (title, slug, content, excerpt, category, cover_emoji, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(title, slug, content, excerpt, category, cover_emoji, status, publishedAt)
      .run();
    return redirect("/admin");
  }

  const publishedAt = status === "published" ? new Date().toISOString() : null;
  await db
    .prepare(
      "UPDATE posts SET title=?, slug=?, content=?, excerpt=?, category=?, cover_emoji=?, status=?, published_at=COALESCE(?, published_at), updated_at=datetime('now') WHERE id=?"
    )
    .bind(title, slug, content, excerpt, category, cover_emoji, status, publishedAt, id)
    .run();

  return redirect("/admin");
}

export default function AdminEditor() {
  const { post } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const saving = navigation.state === "submitting";

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [category, setCategory] = useState(post?.category || "guides");
  const [coverEmoji, setCoverEmoji] = useState(post?.cover_emoji || "📝");
  const [status, setStatus] = useState(post?.status || "draft");
  const [showPreview, setShowPreview] = useState(false);

  const autoSlug = (t: string) => {
    setTitle(t);
    if (!post) setSlug(slugify(t));
  };

  const inputClass =
    "w-full bg-[#1a1a1f] border border-white/[0.06] rounded-xl py-3 px-4 text-[#f4f4f5] text-[0.92rem] outline-none focus:border-[#facc15]/40 font-['Outfit']";
  const labelClass = "block text-[0.82rem] font-medium text-[#a1a1aa] mb-1.5";

  return (
    <div className="max-w-[960px] mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-[#71717a] hover:text-white transition-colors text-[0.85rem]">
            ← Back
          </Link>
          <h1 className="font-['Outfit'] font-extrabold text-[1.5rem] tracking-tight">
            {post ? "Edit Post" : "New Post"}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 rounded-lg bg-white/[0.06] text-[#a1a1aa] text-[0.82rem] font-medium hover:bg-white/[0.1] transition-all"
          >
            {showPreview ? "Editor" : "Preview"}
          </button>
        </div>
      </div>

      {showPreview ? (
        /* PREVIEW */
        <div className="bg-[#131316] border border-white/[0.06] rounded-2xl p-8">
          <div className="text-[3rem] mb-4">{coverEmoji}</div>
          <h1 className="font-['Outfit'] font-extrabold text-[2rem] tracking-tight mb-3">{title || "Untitled"}</h1>
          <p className="text-[#a1a1aa] text-[0.88rem] mb-6 italic">{excerpt}</p>
          <div
            className="prose prose-invert max-w-none
              [&_h1]:font-['Outfit'] [&_h1]:font-bold [&_h1]:text-[1.6rem] [&_h1]:mt-8 [&_h1]:mb-3
              [&_h2]:font-['Outfit'] [&_h2]:font-bold [&_h2]:text-[1.3rem] [&_h2]:mt-6 [&_h2]:mb-2
              [&_h3]:font-['Outfit'] [&_h3]:font-semibold [&_h3]:text-[1.1rem] [&_h3]:mt-5 [&_h3]:mb-2
              [&_p]:text-[#a1a1aa] [&_p]:text-[0.92rem] [&_p]:leading-relaxed [&_p]:mb-4
              [&_a]:text-[#facc15] [&_a]:underline
              [&_strong]:text-[#f4f4f5]
              [&_code]:bg-white/[0.06] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[0.85rem] [&_code]:font-['JetBrains_Mono']
              [&_pre]:bg-[#0a0a0f] [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:mb-4
              [&_blockquote]:border-l-2 [&_blockquote]:border-[#facc15]/40 [&_blockquote]:pl-4 [&_blockquote]:text-[#71717a] [&_blockquote]:italic
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_li]:text-[#a1a1aa] [&_li]:mb-1
              [&_hr]:border-white/[0.06] [&_hr]:my-6
              [&_img]:rounded-xl [&_img]:my-4"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
          />
        </div>
      ) : (
        /* EDITOR */
        <Form method="post" className="flex flex-col gap-5">
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                name="title"
                value={title}
                onChange={(e) => autoSlug(e.target.value)}
                placeholder="Your post title"
                className={inputClass}
              />
            </div>
            <div className="w-[80px]">
              <label className={labelClass}>Emoji</label>
              <input
                type="text"
                name="cover_emoji"
                value={coverEmoji}
                onChange={(e) => setCoverEmoji(e.target.value)}
                className={`${inputClass} text-center text-2xl`}
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Slug</label>
            <div className="flex items-center gap-2">
              <span className="text-[#71717a] text-[0.82rem]">/blog/</span>
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Excerpt</label>
            <input
              type="text"
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for listing pages"
              className={inputClass}
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Content <span className="text-[#71717a] font-normal">(Markdown supported)</span>
            </label>
            <textarea
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              placeholder={"# Your Post Title\n\nWrite your content here using **Markdown**...\n\n## Section Header\n\nParagraph text goes here."}
              className={`${inputClass} font-['JetBrains_Mono'] text-[0.85rem] leading-relaxed resize-y min-h-[300px]`}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Link
              to="/admin"
              className="px-6 py-3 rounded-xl bg-white/[0.06] text-[#a1a1aa] font-['Outfit'] font-medium text-[0.88rem] border border-white/[0.06] hover:bg-white/[0.1] transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#09090b] font-['Outfit'] font-bold text-[0.92rem] cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {saving ? "Saving..." : post ? "Update Post" : "Create Post"}
            </button>
          </div>
        </Form>
      )}
    </div>
  );
}
