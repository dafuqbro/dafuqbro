import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Rate My Red Flags — DaFuqBro" },
  {
    name: "description",
    content:
      "Check all the red flags that apply to you. Get a brutal dateability score and a shareable card to prove how undateable you are.",
  },
];

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */

interface Flag {
  id: string;
  emoji: string;
  text: string;
  severity: number; // 1-5
}

interface Category {
  key: string;
  emoji: string;
  name: string;
  color: string;
  flags: Flag[];
}

const categories: Category[] = [
  {
    key: "dating",
    emoji: "💔",
    name: "Dating & Romance",
    color: "#f87171",
    flags: [
      { id: "d1", emoji: "📱", text: "Still follows all their exes on Instagram", severity: 2 },
      { id: "d2", emoji: "🚗", text: "\"I'll pick you up\" means you're driving", severity: 2 },
      { id: "d3", emoji: "⏰", text: "Takes 3 days to respond, gets mad if you take 3 hours", severity: 4 },
      { id: "d4", emoji: "🥇", text: "Compares you to their ex... favorably... about their ex", severity: 4 },
      { id: "d5", emoji: "🔒", text: "Phone is always face down", severity: 3 },
      { id: "d6", emoji: "😤", text: "Says \"I don't do labels\" after 6 months", severity: 5 },
      { id: "d7", emoji: "🗣️", text: "Starts every argument with \"You always...\"", severity: 3 },
      { id: "d8", emoji: "👀", text: "Checks your phone when you go to the bathroom", severity: 4 },
      { id: "d9", emoji: "🎭", text: "Completely different person around their friends", severity: 3 },
      { id: "d10", emoji: "💸", text: "\"Forgot their wallet\" every single time", severity: 2 },
      { id: "d11", emoji: "🙄", text: "Says \"you're overreacting\" to everything", severity: 5 },
      { id: "d12", emoji: "🌙", text: "Only texts after midnight", severity: 3 },
    ],
  },
  {
    key: "social",
    emoji: "🎭",
    name: "Social & Friendship",
    color: "#a78bfa",
    flags: [
      { id: "s1", emoji: "📸", text: "Posts everything on social media before telling you", severity: 2 },
      { id: "s2", emoji: "🎤", text: "Makes everything about themselves", severity: 3 },
      { id: "s3", emoji: "🤫", text: "Tells other people's secrets \"in confidence\"", severity: 4 },
      { id: "s4", emoji: "👋", text: "Disappears when you need them, appears when they need you", severity: 5 },
      { id: "s5", emoji: "🏆", text: "Always has to one-up your stories", severity: 3 },
      { id: "s6", emoji: "😂", text: "\"Just joking\" is their full-time personality", severity: 3 },
      { id: "s7", emoji: "📵", text: "Never initiates plans but complains about being left out", severity: 2 },
      { id: "s8", emoji: "🔪", text: "Talks badly about friends who just left the room", severity: 4 },
      { id: "s9", emoji: "🎂", text: "Forgets your birthday but posts \"HBD!!!!\" 3 days late", severity: 2 },
      { id: "s10", emoji: "🏃", text: "Cancels plans last minute, every time", severity: 3 },
      { id: "s11", emoji: "🪞", text: "Only reaches out when they want validation", severity: 4 },
      { id: "s12", emoji: "🐍", text: "Befriends your friends to replace you", severity: 5 },
    ],
  },
  {
    key: "lifestyle",
    emoji: "🛋️",
    name: "Lifestyle & Habits",
    color: "#fb923c",
    flags: [
      { id: "l1", emoji: "🍕", text: "Eats in bed. With crumbs. No regrets.", severity: 1 },
      { id: "l2", emoji: "🧺", text: "\"Clean\" means shoving everything in the closet", severity: 2 },
      { id: "l3", emoji: "🛏️", text: "Has never washed their pillows. Ever.", severity: 3 },
      { id: "l4", emoji: "📺", text: "Has 47 streaming subscriptions, watches the same 3 shows", severity: 1 },
      { id: "l5", emoji: "🚿", text: "\"I showered yesterday\" is a flexible definition of yesterday", severity: 4 },
      { id: "l6", emoji: "💳", text: "Impulse buys at 2am, returns nothing", severity: 2 },
      { id: "l7", emoji: "🍝", text: "Their cooking peaks at instant ramen", severity: 1 },
      { id: "l8", emoji: "📧", text: "10,000+ unread emails. Doesn't care.", severity: 2 },
      { id: "l9", emoji: "🚗", text: "Car looks like a mobile landfill", severity: 3 },
      { id: "l10", emoji: "⏰", text: "Sets 15 alarms, snoozes all of them, still late", severity: 2 },
      { id: "l11", emoji: "🎮", text: "\"Just one more game\" at 4am on a work night", severity: 2 },
      { id: "l12", emoji: "🧠", text: "Self-diagnosed everything from TikTok", severity: 3 },
    ],
  },
  {
    key: "work",
    emoji: "💼",
    name: "Work & Ambition",
    color: "#22d3ee",
    flags: [
      { id: "w1", emoji: "🛌", text: "\"Hustling\" = scrolling LinkedIn in bed", severity: 2 },
      { id: "w2", emoji: "📊", text: "Has a side hustle that's lost money for 3 years", severity: 2 },
      { id: "w3", emoji: "🎓", text: "Peaked in college and won't stop talking about it", severity: 3 },
      { id: "w4", emoji: "💰", text: "Says \"money isn't everything\" while asking to borrow $50", severity: 4 },
      { id: "w5", emoji: "📈", text: "Calls themselves a CEO of a 0-employee company", severity: 3 },
      { id: "w6", emoji: "🤝", text: "\"Let's circle back\" is their entire vocabulary", severity: 2 },
      { id: "w7", emoji: "🎯", text: "Vision board but no actual plan", severity: 2 },
      { id: "w8", emoji: "🧘", text: "Quit to \"find themselves\" — it's been 4 years", severity: 3 },
      { id: "w9", emoji: "📱", text: "Checks Slack at dinner and calls it \"being dedicated\"", severity: 3 },
      { id: "w10", emoji: "🏖️", text: "Uses \"quiet quitting\" as an excuse to do nothing", severity: 3 },
      { id: "w11", emoji: "🤖", text: "Thinks AI will replace their job but won't learn AI", severity: 2 },
      { id: "w12", emoji: "💎", text: "Still holding crypto they bought at the top", severity: 2 },
    ],
  },
];

/* Tiers & verdicts */
interface Tier {
  min: number;
  max: number;
  emoji: string;
  label: string;
  color: string;
  verdicts: string[];
}

const tiers: Tier[] = [
  {
    min: 0, max: 10, emoji: "😇", label: "Suspiciously Perfect", color: "#4ade80",
    verdicts: [
      "Either you're lying or you're a golden retriever in human form.",
      "You're so green-flag it's actually a red flag.",
      "Therapists hate you because you have nothing to discuss.",
    ],
  },
  {
    min: 11, max: 25, emoji: "🙂", label: "Mostly Dateable", color: "#a3e635",
    verdicts: [
      "A few quirks but honestly? You're fine. Boring, but fine.",
      "You'd pass a background check. Barely.",
      "Your red flags are more like... orange caution signs.",
    ],
  },
  {
    min: 26, max: 45, emoji: "😬", label: "Proceed With Caution", color: "#facc15",
    verdicts: [
      "You're the person people date when they're \"working on themselves.\"",
      "Your dating profile should come with a terms of service.",
      "Not undateable, but definitely a 3rd-date reveal kinda person.",
    ],
  },
  {
    min: 46, max: 65, emoji: "🚩", label: "Walking Red Flag", color: "#fb923c",
    verdicts: [
      "You're the reason people have trust issues.",
      "Someone's therapist knows all about you. By name.",
      "The red flags aren't a personality trait, they're a lifestyle.",
    ],
  },
  {
    min: 66, max: 80, emoji: "🚨", label: "Certified Menace", color: "#f87171",
    verdicts: [
      "You don't date. You create origin stories for future therapy patients.",
      "You're not a red flag — you're the entire flag factory.",
      "Your situationships have situationships.",
    ],
  },
  {
    min: 81, max: 100, emoji: "☠️", label: "Emotional Hazmat Zone", color: "#dc2626",
    verdicts: [
      "Scientists should study you. For the safety of humanity.",
      "You're the final boss of every dating app.",
      "Congratulations — you've achieved emotional supervillain status.",
    ],
  },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ═══════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════ */

/* ── Progress Bar ── */
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = ((step) / total) * 100;
  return (
    <div className="w-full max-w-[480px] mx-auto mb-8">
      <div className="flex justify-between text-[0.7rem] font-['JetBrains_Mono'] text-[#71717a] mb-2">
        <span>Step {step} of {total}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #f87171, #fb923c, #facc15)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Flag Chip (toggleable) ── */
function FlagChip({
  flag,
  selected,
  onToggle,
  color,
}: {
  flag: Flag;
  selected: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-start gap-3 w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
        selected
          ? "bg-[var(--sel-bg)] border-[var(--sel-border)] scale-[1.02] shadow-[0_0_20px_var(--sel-glow)]"
          : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
      }`}
      style={{
        "--sel-bg": color + "15",
        "--sel-border": color + "40",
        "--sel-glow": color + "15",
      } as React.CSSProperties}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">{flag.emoji}</span>
      <span className={`text-[0.9rem] leading-snug font-medium ${selected ? "text-white" : "text-[#a1a1aa]"}`}>
        {flag.text}
      </span>
      <span className="ml-auto flex-shrink-0 mt-0.5">
        {selected ? (
          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[0.75rem] font-bold" style={{ background: color, color: "#09090b" }}>✓</span>
        ) : (
          <span className="w-6 h-6 rounded-full border border-white/[0.12] flex items-center justify-center" />
        )}
      </span>
    </button>
  );
}

/* ── Animated Score Meter ── */
function ScoreMeter({ score, color, active }: { score: number; color: string; active: boolean }) {
  const [display, setDisplay] = useState(0);
  const [animDone, setAnimDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    setDisplay(0);
    setAnimDone(false);
    const duration = 2000;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * score));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimDone(true);
      }
    };
    requestAnimationFrame(animate);
  }, [active, score]);

  const circumference = 2 * Math.PI * 80;
  const dashoffset = circumference - (circumference * (active ? display : 0)) / 100;

  return (
    <div className="relative w-[200px] h-[200px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        {/* Score ring */}
        <circle
          cx="100" cy="100" r="80" fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          className="transition-none"
          style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-['Outfit'] font-black text-[3.5rem] leading-none tracking-tight"
          style={{ color }}
        >
          {display}
        </span>
        <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] uppercase tracking-widest mt-1">
          / 100
        </span>
      </div>
      {/* Pulse ring on completion */}
      {animDone && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ border: `2px solid ${color}`, animationIterationCount: 2, animationDuration: "1s" }}
        />
      )}
    </div>
  );
}

/* ── Category Breakdown Bar ── */
function CategoryBar({
  name,
  emoji,
  count,
  total,
  color,
  delay,
}: {
  name: string;
  emoji: string;
  count: number;
  total: number;
  color: string;
  delay: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="animate-fadeInUp" style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[0.82rem] font-medium text-[#a1a1aa]">
          {emoji} {name}
        </span>
        <span className="font-['JetBrains_Mono'] text-[0.72rem] font-semibold" style={{ color }}>
          {count}/{total}
        </span>
      </div>
      <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: color,
            transitionDelay: `${delay}s`,
            boxShadow: `0 0 10px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN TOOL
   ═══════════════════════════════════════ */

type Phase = "intro" | "quiz" | "calculating" | "result";

export default function RedFlagsTool() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [catIndex, setCatIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [transitioning, setTransitioning] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    tier: Tier;
    verdict: string;
    worst: Category;
    totalFlags: number;
    categoryCounts: { cat: Category; count: number }[];
    mascot: string;
  } | null>(null);
  const [meterActive, setMeterActive] = useState(false);
  const [calcMsg, setCalcMsg] = useState(0);

  const calcMessages = [
    "Analyzing your emotional damage...",
    "Cross-referencing with therapist databases...",
    "Calculating ick factor...",
    "Consulting your ex's group chat...",
    "Running background check...",
    "Measuring toxicity levels...",
    "Generating your warning label...",
  ];

  const currentCat = categories[catIndex];
  const totalSteps = categories.length;

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const slideTransition = useCallback((dir: "left" | "right", cb: () => void) => {
    setSlideDir(dir);
    setTransitioning(true);
    setTimeout(() => {
      cb();
      setTransitioning(false);
    }, 300);
  }, []);

  const nextCat = () => {
    if (catIndex < categories.length - 1) {
      slideTransition("left", () => setCatIndex((i) => i + 1));
    } else {
      // Calculate results
      setPhase("calculating");
    }
  };

  const prevCat = () => {
    if (catIndex > 0) {
      slideTransition("right", () => setCatIndex((i) => i - 1));
    }
  };

  // Calculating phase
  useEffect(() => {
    if (phase !== "calculating") return;

    const msgInterval = setInterval(() => {
      setCalcMsg((m) => (m + 1) % calcMessages.length);
    }, 600);

    const timer = setTimeout(() => {
      clearInterval(msgInterval);

      // Calculate score
      let totalSeverity = 0;
      let maxSeverity = 0;
      const categoryCounts: { cat: Category; count: number }[] = [];

      for (const cat of categories) {
        let count = 0;
        for (const flag of cat.flags) {
          maxSeverity += flag.severity;
          if (selected.has(flag.id)) {
            totalSeverity += flag.severity;
            count++;
          }
        }
        categoryCounts.push({ cat, count });
      }

      const score = maxSeverity > 0 ? Math.round((totalSeverity / maxSeverity) * 100) : 0;
      const tier = tiers.find((t) => score >= t.min && score <= t.max) || tiers[0];
      const worst = categoryCounts.sort((a, b) => b.count - a.count)[0].cat;
      const totalFlags = selected.size;

      // Sort back for display
      categoryCounts.sort(
        (a, b) => categories.indexOf(a.cat) - categories.indexOf(b.cat)
      );

      setResult({
        score,
        tier,
        verdict: pick(tier.verdicts),
        worst,
        totalFlags,
        categoryCounts,
        mascot: tier.emoji,
      });

      setPhase("result");
      setTimeout(() => setMeterActive(true), 400);
    }, 3500);

    return () => {
      clearTimeout(timer);
      clearInterval(msgInterval);
    };
  }, [phase, selected]);

  const retry = () => {
    setPhase("intro");
    setCatIndex(0);
    setSelected(new Set());
    setResult(null);
    setMeterActive(false);
  };

  /* ═══ RENDER ═══ */

  return (
    <>
      {/* Top bar */}
      <div className="py-4 px-5 flex items-center gap-3 border-b border-white/[0.06] relative z-10">
        <Link to="/" className="text-[#71717a] text-[0.85rem] hover:text-white transition-colors">
          DaFuqBro
        </Link>
        <span className="text-[#71717a] text-[0.75rem]">›</span>
        <span className="text-[#a1a1aa] font-semibold text-[0.85rem]">🚨 Rate My Red Flags</span>
      </div>

      <div className="max-w-[640px] mx-auto px-5 py-10 pb-24 relative z-1">
        {/* ════ INTRO ════ */}
        {phase === "intro" && (
          <div className="animate-fadeInUp text-center">
            <div className="text-[5rem] mb-4 leading-none">🚩</div>
            <h1 className="font-['Outfit'] font-extrabold text-[2.2rem] tracking-tight mb-3">
              Rate My Red Flags
            </h1>
            <p className="text-[#a1a1aa] text-[1rem] leading-relaxed max-w-[440px] mx-auto mb-3">
              Check every red flag that applies to you. Be honest — we already know you won't be.
            </p>
            <p className="text-[#71717a] text-[0.82rem] mb-10">
              48 flags across 4 categories. Your score awaits.
            </p>

            {/* Category preview */}
            <div className="grid grid-cols-2 gap-3 max-w-[400px] mx-auto mb-10">
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center"
                >
                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                  <span className="text-[0.82rem] font-medium text-[#a1a1aa]">{cat.name}</span>
                  <span className="block font-['JetBrains_Mono'] text-[0.65rem] mt-1" style={{ color: cat.color }}>
                    {cat.flags.length} flags
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPhase("quiz")}
              className="w-full max-w-[400px] py-4 rounded-[14px] bg-gradient-to-br from-[#f87171] to-[#fb923c] text-white font-['Outfit'] text-[1.1rem] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(248,113,113,0.3)]"
            >
              Start the Assessment 🚩
            </button>
          </div>
        )}

        {/* ════ QUIZ ════ */}
        {phase === "quiz" && (
          <div>
            <ProgressBar step={catIndex + 1} total={totalSteps} />

            {/* Category header */}
            <div
              className={`transition-all duration-300 ${
                transitioning
                  ? slideDir === "left"
                    ? "translate-x-[-30px] opacity-0"
                    : "translate-x-[30px] opacity-0"
                  : "translate-x-0 opacity-100"
              }`}
            >
              <div className="text-center mb-6">
                <span className="text-[3rem] block mb-2">{currentCat.emoji}</span>
                <h2 className="font-['Outfit'] font-bold text-[1.5rem] tracking-tight mb-1">
                  {currentCat.name}
                </h2>
                <p className="text-[#71717a] text-[0.82rem]">
                  Check all that apply. No judgment.{" "}
                  <span className="text-[#a1a1aa]">(Total judgment.)</span>
                </p>
              </div>

              {/* Flags */}
              <div className="flex flex-col gap-2.5 mb-8">
                {currentCat.flags.map((flag, i) => (
                  <div
                    key={flag.id}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${0.03 * i}s`, animationFillMode: "both" }}
                  >
                    <FlagChip
                      flag={flag}
                      selected={selected.has(flag.id)}
                      onToggle={() => toggle(flag.id)}
                      color={currentCat.color}
                    />
                  </div>
                ))}
              </div>

              {/* Selected count badge */}
              <div className="text-center mb-5">
                <span
                  className="inline-flex items-center gap-1.5 font-['JetBrains_Mono'] text-[0.75rem] px-3.5 py-1.5 rounded-full border"
                  style={{
                    color: currentCat.color,
                    borderColor: currentCat.color + "30",
                    background: currentCat.color + "10",
                  }}
                >
                  {currentCat.flags.filter((f) => selected.has(f.id)).length} / {currentCat.flags.length} selected
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              {catIndex > 0 && (
                <button
                  onClick={prevCat}
                  className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1] transition-all"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={nextCat}
                className="flex-1 py-3.5 rounded-xl font-['Outfit'] font-bold text-[0.95rem] cursor-pointer transition-all hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${currentCat.color}, ${currentCat.color}cc)`,
                  color: "#09090b",
                  boxShadow: `0 4px 20px ${currentCat.color}30`,
                }}
              >
                {catIndex < categories.length - 1 ? "Next Category →" : "Get My Score 🚨"}
              </button>
            </div>
          </div>
        )}

        {/* ════ CALCULATING ════ */}
        {phase === "calculating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fadeInUp">
            <div className="relative">
              <div className="w-[80px] h-[80px] rounded-full border-[3px] border-white/[0.06] border-t-[#f87171] animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-3xl">🚩</span>
            </div>
            <div className="text-[1.1rem] font-semibold text-[#a1a1aa] text-center transition-all">
              {calcMessages[calcMsg]}
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ════ RESULT ════ */}
        {phase === "result" && result && (
          <div className="flex flex-col items-center gap-6 animate-fadeInUp">
            {/* Result Card */}
            <div
              id="resultCard"
              className="w-full max-w-[480px] bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] rounded-[20px] border overflow-hidden relative"
              style={{ borderColor: result.tier.color + "25" }}
            >
              {/* Ambient glows */}
              <div
                className="absolute -top-[40%] -right-[30%] w-[70%] h-[70%] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${result.tier.color}12 0%, transparent 70%)`,
                }}
              />
              <div
                className="absolute -bottom-[30%] -left-[20%] w-[60%] h-[60%] rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, ${result.worst.color}08 0%, transparent 60%)`,
                }}
              />

              {/* Header */}
              <div className="flex justify-between items-center p-6 pb-0">
                <span
                  className="font-['JetBrains_Mono'] text-[0.72rem] px-3 py-1 rounded-full font-semibold border"
                  style={{
                    color: result.tier.color,
                    borderColor: result.tier.color + "30",
                    background: result.tier.color + "15",
                  }}
                >
                  {result.totalFlags} RED FLAGS
                </span>
                <span className="font-['JetBrains_Mono'] text-[0.72rem] text-[#71717a]">
                  dafuqbro.com
                </span>
              </div>

              {/* Score Meter */}
              <div className="px-6 pt-6 pb-2">
                <ScoreMeter score={result.score} color={result.tier.color} active={meterActive} />
              </div>

              {/* Tier */}
              <div className="text-center px-6 pb-4">
                <div className="text-[2.5rem] mb-1 animate-mascotIn">{result.tier.emoji}</div>
                <div
                  className="font-['Outfit'] font-extrabold text-[1.6rem] tracking-tight mb-1"
                  style={{ color: result.tier.color }}
                >
                  {result.tier.label}
                </div>
                <div className="text-[#a1a1aa] text-[0.88rem] italic leading-relaxed max-w-[380px] mx-auto">
                  "{result.verdict}"
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="px-6 pb-5">
                <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-[0.15em] mb-3">
                  Damage Breakdown
                </div>
                <div className="flex flex-col gap-3">
                  {result.categoryCounts.map((cc, i) => (
                    <CategoryBar
                      key={cc.cat.key}
                      name={cc.cat.name}
                      emoji={cc.cat.emoji}
                      count={cc.count}
                      total={cc.cat.flags.length}
                      color={cc.cat.color}
                      delay={0.6 + i * 0.15}
                    />
                  ))}
                </div>
              </div>

              {/* Worst category callout */}
              <div className="mx-6 mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-[0.12em] mb-1.5">
                  Biggest Problem Area
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{result.worst.emoji}</span>
                  <span className="font-['Outfit'] font-bold text-[1.1rem]" style={{ color: result.worst.color }}>
                    {result.worst.name}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.04]">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">
                  Rate My Red Flags
                </span>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Share */}
            <ShareButtons
              shareUrl="https://dafuqbro.com/redflags"
              shareText={`I scored ${result.score}/100 on the Red Flag test 🚩 — "${result.tier.label}"\n\nCheck yours 👇`}
              cardId="resultCard"
              accentColor={result.tier.color}
            />

            {/* Action buttons */}
            <div className="flex gap-3 w-full max-w-[480px]">
              <button
                onClick={retry}
                className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1] transition-all"
              >
                🔄 Try Again
              </button>
              <Link
                to="/"
                className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1] transition-all text-center"
              >
                ← All Tools
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
