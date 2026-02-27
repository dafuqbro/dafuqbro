import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "What Trendy Food Are You? — DaFuqBro" },
  {
    name: "description",
    content:
      "Take the quiz to find out which trendy food matches your personality. Are you matcha, boba, Dubai chocolate, or something worse? Find out now.",
  },
  { property: "og:title", content: "What Trendy Food Are You? — DaFuqBro" },
  { property: "og:description", content: "Take the quiz to find out which trendy food matches your personality." },
  { name: "twitter:card", content: "summary_large_image" },
];

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface Question {
  id: string;
  emoji: string;
  question: string;
  options: { value: string; label: string; traits: Record<string, number> }[];
}

// Trait dimensions: basic, chaotic, aesthetic, pretentious, healthy, mysterious, controversial, wholesome
const questions: Question[] = [
  {
    id: "morning",
    emoji: "☀️",
    question: "What does your morning routine look like?",
    options: [
      { value: "a", label: "5 AM gym, cold shower, journaling", traits: { healthy: 3, pretentious: 2 } },
      { value: "b", label: "Scroll phone for 45 minutes, panic", traits: { chaotic: 3, basic: 1 } },
      { value: "c", label: "Aesthetic coffee + curated playlist", traits: { aesthetic: 3, pretentious: 1 } },
      { value: "d", label: "What morning? I wake up at 2 PM", traits: { chaotic: 2, mysterious: 2 } },
    ],
  },
  {
    id: "social",
    emoji: "📱",
    question: "Your social media presence is...",
    options: [
      { value: "a", label: "Carefully curated grid, matching colors", traits: { aesthetic: 3, pretentious: 2 } },
      { value: "b", label: "Memes, unhinged stories, zero filter", traits: { chaotic: 3, wholesome: 1 } },
      { value: "c", label: "I post once a year and it's a sunset", traits: { mysterious: 3, basic: 1 } },
      { value: "d", label: "Wellness tips & smoothie recipes", traits: { healthy: 3, pretentious: 1 } },
    ],
  },
  {
    id: "conflict",
    emoji: "⚡",
    question: "Someone starts drama. You...",
    options: [
      { value: "a", label: "Grab popcorn and watch it unfold", traits: { chaotic: 2, mysterious: 2 } },
      { value: "b", label: "Write a 7-paragraph response", traits: { controversial: 3, chaotic: 1 } },
      { value: "c", label: "\"I'm not getting involved\" (gets involved)", traits: { basic: 2, chaotic: 2 } },
      { value: "d", label: "Mediate and restore peace immediately", traits: { wholesome: 3, healthy: 1 } },
    ],
  },
  {
    id: "weekend",
    emoji: "🌴",
    question: "Your ideal weekend is...",
    options: [
      { value: "a", label: "Farmers market → brunch → bookshop", traits: { aesthetic: 2, pretentious: 2, wholesome: 1 } },
      { value: "b", label: "Doing absolutely nothing and thriving", traits: { mysterious: 2, basic: 1, healthy: 1 } },
      { value: "c", label: "Club → afterparty → regret → repeat", traits: { chaotic: 3, controversial: 1 } },
      { value: "d", label: "Trying a new hobby that lasts 3 days", traits: { chaotic: 1, aesthetic: 1, wholesome: 2 } },
    ],
  },
  {
    id: "fashion",
    emoji: "👗",
    question: "Your style can be described as...",
    options: [
      { value: "a", label: "Clean girl aesthetic, neutral tones", traits: { aesthetic: 3, basic: 2 } },
      { value: "b", label: "Whatever was on the floor this morning", traits: { chaotic: 3 } },
      { value: "c", label: "All black everything, always", traits: { mysterious: 3, controversial: 1 } },
      { value: "d", label: "Bold, loud, conversation-starting fits", traits: { controversial: 2, aesthetic: 1, chaotic: 1 } },
    ],
  },
  {
    id: "friend",
    emoji: "👥",
    question: "In your friend group, you're...",
    options: [
      { value: "a", label: "The planner who makes the reservations", traits: { wholesome: 2, pretentious: 2 } },
      { value: "b", label: "The wildcard no one can predict", traits: { chaotic: 3, controversial: 1 } },
      { value: "c", label: "The therapist friend everyone vents to", traits: { wholesome: 3, healthy: 1 } },
      { value: "d", label: "The one who shows up late but makes it worth it", traits: { aesthetic: 2, mysterious: 2 } },
    ],
  },
  {
    id: "guilty",
    emoji: "🤫",
    question: "Your guilty pleasure is...",
    options: [
      { value: "a", label: "Reality TV. All of it. No shame.", traits: { basic: 3, chaotic: 1 } },
      { value: "b", label: "3 AM Wikipedia rabbit holes", traits: { mysterious: 2, pretentious: 2 } },
      { value: "c", label: "Spending $47 on a candle", traits: { aesthetic: 2, pretentious: 2 } },
      { value: "d", label: "Eating cereal for dinner and calling it self-care", traits: { chaotic: 2, wholesome: 1, healthy: -1 } },
    ],
  },
  {
    id: "motto",
    emoji: "💭",
    question: "Which motto resonates most?",
    options: [
      { value: "a", label: "\"Life's too short for bad vibes\"", traits: { wholesome: 2, healthy: 2 } },
      { value: "b", label: "\"I didn't choose the chaos, the chaos chose me\"", traits: { chaotic: 3, controversial: 1 } },
      { value: "c", label: "\"Less is more\" (owns 400 things)", traits: { aesthetic: 2, pretentious: 2, basic: 1 } },
      { value: "d", label: "\"I'm not weird, I'm limited edition\"", traits: { mysterious: 2, controversial: 1, chaotic: 1 } },
    ],
  },
];

interface FoodResult {
  id: string;
  emoji: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  colorDark: string;
  stats: { label: string; value: string }[];
  keywords: string[];
  roast: string;
  dominantTraits: string[];
}

const foodResults: FoodResult[] = [
  {
    id: "matcha",
    emoji: "🍵",
    name: "Matcha",
    tagline: "Trendy, basic, and overpriced — just like you.",
    description:
      "You curate your life like an Instagram feed. Everything has to look good, feel good, and preferably be photographed before consumed. You've told at least 3 people that matcha is 'so much better than coffee' this week.",
    color: "#86efac",
    colorDark: "#166534",
    stats: [
      { label: "Aesthetic Score", value: "97%" },
      { label: "Caffeine Dependence", value: "Lethal" },
      { label: "Personality", value: "Borrowed" },
      { label: "Chance of Being Basic", value: "Confirmed" },
    ],
    keywords: ["matcha", "aesthetic", "trendy", "basic"],
    roast: "Your entire personality is a Pinterest board.",
    dominantTraits: ["aesthetic", "pretentious", "basic"],
  },
  {
    id: "dubai_chocolate",
    emoji: "🍫",
    name: "Dubai Chocolate",
    tagline: "All hype, lowkey delicious.",
    description:
      "You're the person who always knows about things before they go viral. You love being first, and you love even more telling people you were first. You're expensive, extra, and weirdly addictive.",
    color: "#d4a574",
    colorDark: "#78350f",
    stats: [
      { label: "Hype Level", value: "Maximum" },
      { label: "Substance", value: "Debatable" },
      { label: "Cost", value: "$47/bar" },
      { label: "Worth It?", value: "...Kinda?" },
    ],
    keywords: ["dubai chocolate", "hype", "luxury", "extra"],
    roast: "You spent $50 on chocolate because TikTok told you to.",
    dominantTraits: ["pretentious", "aesthetic", "controversial"],
  },
  {
    id: "boba",
    emoji: "🧋",
    name: "Boba Tea",
    tagline: "Fun exterior, complex interior.",
    description:
      "You're the life of the party who also has a hidden depth most people never see. Colorful on the outside, surprising on the inside. People underestimate you constantly, and you're honestly fine with that.",
    color: "#c084fc",
    colorDark: "#581c87",
    stats: [
      { label: "Layers", value: "∞" },
      { label: "Sugar Level", value: "Concerning" },
      { label: "Friend Count", value: "Quality > Qty" },
      { label: "Vibe", value: "Immaculate" },
    ],
    keywords: ["boba", "colorful", "layered", "fun"],
    roast: "You're 80% sugar and 20% personality. The tapioca pearls are doing all the heavy lifting.",
    dominantTraits: ["wholesome", "aesthetic", "chaotic"],
  },
  {
    id: "kombucha",
    emoji: "🫧",
    name: "Kombucha",
    tagline: "An acquired taste that thinks it's better than everyone.",
    description:
      "You've been on a 'wellness journey' for 3 years and you won't let anyone forget it. You judge people's grocery carts. Your gut microbiome is your entire personality. You're healthy, you're thriving, and you're absolutely insufferable about it.",
    color: "#fbbf24",
    colorDark: "#78350f",
    stats: [
      { label: "Health Obsession", value: "Clinical" },
      { label: "Superiority Complex", value: "Active" },
      { label: "Gut Health", value: "Thriving" },
      { label: "Fun at Parties", value: "Debatable" },
    ],
    keywords: ["kombucha", "healthy", "wellness", "fermented"],
    roast: "You brought your own snacks to the party and they all contain turmeric.",
    dominantTraits: ["healthy", "pretentious"],
  },
  {
    id: "beef_tallow",
    emoji: "🥩",
    name: "Beef Tallow",
    tagline: "Controversial, weirdly effective, impossible to ignore.",
    description:
      "You don't follow trends — you start arguments about them. While everyone was using seed oils, you went full ancestral and haven't shut up since. You're polarizing, passionate, and probably right about more things than people want to admit.",
    color: "#f87171",
    colorDark: "#7f1d1d",
    stats: [
      { label: "Controversy Level", value: "Maximum" },
      { label: "Confidence", value: "Unshakeable" },
      { label: "Friends Lost to Opinions", value: "Several" },
      { label: "Correct?", value: "Annoyingly Yes" },
    ],
    keywords: ["beef tallow", "controversial", "ancestral", "bold"],
    roast: "You've ruined at least 3 dinner parties with your takes on seed oils.",
    dominantTraits: ["controversial", "chaotic", "healthy"],
  },
  {
    id: "ube",
    emoji: "🟣",
    name: "Ube",
    tagline: "Aesthetic queen. Substance optional.",
    description:
      "You exist to be photographed. Your entire life is optimized for visual appeal — your food, your outfits, your apartment, your emotional vulnerability. Everything is purple-tinted and Instagram-ready.",
    color: "#a78bfa",
    colorDark: "#4c1d95",
    stats: [
      { label: "Photo-Worthiness", value: "100%" },
      { label: "Flavor Profile", value: "Subtle" },
      { label: "Color Coordination", value: "Extreme" },
      { label: "Depth", value: "Loading..." },
    ],
    keywords: ["ube", "purple", "aesthetic", "instagram"],
    roast: "You chose your apartment based on how it looks in golden hour.",
    dominantTraits: ["aesthetic", "basic", "mysterious"],
  },
  {
    id: "miso",
    emoji: "🍜",
    name: "Miso",
    tagline: "Underrated, complex, and weirdly comforting.",
    description:
      "You're the friend everyone calls when they're having a crisis at 2 AM. Warm, dependable, and way more complex than people give you credit for. You don't need to be the loudest in the room — your depth speaks for itself.",
    color: "#fb923c",
    colorDark: "#7c2d12",
    stats: [
      { label: "Warmth", value: "Maximum" },
      { label: "Complexity", value: "Hidden" },
      { label: "Appreciation", value: "Underrated" },
      { label: "Comfort Level", value: "∞" },
    ],
    keywords: ["miso", "comfort", "umami", "underrated"],
    roast: "You're everyone's emotional support human and nobody asks how YOU'RE doing.",
    dominantTraits: ["wholesome", "mysterious", "healthy"],
  },
  {
    id: "ghee",
    emoji: "🧈",
    name: "Ghee",
    tagline: "Ancient wisdom in a trendy package.",
    description:
      "You've been cool since before it was cool. You're the OG that trends keep rediscovering. While everyone else is chasing the latest thing, you've been quietly being excellent the whole time. Timeless energy.",
    color: "#fde047",
    colorDark: "#713f12",
    stats: [
      { label: "Timelessness", value: "Eternal" },
      { label: "Trend Cycle Position", value: "Above It" },
      { label: "Smoke Point", value: "Very High" },
      { label: "Drama Tolerance", value: "Zero" },
    ],
    keywords: ["ghee", "clarified", "ancient", "timeless"],
    roast: "You say 'I was into that years ago' about literally everything.",
    dominantTraits: ["mysterious", "pretentious", "wholesome"],
  },
];

function matchFood(answers: Record<string, string>): FoodResult {
  // Tally traits
  const traits: Record<string, number> = {
    basic: 0, chaotic: 0, aesthetic: 0, pretentious: 0,
    healthy: 0, mysterious: 0, controversial: 0, wholesome: 0,
  };

  for (const q of questions) {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    if (chosen) {
      for (const [trait, val] of Object.entries(chosen.traits)) {
        traits[trait] = (traits[trait] || 0) + val;
      }
    }
  }

  // Score each food by how well traits match
  let bestFood = foodResults[0];
  let bestScore = -Infinity;

  for (const food of foodResults) {
    let score = 0;
    for (const t of food.dominantTraits) {
      score += (traits[t] || 0) * 3;
    }
    // Small penalty for traits that are very low for this food
    for (const [t, v] of Object.entries(traits)) {
      if (!food.dominantTraits.includes(t) && v > 5) {
        score -= 1;
      }
    }
    // Add small random factor to prevent ties
    score += Math.random() * 0.5;
    if (score > bestScore) {
      bestScore = score;
      bestFood = food;
    }
  }

  return bestFood;
}

/* ═══════════════════════════════════════
   FOOD RAIN CANVAS
   ═══════════════════════════════════════ */

function FoodRain({ emoji, color }: { emoji: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<
    { x: number; y: number; vy: number; vx: number; size: number; rotation: number; rotSpeed: number; opacity: number }[]
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    // Spawn initial particles
    for (let i = 0; i < 30; i++) {
      particles.current.push({
        x: Math.random() * w,
        y: Math.random() * h * -1.5,
        vy: 0.8 + Math.random() * 1.5,
        vx: (Math.random() - 0.5) * 0.8,
        size: 16 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.4 + Math.random() * 0.6,
      });
    }

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles.current) {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.rotSpeed;

        if (p.y > h + 40) {
          p.y = -40;
          p.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, 0, 0);
        ctx.restore();
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, [emoji, color]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      data-html2canvas-ignore="true"
    />
  );
}

/* ═══════════════════════════════════════
   SCORE RING (animated fill)
   ═══════════════════════════════════════ */

function MatchRing({ percentage, color }: { percentage: number; color: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number;
    const duration = 1800;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setProgress(ease(t) * percentage);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [percentage]);

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      <circle
        cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="8"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 64 64)"
        style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
      />
      <text x="64" y="58" textAnchor="middle" fill="#f4f4f5" fontSize="28" fontWeight="800" fontFamily="Outfit">
        {Math.round(progress)}%
      </text>
      <text x="64" y="78" textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="500" fontFamily="Outfit">
        MATCH
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════
   GENERATING OVERLAY
   ═══════════════════════════════════════ */

const calcMessages = [
  "Analyzing your personality...",
  "Cross-referencing with food science...",
  "Consulting the TikTok algorithm...",
  "Judging your life choices...",
  "Matching flavor profile to personality...",
  "Calculating your basic-ness index...",
  "Asking the farmers market...",
  "Running vibes through the blender...",
];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */

export default function FoodQuiz() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "calculating" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FoodResult | null>(null);
  const [calcMsg, setCalcMsg] = useState(0);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [matchPct, setMatchPct] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Calculating phase
  useEffect(() => {
    if (phase !== "calculating") return;
    const msgInterval = setInterval(() => setCalcMsg((p) => (p + 1) % calcMessages.length), 700);
    const timeout = setTimeout(() => {
      const food = matchFood(answers);
      setResult(food);
      setMatchPct(72 + Math.floor(Math.random() * 24)); // 72-95%
      setPhase("result");
    }, 3500);
    return () => {
      clearInterval(msgInterval);
      clearTimeout(timeout);
    };
  }, [phase, answers]);

  const handleAnswer = useCallback(
    (value: string) => {
      const q = questions[currentQ];
      const newAnswers = { ...answers, [q.id]: value };
      setAnswers(newAnswers);

      if (currentQ < questions.length - 1) {
        setSlideDir("left");
        setTimeout(() => setCurrentQ((p) => p + 1), 300);
      } else {
        setPhase("calculating");
      }
    },
    [currentQ, answers]
  );

  const shareUrl = "https://dafuqbro.com/food";
  const shareText = result
    ? `I'm ${result.name} ${result.emoji} — ${result.tagline}\n\nFind out your trendy food personality:`
    : "";

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#09090b" }}>
        {/* Ambient glow */}
        <div
          className="absolute top-[-200px] left-[50%] translate-x-[-50%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${
              result ? result.color + "12" : "rgba(251,191,36,0.06)"
            }, transparent 70%)`,
          }}
        />

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-5 py-4 max-w-3xl mx-auto">
          <Link to="/" className="font-['Outfit'] font-extrabold text-[1.1rem] tracking-tight text-[#f4f4f5]">
            DaFuqBro<span className="text-[#fbbf24]">.</span>
          </Link>
          <Link
            to="/"
            className="text-[#71717a] text-[0.78rem] font-medium hover:text-[#a1a1aa] transition-colors"
          >
            ← All Tools
          </Link>
        </header>

        <main className="relative z-10 max-w-2xl mx-auto px-5 pb-16">
          {/* ─── INTRO ─── */}
          {phase === "intro" && (
            <div className="text-center pt-8 animate-[fadeInUp_0.5s_ease]">
              <span className="text-[4rem] block mb-4">🍵</span>
              <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,6vw,3rem)] tracking-tight leading-tight mb-3">
                What Trendy Food
                <br />
                <span className="text-[#fbbf24]">Are You?</span>
              </h1>
              <p className="text-[#a1a1aa] text-[1.05rem] leading-relaxed max-w-md mx-auto mb-8">
                8 questions. 1 trendy food that perfectly captures your personality. Prepare to feel seen (and roasted).
              </p>

              {/* Food preview grid */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {foodResults.map((f) => (
                  <span
                    key={f.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-medium border border-white/[0.06] bg-white/[0.03]"
                    style={{ color: f.color }}
                  >
                    {f.emoji} {f.name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setPhase("quiz")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-['Outfit'] font-bold text-[1rem] text-[#09090b] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}
              >
                Take the Quiz 🍽️
              </button>
            </div>
          )}

          {/* ─── QUIZ ─── */}
          {phase === "quiz" && (
            <div className="pt-6">
              {/* Progress bar */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[#71717a] text-[0.75rem] font-['JetBrains_Mono'] font-semibold">
                  {currentQ + 1}/{questions.length}
                </span>
                <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${((currentQ + 1) / questions.length) * 100}%`,
                      background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div
                key={currentQ}
                className="animate-[fadeInUp_0.35s_ease]"
              >
                <div className="text-center mb-8">
                  <span className="text-[2.5rem] block mb-3">{questions[currentQ].emoji}</span>
                  <h2 className="font-['Outfit'] font-bold text-[1.4rem] text-[#f4f4f5] tracking-tight">
                    {questions[currentQ].question}
                  </h2>
                </div>

                <div className="flex flex-col gap-3">
                  {questions[currentQ].options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(opt.value)}
                      className="text-left px-5 py-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all cursor-pointer group"
                    >
                      <span className="text-[#e4e4e7] text-[0.95rem] font-medium group-hover:text-[#f4f4f5] transition-colors">
                        {opt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── CALCULATING ─── */}
          {phase === "calculating" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-[fadeInUp_0.4s_ease]">
              <div className="relative mb-8">
                <div className="w-16 h-16 border-[3px] border-white/[0.08] border-t-[#fbbf24] rounded-full animate-spin" />
              </div>
              <p className="text-[#a1a1aa] text-[0.95rem] font-medium animate-pulse min-h-[1.5em]">
                {calcMessages[calcMsg]}
              </p>
            </div>
          )}

          {/* ─── RESULT ─── */}
          {phase === "result" && result && (
            <div className="pt-4 animate-[fadeInUp_0.5s_ease]">
              <div className="text-center mb-6">
                <p className="text-[#71717a] text-[0.82rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider mb-2">
                  Your result
                </p>
                <h2 className="font-['Outfit'] font-extrabold text-[1.8rem] text-[#f4f4f5] tracking-tight">
                  You are...
                </h2>
              </div>

              {/* Result card */}
              <div
                ref={resultRef}
                className="relative overflow-hidden rounded-3xl border p-8 mb-6"
                style={{
                  background: `linear-gradient(160deg, ${result.color}08, ${result.color}04, #09090b)`,
                  borderColor: result.color + "30",
                }}
              >
                {/* Food rain */}
                <FoodRain emoji={result.emoji} color={result.color} />

                <div className="relative z-10">
                  {/* Food emoji + name */}
                  <div className="text-center mb-6">
                    <span
                      className="text-[5rem] block mb-2 animate-[mascotIn_0.6s_ease]"
                      style={{ filter: `drop-shadow(0 0 30px ${result.color}40)` }}
                    >
                      {result.emoji}
                    </span>
                    <h3
                      className="font-['Outfit'] font-extrabold text-[2.2rem] tracking-tight"
                      style={{ color: result.color }}
                    >
                      {result.name}
                    </h3>
                    <p className="text-[#a1a1aa] text-[1rem] italic mt-1">{result.tagline}</p>
                  </div>

                  {/* Match ring */}
                  <div className="flex justify-center mb-6">
                    <MatchRing percentage={matchPct} color={result.color} />
                  </div>

                  {/* Description */}
                  <p className="text-[#a1a1aa] text-[0.92rem] leading-relaxed text-center max-w-md mx-auto mb-6">
                    {result.description}
                  </p>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {result.stats.map((s) => (
                      <div
                        key={s.label}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center"
                      >
                        <div className="text-[#71717a] text-[0.68rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider mb-1">
                          {s.label}
                        </div>
                        <div className="text-[#f4f4f5] text-[0.95rem] font-['Outfit'] font-bold">
                          {s.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Roast */}
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{ background: result.color + "10", border: `1px solid ${result.color}20` }}
                  >
                    <p className="text-[0.7rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider mb-1" style={{ color: result.color }}>
                      The Roast
                    </p>
                    <p className="text-[#e4e4e7] text-[0.95rem] italic font-medium">
                      "{result.roast}"
                    </p>
                  </div>

                  {/* Branding */}
                  <div className="text-center mt-5">
                    <p className="text-[#3f3f46] text-[0.7rem] font-['JetBrains_Mono'] font-semibold">
                      dafuqbro.com/food
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <ShareButtons
                cardRef={resultRef}
                shareUrl={shareUrl}
                shareText={shareText}
                filename={`dafuqbro-food-${result.id}`}
              />

              {/* Try again */}
              <div className="text-center mt-8">
                <button
                  onClick={() => {
                    setPhase("intro");
                    setCurrentQ(0);
                    setAnswers({});
                    setResult(null);
                  }}
                  className="text-[#71717a] text-[0.88rem] hover:text-[#a1a1aa] transition-colors cursor-pointer"
                >
                  ← Take it again
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
