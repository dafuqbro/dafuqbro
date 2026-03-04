import { Link, useLoaderData, Form, redirect } from "react-router";
import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { getDB, validateSession, getSessionFromCookie, deleteSession, CATEGORIES } from "~/lib/db";
import type { Post } from "~/lib/db";

export const meta: MetaFunction = () => [{ title: "Admin Dashboard — DaFuqBro" }];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const db = getDB(context);
  const sessionId = getSessionFromCookie(request);
  if (!(await validateSession(db, sessionId))) {
    return redirect("/admin/login");
  }
  const { results } = await db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all<Post>();
  return { posts: results || [] };
}

export async function action({ request, context }: ActionFunctionArgs) {
  const db = getDB(context);
  const sessionId = getSessionFromCookie(request);
  if (!(await validateSession(db, sessionId))) {
    return redirect("/admin/login");
  }

  const form = await request.formData();
  const intent = form.get("intent") as string;

  if (intent === "delete") {
    const id = form.get("id") as string;
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
  }

  if (intent === "toggle") {
    const id = form.get("id") as string;
    const current = form.get("status") as string;
    const newStatus = current === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? new Date().toISOString() : null;
    await db
      .prepare("UPDATE posts SET status = ?, published_at = COALESCE(?, published_at), updated_at = datetime('now') WHERE id = ?")
      .bind(newStatus, publishedAt, id)
      .run();
  }

  if (intent === "logout") {
    await deleteSession(db, sessionId);
    return redirect("/admin/login", {
      headers: {
        "Set-Cookie": "dfb_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      },
    });
  }

  return redirect("/admin");
}

export default function AdminDashboard() {
  const { posts } = useLoaderData<typeof loader>();

  const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.value, c]));

  return (
    <div className="max-w-[960px] mx-auto px-5 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-['Outfit'] font-extrabold text-[1.8rem] tracking-tight">📋 Dashboard</h1>
          <p className="text-[#6B6580] text-[0.85rem]">{posts.length} posts total</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/edit/new"
            className="px-5 py-2.5 rounded-xl bg-[#F5C518] hover:bg-[#FFD84D] text-[#09090b] font-['Outfit'] font-bold text-[0.88rem] hover:-translate-y-0.5 transition-all"
          >
            + New Post
          </Link>
          <Link
            to="/"
            className="px-4 py-2.5 rounded-xl bg-[#2A2640]/40 text-[#9B95A8] font-['Outfit'] font-medium text-[0.85rem] border border-[#3A3555]/50 hover:bg-[#2A2640]/60 transition-all"
          >
            View Site
          </Link>
          <Form method="post">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#2A2640]/40 text-[#E05544] font-['Outfit'] font-medium text-[0.85rem] border border-[#3A3555]/50 hover:bg-[#E05544]/10 transition-all"
            >
              Logout
            </button>
          </Form>
        </div>
      </div>

      {/* Posts table */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-[3rem] block mb-4">📝</span>
          <p className="text-[#6B6580] text-[1rem] mb-4">No posts yet. Create your first one!</p>
          <Link
            to="/admin/edit/new"
            className="inline-flex px-6 py-3 rounded-xl bg-[#F5C518] hover:bg-[#FFD84D] text-[#09090b] font-['Outfit'] font-bold text-[0.92rem]"
          >
            + Create Post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post: Post) => {
            const cat = catMap[post.category];
            return (
              <div
                key={post.id}
                className="bg-[#1E1A35] border border-[#3A3555]/50 rounded-xl p-5 flex items-center gap-4 hover:border-[#3A3555]/60 transition-all"
              >
                <span className="text-2xl">{post.cover_emoji}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to={`/admin/edit/${post.id}`}
                      className="font-['Outfit'] font-bold text-[1rem] text-[#F5F5F7] hover:text-[#F5C518] transition-colors truncate"
                    >
                      {post.title}
                    </Link>
                    <span
                      className={`text-[0.65rem] font-['JetBrains_Mono'] font-semibold px-2 py-0.5 rounded-full ${
                        post.status === "published"
                          ? "bg-[#4ade80]/15 text-[#4ade80]"
                          : "bg-[#6B6580]/15 text-[#6B6580]"
                      }`}
                    >
                      {post.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[0.75rem] text-[#6B6580] font-['JetBrains_Mono']">
                    <span>
                      {cat?.emoji} {cat?.label || post.category}
                    </span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>/blog/{post.slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/admin/edit/${post.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2640]/40 text-[#9B95A8] text-[0.78rem] font-medium hover:bg-[#2A2640]/60 transition-all"
                  >
                    Edit
                  </Link>

                  <Form method="post">
                    <input type="hidden" name="intent" value="toggle" />
                    <input type="hidden" name="id" value={post.id} />
                    <input type="hidden" name="status" value={post.status} />
                    <button
                      type="submit"
                      className={`px-3 py-1.5 rounded-lg text-[0.78rem] font-medium transition-all ${
                        post.status === "published"
                          ? "bg-[#fb923c]/10 text-[#fb923c] hover:bg-[#fb923c]/20"
                          : "bg-[#4ade80]/10 text-[#4ade80] hover:bg-[#4ade80]/20"
                      }`}
                    >
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  </Form>

                  <Form method="post" onSubmit={(e) => { if (!confirm("Delete this post?")) e.preventDefault(); }}>
                    <input type="hidden" name="intent" value="delete" />
                    <input type="hidden" name="id" value={post.id} />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-[#E05544]/10 text-[#E05544] text-[0.78rem] font-medium hover:bg-[#E05544]/20 transition-all"
                    >
                      Delete
                    </button>
                  </Form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
