import { useState, useRef, useEffect, useCallback } from "react";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { toolMeta, toolJsonLd } from "~/lib/seo";

// ─────────────────────────────────────────────────────────────
// MEME WARS — DaFuqBro.com route
// Deploy to: app/routes/memewars.tsx
// Add to routes.ts: route("memewars", "routes/memewars.tsx"),
// Add to tools.ts: see tools.ts file in this package
// ─────────────────────────────────────────────────────────────

export const meta: MetaFunction = () =>
  toolMeta({
    slug: "memewars",
    title: "Meme Wars: Settle the Internet — DaFuqBro",
    description:
      "A Catan-style strategy game set across 8 internet zones. Collect Clout, Cope, Degen, Sigma & Rizz. Build Bases, Viral Hubs and Pipelines. First to 10 VP wins the timeline.",
    ogImage: "/og/memewars.png",
  });

// ── DESIGN TOKENS (mirrors app.css) ─────────────────────────
const T = {
  bgPrimary:  "#09090b",
  bgCard:     "#1E1A35",
  bgCardHov:  "#2A2640",
  bgInput:    "#2A2640",
  borderSub:  "rgba(139,126,168,0.18)",
  borderHov:  "rgba(139,126,168,0.4)",
  textPri:    "#F5F5F7",
  textSec:    "#B0AAC0",
  textMut:    "#7B7490",
  yellow:     "#F5C518",
  pink:       "#C4A8D8",
  cyan:       "#22d3ee",
  green:      "#4ade80",
  purple:     "#A89BC0",
  orange:     "#fb923c",
  red:        "#E05544",
  blue:       "#60a5fa",
  hoodDeep:   "#1E1A35",
  hoodMid:    "#2A2640",
  hoodLight:  "#3A3555",
};

const W = 760, H = 520;

const RESOURCES = {
  CLOUT: { name: "Clout", emoji: "✨", color: T.yellow,  dark: "#2a2300" },
  COPE:  { name: "Cope",  emoji: "😭", color: T.blue,    dark: "#0d1a3a" },
  DEGEN: { name: "Degen", emoji: "🎰", color: T.orange,  dark: "#2a1000" },
  SIGMA: { name: "Sigma", emoji: "🐺", color: T.purple,  dark: "#1a0a40" },
  RIZZ:  { name: "Rizz",  emoji: "💅", color: T.pink,    dark: "#2a0a28" },
};
const RES_KEYS = Object.keys(RESOURCES) as Array<keyof typeof RESOURCES>;

const PORTS = [
  { nodeId: 0,  type: "3:1", give: null,    ratio: 3, label: "3:1 Port",   emoji: "🔀" },
  { nodeId: 6,  type: "2:1", give: "COPE",  ratio: 2, label: "Cope Port",  emoji: "😭" },
  { nodeId: 10, type: "2:1", give: "DEGEN", ratio: 2, label: "Degen Port", emoji: "🎰" },
  { nodeId: 25, type: "2:1", give: "CLOUT", ratio: 2, label: "Clout Port", emoji: "✨" },
  { nodeId: 27, type: "2:1", give: "RIZZ",  ratio: 2, label: "Rizz Port",  emoji: "💅" },
  { nodeId: 16, type: "2:1", give: "SIGMA", ratio: 2, label: "Sigma Port", emoji: "🐺" },
  { nodeId: 22, type: "3:1", give: null,    ratio: 3, label: "3:1 Port",   emoji: "🔀" },
] as const;

const ZONES = [
  { id: "tiktok",    name: "TikTok",      emoji: "🎵", resource: "RIZZ"  as const, color: "#ff2d55", x: 130, y: 110, w: 160, h: 110 },
  { id: "twitter",   name: "X (Twitter)", emoji: "💀", resource: "COPE"  as const, color: T.blue,    x: 340, y: 60,  w: 170, h: 110 },
  { id: "reddit",    name: "Reddit",      emoji: "🐸", resource: "DEGEN" as const, color: T.orange,  x: 570, y: 110, w: 160, h: 130 },
  { id: "youtube",   name: "YouTube",     emoji: "📺", resource: "CLOUT" as const, color: T.red,     x: 380, y: 240, w: 160, h: 110 },
  { id: "discord",   name: "Discord",     emoji: "🗡️", resource: "SIGMA" as const, color: "#5865f2", x: 110, y: 290, w: 160, h: 110 },
  { id: "instagram", name: "Instagram",   emoji: "✨", resource: "RIZZ"  as const, color: "#e1306c", x: 310, y: 380, w: 160, h: 110 },
  { id: "linkedin",  name: "LinkedIn",    emoji: "💼", resource: "CLOUT" as const, color: "#0077b5", x: 570, y: 360, w: 150, h: 100 },
  { id: "4chan",     name: "The Abyss",   emoji: "👁️", resource: "DEGEN" as const, color: T.green,   x: 100, y: 400, w: 130, h: 100 },
];

const NODES = [
  { id: 0,  x: 130, y: 100, zones: ["tiktok"],               roll: 5,  label: "FYP" },
  { id: 1,  x: 210, y: 75,  zones: ["tiktok","twitter"],     roll: 9,  label: "Crossover" },
  { id: 2,  x: 310, y: 95,  zones: ["twitter"],              roll: 6,  label: "Quote RT" },
  { id: 3,  x: 155, y: 175, zones: ["tiktok","discord"],     roll: 8,  label: "Brainrot" },
  { id: 4,  x: 265, y: 155, zones: ["tiktok","youtube"],     roll: 4,  label: "Repost" },
  { id: 5,  x: 380, y: 70,  zones: ["twitter"],              roll: 11, label: "Main Char" },
  { id: 6,  x: 480, y: 65,  zones: ["twitter"],              roll: 3,  label: "Ratio" },
  { id: 7,  x: 540, y: 110, zones: ["twitter","reddit"],     roll: 9,  label: "Drama" },
  { id: 8,  x: 430, y: 160, zones: ["twitter","youtube"],    roll: 6,  label: "Viral" },
  { id: 9,  x: 620, y: 120, zones: ["reddit"],               roll: 5,  label: "Front Pg" },
  { id: 10, x: 700, y: 185, zones: ["reddit"],               roll: 10, label: "Basement" },
  { id: 11, x: 660, y: 270, zones: ["reddit","linkedin"],    roll: 8,  label: "AMA" },
  { id: 12, x: 560, y: 245, zones: ["reddit","youtube"],     roll: 4,  label: "Reposter" },
  { id: 13, x: 400, y: 250, zones: ["youtube"],              roll: 2,  label: "Algorithm" },
  { id: 14, x: 490, y: 250, zones: ["youtube"],              roll: 12, label: "Clickbait" },
  { id: 15, x: 450, y: 345, zones: ["youtube","instagram"],  roll: 9,  label: "Collab" },
  { id: 16, x: 115, y: 295, zones: ["discord"],              roll: 5,  label: "Server" },
  { id: 17, x: 245, y: 285, zones: ["discord","youtube"],    roll: 10, label: "Mod Fort" },
  { id: 18, x: 155, y: 375, zones: ["discord","4chan"],      roll: 6,  label: "Bunker" },
  { id: 19, x: 265, y: 370, zones: ["discord","instagram"],  roll: 3,  label: "E-boy" },
  { id: 20, x: 325, y: 400, zones: ["instagram"],            roll: 11, label: "Explore" },
  { id: 21, x: 445, y: 395, zones: ["instagram","linkedin"], roll: 8,  label: "Collab" },
  { id: 22, x: 360, y: 470, zones: ["instagram","4chan"],    roll: 5,  label: "Cursed" },
  { id: 23, x: 585, y: 370, zones: ["linkedin"],             roll: 6,  label: "Hustle" },
  { id: 24, x: 690, y: 370, zones: ["linkedin"],             roll: 4,  label: "CEO" },
  { id: 25, x: 635, y: 460, zones: ["linkedin"],             roll: 10, label: "Humble Brg" },
  { id: 26, x: 105, y: 415, zones: ["4chan"],                roll: 9,  label: "/b/" },
  { id: 27, x: 185, y: 480, zones: ["4chan"],                roll: 3,  label: "Anon Pit" },
  { id: 28, x: 215, y: 450, zones: ["4chan","instagram"],    roll: 11, label: "Schizo" },
];

const EDGES: [number,number][] = [
  [0,1],[1,2],[2,5],[5,6],[6,7],[7,9],[9,10],[10,11],[11,12],[12,14],
  [14,8],[8,13],[13,4],[4,3],[3,16],[16,17],[17,12],[15,23],[15,21],
  [21,23],[23,24],[24,25],[25,22],[22,27],[27,26],[26,18],[18,16],
  [18,28],[28,22],[19,20],[20,15],[4,2],[8,7],[11,24],[17,19],[3,1],
  [13,15],[20,22],[12,8],[6,9],[16,18],[19,28],
];

const BUILD_COSTS = {
  BASE:      { COPE: 1, CLOUT: 1, DEGEN: 1, RIZZ: 1 },
  VIRAL_HUB: { CLOUT: 2, DEGEN: 3 },
  PIPELINE:  { COPE: 1, CLOUT: 1 },
  GLAZER:    { RIZZ: 1, SIGMA: 1, DEGEN: 1 },
} as const;

type BuildType = keyof typeof BUILD_COSTS;
type ResKey = keyof typeof RESOURCES;
type Resources = Partial<Record<ResKey, number>>;

const PIECES: { type: BuildType; label: string; emoji: string; desc: string; color: string }[] = [
  { type: "BASE",      label: "Base",      emoji: "🏠", desc: "+1 VP · Claim any free node",          color: T.green  },
  { type: "VIRAL_HUB", label: "Viral Hub", emoji: "🔥", desc: "+2 VP · Upgrade your Base (×2 yield)", color: T.orange },
  { type: "PIPELINE",  label: "Pipeline",  emoji: "⚡", desc: "Link nodes · Unlocks Port trades",      color: T.yellow },
  { type: "GLAZER",    label: "Glazer",    emoji: "💪", desc: "3 Glazers = Largest Army = +2 VP",      color: T.pink   },
];

const LEAGUES = [
  { name: "NPC",      min: 0,  color: T.textMut, emoji: "🧟" },
  { name: "Normie",   min: 3,  color: "#92400e", emoji: "😐" },
  { name: "Poster",   min: 5,  color: T.textSec, emoji: "📱" },
  { name: "Glazer",   min: 7,  color: T.yellow,  emoji: "✨" },
  { name: "Sigma",    min: 9,  color: T.purple,  emoji: "🐺" },
  { name: "Gigachad", min: 12, color: T.red,     emoji: "👑" },
];

const RULES_SECTIONS = [
  { title: "🎯 Objective", color: T.yellow,
    items: ["First to 10 Victory Points (VP) wins.", "VP come from Bases (+1), Viral Hubs (+2), and the Glazer Army bonus (+2 for 3+ Glazers)."] },
  { title: "🔄 Turn Order", color: T.blue,
    items: ["SETUP: Place 2 Bases anywhere on the map to get starting resources.", "PLAY: Roll Dice first, then optionally Trade or Build.", "End Turn passes play to CPU opponents."] },
  { title: "🎲 Dice & Resources", color: T.orange,
    items: ["Roll 2 dice. Each node showing that number produces for its owner.", "Bases produce 1 per adjacent zone. Viral Hubs produce 2.", "Rolling 7 summons THE RATIO ☠️ — blocks a random node."] },
  { title: "🏗️ Building", color: T.green,
    items: ["🏠 Base (1 Cope+Clout+Degen+Rizz) → +1 VP. Drag onto any free node.", "🔥 Viral Hub (2 Clout+3 Degen) → +2 VP. Drag onto YOUR Base.", "⚡ Pipeline (1 Cope+1 Clout) → connects nodes. Drag to Base, click dest.", "💪 Glazer (1 Rizz+Sigma+Degen) → 3+ = +2 VP bonus."] },
  { title: "💱 Trading", color: T.purple,
    items: ["BANK (always): 4 same → 1 any", "PORT 3:1 (Pipeline to 🔀 node): 3 same → 1 any", "PORT 2:1 (Pipeline to resource port): 2 specific → 1 any"] },
  { title: "🌐 Zones & Nodes", color: "#e1306c",
    items: ["8 Internet Zones each produce a resource.", "Nodes on borders touch multiple zones — produce multiple resources!", "Hover nodes to see roll number, zones, and resource output."] },
  { title: "🏆 Leagues", color: T.pink,
    items: ["NPC (0+) → Normie (3+) → Poster (5+) → Glazer (7+) → Sigma (9+) → Gigachad (12+)"] },
];

// ── HELPERS ──────────────────────────────────────────────────
function getLeague(pts: number) {
  return [...LEAGUES].reverse().find(l => pts >= l.min) || LEAGUES[0];
}
function canAffordCost(res: Resources, cost: Record<string, number>) {
  return Object.entries(cost).every(([k, v]) => (res[k as ResKey] || 0) >= v);
}
function spendCost(res: Resources, cost: Record<string, number>): Resources {
  const r = { ...res };
  Object.entries(cost).forEach(([k, v]) => { r[k as ResKey] = (r[k as ResKey] || 0) - v; });
  return r;
}
function calcPoints(p: Player) {
  return p.bases.length + p.viralHubs.length * 2 + (p.glazers >= 3 ? 2 : 0);
}
function recalcPortAccess(pipes: [number,number][], bases: number[], hubs: number[]) {
  const owned = new Set([...bases, ...hubs]);
  const acc: number[] = [];
  pipes.forEach(([a, b]) => {
    if (owned.has(a) || owned.has(b)) {
      PORTS.forEach(p => { if (p.nodeId === a || p.nodeId === b) acc.push(p.nodeId); });
    }
  });
  return [...new Set(acc)];
}

interface Player {
  resources: Resources;
  bases: number[];
  viralHubs: number[];
  pipelines: [number, number][];
  glazers: number;
  points: number;
  xp: number;
  portAccess: number[];
}
interface CpuPlayer { id: number; name: string; color: string; emoji: string; bases: number[]; viralHubs: number[]; glazers: number; points: number; }

function initPlayer(): Player {
  return { resources: {}, bases: [], viralHubs: [], pipelines: [], glazers: 0, points: 0, xp: 0, portAccess: [] };
}

// ── SHARED CARD STYLE ────────────────────────────────────────
const cs = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: T.bgCard,
  border: `1px solid ${T.borderSub}`,
  borderRadius: "16px",
  padding: "16px",
  ...extra,
});

// ── COST BADGE ───────────────────────────────────────────────
function CostBadge({ type, resources }: { type: BuildType; resources: Resources }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
      {Object.entries(BUILD_COSTS[type]).map(([k, v]) => {
        const r = RESOURCES[k as ResKey];
        const has = (resources[k as ResKey] || 0) >= v;
        return (
          <span key={k} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "8px", background: has ? r.color + "22" : T.bgPrimary, color: has ? r.color : T.textMut, border: `1px solid ${has ? r.color + "55" : T.borderSub}`, fontWeight: 700 }}>
            {v}{r.emoji}
          </span>
        );
      })}
    </div>
  );
}

// ── RULES PANEL ──────────────────────────────────────────────
function RulesPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "fixed", top: "14px", right: "14px", zIndex: 500 }}>
      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: -1 }} aria-hidden="true" />}
      <div style={{ position: "absolute", top: 0, right: 0, width: open ? "min(360px,90vw)" : "0", maxHeight: open ? "85vh" : "0", overflow: "hidden", background: T.bgCard, border: open ? `1px solid ${T.borderHov}` : "1px solid transparent", borderRadius: "16px", boxShadow: open ? "0 8px 60px rgba(0,0,0,0.7)" : "none", transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" }}>
        <div style={{ overflowY: "auto", maxHeight: "85vh", padding: open ? "18px" : "0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: T.textPri, letterSpacing: "2px" }}>RULES</div>
              <div style={{ fontSize: "9px", color: T.textMut, letterSpacing: "3px", marginTop: "1px" }}>MEME WARS · SETTLE THE INTERNET</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close rules" style={{ background: "none", border: `1px solid ${T.borderSub}`, borderRadius: "8px", color: T.textSec, cursor: "pointer", padding: "4px 10px", fontSize: "12px" }}>✕</button>
          </div>
          {RULES_SECTIONS.map((sec, si) => (
            <div key={si} style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: sec.color, borderBottom: `1px solid ${sec.color}33`, paddingBottom: "5px", marginBottom: "8px", letterSpacing: "1px" }}>{sec.title}</div>
              {sec.items.map((item, ii) => (
                <div key={ii} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "11px", color: T.textSec, lineHeight: "1.6" }}>
                  <span style={{ color: sec.color, flexShrink: 0 }}>▸</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          ))}
          <div style={{ background: T.bgInput, borderRadius: "12px", padding: "12px", marginTop: "4px" }}>
            <div style={{ fontSize: "9px", color: T.textMut, letterSpacing: "2px", marginBottom: "10px", fontWeight: 700 }}>QUICK REFERENCE</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[["🏠 Base","1✨+1😭+1🎰+1💅"],["🔥 Hub","2✨+3🎰→+2VP"],["⚡ Pipeline","1😭+1✨"],["💪 Glazer","1💅+1🐺+1🎰"],["🏦 Bank","4 same→1 any"],["🔀 3:1","3 same→1 any"],["💱 2:1","2 specific→1"],["☠️ Ratio","Roll 7→block"]].map(([k,v]) => (
                <div key={k} style={{ fontSize: "10px" }}>
                  <div style={{ color: T.textPri, fontWeight: 700 }}>{k}</div>
                  <div style={{ color: T.textMut, marginTop: "1px" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => setOpen(o => !o)} aria-label={open ? "Close rules" : "Open rules"} aria-expanded={open}
        style={{ position: "relative", zIndex: 1, width: "38px", height: "38px", borderRadius: "50%", background: open ? T.yellow : T.bgCard, border: `2px solid ${open ? T.yellow : T.borderSub}`, color: open ? T.bgPrimary : T.yellow, fontSize: "15px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", marginLeft: "auto", fontFamily: "serif", boxShadow: open ? `0 0 20px ${T.yellow}44` : "none" }}>
        ⓘ
      </button>
    </div>
  );
}

// ── TRADE PANEL ──────────────────────────────────────────────
function TradePanel({ player, onTrade, onClose }: { player: Player; onTrade: (g: ResKey, w: ResKey, r: number) => void; onClose: () => void }) {
  const [giving, setGiving] = useState<ResKey | null>(null);
  const [wanting, setWanting] = useState<ResKey | null>(null);

  const getRate = (resKey: ResKey) => {
    const p2 = PORTS.find(p => p.give === resKey && p.type === "2:1");
    if (p2 && player.portAccess.includes(p2.nodeId)) return 2;
    const p3 = PORTS.find(p => p.type === "3:1");
    if (p3 && player.portAccess.includes(p3.nodeId)) return 3;
    return 4;
  };
  const rate = giving ? getRate(giving) : null;
  const canTrade = giving && wanting && giving !== wanting && (player.resources[giving] || 0) >= rate!;

  const rateTag = (k: ResKey) => {
    const r = getRate(k);
    if (r === 2) return <span style={{ color: T.green,  fontSize: "9px", fontWeight: 700 }}>2:1 port</span>;
    if (r === 3) return <span style={{ color: T.yellow, fontSize: "9px", fontWeight: 700 }}>3:1 port</span>;
    return <span style={{ color: T.textMut, fontSize: "9px" }}>4:1 bank</span>;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}
      onClick={onClose} role="dialog" aria-modal={true} aria-label="Trade resources">
      <div style={cs({ padding: "24px", width: "min(360px,95vw)", boxShadow: "0 8px 60px rgba(0,0,0,0.8)" })} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: T.textPri }}>💱 Trade Resources</div>
            <div style={{ fontSize: "10px", color: T.textMut, marginTop: "2px" }}>Exchange with bank or your ports</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", color: T.textSec, cursor: "pointer", fontSize: "20px", lineHeight: "1" }}>✕</button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "2px", marginBottom: "8px", fontWeight: 700 }}>YOU GIVE</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {RES_KEYS.map(key => {
              const r = RESOURCES[key], amt = player.resources[key] || 0, rate_ = getRate(key), canGive = amt >= rate_, sel = giving === key;
              return (
                <button key={key} onClick={() => canGive && setGiving(sel ? null : key)} disabled={!canGive} aria-pressed={sel}
                  style={{ padding: "8px 10px", borderRadius: "10px", border: `2px solid ${sel ? r.color : canGive ? r.color + "55" : T.borderSub}`, background: sel ? r.color + "22" : canGive ? r.color + "11" : T.bgPrimary, color: canGive ? r.color : T.textMut, cursor: canGive ? "pointer" : "not-allowed", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", opacity: canGive ? 1 : 0.4, transition: "all 0.15s" }}>
                  <span style={{ fontSize: "18px" }}>{r.emoji}</span>
                  <span style={{ fontSize: "9px", fontWeight: 700 }}>{r.name}</span>
                  <span style={{ fontSize: "9px" }}>{amt} owned</span>
                  {rateTag(key)}
                </button>
              );
            })}
          </div>
        </div>

        {giving && <div style={{ textAlign: "center", margin: "4px 0 12px", color: T.textSec, fontSize: "12px" }}>
          Give <span style={{ color: RESOURCES[giving].color, fontWeight: 700 }}>{rate}× {RESOURCES[giving].emoji}</span> → get 1 of:
        </div>}

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "2px", marginBottom: "8px", fontWeight: 700 }}>YOU RECEIVE</div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {RES_KEYS.map(key => {
              const r = RESOURCES[key], sel = wanting === key, dis = key === giving;
              return (
                <button key={key} onClick={() => !dis && setWanting(sel ? null : key)} disabled={dis} aria-pressed={sel}
                  style={{ padding: "8px 10px", borderRadius: "10px", border: `2px solid ${sel ? r.color : T.borderSub}`, background: sel ? r.color + "22" : T.bgPrimary, color: dis ? T.textMut : r.color, cursor: dis ? "not-allowed" : "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", opacity: dis ? 0.3 : 1, transition: "all 0.15s" }}>
                  <span style={{ fontSize: "18px" }}>{r.emoji}</span>
                  <span style={{ fontSize: "9px", fontWeight: 700 }}>{r.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={() => canTrade && onTrade(giving!, wanting!, rate!)} disabled={!canTrade}
          style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", cursor: canTrade ? "pointer" : "not-allowed", background: canTrade ? `linear-gradient(135deg,${T.pink},${T.purple})` : T.bgInput, color: canTrade ? T.textPri : T.textMut, fontWeight: 800, fontSize: "13px", transition: "all 0.2s", boxShadow: canTrade ? `0 4px 20px ${T.pink}44` : "none" }}>
          {canTrade ? "✅ Confirm Trade" : "Select give + receive"}
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE COMPONENT ───────────────────────────────────────
export default function MemeWarsPage() {
  const [phase, setPhase] = useState<"SETUP"|"PLAY">("SETUP");
  const [setupCount, setSetupCount] = useState(0);
  const [turn, setTurn] = useState(1);
  const [player, setPlayer] = useState<Player>(initPlayer());
  const [cpuState, setCpuState] = useState<CpuPlayer[]>([
    { id: 1, name: "CPU Sigma", color: T.green, emoji: "🤖", bases: [], viralHubs: [], glazers: 0, points: 0 },
    { id: 2, name: "CPU Karen", color: T.blue,  emoji: "🤡", bases: [], viralHubs: [], glazers: 0, points: 0 },
  ]);
  const [dice, setDice] = useState<[number|null,number|null]>([null, null]);
  const [diceDisplay, setDiceDisplay] = useState(["🎲", "🎲"]);
  const [diceRolled, setDiceRolled] = useState(false);
  const [ratioNode, setRatioNode] = useState<number|null>(null);
  const [log, setLog] = useState(["🌐 Setup mode — drag a 🏠 Base onto any node."]);
  const [winner, setWinner] = useState<{ name: string; points: number; xp: number } | null>(null);
  const [hovNode, setHovNode] = useState<number|null>(null);
  const [hovZone, setHovZone] = useState<string|null>(null);
  const [selected, setSelected] = useState<BuildType|null>(null);
  const selectedRef = useRef<BuildType|null>(null);
  // legacy aliases so the rest of the render code stays the same
  const dragging = selected ? { type: selected } : null;
  const [dropTarget, setDropTarget] = useState<number|null>(null);
  const [pipelineStart, setPipelineStart] = useState<number|null>(null);
  const [showTrade, setShowTrade] = useState(false);
  const [tradeFlash, setTradeFlash] = useState<{ msg: string; color: string }|null>(null);
  const [mobileTab, setMobileTab] = useState<"build"|"resources"|"army"|"scores">("build");
  const svgRef = useRef<SVGSVGElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [log]);
  const addLog = useCallback((msg: string) => setLog(l => [...l.slice(-40), msg]), []);

  const selectPiece = (type: BuildType) => {
    const next = selectedRef.current === type ? null : type;
    selectedRef.current = next;
    setSelected(next);
    setDropTarget(null);
  };

  const getSVGCoords = (e: React.MouseEvent) => {
    const svg = svgRef.current; if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };

  const nearestNode = (svgPt: DOMPoint | null, threshold = 35) => {
    if (!svgPt) return null;
    let best: number|null = null, bestDist = Infinity;
    NODES.forEach(n => { const d = Math.hypot(n.x - svgPt.x, n.y - svgPt.y); if (d < bestDist) { bestDist = d; best = n.id; } });
    return bestDist <= threshold ? best : null;
  };

  const onSVGMouseMove = (e: React.MouseEvent) => {
    if (!selected) return;
    setDropTarget(nearestNode(getSVGCoords(e)));
  };

  const onSVGClick = (e: React.MouseEvent) => {
    if (!selected) return;
    const nodeId = nearestNode(getSVGCoords(e));
    if (nodeId !== null) {
      handleBuild(selected, nodeId);
      // keep piece selected for multi-place, deselect after use
      selectedRef.current = null;
      setSelected(null);
      setDropTarget(null);
    }
  };

  // keep legacy drag-and-drop working as a bonus on desktop
  const onPieceDragStart = (e: React.DragEvent, type: BuildType) => {
    selectedRef.current = type;
    setSelected(type);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("pieceType", type);
  };
  const onSVGDragOver = (e: React.DragEvent) => { e.preventDefault(); setDropTarget(nearestNode(getSVGCoords(e as unknown as React.MouseEvent))); e.dataTransfer.dropEffect = "move"; };
  const onSVGDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = (e.dataTransfer.getData("pieceType") || selectedRef.current) as BuildType;
    const nodeId = nearestNode(getSVGCoords(e as unknown as React.MouseEvent));
    selectedRef.current = null;
    setSelected(null); setDropTarget(null);
    if (nodeId !== null && type) handleBuild(type, nodeId);
  };

  const handleTrade = (giving: ResKey, wanting: ResKey, rate: number) => {
    setPlayer(p => {
      const res = { ...p.resources };
      res[giving] = (res[giving] || 0) - rate;
      res[wanting] = (res[wanting] || 0) + 1;
      return { ...p, resources: res };
    });
    setTradeFlash({ msg: `✅ ${rate}${RESOURCES[giving].emoji} → 1${RESOURCES[wanting].emoji}`, color: T.green });
    setTimeout(() => setTradeFlash(null), 2000);
    addLog(`💱 Traded ${rate}${RESOURCES[giving].emoji} → 1${RESOURCES[wanting].emoji}`);
    setShowTrade(false);
  };

  const handleBuild = (type: BuildType, nodeId: number) => {
    const node = NODES[nodeId]; if (!node) return;

    if (type === "GLAZER") {
      if (phase === "PLAY" && !diceRolled) { addLog("❌ Roll dice first!"); return; }
      if (!canAffordCost(player.resources, BUILD_COSTS.GLAZER)) { addLog("❌ Need 1 Rizz+Sigma+Degen!"); return; }
      setPlayer(p => { const u = { ...p, resources: spendCost(p.resources, BUILD_COSTS.GLAZER), glazers: p.glazers + 1, xp: p.xp + 30 }; u.points = calcPoints(u); if (u.points >= 10) setTimeout(() => setWinner({ name: "You", points: u.points, xp: u.xp }), 50); return u; });
      addLog("💪 Glazer deployed!"); return;
    }

    if (type === "PIPELINE") {
      if (phase === "PLAY" && !diceRolled) { addLog("❌ Roll dice first!"); return; }
      if (pipelineStart === null) {
        if (!player.bases.includes(nodeId) && !player.viralHubs.includes(nodeId)) { addLog("❌ Start from YOUR Base or Hub!"); return; }
        setPipelineStart(nodeId); setSelected(null); selectedRef.current = null;
        addLog(`⚡ Pipeline from "${node.label}" — click a connected node`); return;
      }
      if (pipelineStart === nodeId) { setPipelineStart(null); return; }
      const edgeOk = EDGES.some(([a, b]) => (a === pipelineStart && b === nodeId) || (b === pipelineStart && a === nodeId));
      if (!edgeOk) { addLog("❌ No direct connection!"); setPipelineStart(null); return; }
      if (player.pipelines.some(([a, b]) => (a === pipelineStart && b === nodeId) || (b === pipelineStart && a === nodeId))) { addLog("❌ Already exists!"); setPipelineStart(null); return; }
      if (!canAffordCost(player.resources, BUILD_COSTS.PIPELINE)) { addLog("❌ Need 1 Cope+Clout!"); setPipelineStart(null); return; }
      const ps = pipelineStart;
      setPlayer(p => { const pipes: [number,number][] = [...p.pipelines, [ps, nodeId]]; const ports = recalcPortAccess(pipes, p.bases, p.viralHubs); return { ...p, resources: spendCost(p.resources, BUILD_COSTS.PIPELINE), pipelines: pipes, portAccess: ports, xp: p.xp + 20 }; });
      const portUnlocked = PORTS.find(p => p.nodeId === nodeId || p.nodeId === ps);
      addLog(portUnlocked ? `⚡ Pipeline built! 🔓 ${portUnlocked.label} unlocked!` : `⚡ Pipeline: "${NODES[ps].label}" ↔ "${node.label}"`);
      setPipelineStart(null); return;
    }

    const allOccupied = [...player.bases, ...player.viralHubs, ...cpuState.flatMap(c => [...c.bases, ...c.viralHubs])];

    if (type === "BASE") {
      if (phase === "SETUP") {
        if (allOccupied.includes(nodeId)) { addLog("❌ Node taken!"); return; }
        setPlayer(p => {
          const res = { ...p.resources };
          node.zones.forEach(zid => { const z = ZONES.find(z => z.id === zid); if (z) res[z.resource] = (res[z.resource] || 0) + 1; });
          const u = { ...p, bases: [...p.bases, nodeId], resources: res, xp: p.xp + 50 };
          u.points = calcPoints(u); u.portAccess = recalcPortAccess(u.pipelines, u.bases, u.viralHubs); return u;
        });
        addLog(`🏠 Base at "${node.label}"! Got starting resources.`);
        const next = setupCount + 1; setSetupCount(next);
        if (next >= 2) { setPhase("PLAY"); addLog("🚀 Setup done! Roll dice to begin."); }
        return;
      }
      if (!diceRolled) { addLog("❌ Roll dice first!"); return; }
      if (allOccupied.includes(nodeId)) { addLog("❌ Node taken!"); return; }
      if (!canAffordCost(player.resources, BUILD_COSTS.BASE)) { addLog("❌ Can't afford Base!"); return; }
      setPlayer(p => { const u = { ...p, resources: spendCost(p.resources, BUILD_COSTS.BASE), bases: [...p.bases, nodeId], xp: p.xp + 50 }; u.points = calcPoints(u); u.portAccess = recalcPortAccess(u.pipelines, u.bases, u.viralHubs); if (u.points >= 10) setTimeout(() => setWinner({ name: "You", points: u.points, xp: u.xp }), 50); return u; });
      addLog(`🏠 Base at "${node.label}" · +1 VP`); return;
    }

    if (type === "VIRAL_HUB") {
      if (!player.bases.includes(nodeId)) { addLog("❌ Upgrade YOUR Base only!"); return; }
      if (phase === "PLAY" && !diceRolled) { addLog("❌ Roll dice first!"); return; }
      if (!canAffordCost(player.resources, BUILD_COSTS.VIRAL_HUB)) { addLog("❌ Need 2 Clout+3 Degen!"); return; }
      setPlayer(p => { const u = { ...p, resources: spendCost(p.resources, BUILD_COSTS.VIRAL_HUB), bases: p.bases.filter(b => b !== nodeId), viralHubs: [...p.viralHubs, nodeId], xp: p.xp + 100 }; u.points = calcPoints(u); u.portAccess = recalcPortAccess(u.pipelines, u.bases, u.viralHubs); if (u.points >= 10) setTimeout(() => setWinner({ name: "You", points: u.points, xp: u.xp }), 50); return u; });
      addLog(`🔥 "${node.label}" went VIRAL! +2 VP`);
    }
  };

  const rollDice = () => {
    if (diceRolled && phase === "PLAY") return;
    const nums = ["1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣"];
    let c = 0;
    const iv = setInterval(() => {
      setDiceDisplay([nums[Math.floor(Math.random()*6)], nums[Math.floor(Math.random()*6)]]);
      c++;
      if (c > 15) {
        clearInterval(iv);
        const d1 = Math.floor(Math.random()*6)+1, d2 = Math.floor(Math.random()*6)+1;
        setDice([d1, d2]); setDiceDisplay([nums[d1-1], nums[d2-1]]); processRoll(d1+d2);
      }
    }, 70);
  };

  const processRoll = (total: number) => {
    setDiceRolled(true);
    if (total === 7) {
      const rn = NODES[Math.floor(Math.random()*NODES.length)].id; setRatioNode(rn);
      addLog(`☠️ THE RATIO lands on "${NODES[rn].label}"! Blocked.`); return;
    }
    addLog(`🎲 Rolled ${total}`);
    setPlayer(p => {
      const res = { ...p.resources }; const gained: string[] = [];
      NODES.forEach(node => {
        if (node.roll !== total || node.id === ratioNode) return;
        const isBase = p.bases.includes(node.id), isHub = p.viralHubs.includes(node.id);
        node.zones.forEach(zid => { const z = ZONES.find(z => z.id === zid); if (!z) return; if (isBase) { res[z.resource] = (res[z.resource]||0)+1; gained.push(RESOURCES[z.resource].emoji); } if (isHub) { res[z.resource] = (res[z.resource]||0)+2; gained.push(RESOURCES[z.resource].emoji+"×2"); } });
      });
      if (gained.length) addLog(`✨ Got: ${gained.join("  ")}`); else addLog("💨 No production this roll.");
      return { ...p, resources: res };
    });
  };

  const endTurn = () => {
    if (!diceRolled && phase === "PLAY") { addLog("❌ Roll dice first!"); return; }
    setCpuState(prev => prev.map(cpu => {
      const all = [...player.bases, ...player.viralHubs, ...prev.flatMap(c => [...c.bases, ...c.viralHubs])];
      const free = NODES.find(n => !all.includes(n.id));
      if (free && Math.random() > 0.35) return { ...cpu, bases: [...cpu.bases, free.id], points: cpu.bases.length + 2 + cpu.viralHubs.length * 2 };
      return cpu;
    }));
    setDiceRolled(false); setDice([null, null]); setDiceDisplay(["🎲","🎲"]); setPipelineStart(null); setSelected(null); selectedRef.current = null; setTurn(t => t+1);
    addLog(`─── Turn ${turn+1} ───`);
  };

  const reset = () => {
    setPhase("SETUP"); setSetupCount(0); setTurn(1); setWinner(null); setRatioNode(null);
    setDice([null, null]); setDiceDisplay(["🎲","🎲"]); setDiceRolled(false); setPipelineStart(null); setSelected(null); selectedRef.current = null;
    setPlayer(initPlayer());
    setCpuState([
      { id: 1, name: "CPU Sigma", color: T.green, emoji: "🤖", bases: [], viralHubs: [], glazers: 0, points: 0 },
      { id: 2, name: "CPU Karen", color: T.blue,  emoji: "🤡", bases: [], viralHubs: [], glazers: 0, points: 0 },
    ]);
    setLog(["🌐 New game! Drag a Base onto any node."]);
  };

  const league = getLeague(player.points);
  const nextLeague = LEAGUES[LEAGUES.findIndex(l => l.name === league.name) + 1];
  const cpuMeta = [
    { id: 1, name: "CPU Sigma", color: T.green, emoji: "🤖" },
    { id: 2, name: "CPU Karen", color: T.blue,  emoji: "🤡" },
  ];

  // Sub-panels defined inside render so they close over state
  const DicePanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={cs()}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.textMut, marginBottom: "12px", fontWeight: 700 }}>BRAINROT DICE</div>
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "14px" }}>
        {diceDisplay.map((d, i) => (
          <div key={i} style={{ width: "60px", height: "60px", background: T.bgInput, border: `2px solid ${diceRolled ? T.orange : T.borderSub}`, borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: diceRolled ? `0 0 20px ${T.orange}44` : "none", transition: "all 0.3s" }}>{d}</div>
        ))}
      </div>
      {dice[0] && <div style={{ fontSize: "20px", color: (dice[0]||0)+(dice[1]||0) === 7 ? T.red : T.yellow, fontWeight: 800, textAlign: "center", marginBottom: "14px" }}>{(dice[0]||0)+(dice[1]||0) === 7 ? "☠️ THE RATIO" : `= ${(dice[0]||0)+(dice[1]||0)}`}</div>}
      <button onClick={rollDice} disabled={diceRolled && phase === "PLAY"}
        style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", cursor: "pointer", background: diceRolled && phase === "PLAY" ? T.bgInput : `linear-gradient(135deg,${T.red},${T.orange})`, color: diceRolled && phase === "PLAY" ? T.textMut : T.textPri, fontWeight: 800, fontSize: "14px", transition: "all 0.2s" }}>
        {phase === "SETUP" ? "📍 Setup Mode" : diceRolled ? "✓ Rolled" : "🎲 Roll Dice"}
      </button>
      {phase === "PLAY" && diceRolled && <>
        <button onClick={() => setShowTrade(true)} style={{ width: "100%", padding: "12px", borderRadius: "12px", border: `1px solid ${T.pink}55`, background: T.pink + "15", color: T.pink, fontWeight: 700, fontSize: "13px", cursor: "pointer", marginTop: "8px" }}>💱 Trade Resources</button>
        <button onClick={endTurn} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", cursor: "pointer", background: `linear-gradient(135deg,#5865f2,${T.pink})`, color: T.textPri, fontWeight: 800, fontSize: "14px", marginTop: "8px" }}>End Turn →</button>
      </>}
    </div>
  );

  const BuildTray = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={cs()}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.textMut, marginBottom: "8px", fontWeight: 700 }}>🏗 BUILD TRAY</div>
      <div style={{ fontSize: "12px", color: T.textMut, marginBottom: "12px", lineHeight: 1.4 }}>
        {selected ? `✅ "${PIECES.find(p=>p.type===selected)?.label}" selected — click a node` : "Click a piece, then click a node"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr 1fr" : "1fr", gap: "8px" }}>
        {PIECES.map(piece => {
          const affordable = canAffordCost(player.resources, BUILD_COSTS[piece.type]);
          const isSetupBase = phase === "SETUP" && piece.type === "BASE";
          const available = isSetupBase || (phase === "PLAY" && affordable);
          const isSel = selected === piece.type;
          return (
            <div key={piece.type}
              draggable={available} onDragStart={available ? (e) => onPieceDragStart(e, piece.type) : undefined}
              onClick={() => available && selectPiece(piece.type)}
              style={{ padding: "12px", borderRadius: "12px",
                border: `${isSel ? 2 : 1}px solid ${isSel ? piece.color : available ? piece.color + "55" : T.borderSub}`,
                background: isSel ? piece.color + "33" : available ? piece.color + "12" : T.bgPrimary,
                cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : 0.4,
                transition: "all 0.15s", userSelect: "none",
                boxShadow: isSel ? `0 0 16px ${piece.color}44` : "none" }}
              onMouseEnter={e => { if (available && !isSel) (e.currentTarget as HTMLElement).style.background = piece.color + "22"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSel ? piece.color + "33" : available ? piece.color + "12" : T.bgPrimary; }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "22px" }}>{piece.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: isSel ? piece.color : available ? piece.color : T.textMut, fontWeight: 700 }}>
                    {isSel ? `✓ ${piece.label}` : piece.label}
                  </div>
                  <div style={{ fontSize: "11px", color: T.textMut, lineHeight: "1.4", marginTop: "2px" }}>{piece.desc}</div>
                </div>
              </div>
              {!isSetupBase && <CostBadge type={piece.type} resources={player.resources} />}
            </div>
          );
        })}
      </div>
      {selected && (
        <button onClick={() => selectPiece(selected)} style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "10px", background: "none", border: `1px solid ${T.borderSub}`, color: T.textMut, cursor: "pointer", fontSize: "12px" }}>
          ✕ Cancel selection
        </button>
      )}
      {pipelineStart !== null && (
        <div style={{ padding: "10px 12px", background: T.yellow + "11", border: `1px solid ${T.yellow}44`, borderRadius: "12px", fontSize: "12px", color: T.yellow, marginTop: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>⚡ From "{NODES[pipelineStart].label}" — click connected node</span>
          <button onClick={() => setPipelineStart(null)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: "18px", lineHeight: "1", marginLeft: "8px" }}>✕</button>
        </div>
      )}
    </div>
  );

  const ResourcePanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={cs()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.textMut, fontWeight: 700 }}>YOUR STASH</div>
        {phase === "PLAY" && <button onClick={() => setShowTrade(true)} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "8px", background: T.pink + "15", border: `1px solid ${T.pink}44`, color: T.pink, cursor: "pointer" }}>💱 trade</button>}
      </div>
      {Object.entries(RESOURCES).map(([key, res]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.borderSub}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>{res.emoji}</span>
            <span style={{ fontSize: "13px", color: res.color, fontWeight: 600 }}>{res.name}</span>
          </div>
          <span style={{ fontSize: "22px", fontWeight: 800, color: (player.resources[key as ResKey] || 0) > 0 ? res.color : T.textMut }}>{player.resources[key as ResKey] || 0}</span>
        </div>
      ))}
    </div>
  );

  const GlazerPanel = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={cs()}>
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: T.textMut, marginBottom: "12px", fontWeight: 700 }}>GLAZER ARMY</div>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "12px" }}>
        {[0,1,2].map(i => (<div key={i} style={{ width: "52px", height: "52px", borderRadius: "12px", border: `2px solid ${player.glazers > i ? T.pink : T.borderSub}`, background: player.glazers > i ? T.pink + "18" : T.bgPrimary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", transition: "all 0.3s" }}>{player.glazers > i ? "💪" : "·"}</div>))}
      </div>
      <div style={{ fontSize: "13px", color: player.glazers >= 3 ? T.pink : T.textMut, textAlign: "center", fontWeight: player.glazers >= 3 ? 700 : 400 }}>
        {player.glazers >= 3 ? "🏆 LARGEST ARMY +2 VP!" : `${3 - player.glazers} more → +2 VP`}
      </div>
    </div>
  );

  const LeaguePanel = () => (
    <div style={cs()}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.textMut, marginBottom: "12px", fontWeight: 700 }}>LEAGUES</div>
      {LEAGUES.map(l => (
        <div key={l.name} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "10px", marginBottom: "3px", background: league.name === l.name ? l.color + "22" : "transparent", border: league.name === l.name ? `1px solid ${l.color}44` : "1px solid transparent" }}>
          <span style={{ fontSize: "14px" }}>{l.emoji}</span>
          <span style={{ flex: 1, fontSize: "12px", color: league.name === l.name ? l.color : T.textMut, fontWeight: league.name === l.name ? 700 : 400 }}>{l.name}</span>
          <span style={{ fontSize: "11px", color: T.textMut }}>{l.min}+</span>
        </div>
      ))}
      <div style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: T.textMut, marginBottom: "5px" }}><span>XP</span><span>{player.xp}/500</span></div>
        <div style={{ background: T.bgPrimary, borderRadius: "6px", height: "7px", overflow: "hidden" }}>
          <div style={{ width: `${Math.min(player.xp/5, 100)}%`, height: "100%", background: `linear-gradient(90deg,${T.orange},${T.yellow})`, transition: "width 0.5s", borderRadius: "6px" }} />
        </div>
      </div>
    </div>
  );

  const PortPanel = () => (
    <div style={cs()}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", color: T.textMut, marginBottom: "12px", fontWeight: 700 }}>TRADE PORTS</div>
      {PORTS.map(port => {
        const has = player.portAccess.includes(port.nodeId);
        return (
          <div key={port.nodeId} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "10px", marginBottom: "4px", background: has ? T.green + "11" : "transparent", border: has ? `1px solid ${T.green}33` : "1px solid transparent" }}>
            <span style={{ fontSize: "16px" }}>{port.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "12px", color: has ? T.green : T.textMut, fontWeight: has ? 700 : 400 }}>{port.label}</div>
              <div style={{ fontSize: "11px", color: has ? T.green : T.textMut }}>{port.ratio}:1{has ? " ✓" : " locked"}</div>
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: "11px", color: T.textMut, marginTop: "10px", lineHeight: "1.5" }}>Build ⚡ Pipelines to port nodes to unlock better trade rates</div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toolJsonLd({ slug: "memewars", name: "Meme Wars: Settle the Internet", description: "A Catan-style strategy game across 8 internet zones.", emoji: "🎮" }) }} />
      <Header />
      <main style={{ background: T.bgPrimary, color: T.textPri, fontFamily: "'DM Sans','Outfit',sans-serif", minHeight: "100vh" }}>
        <style>{`
          *{box-sizing:border-box}
          .mw-sidebar{display:flex;flex-direction:column;gap:12px;width:260px;flex-shrink:0;overflow-y:auto;max-height:calc(100vh - 120px)}
          .mw-sidebar-right{width:220px}
          @media(max-width:900px){.mw-sidebar,.mw-sidebar-right{display:none!important}}
          @media(min-width:901px){.mw-mobile-tabs,.mw-mobile-panels{display:none!important}}
          button:focus-visible{outline:2px solid ${T.yellow};outline-offset:2px}
          .mw-tab:hover{border-color:${T.borderHov}!important;background:${T.hoodMid}!important}
          ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.borderSub};border-radius:4px}
        `}</style>

        <RulesPanel />
        {showTrade && <TradePanel player={player} onTrade={handleTrade} onClose={() => setShowTrade(false)} />}
        {tradeFlash && (
          <div style={{ position: "fixed", top: "70px", left: "50%", transform: "translateX(-50%)", background: T.bgCard, border: `1px solid ${tradeFlash.color}`, color: tradeFlash.color, padding: "10px 24px", borderRadius: "24px", fontSize: "14px", fontWeight: 700, zIndex: 400, pointerEvents: "none", whiteSpace: "nowrap" }}>{tradeFlash.msg}</div>
        )}

        {/* GAME HEADER */}
        <div style={{ background: `${T.hoodDeep}ee`, borderBottom: `1px solid ${T.borderSub}`, backdropFilter: "blur(20px)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <div style={{ fontSize: "10px", letterSpacing: "5px", color: T.textMut }}>⚔ SEASON 1 · SOLO</div>
            <h1 style={{ fontSize: "clamp(18px,3.5vw,26px)", fontWeight: 900, margin: 0, letterSpacing: "4px", background: `linear-gradient(90deg,${T.red},${T.orange},${T.yellow},${T.green},${T.blue},#c13584)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>MEME WARS</h1>
          </div>
          {/* Stat bar */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "1px" }}>VP</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: T.yellow, lineHeight: 1 }}>{player.points}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "1px" }}>LEAGUE</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: league.color }}>{league.emoji} {league.name}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "1px" }}>TURN</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: T.textSec, lineHeight: 1 }}>{turn}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "10px", color: T.textMut, letterSpacing: "1px" }}>XP</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: T.purple }}>{player.xp}</div>
            </div>
            <button onClick={reset} style={{ fontSize: "12px", padding: "6px 14px", borderRadius: "10px", background: T.bgCard, border: `1px solid ${T.borderSub}`, color: T.textSec, cursor: "pointer", fontWeight: 600 }}>🔄 Reset</button>
          </div>
        </div>

        {/* SCOREBOARD */}
        <div style={{ display: "flex", gap: "8px", padding: "10px 16px", background: `${T.bgCard}88`, borderBottom: `1px solid ${T.borderSub}`, flexWrap: "wrap" }}>
          <div style={{ flex: "2 1 160px", background: T.red + "18", border: `2px solid ${T.red}`, borderRadius: "14px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "20px" }}>😤</span>
            <div>
              <div style={{ fontSize: "14px", color: T.red, fontWeight: 800 }}>You</div>
              <div style={{ fontSize: "11px", color: T.textMut }}>{league.emoji}{league.name} · 🏠{player.bases.length} 🔥{player.viralHubs.length} ⚡{player.pipelines.length} 💪{player.glazers}</div>
            </div>
            <span style={{ marginLeft: "auto", fontSize: "24px", color: T.yellow, fontWeight: 900 }}>{player.points}<span style={{ fontSize: "13px" }}>VP</span></span>
          </div>
          {cpuState.map((cpu, i) => (
            <div key={cpu.id} style={{ flex: "1 1 120px", background: cpuMeta[i].color + "11", border: `1px solid ${cpuMeta[i].color}44`, borderRadius: "14px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}>{cpuMeta[i].emoji}</span>
              <div>
                <div style={{ fontSize: "13px", color: cpuMeta[i].color, fontWeight: 700 }}>{cpuMeta[i].name}</div>
                <div style={{ fontSize: "11px", color: T.textMut }}>🏠{cpu.bases.length}</div>
              </div>
              <span style={{ marginLeft: "auto", fontSize: "20px", color: T.yellow, fontWeight: 800 }}>{cpu.points}<span style={{ fontSize: "12px" }}>VP</span></span>
            </div>
          ))}
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display: "flex", gap: "12px", padding: "12px 16px", maxWidth: "1400px", margin: "0 auto", alignItems: "flex-start" }}>

          {/* LEFT SIDEBAR — desktop only */}
          <div className="mw-sidebar">
            <DicePanel />
            <BuildTray />
            <ResourcePanel />
            <GlazerPanel />
          </div>

          {/* CENTRE — map + log */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "10px" }}>

            {/* SVG MAP */}
            <div style={{ background: T.bgPrimary, border: `1px solid ${T.borderSub}`, borderRadius: "18px", overflow: "hidden", boxShadow: `inset 0 0 80px rgba(0,0,0,0.6)` }}>
              <svg ref={svgRef} width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet"
                style={{ display: "block", cursor: selected ? "crosshair" : "default", minHeight: "280px" }}
                onMouseMove={onSVGMouseMove} onClick={onSVGClick}
                onDragOver={onSVGDragOver} onDrop={onSVGDrop} onDragLeave={() => setDropTarget(null)}
                role="application" aria-label="Meme Wars game map">
                <defs>
                  <filter id="mw-glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  <filter id="mw-glowS"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>

                {Array.from({length:18},(_,i) => <line key={`h${i}`} x1="0" y1={i*30} x2={W} y2={i*30} stroke="rgba(139,126,168,0.07)" strokeWidth="0.5"/>)}
                {Array.from({length:26},(_,i) => <line key={`v${i}`} x1={i*30} y1="0" x2={i*30} y2={H} stroke="rgba(139,126,168,0.07)" strokeWidth="0.5"/>)}

                {ZONES.map(zone => {
                  const {x,y,w,h,color} = zone, r = 24;
                  const path = `M${x+r} ${y} Q${x+w/2} ${y-5} ${x+w-r} ${y} Q${x+w+4} ${y+h/3} ${x+w} ${y+r} Q${x+w+3} ${y+h/2} ${x+w} ${y+h-r} Q${x+w/2} ${y+h+4} ${x+r} ${y+h} Q${x-3} ${y+2*h/3} ${x} ${y+h-r} Q${x-4} ${y+h/3} ${x} ${y+r} Q${x} ${y} ${x+r} ${y} Z`;
                  const hov = hovZone === zone.id;
                  return (
                    <g key={zone.id} onMouseEnter={() => setHovZone(zone.id)} onMouseLeave={() => setHovZone(null)}>
                      <path d={path} fill={color+"0d"} stroke={color} strokeWidth={hov?2:0.9} opacity={hov?1:0.7} style={{transition:"all 0.3s"}}/>
                      <text x={x+w/2} y={y+20} textAnchor="middle" fontSize="13" style={{userSelect:"none"}}>{zone.emoji}</text>
                      <text x={x+w/2} y={y+33} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold" style={{userSelect:"none"}}>{zone.name}</text>
                      <text x={x+w/2} y={y+44} textAnchor="middle" fontSize="7" fill={RESOURCES[zone.resource].color} opacity="0.7" style={{userSelect:"none"}}>→{RESOURCES[zone.resource].emoji}</text>
                    </g>
                  );
                })}

                {EDGES.map(([a,b], i) => {
                  const na = NODES[a], nb = NODES[b]; if (!na||!nb) return null;
                  const built = player.pipelines.some(([x,y]) => (x===a&&y===b)||(x===b&&y===a));
                  return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={built?T.yellow:"rgba(139,126,168,0.2)"} strokeWidth={built?2.5:1} strokeDasharray={built?"none":"5 5"} opacity={built?0.9:1} style={{filter:built?"url(#mw-glow)":"none"}}/>;
                })}

                {pipelineStart !== null && EDGES.filter(([a,b]) => a===pipelineStart||b===pipelineStart).map(([a,b], i) => {
                  const other = a===pipelineStart ? b : a;
                  const na = NODES[pipelineStart], nb = NODES[other];
                  return <line key={`ps${i}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke={T.yellow} strokeWidth="2.5" strokeDasharray="4 3" opacity="0.8"/>;
                })}

                {PORTS.map(port => { const n = NODES[port.nodeId]; if (!n) return null; const has = player.portAccess.includes(port.nodeId); return (
                  <g key={`port${port.nodeId}`}>
                    <circle cx={n.x-13} cy={n.y-13} r={8} fill={has?T.green+"22":T.bgCard} stroke={has?T.green:T.borderHov} strokeWidth={has?1.5:1}/>
                    <text x={n.x-13} y={n.y-13} textAnchor="middle" dominantBaseline="middle" fontSize="7">{port.emoji}</text>
                  </g>
                );})}

                {cpuState.flatMap((cpu, ci) => [...cpu.bases.map(id => ({id,ci,emoji:"🏠"})), ...cpu.viralHubs.map(id => ({id,ci,emoji:"🔥"}))]).map(({id,emoji}) => { const n = NODES[id]; if (!n) return null; return <text key={`cpu${id}${emoji}`} x={n.x-7} y={n.y+5} fontSize="14" style={{userSelect:"none"}} opacity="0.8">{emoji}</text>; })}

                {NODES.map(node => {
                  const isMyBase = player.bases.includes(node.id);
                  const isMyHub  = player.viralHubs.includes(node.id);
                  const isCpu    = cpuState.some(c => c.bases.includes(node.id) || c.viralHubs.includes(node.id));
                  const isRatio  = ratioNode === node.id;
                  const isHov    = hovNode === node.id;
                  const isTarget = dropTarget === node.id;
                  const isPipeS  = pipelineStart === node.id;
                  const isPipeDest = pipelineStart !== null && EDGES.some(([a,b]) => (a===pipelineStart&&b===node.id)||(b===pipelineStart&&a===node.id));
                  const isPort = PORTS.find(p => p.nodeId === node.id);
                  const hasPortAccess = !!(isPort && player.portAccess.includes(node.id));

                  const r      = isMyHub ? 13 : isMyBase||isCpu ? 10 : isTarget ? 9 : 6;
                  const fill   = isRatio ? "#2d0000" : isMyHub ? T.orange+"44" : isMyBase ? T.red+"44" : isCpu ? T.hoodMid : isTarget ? T.green+"22" : T.bgCard;
                  const stroke = isRatio ? T.red : isPipeS ? T.yellow : isPipeDest ? T.yellow+"99" : isTarget ? T.green : isMyHub ? T.orange : isMyBase ? T.red : isCpu ? "#3A3555" : isHov ? T.borderHov : "rgba(139,126,168,0.25)";
                  const sw     = isMyBase||isMyHub||isTarget||isPipeS ? 2.5 : 1;

                  return (
                    <g key={node.id}
                      onMouseEnter={() => setHovNode(node.id)} onMouseLeave={() => setHovNode(null)}
                      onClick={(e) => {
                        if (isPipeDest) {
                          e.stopPropagation();
                          handleBuild("PIPELINE", node.id);
                        } else if (selected) {
                          // let onSVGClick handle it
                        } else if (isMyBase && !isMyHub) {
                          addLog(`💡 Select 🔥 Viral Hub from the tray to upgrade "${node.label}".`);
                        }
                      }}
                      style={{ cursor: (isPipeDest||isMyBase) ? "pointer" : "default" }}
                      role="button" aria-label={`${node.label}, roll ${node.roll}`}>
                      {(isMyBase||isMyHub) && <circle cx={node.x} cy={node.y} r={r+8} fill={T.red} opacity="0.07"/>}
                      {isTarget && <circle cx={node.x} cy={node.y} r={r+10} fill={T.green} opacity="0.1"/>}
                      {hasPortAccess && <circle cx={node.x} cy={node.y} r={r+6} fill="none" stroke={T.green} strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>}
                      <circle cx={node.x} cy={node.y} r={r} fill={fill} stroke={stroke} strokeWidth={sw} style={{transition:"all 0.15s",filter:isMyHub?"url(#mw-glowS)":"none"}}/>
                      {isRatio && <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle" fontSize="10">☠️</text>}
                      {isMyHub && !isRatio && <text x={node.x} y={node.y-3} textAnchor="middle" dominantBaseline="middle" fontSize="12">🔥</text>}
                      {isMyBase && !isMyHub && !isRatio && <text x={node.x} y={node.y-3} textAnchor="middle" dominantBaseline="middle" fontSize="10">🏠</text>}
                      {node.roll && !isRatio && (
                        <text x={node.x} y={(isMyBase||isMyHub||isCpu) ? node.y+10 : node.y}
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize="10" fontWeight="bold"
                          fill={node.roll===6||node.roll===8 ? T.red : (isMyBase||isMyHub||isCpu) ? T.textPri : T.textSec}>
                          {node.roll}
                        </text>
                      )}
                      {isHov && (
                        <g>
                          <rect x={node.x+14} y={node.y-38} width={112} height={isPort?50:42} rx={7} fill={T.bgCard} stroke={T.borderHov} strokeWidth="1"/>
                          <text x={node.x+19} y={node.y-22} fontSize="9" fill={T.textPri} fontWeight="bold">{node.label}</text>
                          <text x={node.x+19} y={node.y-11} fontSize="8" fill={T.textSec}>Roll #{node.roll} · {node.zones.map(z => ZONES.find(zo => zo.id===z)?.emoji).join("")}</text>
                          <text x={node.x+19} y={node.y-1}  fontSize="8" fill={T.textMut}>{node.zones.map(z => RESOURCES[ZONES.find(zo => zo.id===z)?.resource as ResKey]?.emoji).filter(Boolean).join("+")}</text>
                          {isPort && <text x={node.x+19} y={node.y+10} fontSize="8" fill={hasPortAccess?T.green:T.yellow}>{isPort.emoji} {isPort.label}{hasPortAccess?" ✓":""}</text>}
                        </g>
                      )}
                    </g>
                  );
                })}

                {dragging && dropTarget !== null && (() => { const n = NODES[dropTarget]; if (!n) return null; const p = PIECES.find(p => p.type===dragging.type); return <text x={n.x} y={n.y-18} textAnchor="middle" fontSize="20" opacity="0.7">{p?.emoji}</text>; })()}
              </svg>

              {/* Zone legend */}
              <div style={{ padding: "10px 16px", borderTop: `1px solid ${T.borderSub}`, display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center", background: T.bgPrimary }}>
                {ZONES.map(z => (
                  <div key={z.id} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                    <span>{z.emoji}</span>
                    <span style={{ color: z.color }}>{z.name.split(" ")[0]}</span>
                    <span style={{ color: T.textMut }}>→</span>
                    <span style={{ color: RESOURCES[z.resource].color }}>{RESOURCES[z.resource].emoji}</span>
                  </div>
                ))}
                <div style={{ marginLeft: "auto", fontSize: "11px", color: T.textMut }}><span style={{ color: T.green }}>🔀</span>=port · <span style={{ color: T.yellow }}>━</span>=pipeline</div>
              </div>
            </div>

            {/* LOG */}
            <div ref={logRef} role="log" aria-live="polite" aria-label="Game log"
              style={cs({ height: "96px", overflowY: "auto", fontSize: "12px", lineHeight: "1.8", padding: "12px 16px" })}>
              {log.map((l, i) => <div key={i} style={{ color: i === log.length-1 ? T.textPri : T.textMut }}>{l}</div>)}
            </div>

            {/* MOBILE TABS */}
            <div className="mw-mobile-tabs" style={{ display: "flex", gap: "6px" }}>
              {(["build","resources","army","scores"] as const).map(tab => (
                <button key={tab} className="mw-tab" onClick={() => setMobileTab(tab)}
                  style={{ flex: 1, padding: "11px 4px", borderRadius: "12px", border: `1px solid ${mobileTab===tab ? T.borderHov : T.borderSub}`, background: mobileTab===tab ? T.hoodLight : T.bgCard, color: mobileTab===tab ? T.textPri : T.textSec, fontWeight: mobileTab===tab ? 700 : 400, fontSize: "12px", cursor: "pointer", transition: "all 0.15s" }}>
                  {tab==="build" ? "🏗 Build" : tab==="resources" ? "✨ Stash" : tab==="army" ? "💪 Army" : "🏆 Scores"}
                </button>
              ))}
            </div>

            {/* MOBILE CONTENT */}
            <div className="mw-mobile-panels" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {mobileTab === "build"     && <><DicePanel /><BuildTray /></>}
              {mobileTab === "resources" && <ResourcePanel />}
              {mobileTab === "army"      && <><GlazerPanel /><LeaguePanel /><PortPanel /></>}
              {mobileTab === "scores"    && (
                <div style={cs()}>
                  <div style={{ fontSize: "12px", letterSpacing: "2px", color: T.textMut, marginBottom: "14px", fontWeight: 700 }}>SCOREBOARD</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ background: T.red+"18", border: `2px solid ${T.red}`, borderRadius: "14px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "22px" }}>😤</span>
                      <div><div style={{ color: T.red, fontWeight: 800, fontSize: "16px" }}>You</div><div style={{ color: T.textMut, fontSize: "12px" }}>{league.emoji}{league.name}</div></div>
                      <span style={{ marginLeft: "auto", color: T.yellow, fontWeight: 900, fontSize: "26px" }}>{player.points}VP</span>
                    </div>
                    {cpuState.map((cpu, i) => (
                      <div key={cpu.id} style={{ background: cpuMeta[i].color+"11", border: `1px solid ${cpuMeta[i].color}44`, borderRadius: "14px", padding: "14px", display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "22px" }}>{cpuMeta[i].emoji}</span>
                        <div style={{ color: cpuMeta[i].color, fontWeight: 700, fontSize: "15px" }}>{cpuMeta[i].name}</div>
                        <span style={{ marginLeft: "auto", color: T.yellow, fontWeight: 800, fontSize: "22px" }}>{cpu.points}VP</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR — desktop only */}
          <div className="mw-sidebar mw-sidebar-right">
            <LeaguePanel />
            <PortPanel />
          </div>
        </div>

        {/* WIN SCREEN */}
        {winner && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
            role="dialog" aria-modal={true} aria-label="Victory screen">
            <div style={cs({ padding: "48px 36px", textAlign: "center", maxWidth: "400px", width: "92vw", boxShadow: `0 0 100px ${T.orange}22,0 0 0 1px ${T.borderHov}` })}>
              <div style={{ fontSize: "64px", marginBottom: "14px" }}>👑</div>
              <h2 style={{ fontSize: "32px", fontWeight: 900, margin: "0 0 10px", letterSpacing: "2px", background: `linear-gradient(90deg,${T.red},${T.yellow})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>YOU WIN</h2>
              <div style={{ color: T.textSec, fontSize: "14px", marginBottom: "8px" }}>{winner.points} VP · {winner.xp} XP earned</div>
              <div style={{ color: T.orange, fontSize: "15px", marginBottom: "30px", fontWeight: 700 }}>🏆 {getLeague(winner.points).emoji} {getLeague(winner.points).name} tier reached</div>
              <button onClick={reset} style={{ padding: "14px 40px", borderRadius: "14px", border: "none", cursor: "pointer", background: `linear-gradient(135deg,${T.red},${T.orange})`, color: T.textPri, fontWeight: 800, fontSize: "16px", boxShadow: `0 4px 30px ${T.red}44` }}>🔄 Play Again</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
