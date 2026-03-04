import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Brainrot Pandemic — DaFuqBro" },
  { name: "description", content: "Your brainrot is spreading. Evolve your virus, unlock mutations with real prerequisites, and watch civilization dissolve." },
  { property: "og:title", content: "Brainrot Pandemic — DaFuqBro" },
  { property: "og:description", content: "Your brainrot is a global pandemic. Watch it spread." },
  { name: "twitter:card", content: "summary_large_image" },
];

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type MutationCategory = "transmission" | "symptom" | "ability" | "evolution";

interface Region {
  id: string; name: string; path: string; cx: number; cy: number;
  population: number; resistance: number;
}

interface Mutation {
  id: string; emoji: string; name: string; description: string;
  infectivity: number; severity: number; memeLevel: number;
  category: MutationCategory; epCost: number; requires?: string[];
}

interface GameState {
  infected: Record<string, number>; totalInfected: number; day: number;
  activeMutations: string[]; infectivity: number; severity: number;
  memeLevel: number; newsHeadlines: string[]; gameOver: boolean;
  cureProgress: number; evolutionPoints: number; totalEPEarned: number;
}

/* ─────────────────────────────────────────────
   SLOT LIMITS
───────────────────────────────────────────── */
const SLOTS: Record<MutationCategory, number> = {
  transmission: 3, symptom: 3, ability: 2, evolution: 1,
};

/* ─────────────────────────────────────────────
   WORLD MAP — viewBox 0 0 2000 900
───────────────────────────────────────────── */
const regions: Region[] = [
  {
    id: "na", name: "North America",
    path: `M 230,80 L 250,65 L 275,55 L 310,48 L 350,44 L 395,42 L 435,48 L 465,60
           L 480,75 L 488,92 L 482,112 L 468,130 L 450,148 L 428,165 L 405,178
           L 382,188 L 358,195 L 335,198 L 312,192 L 292,182 L 272,168 L 255,152
           L 240,135 L 228,118 L 220,100 Z`,
    cx: 355, cy: 125, population: 580, resistance: 0.30,
  },
  {
    id: "sa", name: "South America",
    path: `M 320,215 L 342,205 L 368,208 L 392,220 L 410,240 L 418,265
           L 415,295 L 405,325 L 390,355 L 372,380 L 352,398 L 332,405
           L 312,398 L 295,378 L 282,352 L 275,320 L 275,288 L 280,258
           L 292,232 Z`,
    cx: 348, cy: 310, population: 430, resistance: 0.25,
  },
  {
    id: "eu", name: "Europe",
    path: `M 862,55 L 885,48 L 912,45 L 940,48 L 965,58 L 982,72
           L 985,90 L 975,106 L 958,118 L 935,125 L 910,128 L 885,122
           L 862,112 L 848,95 L 848,75 Z`,
    cx: 918, cy: 88, population: 750, resistance: 0.42,
  },
  {
    id: "af", name: "Africa",
    path: `M 870,148 L 900,138 L 932,140 L 962,152 L 982,172 L 990,198
           L 988,228 L 978,260 L 960,290 L 938,315 L 912,332 L 885,338
           L 858,330 L 835,312 L 818,288 L 810,260 L 812,230 L 820,200
           L 835,172 L 852,155 Z`,
    cx: 900, cy: 242, population: 1400, resistance: 0.15,
  },
  {
    id: "ru", name: "Russia",
    path: `M 1005,40 L 1065,28 L 1145,20 L 1235,18 L 1330,22 L 1418,30
           L 1490,42 L 1530,58 L 1525,75 L 1498,88 L 1455,95 L 1390,98
           L 1315,95 L 1235,90 L 1155,85 L 1075,78 L 1010,68 L 992,55 Z`,
    cx: 1265, cy: 60, population: 145, resistance: 0.38,
  },
  {
    id: "as", name: "Asia",
    path: `M 1012,108 L 1055,98 L 1105,92 L 1165,90 L 1225,95 L 1285,105
           L 1340,118 L 1385,135 L 1415,155 L 1418,178 L 1400,198
           L 1368,212 L 1328,220 L 1282,222 L 1235,218 L 1185,210
           L 1135,198 L 1088,182 L 1048,162 L 1020,140 L 1005,122 Z`,
    cx: 1215, cy: 160, population: 3200, resistance: 0.32,
  },
  {
    id: "me", name: "Middle East",
    path: `M 1005,138 L 1035,128 L 1065,130 L 1088,148 L 1092,170
           L 1078,190 L 1052,200 L 1025,195 L 1005,178 L 998,158 Z`,
    cx: 1045, cy: 165, population: 420, resistance: 0.28,
  },
  {
    id: "oc", name: "Oceania",
    path: `M 1432,400 L 1470,388 L 1512,390 L 1548,405 L 1562,428
           L 1555,452 L 1530,468 L 1498,472 L 1465,462 L 1440,442
           L 1428,420 Z`,
    cx: 1495, cy: 432, population: 45, resistance: 0.48,
  },
];

/* ─────────────────────────────────────────────
   MUTATIONS
───────────────────────────────────────────── */
const allMutations: Mutation[] = [
  { id: "airborne",      emoji: "💨", name: "Airborne Vector",     description: "Spreads through viral memes exhaled into timelines",    infectivity: 22, severity: 5,  memeLevel: 12, category: "transmission", epCost: 2 },
  { id: "waterborne",    emoji: "💧", name: "Waterborne Scroll",    description: "Transmitted via shared WiFi and public hotspots",       infectivity: 16, severity: 8,  memeLevel: 10, category: "transmission", epCost: 2 },
  { id: "direct",        emoji: "🤝", name: "Direct IRL Exposure",  description: "Spread through touch-grass-refusal and proximity",      infectivity: 12, severity: 14, memeLevel: 8,  category: "transmission", epCost: 2 },
  { id: "vector",        emoji: "🐀", name: "Influencer Vector",    description: "Carried by macro-influencers into new demographics",    infectivity: 28, severity: 6,  memeLevel: 18, category: "transmission", epCost: 3, requires: ["airborne"] },
  { id: "algorithm",     emoji: "⚙️", name: "Algorithm Boost",      description: "The FYP force-feeds your brainrot to millions daily",   infectivity: 35, severity: 5,  memeLevel: 28, category: "transmission", epCost: 4, requires: ["vector"] },
  { id: "skibidi",       emoji: "🚽", name: "Skibidi Syndrome",     description: "Uncontrollable urge to say 'skibidi toilet'",           infectivity: 5,  severity: 20, memeLevel: 32, category: "symptom",      epCost: 2 },
  { id: "sigma",         emoji: "🐺", name: "Sigma Delusion",       description: "Victim believes they're on a sigma grindset at 3am",   infectivity: 8,  severity: 26, memeLevel: 22, category: "symptom",      epCost: 2 },
  { id: "npc",           emoji: "🤖", name: "NPC Behavior",         description: "Repeating the same 3 phrases in every conversation",   infectivity: 10, severity: 16, memeLevel: 28, category: "symptom",      epCost: 2 },
  { id: "aura",          emoji: "✨", name: "Aura Obsession",       description: "Calculating aura points for every minor life event",   infectivity: 14, severity: 12, memeLevel: 38, category: "symptom",      epCost: 3, requires: ["skibidi"] },
  { id: "cortisol",      emoji: "😰", name: "Cortisol Face",        description: "Stress-bloat from doomscrolling 18 hours straight",   infectivity: 6,  severity: 30, memeLevel: 15, category: "symptom",      epCost: 3, requires: ["sigma"] },
  { id: "meme_immunity", emoji: "🧬", name: "Meme Immunity",        description: "Brainrot becomes resistant to touching grass",         infectivity: 5,  severity: 12, memeLevel: 20, category: "ability",      epCost: 3 },
  { id: "streamer",      emoji: "🎮", name: "Streamer Mutation",    description: "Infected hosts start livestreaming everything",        infectivity: 20, severity: 14, memeLevel: 22, category: "ability",      epCost: 3, requires: ["meme_immunity"] },
  { id: "delulu",        emoji: "🦋", name: "Delulu Evolution",     description: "Delusion becomes the solution. Unstoppable.",         infectivity: 16, severity: 32, memeLevel: 45, category: "ability",      epCost: 5, requires: ["meme_immunity", "npc"] },
  { id: "rizz",          emoji: "😏", name: "Unspoken Rizz",        description: "Brainrot spreads without words. Just vibes.",         infectivity: 24, severity: 8,  memeLevel: 35, category: "ability",      epCost: 4, requires: ["streamer"] },
  { id: "omega",         emoji: "☠️", name: "Omega Brainrot",       description: "Final form. Humanity forgets what 'outside' means.",  infectivity: 50, severity: 50, memeLevel: 100,category: "evolution",    epCost: 10, requires: ["algorithm", "delulu"] },
  { id: "chronically",   emoji: "💀", name: "Chronically Online",   description: "Reality and timeline merge. There's no coming back.", infectivity: 40, severity: 40, memeLevel: 80, category: "evolution",    epCost: 8,  requires: ["airborne", "cortisol", "rizz"] },
];

const EP_MILESTONES = [
  { threshold: 10, ep: 1, msg: "+1 EP — Outbreak detected" },
  { threshold: 20, ep: 1, msg: "+1 EP — Panic spreading" },
  { threshold: 35, ep: 2, msg: "+2 EP — WHO concerned" },
  { threshold: 50, ep: 2, msg: "+2 EP — Continental crisis" },
  { threshold: 65, ep: 3, msg: "+3 EP — Global emergency" },
  { threshold: 80, ep: 3, msg: "+3 EP — Governments collapsing" },
  { threshold: 92, ep: 5, msg: "+5 EP — Total brainrot" },
];

const NEWS = {
  early:   ["Scientists baffled by brain deterioration linked to phone usage","CDC warns: teenagers forgetting how to make eye contact","Local teen diagnosed with 'permanent FYP face'","'No cap' now appearing in corporate earnings reports"],
  mid:     ["WHO declares brainrot a global health concern","Schools ban phones — students now speak exclusively in TikTok audio","Emergency rooms flooded with people who can't stop saying 'skibidi'","NASA scientists caught doomscrolling during rocket launch"],
  late:    ["UN emergency session: 'The memes have won'","Last library closes — books officially declared 'mid'","Touching grass declared illegal in 47 countries","Humanity's attention span measured at 0.3 seconds"],
  endgame: ["Civilization has fallen. The brainrot is complete.","Earth renamed to 'Skibidi Planet' by unanimous vote","AI declares humanity 'cooked beyond repair'"],
};

const PATIENT_ZERO = [
  { id: "doomscroller", emoji: "📱", label: "The Doomscroller",  desc: "12+ hours daily screen time",     bonusInfectivity: 10, bonusSeverity: 5,  startRegion: "na", startEP: 3 },
  { id: "shitposter",   emoji: "💩", label: "The Shitposter",    desc: "Posts 50 memes before breakfast", bonusInfectivity: 15, bonusSeverity: 8,  startRegion: "eu", startEP: 4 },
  { id: "tiktoker",     emoji: "🎵", label: "The TikToker",      desc: "Everything is content",           bonusInfectivity: 20, bonusSeverity: 3,  startRegion: "as", startEP: 5 },
  { id: "gamer",        emoji: "🎮", label: "The Gamer",         desc: "Hasn't touched grass since 2019", bonusInfectivity: 8,  bonusSeverity: 15, startRegion: "oc", startEP: 2 },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function infColor(p: number) {
  if (p <= 0) return "#12122a";
  if (p < 10) return "#1e3d1e";
  if (p < 25) return "#3a6b2a";
  if (p < 45) return "#7a7a15";
  if (p < 65) return "#b87018";
  if (p < 85) return "#c03a15";
  return "#e03030";
}
function infGlow(p: number) {
  if (p <= 0) return "none";
  const i = Math.min(1, p / 100);
  return `drop-shadow(0 0 ${4 + i * 16}px ${infColor(p)}cc)`;
}

function getResult(state: GameState) {
  const avg = Object.values(state.infected).reduce((a, b) => a + b, 0) / regions.length;
  const m = state.activeMutations.length;
  if (avg >= 88 && m >= 6) return { title: "EXTINCTION-LEVEL BRAINROT", emoji: "💀", color: "#E05544", grade: "S+", desc: "You didn't just infect the world — you ended civilization. Historians will study your brainrot for centuries. If they can still read.", roast: "You are the reason aliens won't visit us." };
  if (avg >= 68)           return { title: "GLOBAL PANDEMIC",            emoji: "🌍", color: "#fb923c", grade: "S",  desc: "Every continent is cooked. The WHO has given up. Your brainrot achieved what real pandemics only dream of.", roast: "Your screen time report should be classified as a WMD." };
  if (avg >= 48)           return { title: "CONTINENTAL CRISIS",         emoji: "🦠", color: "#F5C518", grade: "A",  desc: "Half the world is infected. Governments are scrambling. Your brainrot is on the news.", roast: "You're the reason your mom asks 'what's a sigma' at dinner." };
  if (avg >= 28)           return { title: "REGIONAL OUTBREAK",          emoji: "📡", color: "#a78bfa", grade: "B",  desc: "Your brainrot spread but never went global. You needed more mutations.", roast: "Mid pandemic energy. Even COVID did better." };
  return                          { title: "CONTAINED INCIDENT",         emoji: "🧪", color: "#8B7EA8", grade: "C",  desc: "Your brainrot barely left your group chat. Embarrassing.", roast: "You couldn't even go viral. That's the real brainrot." };
}

const CAT: Record<MutationCategory, { label: string; color: string; dim: string; border: string }> = {
  transmission: { label: "Transmission", color: "#ff6b6b", dim: "rgba(255,107,107,0.10)", border: "rgba(255,107,107,0.28)" },
  symptom:      { label: "Symptoms",     color: "#ffa94d", dim: "rgba(255,169,77,0.10)",  border: "rgba(255,169,77,0.28)"  },
  ability:      { label: "Abilities",    color: "#b197fc", dim: "rgba(177,151,252,0.10)", border: "rgba(177,151,252,0.28)" },
  evolution:    { label: "Evolution",    color: "#ffd43b", dim: "rgba(255,212,59,0.10)",  border: "rgba(255,212,59,0.32)"  },
};

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */
export default function BrainrotPandemic() {
  const [phase, setPhase] = useState<"intro" | "setup" | "playing" | "result">("intro");
  const [gameState, setGameState] = useState<GameState>({
    infected: Object.fromEntries(regions.map(r => [r.id, 0])),
    totalInfected: 0, day: 0, activeMutations: [], infectivity: 10, severity: 5,
    memeLevel: 0, newsHeadlines: [], gameOver: false, cureProgress: 0,
    evolutionPoints: 0, totalEPEarned: 0,
  });
  const [isPaused,  setIsPaused]  = useState(false);
  const [tickSpeed, setTickSpeed] = useState(800);
  const [showNews,  setShowNews]  = useState(false);
  const [headline,  setHeadline]  = useState("");
  const [epToast,   setEpToast]   = useState<string | null>(null);
  const [selCat,    setSelCat]    = useState<MutationCategory>("transmission");
  const awardedRef = useRef<Set<number>>(new Set());

  const startGame = (pz: typeof PATIENT_ZERO[0]) => {
    awardedRef.current = new Set();
    const inf = Object.fromEntries(regions.map(r => [r.id, 0]));
    inf[pz.startRegion] = 5;
    setGameState({
      infected: inf, totalInfected: 5, day: 0, activeMutations: [],
      infectivity: 10 + pz.bonusInfectivity, severity: 5 + pz.bonusSeverity,
      memeLevel: 0, newsHeadlines: [], gameOver: false, cureProgress: 0,
      evolutionPoints: pz.startEP, totalEPEarned: pz.startEP,
    });
    setPhase("playing"); setIsPaused(false); setSelCat("transmission");
  };

  useEffect(() => {
    if (phase !== "playing" || isPaused || gameState.gameOver) return;
    const id = setInterval(() => {
      setGameState(prev => {
        const inf = { ...prev.infected };
        for (const r of regions) {
          const c = inf[r.id]; if (c <= 0 || c >= 100) continue;
          const rate = (prev.infectivity / 100) * (1 - r.resistance) * (1 + prev.memeLevel / 200);
          inf[r.id] = Math.min(100, c + c * rate * 0.08 + rate * 0.3);
        }
        for (const r of regions) {
          if (inf[r.id] > 20) for (const o of regions) {
            if (o.id === r.id || inf[o.id] > 0) continue;
            if (Math.random() < (prev.infectivity / 500) * (inf[r.id] / 100)) inf[o.id] = 1;
          }
        }
        const totalPop = regions.reduce((a, r) => a + r.population, 0);
        const totalInf = regions.reduce((a, r) => a + (inf[r.id] / 100) * r.population, 0);
        const pct = (totalInf / totalPop) * 100;
        let epGain = 0, epMsg = "";
        for (const m of EP_MILESTONES) {
          if (pct >= m.threshold && !awardedRef.current.has(m.threshold)) {
            awardedRef.current.add(m.threshold); epGain += m.ep; epMsg = m.msg;
          }
        }
        if (epGain > 0) { setEpToast(epMsg); setTimeout(() => setEpToast(null), 3000); }
        const cure = Math.min(100, prev.cureProgress + (prev.day > 15 ? 0.6 - prev.memeLevel / 400 : 0));
        const day = prev.day + 1;
        const newH = [...prev.newsHeadlines];
        if (day % 8 === 0) {
          const pool = pct < 25 ? NEWS.early : pct < 50 ? NEWS.mid : pct < 80 ? NEWS.late : NEWS.endgame;
          const h = pool[Math.floor(Math.random() * pool.length)];
          if (!newH.includes(h)) { newH.push(h); setHeadline(h); setShowNews(true); setTimeout(() => setShowNews(false), 4500); }
        }
        const avg = Object.values(inf).reduce((a, b) => a + b, 0) / regions.length;
        const over = avg >= 95 || cure >= 100 || day >= 120;
        if (over) fetch("/api/track", { method: "POST" }).catch(() => {});
        return {
          ...prev, infected: inf, totalInfected: Math.round(pct), day, newsHeadlines: newH,
          gameOver: over, cureProgress: cure,
          evolutionPoints: prev.evolutionPoints + epGain, totalEPEarned: prev.totalEPEarned + epGain,
        };
      });
    }, tickSpeed);
    return () => clearInterval(id);
  }, [phase, isPaused, gameState.gameOver, tickSpeed]);

  useEffect(() => {
    if (gameState.gameOver && phase === "playing") setTimeout(() => setPhase("result"), 1500);
  }, [gameState.gameOver, phase]);

  const activeOf = (cat: MutationCategory) =>
    gameState.activeMutations.filter(id => allMutations.find(m => m.id === id)?.category === cat);

  const canUnlock = (mut: Mutation): { ok: boolean; reason?: string } => {
    if (gameState.activeMutations.includes(mut.id)) return { ok: false, reason: "Already active" };
    if (gameState.evolutionPoints < mut.epCost) return { ok: false, reason: `Need ${mut.epCost} EP (have ${gameState.evolutionPoints})` };
    if (activeOf(mut.category).length >= SLOTS[mut.category]) return { ok: false, reason: `${CAT[mut.category].label} slots full` };
    if (mut.requires) for (const req of mut.requires) {
      if (!gameState.activeMutations.includes(req))
        return { ok: false, reason: `Requires: ${allMutations.find(m => m.id === req)?.name ?? req}` };
    }
    return { ok: true };
  };

  const applyMutation = (mut: Mutation) => {
    if (!canUnlock(mut).ok) return;
    setGameState(p => ({
      ...p,
      activeMutations: [...p.activeMutations, mut.id],
      infectivity: p.infectivity + mut.infectivity,
      severity: p.severity + mut.severity,
      memeLevel: p.memeLevel + mut.memeLevel,
      evolutionPoints: p.evolutionPoints - mut.epCost,
    }));
  };

  const result = phase === "result" ? getResult(gameState) : null;

  return (
    <>
      <Header />
      <div style={{ minHeight: "100vh", background: "#08080f", fontFamily: "'Outfit', sans-serif" }}>

        {/* Ambient */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle,rgba(224,85,68,0.055) 0%,transparent 70%)", top: -300, left: "5%" }} />
          <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(177,151,252,0.04) 0%,transparent 70%)", bottom: "0%", right: "0%" }} />
        </div>

        <main style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px", position: "relative", zIndex: 1 }}>

          {/* ══ INTRO ══ */}
          {phase === "intro" && (
            <div style={{ textAlign: "center", maxWidth: 620, margin: "80px auto 0", animation: "fadeUp 0.5s ease both" }}>
              <Link to="/" style={{ color: "#44445a", fontSize: 13, textDecoration: "none", display: "inline-block", marginBottom: 36 }}>
                ← back to tools
              </Link>
              <div style={{ fontSize: 72, marginBottom: 20 }}>🧠🦠</div>
              <h1 style={{ fontSize: "clamp(2.4rem,5vw,3.4rem)", fontWeight: 900, color: "#f0f0f8", margin: "0 0 18px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                Brainrot Pandemic
              </h1>
              <p style={{ color: "#7070a0", fontSize: 17, lineHeight: 1.75, marginBottom: 12 }}>
                Your brainrot is <span style={{ color: "#ff6b6b", fontWeight: 700 }}>Patient Zero</span>. Spread infection across the globe, earn Evolution Points, and unlock a mutation tree with real prerequisites.
              </p>
              <p style={{ color: "#333348", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", marginBottom: 44 }}>
                inspired by plague inc. but make it chronically online.
              </p>
              <button
                onClick={() => setPhase("setup")}
                style={{ background: "#E05544", color: "#fff", border: "none", borderRadius: 50, padding: "18px 52px", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "'Outfit',sans-serif", letterSpacing: "-0.01em", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget).style.transform = "translateY(-3px)"; (e.currentTarget).style.boxShadow = "0 16px 48px rgba(224,85,68,0.38)"; }}
                onMouseLeave={e => { (e.currentTarget).style.transform = ""; (e.currentTarget).style.boxShadow = ""; }}
              >
                🦠 Start Pandemic
              </button>
            </div>
          )}

          {/* ══ SETUP ══ */}
          {phase === "setup" && (
            <div style={{ maxWidth: 720, margin: "48px auto 0", animation: "fadeUp 0.5s ease both" }}>
              <h2 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#f0f0f8", textAlign: "center", margin: "0 0 8px", letterSpacing: "-0.025em" }}>
                Choose Patient Zero
              </h2>
              <p style={{ color: "#44445a", textAlign: "center", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, marginBottom: 36 }}>
                who started the outbreak?
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {PATIENT_ZERO.map(pz => (
                  <button
                    key={pz.id}
                    onClick={() => startGame(pz)}
                    style={{ background: "linear-gradient(160deg,#18182a,#111120)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 22, padding: "28px 24px", textAlign: "left", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Outfit',sans-serif" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,107,107,0.4)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 48px rgba(224,85,68,0.12)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <span style={{ fontSize: 36, display: "block", marginBottom: 12 }}>{pz.emoji}</span>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#f0f0f8", margin: "0 0 5px" }}>{pz.label}</h3>
                    <p style={{ color: "#55556a", fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>{pz.desc}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", padding: "4px 12px", borderRadius: 20, background: "rgba(255,107,107,0.12)", color: "#ff6b6b" }}>+{pz.bonusInfectivity} infectivity</span>
                      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", padding: "4px 12px", borderRadius: 20, background: "rgba(255,212,59,0.10)", color: "#ffd43b" }}>{pz.startEP} EP start</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ PLAYING ══ */}
          {phase === "playing" && (
            <div style={{ animation: "fadeUp 0.4s ease both" }}>

              {/* Toasts */}
              {showNews && (
                <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center", animation: "slideDown 0.3s ease both" }}>
                  <div style={{ background: "#E05544", color: "#fff", padding: "11px 28px", borderRadius: "0 0 18px 18px", fontFamily: "'JetBrains Mono',monospace", fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(224,85,68,0.5)", maxWidth: "90vw", textAlign: "center" }}>
                    📰 BREAKING: {headline}
                  </div>
                </div>
              )}
              {epToast && (
                <div style={{ position: "fixed", top: 64, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center", animation: "slideDown 0.3s ease both" }}>
                  <div style={{ background: "#ffd43b", color: "#1a1a00", padding: "11px 28px", borderRadius: "0 0 18px 18px", fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 800, boxShadow: "0 8px 32px rgba(255,212,59,0.5)", maxWidth: "90vw" }}>
                    ⚗️ {epToast}
                  </div>
                </div>
              )}

              {/* Status bar */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24, background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: "16px 24px" }}>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center" }}>
                  <StatBar label="DAY"      value={String(gameState.day)}          color="#7070a0" />
                  <StatBar label="INFECTED" value={`${gameState.totalInfected}%`}   color="#ff6b6b" />
                  <StatBar label="MEME LVL" value={String(gameState.memeLevel)}     color="#ffd43b" />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderRadius: 14, background: "rgba(255,212,59,0.10)", border: "1px solid rgba(255,212,59,0.25)" }}>
                    <span style={{ fontSize: 20 }}>⚗️</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, fontWeight: 900, color: "#ffd43b" }}>{gameState.evolutionPoints}</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#aa9030", letterSpacing: "0.1em" }}>EP</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <CtrlBtn onClick={() => setIsPaused(!isPaused)} label={isPaused ? "▶ PLAY" : "⏸ PAUSE"} />
                  <CtrlBtn onClick={() => setTickSpeed(s => s === 800 ? 400 : s === 400 ? 200 : 800)}
                    label={tickSpeed === 800 ? "1×" : tickSpeed === 400 ? "2×" : "3×"} />
                </div>
              </div>

              {/* Cure */}
              {gameState.cureProgress > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#4ade80", letterSpacing: "0.1em" }}>🧬 CURE PROGRESS</span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "#4ade80" }}>{Math.round(gameState.cureProgress)}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${gameState.cureProgress}%`, background: "#4ade80", borderRadius: 5, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              )}

              {/* ── SPLIT LAYOUT ── */}
              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>

                {/* LEFT: MAP */}
                <div style={{ flex: "1 1 580px", minWidth: 0 }}>
                  <div style={{ borderRadius: 22, overflow: "hidden", border: "1px solid rgba(255,255,255,0.055)", background: "#090912" }}>
                    <svg viewBox="0 0 2000 500" style={{ width: "100%", height: "auto", display: "block" }}>
                      <defs>
                        <radialGradient id="og" cx="50%" cy="50%" r="70%">
                          <stop offset="0%" stopColor="#0c1422" />
                          <stop offset="100%" stopColor="#060810" />
                        </radialGradient>
                      </defs>
                      <rect width="2000" height="500" fill="url(#og)" />
                      {/* Grid */}
                      {[100, 200, 300, 400].map(y => (
                        <line key={y} x1="0" y1={y} x2="2000" y2={y} stroke="#0f1a2e" strokeWidth="1" />
                      ))}
                      {[400, 800, 1200, 1600].map(x => (
                        <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#0f1a2e" strokeWidth="1" />
                      ))}
                      {/* Equator */}
                      <line x1="0" y1="250" x2="2000" y2="250" stroke="#121e35" strokeWidth="1.5" strokeDasharray="10,10" />
                      <text x="18" y="244" fill="#162030" fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="3">EQUATOR</text>
                      {/* Ocean labels */}
                      <text x="620" y="450" textAnchor="middle" fill="#0a1322" fontSize="26" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="8">PACIFIC</text>
                      <text x="170" y="380" textAnchor="middle" fill="#0a1322" fontSize="18" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="5">ATLANTIC</text>
                      <text x="1720" y="440" textAnchor="middle" fill="#0a1322" fontSize="16" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="4">INDIAN</text>

                      {regions.map(r => {
                        const p = gameState.infected[r.id] || 0;
                        return (
                          <g key={r.id}>
                            <path d={r.path} fill="#060810" transform="translate(3,4)" opacity="0.7" />
                            <path d={r.path} fill={infColor(p)}
                              stroke={p > 0 ? infColor(p) : "#1c1c38"} strokeWidth={p > 0 ? 1.8 : 0.8}
                              style={{ filter: infGlow(p), transition: "fill 0.7s ease, filter 0.7s ease" }} />
                            <path d={r.path} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1.5" />
                            {p > 0 && p < 98 && (
                              <circle cx={r.cx} cy={r.cy} r={8 + p / 10} fill="none" stroke={infColor(p)} strokeWidth="1.8" opacity="0.28">
                                <animate attributeName="r" from={8 + p / 10} to={20 + p / 7} dur="2.5s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.28" to="0" dur="2.5s" repeatCount="indefinite" />
                              </circle>
                            )}
                            <text x={r.cx} y={r.cy - 10} textAnchor="middle"
                              fill={p > 35 ? "#ddddf0" : "#383858"} fontSize="11"
                              fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                              style={{ transition: "fill 0.5s ease" }}>
                              {r.name}
                            </text>
                            <text x={r.cx} y={r.cy + 7} textAnchor="middle"
                              fill={p > 0 ? infColor(p) : "#222240"} fontSize={p >= 100 ? 13 : 11}
                              fontFamily="'JetBrains Mono',monospace" fontWeight="900"
                              style={{ transition: "fill 0.5s ease" }}>
                              {Math.round(p)}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Region bars */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                    {regions.map(r => {
                      const p = gameState.infected[r.id] || 0;
                      return (
                        <div key={r.id} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "13px 15px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#c8c8e0" }}>{r.name}</span>
                            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 900, color: p > 0 ? infColor(p) : "#2a2a50" }}>
                              {Math.round(p)}%
                            </span>
                          </div>
                          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                            <div style={{ height: "100%", width: `${p}%`, borderRadius: 4, background: infColor(p), transition: "width 0.5s ease" }} />
                          </div>
                          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#2a2a50" }}>
                            {Math.round((p / 100) * r.population)}M / {r.population}M
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RIGHT: MUTATIONS */}
                <div style={{ flex: "0 0 380px", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* EP card */}
                  <div style={{ borderRadius: 20, padding: "20px 22px", background: "rgba(255,212,59,0.06)", border: "1px solid rgba(255,212,59,0.22)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#aa9030", letterSpacing: "0.14em", textTransform: "uppercase" }}>⚗️ Evolution Points</span>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 30, fontWeight: 900, color: "#ffd43b" }}>{gameState.evolutionPoints}</span>
                    </div>
                    <p style={{ color: "#665c20", fontSize: 12, fontFamily: "'JetBrains Mono',monospace", margin: "0 0 14px", lineHeight: 1.6 }}>
                      Infect more of the world to earn EP. Spend it on mutations below.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {(Object.keys(SLOTS) as MutationCategory[]).map(cat => {
                        const used = activeOf(cat).length, max = SLOTS[cat], c = CAT[cat];
                        return (
                          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: c.color, opacity: 0.75 }}>{c.label}</span>
                            <div style={{ display: "flex", gap: 4 }}>
                              {Array.from({ length: max }).map((_, i) => (
                                <div key={i} style={{ width: 9, height: 9, borderRadius: 2, background: i < used ? c.color : "rgba(255,255,255,0.07)", border: `1px solid ${i < used ? c.color : "rgba(255,255,255,0.1)"}` }} />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {(Object.keys(CAT) as MutationCategory[]).map(cat => {
                      const c = CAT[cat], sel = selCat === cat;
                      const used = activeOf(cat).length, max = SLOTS[cat];
                      return (
                        <button key={cat} onClick={() => setSelCat(cat)} style={{
                          flex: "1", padding: "12px 6px", borderRadius: 14, cursor: "pointer",
                          background: sel ? c.dim : "rgba(255,255,255,0.022)",
                          border: `1px solid ${sel ? c.border : "rgba(255,255,255,0.05)"}`,
                          color: sel ? c.color : "#44445a", transition: "all 0.15s",
                          fontFamily: "'Outfit',sans-serif",
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 800 }}>{c.label}</div>
                          <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", marginTop: 3, opacity: 0.65 }}>{used}/{max}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mutation cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", maxHeight: 480, scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.07) transparent" }}>
                    {allMutations.filter(m => m.category === selCat).map(mut => {
                      const active = gameState.activeMutations.includes(mut.id);
                      const check = canUnlock(mut);
                      const c = CAT[mut.category];
                      const locked = !active && !check.ok;
                      const prereqNames = mut.requires?.map(id => allMutations.find(m => m.id === id)?.name ?? id);
                      return (
                        <div key={mut.id} style={{
                          borderRadius: 18, padding: "18px",
                          background: active ? c.dim : locked ? "rgba(10,10,20,0.8)" : "rgba(16,16,28,0.95)",
                          border: `1px solid ${active ? c.border : locked ? "rgba(35,35,55,0.5)" : c.border}`,
                          opacity: locked ? 0.52 : 1, transition: "all 0.2s",
                        }}>
                          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{mut.emoji}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 5 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 800, color: "#f0f0f8", margin: 0, lineHeight: 1.2 }}>{mut.name}</h4>
                                {active && (
                                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", padding: "2px 10px", borderRadius: 20, background: c.dim, color: c.color, fontWeight: 700, letterSpacing: "0.1em" }}>ACTIVE</span>
                                )}
                              </div>
                              <p style={{ fontSize: 13, color: "#606080", margin: "0 0 8px", lineHeight: 1.55 }}>{mut.description}</p>
                              {prereqNames && prereqNames.length > 0 && (
                                <p style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", margin: "0 0 8px", color: active ? "rgba(74,222,128,0.65)" : check.ok ? "rgba(74,222,128,0.65)" : "rgba(255,175,55,0.65)" }}>
                                  {active ? "✓" : "→"} Requires: {prereqNames.join(", ")}
                                </p>
                              )}
                              {!active && (
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {mut.infectivity > 0 && <StatPill v={`+${mut.infectivity} inf`}  color="#ff6b6b" />}
                                  {mut.memeLevel > 0   && <StatPill v={`+${mut.memeLevel} meme`}  color="#ffd43b" />}
                                  {mut.severity > 0    && <StatPill v={`+${mut.severity} sev`}    color="#b197fc" />}
                                </div>
                              )}
                              {locked && check.reason && (
                                <p style={{ fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: "rgba(255,165,50,0.5)", margin: "10px 0 0" }}>⚠ {check.reason}</p>
                              )}
                            </div>
                            {/* Unlock btn */}
                            {!active && (
                              <button onClick={() => applyMutation(mut)} disabled={!check.ok} style={{
                                flexShrink: 0, padding: "12px 16px", borderRadius: 14,
                                cursor: check.ok ? "pointer" : "not-allowed",
                                background: check.ok ? c.dim : "rgba(28,28,48,0.5)",
                                border: `1px solid ${check.ok ? c.border : "rgba(35,35,55,0.4)"}`,
                                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                transition: "all 0.15s", minWidth: 62,
                              }}
                                onMouseEnter={e => { if (check.ok) e.currentTarget.style.transform = "scale(1.06)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = ""; }}
                              >
                                <span style={{ fontSize: 18 }}>⚗️</span>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 900, color: check.ok ? c.color : "#333352" }}>{mut.epCost}</span>
                                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.08em", color: check.ok ? c.color : "#2a2a48", textTransform: "uppercase" }}>
                                  {check.ok ? "unlock" : "locked"}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active mutations */}
                  {gameState.activeMutations.length > 0 && (
                    <div style={{ borderRadius: 18, padding: "16px 18px", background: "rgba(255,255,255,0.022)", border: "1px solid rgba(255,255,255,0.055)" }}>
                      <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#333350", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px" }}>Active Mutations</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {gameState.activeMutations.map(id => {
                          const m = allMutations.find(x => x.id === id); if (!m) return null;
                          const c = CAT[m.category];
                          return (
                            <span key={id} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 20, fontWeight: 700, background: c.dim, border: `1px solid ${c.border}`, color: c.color, display: "flex", alignItems: "center", gap: 6 }}>
                              {m.emoji} {m.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ══ RESULT ══ */}
          {phase === "result" && result && (
            <div style={{ maxWidth: 560, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "#f0f0f8", textAlign: "center", margin: "0 0 32px", letterSpacing: "-0.025em" }}>
                Pandemic Complete
              </h2>
              <div id="brainrot-card" style={{ borderRadius: 30, overflow: "hidden", marginBottom: 32, background: `linear-gradient(135deg,#0e0e1c 0%,${result.color}10 50%,#0e0e1c 100%)`, border: `1px solid ${result.color}22` }}>
                <div style={{ padding: "36px" }}>
                  <div style={{ textAlign: "center", marginBottom: 26 }}>
                    <div style={{ fontSize: 60, marginBottom: 14 }}>{result.emoji}</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 20px", borderRadius: 30, background: result.color + "14", color: result.color, border: `1px solid ${result.color}20`, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", marginBottom: 16 }}>
                      GRADE: {result.grade}
                    </div>
                    <h3 style={{ fontSize: "clamp(1.4rem,4vw,2rem)", fontWeight: 900, color: result.color, margin: 0, letterSpacing: "-0.025em" }}>{result.title}</h3>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>
                    {[{ l: "Infected", v: `${gameState.totalInfected}%`, c: "#ff6b6b" }, { l: "Days", v: String(gameState.day), c: "#ffd43b" }, { l: "Mutations", v: String(gameState.activeMutations.length), c: "#b197fc" }].map(s => (
                      <div key={s.l} style={{ textAlign: "center", padding: "16px 8px", borderRadius: 18, background: "rgba(255,255,255,0.04)" }}>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 24, fontWeight: 900, color: s.c }}>{s.v}</div>
                        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: "#44445a", textTransform: "uppercase", marginTop: 5 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ color: "#8080a8", fontSize: 15, lineHeight: 1.75, textAlign: "center", marginBottom: 18 }}>{result.desc}</p>
                  <div style={{ borderRadius: 18, padding: "20px", textAlign: "center", background: result.color + "08", border: `1px solid ${result.color}12` }}>
                    <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: result.color, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>The Diagnosis</p>
                    <p style={{ color: "#e0e0f0", fontSize: 16, fontStyle: "italic", fontWeight: 600, margin: 0 }}>"{result.roast}"</p>
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: "#202038", textAlign: "center", marginTop: 22 }}>dafuqbro.com/brainrot</p>
                </div>
              </div>
              <ShareButtons cardId="brainrot-card" shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade}: "${result.title}" 🧠🦠 How cooked are you?`}
                accentColor={result.color} />
              <div style={{ textAlign: "center", marginTop: 32 }}>
                <button
                  onClick={() => { setPhase("intro"); setGameState({ infected: Object.fromEntries(regions.map(r => [r.id, 0])), totalInfected: 0, day: 0, activeMutations: [], infectivity: 10, severity: 5, memeLevel: 0, newsHeadlines: [], gameOver: false, cureProgress: 0, evolutionPoints: 0, totalEPEarned: 0 }); }}
                  style={{ color: "#44445a", fontSize: 15, background: "none", border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                  ← Start a new pandemic
                </button>
              </div>
            </div>
          )}
        </main>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap');
          @keyframes fadeUp    { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:none } }
          @keyframes slideDown { from { opacity:0; transform:translateY(-14px)} to { opacity:1; transform:none } }
          ::-webkit-scrollbar { width: 4px }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 4px }
        `}</style>
      </div>
      <Footer />
    </>
  );
}

function StatBar({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ fontFamily: "'JetBrains Mono',monospace" }}>
      <span style={{ fontSize: 11, color: "#383858", letterSpacing: "0.12em", textTransform: "uppercase" }}>{label} </span>
      <span style={{ fontSize: 20, fontWeight: 900, color }}>{value}</span>
    </div>
  );
}
function CtrlBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} style={{ padding: "9px 18px", borderRadius: 11, background: "rgba(255,255,255,0.038)", border: "1px solid rgba(255,255,255,0.07)", color: "#8080a0", fontSize: 13, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", cursor: "pointer", transition: "all 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
    >{label}</button>
  );
}
function StatPill({ v, color }: { v: string; color: string }) {
  return (
    <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono',monospace", padding: "3px 10px", borderRadius: 20, background: `${color}14`, color, border: `1px solid ${color}20` }}>{v}</span>
  );
}
