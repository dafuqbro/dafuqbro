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
      "Your brainrot is spreading. Pick your patient zero symptoms, mutate your virus with drag-and-drop cards, and watch it infect the entire world. Plague Inc. meets internet culture.",
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
  resistance: number; // 0-1, higher = harder to infect
}

interface Mutation {
  id: string;
  emoji: string;
  name: string;
  description: string;
  infectivity: number;
  severity: number;
  memeLevel: number;
  category: "transmission" | "symptom" | "ability";
}

interface GameState {
  infected: Record<string, number>; // region id -> infection % (0-100)
  totalInfected: number;
  day: number;
  activeMutations: string[];
  infectivity: number;
  severity: number;
  memeLevel: number;
  newsHeadlines: string[];
  gameOver: boolean;
  cureProgress: number;
}

/* ═══════════════════════════════════════
   WORLD MAP REGIONS (simplified SVG paths)
   ═══════════════════════════════════════ */

const regions: Region[] = [
  { id: "na", name: "North America", path: "M50,80 L55,50 L100,35 L160,30 L200,45 L210,70 L195,100 L160,120 L120,130 L80,120 L55,100 Z", cx: 130, cy: 75, population: 580, resistance: 0.3 },
  { id: "sa", name: "South America", path: "M130,140 L155,135 L175,155 L180,200 L170,250 L155,275 L140,280 L125,260 L115,220 L110,180 L120,155 Z", cx: 150, cy: 210, population: 430, resistance: 0.25 },
  { id: "eu", name: "Europe", path: "M280,35 L310,28 L340,32 L360,45 L355,65 L340,75 L310,80 L285,75 L270,60 L275,45 Z", cx: 315, cy: 55, population: 750, resistance: 0.4 },
  { id: "af", name: "Africa", path: "M280,90 L320,85 L355,95 L365,130 L355,175 L335,210 L310,220 L285,210 L270,175 L265,135 L270,100 Z", cx: 315, cy: 150, population: 1400, resistance: 0.15 },
  { id: "as", name: "Asia", path: "M370,30 L430,25 L490,35 L520,55 L510,85 L480,100 L440,105 L400,95 L375,80 L365,55 Z", cx: 445, cy: 65, population: 4700, resistance: 0.35 },
  { id: "oc", name: "Oceania", path: "M470,170 L510,165 L540,175 L545,195 L530,210 L500,215 L475,205 L465,190 Z", cx: 505, cy: 190, population: 45, resistance: 0.45 },
];

/* ═══════════════════════════════════════
   MUTATIONS (drag-and-drop cards)
   ═══════════════════════════════════════ */

const allMutations: Mutation[] = [
  // Transmission
  { id: "doomscroll", emoji: "📱", name: "Doomscrolling", description: "Spreads through infinite feed addiction", infectivity: 15, severity: 5, memeLevel: 10, category: "transmission" },
  { id: "groupchat", emoji: "💬", name: "Group Chat Leak", description: "One screenshot infects entire friend circles", infectivity: 20, severity: 8, memeLevel: 15, category: "transmission" },
  { id: "repost", emoji: "🔁", name: "Repost Pandemic", description: "Content goes viral through mindless sharing", infectivity: 25, severity: 3, memeLevel: 20, category: "transmission" },
  { id: "fyp", emoji: "✨", name: "FYP Algorithm", description: "The algorithm force-feeds your brainrot to millions", infectivity: 30, severity: 5, memeLevel: 25, category: "transmission" },
  // Symptoms
  { id: "skibidi", emoji: "🚽", name: "Skibidi Syndrome", description: "Uncontrollable urge to say 'skibidi toilet'", infectivity: 5, severity: 20, memeLevel: 30, category: "symptom" },
  { id: "sigma", emoji: "🐺", name: "Sigma Delusion", description: "Victim believes they're on a sigma grindset", infectivity: 8, severity: 25, memeLevel: 20, category: "symptom" },
  { id: "npc", emoji: "🤖", name: "NPC Behavior", description: "Repeating the same 3 phrases in every conversation", infectivity: 10, severity: 15, memeLevel: 25, category: "symptom" },
  { id: "aura", emoji: "✨", name: "Aura Obsession", description: "Calculating aura points for every life event", infectivity: 12, severity: 10, memeLevel: 35, category: "symptom" },
  // Special abilities
  { id: "nocure", emoji: "🧬", name: "Meme Immunity", description: "Brainrot becomes resistant to touching grass", infectivity: 5, severity: 10, memeLevel: 15, category: "ability" },
  { id: "streamer", emoji: "🎮", name: "Streamer Mutation", description: "Infected hosts start livestreaming everything", infectivity: 18, severity: 12, memeLevel: 20, category: "ability" },
  { id: "delulu", emoji: "🦋", name: "Delulu Evolution", description: "Delusion becomes the solution. Unstoppable.", infectivity: 15, severity: 30, memeLevel: 40, category: "ability" },
  { id: "rizz", emoji: "😏", name: "Unspoken Rizz", description: "Brainrot spreads without words. Just vibes.", infectivity: 22, severity: 8, memeLevel: 30, category: "ability" },
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
    "Schools ban phones after students start speaking exclusively in TikTok audio",
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
   PATIENT ZERO OPTIONS
   ═══════════════════════════════════════ */

const patientZeroOptions = [
  { id: "doomscroller", emoji: "📱", label: "The Doomscroller", desc: "12+ hours daily screen time", bonusInfectivity: 10, bonusSeverity: 5, startRegion: "na" },
  { id: "shitposter", emoji: "💩", label: "The Shitposter", desc: "Posts 50 memes before breakfast", bonusInfectivity: 15, bonusSeverity: 8, startRegion: "eu" },
  { id: "tiktoker", emoji: "🎵", label: "The TikToker", desc: "Everything is content", bonusInfectivity: 20, bonusSeverity: 3, startRegion: "as" },
  { id: "gamer", emoji: "🎮", label: "The Gamer", desc: "Hasn't touched grass since 2019", bonusInfectivity: 8, bonusSeverity: 15, startRegion: "oc" },
];

/* ═══════════════════════════════════════
   RESULT TIERS
   ═══════════════════════════════════════ */

function getResultTier(state: GameState) {
  const avgInfection = Object.values(state.infected).reduce((a, b) => a + b, 0) / regions.length;
  const mutations = state.activeMutations.length;
  const totalMeme = state.memeLevel;

  if (avgInfection >= 90 && mutations >= 6)
    return { title: "EXTINCTION-LEVEL BRAINROT", emoji: "💀", color: "#E05544", grade: "S+", desc: "You didn't just infect the world — you ended civilization as we know it. Historians will study your brainrot for centuries. If they can still read.", roast: "You are the reason aliens won't visit us." };
  if (avgInfection >= 70)
    return { title: "GLOBAL PANDEMIC", emoji: "🌍", color: "#fb923c", grade: "S", desc: "Your brainrot has achieved what real pandemics dream of. Every continent is cooked. The WHO has given up.", roast: "Your screen time report should be classified as a weapon of mass destruction." };
  if (avgInfection >= 50)
    return { title: "CONTINENTAL CRISIS", emoji: "🦠", color: "#F5C518", grade: "A", desc: "Half the world is infected. Governments are scrambling. Your brainrot is on the news.", roast: "You're the reason your mom asks 'what's a sigma' at dinner." };
  if (avgInfection >= 30)
    return { title: "REGIONAL OUTBREAK", emoji: "📡", color: "#A89BC0", grade: "B", desc: "Your brainrot is spreading but hasn't gone fully global. You need more mutations.", roast: "Mid pandemic energy. Even COVID did better than this." };
  return { title: "CONTAINED INCIDENT", emoji: "🧪", color: "#8B7EA8", grade: "C", desc: "Your brainrot barely left your group chat. Embarrassing.", roast: "You couldn't even go viral. That's the real brainrot." };
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
  });
  const [availableMutations, setAvailableMutations] = useState<Mutation[]>([]);
  const [draggingMutation, setDraggingMutation] = useState<string | null>(null);
  const [showNews, setShowNews] = useState(false);
  const [latestHeadline, setLatestHeadline] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const [tickSpeed, setTickSpeed] = useState(800);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mapRef = useRef<SVGSVGElement>(null);

  // Initialize available mutations (random 6 from the pool)
  const initMutations = useCallback(() => {
    const shuffled = [...allMutations].sort(() => Math.random() - 0.5);
    setAvailableMutations(shuffled.slice(0, 8));
  }, []);

  // Start game
  const startGame = (pz: typeof patientZeroOptions[0]) => {
    setPatientZero(pz);
    const startInfected = Object.fromEntries(regions.map((r) => [r.id, 0]));
    startInfected[pz.startRegion] = 5;
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
    });
    initMutations();
    setPhase("playing");
    setIsPaused(false);
  };

  // Game tick
  useEffect(() => {
    if (phase !== "playing" || isPaused || gameState.gameOver) return;

    tickRef.current = setInterval(() => {
      setGameState((prev) => {
        const newInfected = { ...prev.infected };
        let anyChange = false;

        // Spread within regions
        for (const region of regions) {
          const current = newInfected[region.id];
          if (current <= 0) continue;
          if (current >= 100) continue;

          const spreadRate = (prev.infectivity / 100) * (1 - region.resistance) * (1 + prev.memeLevel / 200);
          const growth = Math.min(100 - current, current * spreadRate * 0.08 + spreadRate * 0.3);
          if (growth > 0.01) {
            newInfected[region.id] = Math.min(100, current + growth);
            anyChange = true;
          }
        }

        // Cross-region spread
        for (const region of regions) {
          if (newInfected[region.id] > 20) {
            for (const other of regions) {
              if (other.id === region.id) continue;
              if (newInfected[other.id] > 0) continue;
              const crossChance = (prev.infectivity / 500) * (newInfected[region.id] / 100);
              if (Math.random() < crossChance) {
                newInfected[other.id] = 1;
                anyChange = true;
              }
            }
          }
        }

        const totalPop = regions.reduce((a, r) => a + r.population, 0);
        const totalInf = regions.reduce((a, r) => a + (newInfected[r.id] / 100) * r.population, 0);
        const totalPct = (totalInf / totalPop) * 100;

        // Cure progress
        const newCure = Math.min(100, prev.cureProgress + (prev.day > 15 ? 0.8 - prev.memeLevel / 300 : 0));

        // News headlines
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

        // Check game over
        const avgInf = Object.values(newInfected).reduce((a, b) => a + b, 0) / regions.length;
        const isGameOver = avgInf >= 95 || newCure >= 100 || newDay >= 120;

        if (isGameOver) {
          // Track result
          fetch("/api/track", { method: "POST" }).catch(() => {});
        }

        return {
          ...prev,
          infected: newInfected,
          totalInfected: Math.round(totalPct),
          day: newDay,
          newsHeadlines: newHeadlines,
          gameOver: isGameOver,
          cureProgress: newCure,
        };
      });
    }, tickSpeed);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [phase, isPaused, gameState.gameOver, tickSpeed]);

  // When game over, transition to result
  useEffect(() => {
    if (gameState.gameOver && phase === "playing") {
      setTimeout(() => setPhase("result"), 1500);
    }
  }, [gameState.gameOver, phase]);

  // Apply mutation via drag and drop
  const applyMutation = (mutationId: string) => {
    const mutation = allMutations.find((m) => m.id === mutationId);
    if (!mutation) return;
    if (gameState.activeMutations.includes(mutationId)) return;

    setGameState((prev) => ({
      ...prev,
      activeMutations: [...prev.activeMutations, mutationId],
      infectivity: prev.infectivity + mutation.infectivity,
      severity: prev.severity + mutation.severity,
      memeLevel: prev.memeLevel + mutation.memeLevel,
    }));

    setAvailableMutations((prev) => prev.filter((m) => m.id !== mutationId));
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, mutationId: string) => {
    e.dataTransfer.setData("text/plain", mutationId);
    setDraggingMutation(mutationId);
  };

  const handleDragEnd = () => {
    setDraggingMutation(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const mutationId = e.dataTransfer.getData("text/plain");
    if (mutationId) applyMutation(mutationId);
    setDraggingMutation(null);
  };

  // Touch drag support
  const [touchDragging, setTouchDragging] = useState<string | null>(null);

  const handleTouchApply = (mutationId: string) => {
    applyMutation(mutationId);
  };

  // Color for infection level
  const getInfectionColor = (pct: number) => {
    if (pct <= 0) return "#2A2640";
    if (pct < 15) return "#4a6741";
    if (pct < 35) return "#8B8B2A";
    if (pct < 60) return "#C4841D";
    if (pct < 85) return "#C44A1D";
    return "#E05544";
  };

  const getInfectionGlow = (pct: number) => {
    if (pct <= 0) return "none";
    const intensity = Math.min(1, pct / 100);
    return `drop-shadow(0 0 ${4 + intensity * 12}px ${getInfectionColor(pct)}80)`;
  };

  const result = phase === "result" ? getResultTier(gameState) : null;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#09090b] relative">
        {/* Ambient */}
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none -top-[200px] left-[20%] bg-[#E05544]" />
        <div className="fixed w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.04] pointer-events-none bottom-[10%] right-[10%] bg-[#4ade80]" />

        <main className="max-w-[1120px] mx-auto px-4 py-8 relative z-10">
          {/* ═══ INTRO ═══ */}
          {phase === "intro" && (
            <div className="text-center max-w-[640px] mx-auto animate-fadeInUp">
              <Link to="/" className="text-[#6B6580] text-[0.82rem] hover:text-[#9B95A8] transition-colors mb-8 inline-block">
                ← back to tools
              </Link>
              <div className="text-[4rem] mb-4">🧠🦠</div>
              <h1 className="font-['Outfit'] font-black text-[clamp(2rem,5vw,3rem)] tracking-tight mb-4 text-[#F5F5F7]">
                Brainrot Pandemic
              </h1>
              <p className="text-[#9B95A8] text-[1.1rem] leading-relaxed mb-3">
                Your brainrot is <span className="text-[#E05544] font-semibold">Patient Zero</span>. Choose your origin, mutate your virus with drag-and-drop cards, and watch it infect the entire world.
              </p>
              <p className="text-[#6B6580] text-[0.88rem] font-['JetBrains_Mono'] mb-10">
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
            <div className="max-w-[640px] mx-auto animate-fadeInUp">
              <h2 className="font-['Outfit'] font-extrabold text-[1.8rem] tracking-tight text-center mb-2 text-[#F5F5F7]">
                Choose Patient Zero
              </h2>
              <p className="text-[#6B6580] text-center text-[0.88rem] mb-8 font-['JetBrains_Mono']">
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
                    <div className="mt-3 flex gap-2">
                      <span className="text-[0.65rem] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full bg-[#E05544]/10 text-[#E05544]">
                        +{pz.bonusInfectivity} infectivity
                      </span>
                      <span className="text-[0.65rem] font-['JetBrains_Mono'] px-2 py-0.5 rounded-full bg-[#fb923c]/10 text-[#fb923c]">
                        +{pz.bonusSeverity} severity
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ═══ GAME PHASE ═══ */}
          {phase === "playing" && (
            <div className="animate-fadeInUp">
              {/* News ticker */}
              {showNews && (
                <div className="fixed top-[72px] left-0 right-0 z-50 flex justify-center animate-fadeInDown">
                  <div className="bg-[#E05544] text-white px-6 py-2.5 rounded-b-xl font-['JetBrains_Mono'] text-[0.78rem] font-semibold shadow-[0_4px_20px_rgba(224,85,68,0.4)] max-w-[90vw] text-center">
                    📰 BREAKING: {latestHeadline}
                  </div>
                </div>
              )}

              {/* Stats bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="font-['JetBrains_Mono'] text-[0.78rem]">
                    <span className="text-[#6B6580]">DAY</span>{" "}
                    <span className="text-[#F5F5F7] font-bold">{gameState.day}</span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-[0.78rem]">
                    <span className="text-[#6B6580]">INFECTED</span>{" "}
                    <span className="text-[#E05544] font-bold">{gameState.totalInfected}%</span>
                  </div>
                  <div className="font-['JetBrains_Mono'] text-[0.78rem]">
                    <span className="text-[#6B6580]">MEME LVL</span>{" "}
                    <span className="text-[#F5C518] font-bold">{gameState.memeLevel}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2640] border border-[#3A3555]/50 text-[#9B95A8] text-[0.78rem] font-['JetBrains_Mono'] cursor-pointer hover:bg-[#2A2640]/80 transition-all"
                  >
                    {isPaused ? "▶ PLAY" : "⏸ PAUSE"}
                  </button>
                  <button
                    onClick={() => setTickSpeed((s) => (s === 800 ? 400 : s === 400 ? 200 : 800))}
                    className="px-3 py-1.5 rounded-lg bg-[#2A2640] border border-[#3A3555]/50 text-[#9B95A8] text-[0.78rem] font-['JetBrains_Mono'] cursor-pointer hover:bg-[#2A2640]/80 transition-all"
                  >
                    {tickSpeed === 800 ? "1×" : tickSpeed === 400 ? "2×" : "3×"}
                  </button>
                </div>
              </div>

              {/* Cure progress */}
              {gameState.cureProgress > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['JetBrains_Mono'] text-[0.7rem] text-[#4ade80]">🧬 CURE PROGRESS</span>
                    <span className="font-['JetBrains_Mono'] text-[0.7rem] text-[#4ade80]">{Math.round(gameState.cureProgress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2A2640] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4ade80] rounded-full transition-all duration-500"
                      style={{ width: `${gameState.cureProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* World map */}
              <div
                className={`relative rounded-2xl border overflow-hidden mb-4 transition-all ${
                  draggingMutation ? "border-[#E05544]/40 shadow-[0_0_30px_rgba(224,85,68,0.1)]" : "border-[#3A3555]/50"
                }`}
                style={{ background: "linear-gradient(180deg, #0d1117 0%, #09090b 100%)" }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {draggingMutation && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="px-6 py-3 rounded-xl bg-[#E05544]/20 border border-[#E05544]/30 backdrop-blur-sm">
                      <span className="font-['Outfit'] font-bold text-[#E05544] text-[0.92rem]">
                        🦠 Drop to mutate!
                      </span>
                    </div>
                  </div>
                )}
                <svg
                  ref={mapRef}
                  viewBox="0 0 600 300"
                  className="w-full h-auto"
                  style={{ minHeight: 220 }}
                >
                  {/* Grid lines */}
                  {[...Array(12)].map((_, i) => (
                    <line key={`vg${i}`} x1={i * 50} y1={0} x2={i * 50} y2={300} stroke="#1E1A35" strokeWidth={0.5} />
                  ))}
                  {[...Array(6)].map((_, i) => (
                    <line key={`hg${i}`} x1={0} y1={i * 50} x2={600} y2={i * 50} stroke="#1E1A35" strokeWidth={0.5} />
                  ))}

                  {/* Regions */}
                  {regions.map((region) => {
                    const pct = gameState.infected[region.id] || 0;
                    return (
                      <g key={region.id}>
                        <path
                          d={region.path}
                          fill={getInfectionColor(pct)}
                          stroke={pct > 0 ? getInfectionColor(pct) : "#3A3555"}
                          strokeWidth={1}
                          style={{
                            filter: getInfectionGlow(pct),
                            transition: "fill 0.5s ease, filter 0.5s ease",
                          }}
                        />
                        {/* Infection pulse */}
                        {pct > 0 && pct < 100 && (
                          <circle cx={region.cx} cy={region.cy} r={3 + pct / 10} fill="none" stroke={getInfectionColor(pct)} strokeWidth={1} opacity={0.4}>
                            <animate attributeName="r" from={3 + pct / 10} to={8 + pct / 5} dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from={0.4} to={0} dur="2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        {/* Labels */}
                        <text
                          x={region.cx}
                          y={region.cy - 8}
                          textAnchor="middle"
                          fill={pct > 50 ? "#F5F5F7" : "#6B6580"}
                          fontSize={8}
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight={600}
                        >
                          {region.name}
                        </text>
                        <text
                          x={region.cx}
                          y={region.cy + 5}
                          textAnchor="middle"
                          fill={pct > 0 ? getInfectionColor(pct) : "#3A3555"}
                          fontSize={10}
                          fontFamily="'JetBrains Mono', monospace"
                          fontWeight={700}
                        >
                          {Math.round(pct)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Mutation cards */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['JetBrains_Mono'] text-[0.72rem] text-[#6B6580] uppercase tracking-[0.15em]">
                    🧬 Mutations — drag onto map or tap to apply
                  </h3>
                  <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#3A3555]">
                    {gameState.activeMutations.length} active
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableMutations.map((m) => (
                    <div
                      key={m.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, m.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleTouchApply(m.id)}
                      className={`relative p-3 rounded-xl border cursor-grab active:cursor-grabbing transition-all select-none ${
                        m.category === "transmission"
                          ? "bg-[#E05544]/8 border-[#E05544]/20 hover:border-[#E05544]/40"
                          : m.category === "symptom"
                          ? "bg-[#fb923c]/8 border-[#fb923c]/20 hover:border-[#fb923c]/40"
                          : "bg-[#A89BC0]/8 border-[#A89BC0]/20 hover:border-[#A89BC0]/40"
                      } hover:-translate-y-0.5 hover:shadow-lg`}
                    >
                      <span className="text-[0.5rem] font-['JetBrains_Mono'] uppercase tracking-wider absolute top-2 right-2" style={{
                        color: m.category === "transmission" ? "#E05544" : m.category === "symptom" ? "#fb923c" : "#A89BC0"
                      }}>
                        {m.category}
                      </span>
                      <span className="text-[1.3rem] block mb-1">{m.emoji}</span>
                      <h4 className="font-['Outfit'] font-bold text-[0.82rem] text-[#F5F5F7] mb-0.5 leading-tight">
                        {m.name}
                      </h4>
                      <p className="text-[#6B6580] text-[0.68rem] leading-snug mb-2">{m.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {m.infectivity > 0 && (
                          <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#E05544]/10 text-[#E05544]">
                            +{m.infectivity} inf
                          </span>
                        )}
                        {m.memeLevel > 0 && (
                          <span className="text-[0.55rem] font-['JetBrains_Mono'] px-1.5 py-0.5 rounded bg-[#F5C518]/10 text-[#F5C518]">
                            +{m.memeLevel} meme
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {availableMutations.length === 0 && (
                  <p className="text-center text-[#3A3555] text-[0.82rem] font-['JetBrains_Mono'] py-6">
                    all mutations deployed. watch it burn. 🔥
                  </p>
                )}
              </div>

              {/* Active mutations strip */}
              {gameState.activeMutations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-[#6B6580] text-[0.7rem] font-['JetBrains_Mono'] self-center">ACTIVE:</span>
                  {gameState.activeMutations.map((id) => {
                    const m = allMutations.find((x) => x.id === id);
                    return m ? (
                      <span key={id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#2A2640] border border-[#3A3555]/50 text-[0.72rem] text-[#9B95A8]">
                        {m.emoji} {m.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Region breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {regions.map((r) => {
                  const pct = gameState.infected[r.id] || 0;
                  return (
                    <div key={r.id} className="bg-[#1E1A35] rounded-xl p-3 border border-[#3A3555]/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Outfit'] font-semibold text-[0.82rem] text-[#F5F5F7]">{r.name}</span>
                        <span className="font-['JetBrains_Mono'] text-[0.7rem] font-bold" style={{ color: getInfectionColor(pct) }}>
                          {Math.round(pct)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#09090b] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: getInfectionColor(pct) }}
                        />
                      </div>
                      <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#3A3555] mt-1">
                        {Math.round((pct / 100) * r.population)}M / {r.population}M
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══ RESULT ═══ */}
          {phase === "result" && result && (
            <div className="max-w-[520px] mx-auto animate-fadeInUp">
              <h2 className="font-['Outfit'] font-extrabold text-[1.5rem] text-center mb-6 text-[#F5F5F7] tracking-tight">
                Pandemic Complete
              </h2>

              {/* Result card */}
              <div
                id="brainrot-card"
                className="rounded-3xl overflow-hidden mb-8"
                style={{
                  background: `linear-gradient(135deg, #0f0f1a 0%, ${result.color}15 50%, #0f0f1a 100%)`,
                  border: `1px solid ${result.color}30`,
                }}
              >
                <div className="p-6 sm:p-8">
                  {/* Grade */}
                  <div className="text-center mb-5">
                    <div className="text-[3.5rem] mb-2">{result.emoji}</div>
                    <div
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-['JetBrains_Mono'] text-[0.7rem] font-bold tracking-wider mb-3"
                      style={{ background: result.color + "15", color: result.color, border: `1px solid ${result.color}25` }}
                    >
                      GRADE: {result.grade}
                    </div>
                    <h3
                      className="font-['Outfit'] font-black text-[clamp(1.3rem,4vw,1.8rem)] tracking-tight"
                      style={{ color: result.color }}
                    >
                      {result.title}
                    </h3>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="text-center p-3 rounded-xl bg-[#1E1A35]/60">
                      <div className="font-['JetBrains_Mono'] text-[1.3rem] font-bold text-[#E05544]">{gameState.totalInfected}%</div>
                      <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#6B6580] uppercase">Infected</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-[#1E1A35]/60">
                      <div className="font-['JetBrains_Mono'] text-[1.3rem] font-bold text-[#F5C518]">{gameState.day}</div>
                      <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#6B6580] uppercase">Days</div>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-[#1E1A35]/60">
                      <div className="font-['JetBrains_Mono'] text-[1.3rem] font-bold text-[#A89BC0]">{gameState.activeMutations.length}</div>
                      <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#6B6580] uppercase">Mutations</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[#9B95A8] text-[0.88rem] leading-relaxed text-center mb-4">
                    {result.desc}
                  </p>

                  {/* Roast */}
                  <div
                    className="rounded-xl p-4 text-center"
                    style={{ background: result.color + "08", border: `1px solid ${result.color}15` }}
                  >
                    <p className="text-[0.65rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider mb-1" style={{ color: result.color }}>
                      The Diagnosis
                    </p>
                    <p className="text-[#e4e4e7] text-[0.92rem] italic font-medium">
                      "{result.roast}"
                    </p>
                  </div>

                  {/* Branding */}
                  <div className="text-center mt-5">
                    <p className="text-[#3A3555] text-[0.7rem] font-['JetBrains_Mono'] font-semibold">
                      dafuqbro.com/brainrot
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <ShareButtons
                cardId="brainrot-card"
                shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade} grade: "${result.title}" 🧠🦠 How cooked are you?`}
                accentColor={result.color}
              />

              {/* Try again */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setPhase("intro");
                    setGameState({
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
                    });
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
      </div>
      <Footer />
    </>
  );
}
