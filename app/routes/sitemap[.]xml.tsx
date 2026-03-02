import type { LoaderFunctionArgs } from "react-router";
import { getDB } from "~/lib/db";
import type { Post } from "~/lib/db";

const SITE_URL = "https://dafuqbro.com";

// Static pages with their priority and change frequency
const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/blog", priority: "0.8", changefreq: "daily" },
  { path: "/shitcoin", priority: "0.7", changefreq: "monthly" },
  { path: "/roast", priority: "0.7", changefreq: "monthly" },
  { path: "/redflags", priority: "0.7", changefreq: "monthly" },
  { path: "/food", priority: "0.7", changefreq: "monthly" },
  { path: "/energy", priority: "0.7", changefreq: "monthly" },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const db = getDB(context);

  // Fetch all published blog posts
  const { results } = await db
    .prepare("SELECT slug, updated_at, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC")
    .all<Pick<Post, "slug" | "updated_at" | "published_at">>();

  const posts = results || [];

  const now = new Date().toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Static pages
  for (const page of staticPages) {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  }

  // Blog posts
  for (const post of posts) {
    const lastmod = (post.updated_at || post.published_at || now).split("T")[0];
    xml += `  <url>
    <loc>${SITE_URL}/blog/${post.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
  }

  xml += `</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
