import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Brainrot Pandemic — DaFuqBro" },
  {
    name: "description",
    content:
      "Your brainrot is spreading. Evolve your virus through Transmission, Symptoms, Abilities and Evolution mutations — each with prerequisites and limited slots. Watch it infect the world.",
  },
  { property: "og:title", content: "Brainrot Pandemic — DaFuqBro" },
  { property: "og:description", content: "Your brainrot is a global pandemic. Watch it spread." },
  { name: "twitter:card", content: "summary_large_image" },
];

/* ═══════════════════════════════════════
   TYPES
   ═══════════════════════════════════════ */

interface Region {
  id: string;
  name: string;
  path: string;
  cx: number;
  cy: number;
  population: number;
  resistance: number;
}

type MutationCategory = "transmission" | "symptom" | "ability" | "evolution";

interface Mutation {
  id: string;
  emoji: string;
  name: string;
  description: string;
  infectivity: number;
  severity: number;
  memeLevel: number;
  category: MutationCategory;
  epCost: number;
  requires?: string[]; // prerequisite mutation ids
  slots?: number; // for transmission subtypes
  maxOfCategory?: number; // informational
}

interface GameState {
  infected: Record<string, number>;
  totalInfected: number;
  day: number;
  activeMutations: string[];
  infectivity: number;
  severity: number;
  memeLevel: number;
  newsHeadlines: string[];
  gameOver: boolean;
  cureProgress: number;
  evolutionPoints: number;
  totalEPEarned: number;
}

/* ═══════════════════════════════════════
   SLOT LIMITS PER CATEGORY
   ═══════════════════════════════════════ */
const SLOT_LIMITS: Record<MutationCategory, number> = {
  transmission: 3,
  symptom: 3,
  ability: 2,
  evolution: 1,
};

/* ═══════════════════════════════════════
   REALISTIC SVG WORLD MAP PATHS
   Natural continent outlines, viewBox 0 0 1000 500
   ═══════════════════════════════════════ */

const regions: Region[] = [
  {
    id: "na",
    name: "North America",
    path: "M95,48 L110,35 L140,28 L175,22 L220,18 L260,25 L285,38 L295,55 L290,75 L275,90 L255,108 L235,125 L215,138 L195,148 L178,158 L162,162 L148,155 L138,142 L128,128 L118,115 L105,100 L92,82 L85,65 Z",
    cx: 190,
    cy: 88,
    population: 580,
    resistance: 0.3,
  },
  {
    id: "sa",
    name: "South America",
    path: "M185,175 L205,168 L228,172 L245,185 L255,205 L258,230 L252,258 L240,282 L225,305 L210,318 L195,322 L180,315 L168,295 L162,270 L160,245 L165,218 L172,195 Z",
    cx: 210,
    cy: 248,
    population: 430,
    resistance: 0.25,
  },
  {
    id: "eu",
    name: "Europe",
    path: "M420,28 L445,22 L472,25 L492,35 L505,48 L508,62 L500,75 L485,85 L465,90 L445,88 L428,80 L415,68 L412,52 Z",
    cx: 460,
    cy: 58,
    population: 750,
    resistance: 0.42,
  },
  {
    id: "af",
    name: "Africa",
    path: "M425,105 L455,98 L488,102 L510,118 L520,140 L518,168 L508,195 L492,218 L472,235 L450,242 L428,238 L408,222 L395,198 L390,172 L395,148 L408,125 Z",
    cx: 455,
    cy: 172,
    population: 1400,
    resistance: 0.15,
  },
  {
    id: "ru",
    name: "Russia",
    path: "M512,18 L560,12 L618,10 L672,15 L715,22 L745,35 L748,50 L730,62 L698,68 L662,70 L625,65 L588,60 L555,55 L528,48 L510,38 Z",
    cx: 628,
    cy: 40,
    population: 145,
    resistance: 0.38,
  },
  {
    id: "as",
    name: "Asia",
    path: "M515,78 L548,72 L585,68 L622,72 L658,82 L688,95 L702,112 L698,132 L678,148 L652,158 L622,162 L592,158 L565,148 L542,132 L525,115 L512,98 Z",
    cx: 608,
    cy: 118,
    population: 3200,
    resistance: 0.32,
  },
  {
    id: "me",
    name: "Middle East",
    path: "M515,95 L538,88 L558,92 L572,105 L570,122 L558,132 L540,135 L522,128 L512,115 Z",
    cx: 542,
    cy: 112,
    population: 420,
    resistance: 0.28,
  },
  {
    id: "oc",
    name: "Oceania",
    path: "M720,228 L752,220 L785,225 L802,240 L800,260 L785,272 L758,278 L730,272 L715,258 L715,242 Z",
    cx: 758,
    cy: 250,
    population: 45,
    resistance: 0.48,
  },
];

/* ═══════════════════════════════════════
   MUTATION TREE
   4 categories, prerequisites, EP costs, slot limits
   ═══════════════════════════════════════ */

const allMutations: Mutation[] = [
  // ── TRANSMISSION (max 3 slots) ──────────────────
  {
    id: "airborne",
    emoji: "💨",
    name: "Airborne Vector",
    description: "Spreads through viral memes exhaled into timelines",
    infectivity: 22,
    severity: 5,
    memeLevel: 12,
    category: "transmission",
    epCost: 2,
  },
  {
    id: "waterborne",
    emoji: "💧",
    name: "Waterborne Scroll",
    description: "Transmitted via shared WiFi and public hotspots",
    infectivity: 16,
    severity: 8,
    memeLevel: 10,
    category: "transmission",
    epCost: 2,
  },
  {
    id: "vector",
    emoji: "🐀",
    name: "Influencer Vector",
    description: "Carried by macro-influencers into new demographics",
    infectivity: 28,
    severity: 6,
    memeLevel: 18,
    category: "transmission",
    epCost: 3,
    requires: ["airborne"],
  },
  {
    id: "direct",
    emoji: "🤝",
    name: "Direct IRL Exposure",
    description: "Spread through touch-grass-refusal and proximity",
    infectivity: 12,
    severity: 14,
    memeLevel: 8,
    category: "transmission",
    epCost: 2,
  },
  {
    id: "algorithm",
    emoji: "⚙️",
    name: "Algorithm Boost",
    description: "The FYP force-feeds your brainrot to millions daily",
    infectivity: 35,
    severity: 5,
    memeLevel: 28,
    category: "transmission",
    epCost: 4,
    requires: ["vector"],
  },

  // ── SYMPTOMS (max 3 slots) ──────────────────────
  {
    id: "skibidi",
    emoji: "🚽",
    name: "Skibidi Syndrome",
    description: "Uncontrollable urge to say 'skibidi toilet'",
    infectivity: 5,
    severity: 20,
    memeLevel: 32,
    category: "symptom",
    epCost: 2,
  },
  {
    id: "sigma",
    emoji: "🐺",
    name: "Sigma Delusion",
    description: "Victim believes they're on a sigma grindset at 3am",
    infectivity: 8,
    severity: 26,
    memeLevel: 22,
    category: "symptom",
    epCost: 2,
  },
  {
    id: "npc",
    emoji: "🤖",
    name: "NPC Behavior",
    description: "Repeating the same 3 phrases in every conversation",
    infectivity: 10,
    severity: 16,
    memeLevel: 28,
    category: "symptom",
    epCost: 2,
  },
  {
    id: "aura",
    emoji: "✨",
    name: "Aura Obsession",
    description: "Calculating aura points for every minor life event",
    infectivity: 14,
    severity: 12,
    memeLevel: 38,
    category: "symptom",
    epCost: 3,
    requires: ["skibidi"],
  },
  {
    id: "cortisol",
    emoji: "😰",
    name: "Cortisol Face",
    description: "Stress-bloat from doomscrolling 18 hours straight",
    infectivity: 6,
    severity: 30,
    memeLevel: 15,
    category: "symptom",
    epCost: 3,
    requires: ["sigma"],
  },

  // ── ABILITIES (max 2 slots) ─────────────────────
  {
    id: "meme_immunity",
    emoji: "🧬",
    name: "Meme Immunity",
    description: "Brainrot becomes resistant to touching grass",
    infectivity: 5,
    severity: 12,
    memeLevel: 20,
    category: "ability",
    epCost: 3,
  },
  {
    id: "streamer",
    emoji: "🎮",
    name: "Streamer Mutation",
    description: "Infected hosts start livestreaming everything",
    infectivity: 20,
    severity: 14,
    memeLevel: 22,
    category: "ability",
    epCost: 3,
    requires: ["meme_immunity"],
  },
  {
    id: "delulu",
    emoji: "🦋",
    name: "Delulu Evolution",
    description: "Delusion becomes the solution. Unstoppable.",
    infectivity: 16,
    severity: 32,
    memeLevel: 45,
    category: "ability",
    epCost: 5,
    requires: ["meme_immunity", "npc"],
  },
  {
    id: "rizz",
    emoji: "😏",
    name: "Unspoken Rizz",
    description: "Brainrot spreads without words. Just vibes.",
    infectivity: 24,
    severity: 8,
    memeLevel: 35,
    category: "ability",
    epCost: 4,
    requires: ["streamer"],
  },

  // ── EVOLUTION (max 1 slot, end-game) ───────────
  {
    id: "omega",
    emoji: "☠️",
    name: "Omega Brainrot",
    description: "Final form. Humanity forgets what 'outside' means.",
    infectivity: 50,
    severity: 50,
    memeLevel: 100,
    category: "evolution",
    epCost: 10,
    requires: ["algorithm", "delulu"],
  },
  {
    id: "chronically_online",
    emoji: "💀",
    name: "Chronically Online",
    description: "Reality and timeline merge. There's no coming back.",
    infectivity: 40,
    severity: 40,
    memeLevel: 80,
    category: "evolution",
    epCost: 8,
    requires: ["airborne", "cortisol", "rizz"],
  },
];

/* ═══════════════════════════════════════
   EP MILESTONES
   ═══════════════════════════════════════ */
const EP_MILESTONES = [
  { threshold: 10, ep: 1, msg: "Outbreak detected. +1 EP" },
  { threshold: 20, ep: 1, msg: "Panic spreading. +1 EP" },
  { threshold: 35, ep: 2, msg: "WHO concerned. +2 EP" },
  { threshold: 50, ep: 2, msg: "Continental crisis. +2 EP" },
  { threshold: 65, ep: 3, msg: "Global emergency. +3 EP" },
  { threshold: 80, ep: 3, msg: "Governments collapsing. +3 EP" },
  { threshold: 92, ep: 5, msg: "Total brainrot. +5 EP" },
];

/* ═══════════════════════════════════════
   NEWS HEADLINES
   ═══════════════════════════════════════ */
const headlineTemplates = {
  early: [
    "Scientists baffled by new form of brain deterioration linked to phone usage",
    "CDC warns: teenagers forgetting how to make eye contact",
    "Local teen diagnosed with 'permanent FYP face'",
    "Unexplained increase in people saying 'no cap' in job interviews",
  ],
  mid: [
    "WHO declares brainrot a global health concern",
    "Schools ban phones after students speak exclusively in TikTok audio",
    "Emergency rooms flooded with people who can't stop saying 'skibidi'",
    "Stock market crashes after traders replace analysis with 'trust the vibes'",
    "NASA scientists caught doomscrolling during rocket launch",
  ],
  late: [
    "UN emergency session: 'The memes have won'",
    "Last library closes as books officially declared 'mid'",
    "World leaders communicate exclusively through group chat screenshots",
    "Humanity's attention span officially measured at 0.3 seconds",
    "Touching grass declared illegal in 47 countries",
  ],
  endgame: [
    "Civilization has fallen. The brainrot is complete.",
    "Earth renamed to 'Skibidi Planet' by unanimous vote",
    "AI declares humanity 'cooked beyond repair'",
    "The last person who read a book has been captured",
  ],
};

/* ═══════════════════════════════════════
   PATIENT ZERO
   ═══════════════════════════════════════ */
const patientZeroOptions = [
  { id: "doomscroller", emoji: "📱", label: "The Doomscroller", desc: "12+ hours daily screen time", bonusInfectivity: 10, bonusSeverity: 5, startRegion: "na", startEP: 3 },
  { id: "shitposter", emoji: "💩", label: "The Shitposter", desc: "Posts 50 memes before breakfast", bonusInfectivity: 15, bonusSeverity: 8, startRegion: "eu", startEP: 4 },
  { id: "tiktoker", emoji: "🎵", label: "The TikToker", desc: "Everything is content", bonusInfectivity: 20, bonusSeverity: 3, startRegion: "as", startEP: 5 },
  { id: "gamer", emoji: "🎮", label: "The Gamer", desc: "Hasn't touched grass since 2019", bonusInfectivity: 8, bonusSeverity: 15, startRegion: "oc", startEP: 2 },
];

/* ═══════════════════════════════════════
   RESULT TIERS
   ═══════════════════════════════════════ */
function getResultTier(state: GameState) {
  const avgInfection = Object.values(state.infected).reduce((a, b) => a + b, 0) / regions.length;
  const mutations = state.activeMutations.length;
  if (avgInfection >= 88 && mutations >= 6)
    return { title: "EXTINCTION-LEVEL BRAINROT", emoji: "💀", color: "#E05544", grade: "S+", desc: "You didn't just infect the world — you ended civilization. Historians will study your brainrot for centuries. If they can still read.", roast: "You are the reason aliens won't visit us." };
  if (avgInfection >= 68)
    return { title: "GLOBAL PANDEMIC", emoji: "🌍", color: "#fb923c", grade: "S", desc: "Every continent is cooked. The WHO has given up. Your brainrot achieved what real pandemics only dream of.", roast: "Your screen time report should be classified as a WMD." };
  if (avgInfection >= 48)
    return { title: "CONTINENTAL CRISIS", emoji: "🦠", color: "#F5C518", grade: "A", desc: "Half the world is infected. Governments are scrambling. Your brainrot is on the news.", roast: "You're the reason your mom asks 'what's a sigma' at dinner." };
  if (avgInfection >= 28)
    return { title: "REGIONAL OUTBREAK", emoji: "📡", color: "#A89BC0", grade: "B", desc: "Your brainrot is spreading but hasn't gone fully global. You needed more mutations.", roast: "Mid pandemic energy. Even COVID did better." };
  return { title: "CONTAINED INCIDENT", emoji: "🧪", color: "#8B7EA8", grade: "C", desc: "Your brainrot barely left your group chat. Embarrassing.", roast: "You couldn't even go viral. That's the real brainrot." };
}

/* ═══════════════════════════════════════
   CATEGORY META
   ═══════════════════════════════════════ */
const CAT_META: Record<MutationCategory, { label: string; color: string; bg: string; border: string; desc: string }> = {
  transmission: { label: "Transmission", color: "#E05544", bg: "rgba(224,85,68,0.08)", border: "rgba(224,85,68,0.25)", desc: "How brainrot spreads" },
  symptom:      { label: "Symptoms",     color: "#fb923c", bg: "rgba(251,146,60,0.08)", border: "rgba(251,146,60,0.25)", desc: "What it does to victims" },
  ability:      { label: "Abilities",    color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)", desc: "Special powers" },
  evolution:    { label: "Evolution",    color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.35)", desc: "End-game mutations" },
};

/* ═══════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════ */
function getInfectionColor(pct: number): string {
  if (pct <= 0) return "#1c1c2e";
  if (pct < 10) return "#2d4a2d";
  if (pct < 25) return "#4a6741";
  if (pct < 45) return "#8B8B2A";
  if (pct < 65) return "#C4841D";
  if (pct < 85) return "#C44A1D";
  return "#E05544";
}

function getInfectionGlow(pct: number): string {
  if (pct <= 0) return "none";
  const intensity = Math.min(1, pct / 100);
  return `drop-shadow(0 0 ${3 + intensity * 10}px ${getInfectionColor(pct)}90)`;
}

/* ═══════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════ */
export default function BrainrotPandemic() {
  const [phase, setPhase] = useState<"intro" | "setup" | "playing" | "result">("intro");
  const [patientZero, setPatientZero] = useState<typeof patientZeroOptions[0] | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    infected: Object.fromEntries(regions.map((r) => [r.id, 0])),
    totalInfected: 0,
    day: 0,
    activeMutations: [],
    infectivity: 10,
    severity: 5,
    memeLevel: 0,
    newsHeadlines: [],
    gameOver: false,
    cureProgress: 0,
    evolutionPoints: 0,
    totalEPEarned: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [tickSpeed, setTickSpeed] = useState(800);
  const [showNews, setShowNews] = useState(false);
  const [latestHeadline, setLatestHeadline] = useState("");
  const [epNotif, setEpNotif] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MutationCategory>("transmission");
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const awardedMilestonesRef = useRef<Set<number>>(new Set());

  const startGame = (pz: typeof patientZeroOptions[0]) => {
    setPatientZero(pz);
    const startInfected = Object.fromEntries(regions.map((r) => [r.id, 0]));
    startInfected[pz.startRegion] = 5;
    awardedMilestonesRef.current = new Set();
    setGameState({
      infected: startInfected,
      totalInfected: 5,
      day: 0,
      activeMutations: [],
      infectivity: 10 + pz.bonusInfectivity,
      severity: 5 + pz.bonusSeverity,
      memeLevel: 0,
      newsHeadlines: [],
      gameOver: false,
      cureProgress: 0,
      evolutionPoints: pz.startEP,
      totalEPEarned: pz.startEP,
    });
    setPhase("playing");
    setIsPaused(false);
    setSelectedCategory("transmission");
  };

  // Game tick
  useEffect(() => {
    if (phase !== "playing" || isPaused || gameState.gameOver) return;
    tickRef.current = setInterval(() => {
      setGameState((prev) => {
        const newInfected = { ...prev.infected };

        for (const region of regions) {
          const current = newInfected[region.id];
          if (current <= 0 || current >= 100) continue;
          const spreadRate = (prev.infectivity / 100) * (1 - region.resistance) * (1 + prev.memeLevel / 200);
          const growth = Math.min(100 - current, current * spreadRate * 0.08 + spreadRate * 0.3);
          if (growth > 0.01) newInfected[region.id] = Math.min(100, current + growth);
        }

        // Cross-region spread
        for (const region of regions) {
          if (newInfected[region.id] > 20) {
            for (const other of regions) {
              if (other.id === region.id || newInfected[other.id] > 0) continue;
              const crossChance = (prev.infectivity / 500) * (newInfected[region.id] / 100);
              if (Math.random() < crossChance) newInfected[other.id] = 1;
            }
          }
        }

        const totalPop = regions.reduce((a, r) => a + r.population, 0);
        const totalInf = regions.reduce((a, r) => a + (newInfected[r.id] / 100) * r.population, 0);
        const totalPct = (totalInf / totalPop) * 100;

        // Check EP milestones
        let epGained = 0;
        let epMsg = "";
        for (const milestone of EP_MILESTONES) {
          if (totalPct >= milestone.threshold && !awardedMilestonesRef.current.has(milestone.threshold)) {
            awardedMilestonesRef.current.add(milestone.threshold);
            epGained += milestone.ep;
            epMsg = milestone.msg;
          }
        }
        if (epGained > 0) {
          setEpNotif(epMsg);
          setTimeout(() => setEpNotif(null), 3000);
        }

        // Cure progress
        const newCure = Math.min(100, prev.cureProgress + (prev.day > 15 ? 0.6 - prev.memeLevel / 400 : 0));

        // News
        const newHeadlines = [...prev.newsHeadlines];
        const newDay = prev.day + 1;
        if (newDay % 8 === 0) {
          let pool: string[];
          if (totalPct < 25) pool = headlineTemplates.early;
          else if (totalPct < 50) pool = headlineTemplates.mid;
          else if (totalPct < 80) pool = headlineTemplates.late;
          else pool = headlineTemplates.endgame;
          const headline = pool[Math.floor(Math.random() * pool.length)];
          if (!newHeadlines.includes(headline)) {
            newHeadlines.push(headline);
            setLatestHeadline(headline);
            setShowNews(true);
            setTimeout(() => setShowNews(false), 4000);
          }
        }

        const avgInf = Object.values(newInfected).reduce((a, b) => a + b, 0) / regions.length;
        const isGameOver = avgInf >= 95 || newCure >= 100 || newDay >= 120;
        if (isGameOver) fetch("/api/track", { method: "POST" }).catch(() => {});

        return {
          ...prev,
          infected: newInfected,
          totalInfected: Math.round(totalPct),
          day: newDay,
          newsHeadlines: newHeadlines,
          gameOver: isGameOver,
          cureProgress: newCure,
          evolutionPoints: prev.evolutionPoints + epGained,
          totalEPEarned: prev.totalEPEarned + epGained,
        };
      });
    }, tickSpeed);
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [phase, isPaused, gameState.gameOver, tickSpeed]);

  useEffect(() => {
    if (gameState.gameOver && phase === "playing") setTimeout(() => setPhase("result"), 1500);
  }, [gameState.gameOver, phase]);

  // Mutation logic
  const getActiveByCategory = (cat: MutationCategory) =>
    gameState.activeMutations.filter((id) => allMutations.find((m) => m.id === id)?.category === cat);

  const canUnlock = (mutation: Mutation): { ok: boolean; reason?: string } => {
    if (gameState.activeMutations.includes(mutation.id)) return { ok: false, reason: "Already active" };
    if (gameState.evolutionPoints < mutation.epCost) return { ok: false, reason: `Need ${mutation.epCost} EP (have ${gameState.evolutionPoints})` };
    const activeInCat = getActiveByCategory(mutation.category).length;
    if (activeInCat >= SLOT_LIMITS[mutation.category]) return { ok: false, reason: `${mutation.category} slots full (${SLOT_LIMITS[mutation.category]} max)` };
    if (mutation.requires) {
      for (const req of mutation.requires) {
        if (!gameState.activeMutations.includes(req)) {
          const reqMut = allMutations.find((m) => m.id === req);
          return { ok: false, reason: `Requires: ${reqMut?.name ?? req}` };
        }
      }
    }
    return { ok: true };
  };

  const applyMutation = (mutation: Mutation) => {
    const check = canUnlock(mutation);
    if (!check.ok) return;
    setGameState((prev) => ({
      ...prev,
      activeMutations: [...prev.activeMutations, mutation.id],
      infectivity: prev.infectivity + mutation.infectivity,
      severity: prev.severity + mutation.severity,
      memeLevel: prev.memeLevel + mutation.memeLevel,
      evolutionPoints: prev.evolutionPoints - mutation.epCost,
    }));
  };

  const result = phase === "result" ? getResultTier(gameState) : null;

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#09090b] relative">
        {/* Ambient blobs */}
        <div className="fixed w-[600px] h-[600px] rounded-full blur-[160px] opacity-[0.035] pointer-events-none -top-[250px] left-[15%] bg-[#E05544]" />
        <div className="fixed w-[400px] h-[400px] rounded-full blur-[130px] opacity-[0.03] pointer-events-none bottom-[5%] right-[8%] bg-[#a78bfa]" />

        <main className="max-w-[1240px] mx-auto px-4 py-8 relative z-10">

          {/* ═══ INTRO ═══ */}
          {phase === "intro" && (
            <div className="text-center max-w-[640px] mx-auto" style={{ animation: "fadeInUp 0.5s ease both" }}>
              <Link to="/" className="text-[#6B6580] text-[0.82rem] hover:text-[#9B95A8] transition-colors mb-8 inline-block">
                ← back to tools
              </Link>
              <div className="text-[4rem] mb-4">🧠🦠</div>
              <h1 className="font-['Outfit'] font-black text-[clamp(2rem,5vw,3rem)] tracking-tight mb-4 text-[#F5F5F7]">
                Brainrot Pandemic
              </h1>
              <p className="text-[#9B95A8] text-[1.05rem] leading-relaxed mb-3">
                Your brainrot is <span className="text-[#E05544] font-semibold">Patient Zero</span>. Spread infection, earn Evolution Points, unlock a mutation tree with real prerequisites — and watch civilization dissolve.
              </p>
              <p className="text-[#6B6580] text-[0.85rem] font-['JetBrains_Mono'] mb-10">
                inspired by plague inc. but make it chronically online.
              </p>
              <button
                onClick={() => setPhase("setup")}
                className="bg-[#E05544] hover:bg-[#c9402f] text-white font-['Outfit'] font-bold text-[1rem] px-10 py-4 rounded-full cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(224,85,68,0.3)]"
              >
                🦠 Start Pandemic
              </button>
            </div>
          )}

          {/* ═══ PATIENT ZERO SELECT ═══ */}
          {phase === "setup" && (
            <div className="max-w-[640px] mx-auto" style={{ animation: "fadeInUp 0.5s ease both" }}>
              <h2 className="font-['Outfit'] font-extrabold text-[1.8rem] tracking-tight text-center mb-2 text-[#F5F5F7]">
                Choose Patient Zero
              </h2>
              <p className="text-[#6B6580] text-center text-[0.85rem] mb-8 font-['JetBrains_Mono']">
                who started the outbreak?
              </p>
              <div className="grid grid-cols-2 gap-3">
                {patientZeroOptions.map((pz) => (
                  <button
                    key={pz.id}
                    onClick={() => startGame(pz)}
                    className="bg-gradient-to-b from-[#2A2640] to-[#1E1A35] border border-[#3A3555]/50 rounded-2xl p-5 text-left cursor-pointer transition-all hover:border-[#E05544]/30 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(224,85,68,0.08)] group"
                  >
                    <span className="text-[2rem] block mb-2">{pz.emoji}</span>
                    <h3 className="font-['Outfit'] font-bold text-[1rem] text-[#F5F5F7] mb-1 group-hover:text-[#E05544] transition-colors">
                      {pz.label}
                    </h3>
                    <p className="text-[#6B6580] text-[0.78rem]">{pz.desc}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[0.62rem] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full bg-[#E05544]/10 text-[#E05544]">
                        +{pz.bonusInfectivity} infectivity
                      </span>
                      <span className="text-[0.62rem] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">
                        {pz.startEP} EP start
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ GAME PHASE ═══ */}
          {phase === "playing" && (
            <div style={{ animation: "fadeInUp 0.5s ease both" }}>
              {/* Breaking news */}
              {showNews && (
                <div className="fixed top-[68px] left-0 right-0 z-50 flex justify-center" style={{ animation: "fadeInDown 0.3s ease both" }}>
                  <div className="bg-[#E05544] text-white px-6 py-2.5 rounded-b-xl font-['JetBrains_Mono'] text-[0.75rem] font-semibold shadow-[0_4px_20px_rgba(224,85,68,0.4)] max-w-[90vw] text-center">
                    📰 BREAKING: {latestHeadline}
                  </div>
                </div>
              )}

              {/* EP notification */}
              {epNotif && (
                <div className="fixed top-[68px] left-0 right-0 z-50 flex justify-center" style={{ animation: "fadeInDown 0.3s ease both" }}>
                  <div className="bg-[#f59e0b] text-[#09090b] px-6 py-2.5 rounded-b-xl font-['JetBrains_Mono'] text-[0.75rem] font-bold shadow-[0_4px_20px_rgba(245,158,11,0.4)] max-w-[90vw] text-center">
                    ⚗️ {epNotif}
                  </div>
                </div>
              )}

              {/* TOP BAR: stats + controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
                <div className="flex items-center gap-5 flex-wrap">
                  <Stat label="DAY" value={String(gameState.day)} color="#9B95A8" />
                  <Stat label="INFECTED" value={`${gameState.totalInfected}%`} color="#E05544" />
                  <Stat label="MEME LVL" value={String(gameState.memeLevel)} color="#F5C518" />
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                    <span className="text-[#f59e0b] text-[0.72rem] font-['JetBrains_Mono'] font-bold">⚗️ {gameState.evolutionPoints} EP</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2640] border border-[#3A3555]/50 text-[#9B95A8] text-[0.75rem] font-['JetBrains_Mono'] cursor-pointer hover:border-[#5A5370] transition-all"
                  >
                    {isPaused ? "▶ PLAY" : "⏸ PAUSE"}
                  </button>
                  <button
                    onClick={() => setTickSpeed((s) => (s === 800 ? 400 : s === 400 ? 200 : 800))}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2640] border border-[#3A3555]/50 text-[#9B95A8] text-[0.75rem] font-['JetBrains_Mono'] cursor-pointer hover:border-[#5A5370] transition-all"
                  >
                    {tickSpeed === 800 ? "1×" : tickSpeed === 400 ? "2×" : "3×"}
                  </button>
                </div>
              </div>

              {/* Cure bar */}
              {gameState.cureProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['JetBrains_Mono'] text-[0.68rem] text-[#4ade80]">🧬 CURE PROGRESS</span>
                    <span className="font-['JetBrains_Mono'] text-[0.68rem] text-[#4ade80]">{Math.round(gameState.cureProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#1E1A35] rounded-full overflow-hidden">
                    <div className="h-full bg-[#4ade80] rounded-full transition-all duration-500" style={{ width: `${gameState.cureProgress}%` }} />
                  </div>
                </div>
              )}

              {/* MAIN SPLIT LAYOUT */}
              <div className="flex flex-col lg:flex-row gap-4">

                {/* ── LEFT: MAP ─────────────────────────── */}
                <div className="lg:w-[58%] flex-shrink-0">
                  <div className="rounded-2xl border border-[#2a2640] overflow-hidden" style={{ background: "linear-gradient(160deg, #0c0c18 0%, #09090b 100%)" }}>
                    {/* Ocean background */}
                    <svg viewBox="0 0 1000 500" className="w-full h-auto" style={{ minHeight: 260, display: "block" }}>
                      {/* Deep ocean fill */}
                      <rect x="0" y="0" width="1000" height="500" fill="#0a0f1e" />
                      {/* Subtle latitude lines */}
                      {[100, 200, 300, 400].map((y) => (
                        <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#111827" strokeWidth="0.8" />
                      ))}
                      {/* Longitude lines */}
                      {[200, 400, 600, 800].map((x) => (
                        <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#111827" strokeWidth="0.8" />
                      ))}
                      {/* Equator */}
                      <line x1="0" y1="260" x2="1000" y2="260" stroke="#1a2035" strokeWidth="1.2" strokeDasharray="8,8" />
                      <text x="8" y="258" fill="#1e2a40" fontSize="9" fontFamily="'JetBrains Mono', monospace">EQUATOR</text>
                      {/* Ocean label */}
                      <text x="340" y="420" textAnchor="middle" fill="#0f1628" fontSize="18" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="6">PACIFIC</text>
                      <text x="100" y="420" textAnchor="middle" fill="#0f1628" fontSize="14" fontFamily="'JetBrains Mono', monospace" fontWeight="800" letterSpacing="4">ATLANTIC</text>

                      {/* Regions */}
                      {regions.map((region) => {
                        const pct = gameState.infected[region.id] || 0;
                        return (
                          <g key={region.id}>
                            {/* Base land shadow */}
                            <path d={region.path} fill="#111520" transform="translate(2,3)" opacity="0.5" />
                            {/* Main land */}
                            <path
                              d={region.path}
                              fill={getInfectionColor(pct)}
                              stroke={pct > 0 ? getInfectionColor(pct) : "#252540"}
                              strokeWidth={pct > 0 ? 1.5 : 0.8}
                              style={{ filter: getInfectionGlow(pct), transition: "fill 0.6s ease, filter 0.6s ease" }}
                            />
                            {/* Border highlight */}
                            <path d={region.path} fill="none" stroke="#ffffff" strokeWidth="0.5" opacity={pct > 30 ? 0.08 : 0.04} />

                            {/* Pulse ring for spreading regions */}
                            {pct > 0 && pct < 98 && (
                              <circle cx={region.cx} cy={region.cy} r={6 + pct / 12} fill="none" stroke={getInfectionColor(pct)} strokeWidth="1" opacity="0.35">
                                <animate attributeName="r" from={6 + pct / 12} to={12 + pct / 8} dur="2.2s" repeatCount="indefinite" />
                                <animate attributeName="opacity" from="0.35" to="0" dur="2.2s" repeatCount="indefinite" />
                              </circle>
                            )}

                            {/* Region name */}
                            <text
                              x={region.cx} y={region.cy - 9}
                              textAnchor="middle"
                              fill={pct > 40 ? "#e4e4e7" : "#4a4a6a"}
                              fontSize="8.5"
                              fontFamily="'JetBrains Mono', monospace"
                              fontWeight="600"
                              style={{ transition: "fill 0.5s ease" }}
                            >
                              {region.name}
                            </text>
                            {/* Infection % */}
                            <text
                              x={region.cx} y={region.cy + 5}
                              textAnchor="middle"
                              fill={pct > 0 ? getInfectionColor(pct) : "#252545"}
                              fontSize={pct >= 100 ? 10 : 9}
                              fontFamily="'JetBrains Mono', monospace"
                              fontWeight="700"
                              style={{ transition: "fill 0.5s ease" }}
                            >
                              {Math.round(pct)}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Region bars */}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {regions.map((r) => {
                      const pct = gameState.infected[r.id] || 0;
                      return (
                        <div key={r.id} className="rounded-xl p-2.5 border border-[#2A2640]/60" style={{ background: "#0e0e1a" }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-['Outfit'] font-semibold text-[0.75rem] text-[#c4c4d4]">{r.name}</span>
                            <span className="font-['JetBrains_Mono'] text-[0.68rem] font-bold" style={{ color: getInfectionColor(pct) }}>
                              {Math.round(pct)}%
                            </span>
                          </div>
                          <div className="h-1 bg-[#1E1A35] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: getInfectionColor(pct) }} />
                          </div>
                          <div className="font-['JetBrains_Mono'] text-[0.58rem] text-[#3A3555] mt-0.5">
                            {Math.round((pct / 100) * r.population)}M / {r.population}M
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── RIGHT: MUTATION PANEL ─────────────── */}
                <div className="lg:flex-1 flex flex-col gap-3">
                  {/* EP status */}
                  <div className="rounded-2xl p-4 border" style={{ background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-['JetBrains_Mono'] text-[0.68rem] text-[#f59e0b] uppercase tracking-[0.12em]">⚗️ Evolution Points</span>
                      <span className="font-['JetBrains_Mono'] text-[1.4rem] font-black text-[#f59e0b]">{gameState.evolutionPoints}</span>
                    </div>
                    <p className="text-[#6B6580] text-[0.68rem] font-['JetBrains_Mono']">
                      Earn EP by infecting more of the world. Spend it to unlock mutations.
                    </p>
                    {/* Slots summary */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(Object.keys(SLOT_LIMITS) as MutationCategory[]).map((cat) => {
                        const used = getActiveByCategory(cat).length;
                        const max = SLOT_LIMITS[cat];
                        const meta = CAT_META[cat];
                        return (
                          <div key={cat} className="flex items-center gap-1.5 text-[0.62rem] font-['JetBrains_Mono']">
                            <span style={{ color: meta.color }}>{meta.label}</span>
                            <span style={{ color: used >= max ? meta.color : "#3A3555" }}>
                              {used}/{max}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(Object.keys(CAT_META) as MutationCategory[]).map((cat) => {
                      const meta = CAT_META[cat];
                      const used = getActiveByCategory(cat).length;
                      const max = SLOT_LIMITS[cat];
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className="flex-1 min-w-[70px] px-2 py-2 rounded-xl text-[0.68rem] font-['JetBrains_Mono'] font-semibold cursor-pointer transition-all"
                          style={{
                            background: isActive ? meta.bg : "rgba(26,26,40,0.8)",
                            border: `1px solid ${isActive ? meta.color + "60" : "rgba(58,53,85,0.4)"}`,
                            color: isActive ? meta.color : "#6B6580",
                          }}
                        >
                          <div>{meta.label}</div>
                          <div className="text-[0.58rem] mt-0.5 opacity-70">{used}/{max} slots</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mutation list for selected category */}
                  <div className="flex-1 flex flex-col gap-2 overflow-auto" style={{ maxHeight: "420px", minHeight: 0 }}>
                    {allMutations
                      .filter((m) => m.category === selectedCategory)
                      .map((mutation) => {
                        const active = gameState.activeMutations.includes(mutation.id);
                        const check = canUnlock(mutation);
                        const meta = CAT_META[mutation.category];
                        return (
                          <MutationCard
                            key={mutation.id}
                            mutation={mutation}
                            active={active}
                            canUnlock={check}
                            meta={meta}
                            onApply={() => applyMutation(mutation)}
                            currentEP={gameState.evolutionPoints}
                          />
                        );
                      })}
                  </div>

                  {/* Active mutations compact list */}
                  {gameState.activeMutations.length > 0 && (
                    <div className="rounded-xl p-3 border border-[#2A2640]/60" style={{ background: "#0e0e1a" }}>
                      <p className="text-[#6B6580] text-[0.62rem] font-['JetBrains_Mono'] uppercase tracking-[0.12em] mb-2">Active Mutations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {gameState.activeMutations.map((id) => {
                          const m = allMutations.find((x) => x.id === id);
                          if (!m) return null;
                          const meta = CAT_META[m.category];
                          return (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[0.65rem]"
                              style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
                            >
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

          {/* ═══ RESULT ═══ */}
          {phase === "result" && result && (
            <div className="max-w-[520px] mx-auto" style={{ animation: "fadeInUp 0.5s ease both" }}>
              <h2 className="font-['Outfit'] font-extrabold text-[1.5rem] text-center mb-6 text-[#F5F5F7] tracking-tight">
                Pandemic Complete
              </h2>
              <div
                id="brainrot-card"
                className="rounded-3xl overflow-hidden mb-8"
                style={{
                  background: `linear-gradient(135deg, #0f0f1a 0%, ${result.color}12 50%, #0f0f1a 100%)`,
                  border: `1px solid ${result.color}28`,
                }}
              >
                <div className="p-6 sm:p-8">
                  <div className="text-center mb-5">
                    <div className="text-[3.5rem] mb-2">{result.emoji}</div>
                    <div
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-['JetBrains_Mono'] text-[0.68rem] font-bold tracking-wider mb-3"
                      style={{ background: result.color + "14", color: result.color, border: `1px solid ${result.color}22` }}
                    >
                      GRADE: {result.grade}
                    </div>
                    <h3 className="font-['Outfit'] font-black text-[clamp(1.3rem,4vw,1.8rem)] tracking-tight" style={{ color: result.color }}>
                      {result.title}
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <StatBlock label="Infected" value={`${gameState.totalInfected}%`} color="#E05544" />
                    <StatBlock label="Days" value={String(gameState.day)} color="#F5C518" />
                    <StatBlock label="Mutations" value={String(gameState.activeMutations.length)} color="#a78bfa" />
                  </div>
                  <p className="text-[#9B95A8] text-[0.88rem] leading-relaxed text-center mb-4">{result.desc}</p>
                  <div className="rounded-xl p-4 text-center" style={{ background: result.color + "08", border: `1px solid ${result.color}14` }}>
                    <p className="text-[0.62rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider mb-1" style={{ color: result.color }}>
                      The Diagnosis
                    </p>
                    <p className="text-[#e4e4e7] text-[0.9rem] italic font-medium">"{result.roast}"</p>
                  </div>
                  <div className="text-center mt-5">
                    <p className="text-[#3A3555] text-[0.68rem] font-['JetBrains_Mono'] font-semibold">dafuqbro.com/brainrot</p>
                  </div>
                </div>
              </div>
              <ShareButtons
                cardId="brainrot-card"
                shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade} grade: "${result.title}" 🧠🦠 How cooked are you?`}
                accentColor={result.color}
              />
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setPhase("intro");
                    setGameState({ infected: Object.fromEntries(regions.map((r) => [r.id, 0])), totalInfected: 0, day: 0, activeMutations: [], infectivity: 10, severity: 5, memeLevel: 0, newsHeadlines: [], gameOver: false, cureProgress: 0, evolutionPoints: 0, totalEPEarned: 0 });
                    setPatientZero(null);
                  }}
                  className="text-[#6B6580] text-[0.88rem] hover:text-[#9B95A8] transition-colors cursor-pointer"
                >
                  ← Start a new pandemic
                </button>
              </div>
            </div>
          )}
        </main>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInDown {
            from { opacity: 0; transform: translateY(-10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
}

/* ═══════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════ */

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="font-['JetBrains_Mono'] text-[0.75rem]">
      <span className="text-[#6B6580]">{label} </span>
      <span className="font-bold" style={{ color }}>{value}</span>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center p-3 rounded-xl bg-[#1E1A35]/60">
      <div className="font-['JetBrains_Mono'] text-[1.25rem] font-bold" style={{ color }}>{value}</div>
      <div className="font-['JetBrains_Mono'] text-[0.58rem] text-[#6B6580] uppercase">{label}</div>
    </div>
  );
}

function MutationCard({
  mutation,
  active,
  canUnlock,
  meta,
  onApply,
  currentEP,
}: {
  mutation: Mutation;
  active: boolean;
  canUnlock: { ok: boolean; reason?: string };
  meta: { label: string; color: string; bg: string; border: string };
  onApply: () => void;
  currentEP: number;
}) {
  const locked = !active && !canUnlock.ok;
  const prereqNames = mutation.requires?.map((id) => allMutations.find((m) => m.id === id)?.name ?? id);

  return (
    <div
      className="rounded-xl p-3 border transition-all"
      style={{
        background: active ? meta.bg : locked ? "rgba(15,15,24,0.8)" : "rgba(20,18,32,0.9)",
        border: `1px solid ${active ? meta.color + "55" : locked ? "rgba(58,53,85,0.3)" : meta.border}`,
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <span className="text-[1.2rem] flex-shrink-0 mt-0.5">{mutation.emoji}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-['Outfit'] font-bold text-[0.82rem] text-[#F5F5F7] leading-tight">{mutation.name}</h4>
              {active && (
                <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded-full" style={{ background: meta.color + "20", color: meta.color }}>
                  ACTIVE
                </span>
              )}
            </div>
            <p className="text-[#6B6580] text-[0.68rem] leading-snug mt-0.5">{mutation.description}</p>

            {/* Prerequisites */}
            {prereqNames && prereqNames.length > 0 && (
              <p className="text-[0.62rem] font-['JetBrains_Mono'] mt-1" style={{ color: canUnlock.ok || active ? "#4ade8088" : "#f59e0b88" }}>
                {active ? "✓" : "→"} Requires: {prereqNames.join(", ")}
              </p>
            )}

            {/* Stat pills */}
            {!active && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {mutation.infectivity > 0 && (
                  <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#E05544]/10 text-[#E05544]">+{mutation.infectivity} inf</span>
                )}
                {mutation.memeLevel > 0 && (
                  <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#F5C518]/10 text-[#F5C518]">+{mutation.memeLevel} meme</span>
                )}
                {mutation.severity > 0 && (
                  <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#a78bfa]/10 text-[#a78bfa]">+{mutation.severity} sev</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Unlock button */}
        {!active && (
          <button
            onClick={onApply}
            disabled={!canUnlock.ok}
            title={canUnlock.reason}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: canUnlock.ok ? meta.bg : "rgba(58,53,85,0.2)",
              border: `1px solid ${canUnlock.ok ? meta.color + "55" : "rgba(58,53,85,0.3)"}`,
              opacity: canUnlock.ok ? 1 : 0.6,
            }}
          >
            <span className="font-['JetBrains_Mono'] text-[0.62rem] font-bold" style={{ color: canUnlock.ok ? meta.color : "#6B6580" }}>
              ⚗️{mutation.epCost}
            </span>
            <span className="font-['JetBrains_Mono'] text-[0.55rem]" style={{ color: canUnlock.ok ? meta.color : "#3A3555" }}>
              {canUnlock.ok ? "UNLOCK" : "LOCKED"}
            </span>
          </button>
        )}
      </div>

      {/* Locked reason tooltip */}
      {locked && canUnlock.reason && (
        <p className="text-[0.6rem] font-['JetBrains_Mono'] mt-1.5 px-1" style={{ color: "#f59e0b66" }}>
          ⚠ {canUnlock.reason}
        </p>
      )}
    </div>
  );
}
