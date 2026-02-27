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

// Tool card data for embeds
const toolCards: Record<string, { emoji: string; name: string; description: string; color: string; slug: string }> = {
  shitcoin: { emoji: "💩", name: "Shitcoin Pitch Deck", description: "Generate a hilariously legit listing for your fake meme coin. Complete with tokenomics & degen score.", color: "#facc15", slug: "shitcoin" },
  roast: { emoji: "🔥", name: "Roast My Year", description: "Your year in review, but make it brutally honest. A Wrapped-style roast with a Life Score.", color: "#f472b6", slug: "roast" },
  redflags: { emoji: "🚨", name: "Rate My Red Flags", description: "Check all the red flags that apply to you. Get a brutal dateability score and a card to prove it.", color: "#fb923c", slug: "redflags" },
  food: { emoji: "🍵", name: "What Trendy Food Are You?", description: "8 questions to find which trendy food matches your personality. Matcha? Boba? Beef tallow? Let's find out.", color: "#fbbf24", slug: "food" },
  energy: { emoji: "⚡", name: "Your Vibe Energy", description: "Physics meets personality. Are you kinetic, potential, nuclear, or dark energy? Science will judge you.", color: "#6366f1", slug: "energy" },
  flags: { emoji: "🚩", name: "Flag Detector", description: "Describe any situation. We'll tell you if it's a red flag or green flag with zero mercy.", color: "#f87171", slug: "flags" },
  horror: { emoji: "🪓", name: "Horror Movie Death", description: "How would you die in a horror movie? Get your death scene, survival odds & \"first to go\" rating.", color: "#a78bfa", slug: "horror" },
  dna: { emoji: "🧬", name: "Internet DNA", description: "Your internet personality broken down into a chart. Are you more doomscroller or shitposter?", color: "#22d3ee", slug: "dna" },
  startup: { emoji: "🦄", name: "Startup or Scam", description: "Pitch any business idea. We'll rate it from \"$4.2B Unicorn\" to \"Straight to Jail.\"", color: "#4ade80", slug: "startup" },
  villain: { emoji: "🦹", name: "Villain Origin Story", description: "Answer 5 questions. Get your villain name, superpower, weakness & evil lair.", color: "#60a5fa", slug: "villain" },
};

function renderToolCard(slug: string): string {
  const tool = toolCards[slug];
  if (!tool) return "";
  return `<div style="background: linear-gradient(135deg, ${tool.color}08, ${tool.color}04); border: 1px solid ${tool.color}25; border-radius: 20px; padding: 32px; margin: 32px 0; text-align: center;">
    <div style="font-size: 3.5rem; margin-bottom: 12px;">${tool.emoji}</div>
    <div style="font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.4rem; color: #f4f4f5; margin-bottom: 8px; letter-spacing: -0.02em;">${tool.name}</div>
    <div style="color: #a1a1aa; font-size: 0.92rem; line-height: 1.6; margin-bottom: 20px; max-width: 380px; margin-left: auto; margin-right: auto;">${tool.description}</div>
    <a href="/${tool.slug}" style="display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, ${tool.color}, ${tool.color}cc); color: #09090b; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.95rem; padding: 12px 28px; border-radius: 12px; text-decoration: none; transition: all 0.2s;">Try It Now →</a>
  </div>`;
}

// Simple markdown to HTML (basic but covers most blog needs)
export function markdownToHtml(md: string): string {
  // First, handle tool embeds before other processing
  md = md.replace(/\[tool:(\w+)\]/g, (_, slug) => renderToolCard(slug));

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
        block.startsWith("<li") ||
        block.startsWith("<div")
      ) {
        return block;
      }
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}
