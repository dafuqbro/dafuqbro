// Types
export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  cover_emoji: string;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface Session {
  id: string;
  created_at: string;
  expires_at: string;
}

export const CATEGORIES = [
  { value: "guides", label: "Guides & How-To", emoji: "📖" },
  { value: "memes", label: "Memes & Culture", emoji: "🐸" },
  { value: "updates", label: "Tool Updates", emoji: "🚀" },
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]["value"];

// Helper to get D1 binding from context
export function getDB(context: any): D1Database {
  return context.cloudflare.env.DB;
}

// Slug generator
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

// Reading time estimate
export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Session helpers
export function generateSessionId(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(db: D1Database): Promise<string> {
  const id = generateSessionId();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  await db.prepare("INSERT INTO sessions (id, expires_at) VALUES (?, ?)").bind(id, expires).run();
  return id;
}

export async function validateSession(db: D1Database, sessionId: string): Promise<boolean> {
  if (!sessionId) return false;
  const row = await db
    .prepare("SELECT id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
    .bind(sessionId)
    .first();
  return !!row;
}

export async function deleteSession(db: D1Database, sessionId: string): Promise<void> {
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

// Parse cookie
export function getSessionFromCookie(request: Request): string {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(/dfb_session=([a-f0-9]+)/);
  return match ? match[1] : "";
}

// Simple markdown to HTML (basic but covers most blog needs)
export function markdownToHtml(md: string): string {
  let html = md
    // Code blocks (must be before other rules)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold & italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
    // Blockquotes
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Horizontal rules
    .replace(/^---$/gm, "<hr />")
    // Lists
    .replace(/^\- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // Paragraphs — wrap lines that aren't already in tags
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (
        block.startsWith("<h") ||
        block.startsWith("<pre") ||
        block.startsWith("<ul") ||
        block.startsWith("<ol") ||
        block.startsWith("<blockquote") ||
        block.startsWith("<hr") ||
        block.startsWith("<li")
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}
