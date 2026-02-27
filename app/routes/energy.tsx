import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "What's Your Vibe Energy? — DaFuqBro" },
  {
    name: "description",
    content:
      "Are you kinetic energy, potential energy, or a walking nuclear meltdown? Take the quiz to find your energy type. Physics meets personality.",
  },
  { property: "og:title", content: "What's Your Vibe Energy? — DaFuqBro" },
  { property: "og:description", content: "Physics meets personality. Find your energy type." },
  { name: "twitter:card", content: "summary_large_image" },
];

/* ═══════════════════════════════════════
   DATA
   ═══════════════════════════════════════ */

interface Question {
  id: string;
  emoji: string;
  question: string;
  options: { value: string; label: string; traits: Record<string, number> }[];
}

// Trait dimensions: active, dormant, intense, chaotic, radiant, mysterious, volatile, calm
const questions: Question[] = [
  {
    id: "alarm",
    emoji: "⏰",
    question: "Your alarm goes off. You...",
    options: [
      { value: "a", label: "Already awake. Already productive. Already annoying.", traits: { active: 3, radiant: 1 } },
      { value: "b", label: "Hit snooze 7 times. New personal record.", traits: { dormant: 3, calm: 1 } },
      { value: "c", label: "Throw phone, immediately regret it", traits: { volatile: 3, chaotic: 1 } },
      { value: "d", label: "Lie there questioning every life choice", traits: { mysterious: 2, dormant: 2 } },
    ],
  },
  {
    id: "party",
    emoji: "🎉",
    question: "At a party, you're the one who...",
    options: [
      { value: "a", label: "Hasn't sat down once — talking to everyone", traits: { active: 3, chaotic: 1 } },
      { value: "b", label: "Found the dog and hasn't moved since", traits: { calm: 3, dormant: 1 } },
      { value: "c", label: "Started a dance floor that didn't exist before", traits: { radiant: 3, active: 1 } },
      { value: "d", label: "In the corner observing everything like a nature documentary", traits: { mysterious: 3, dormant: 1 } },
    ],
  },
  {
    id: "deadline",
    emoji: "📋",
    question: "Big deadline tomorrow. Your strategy?",
    options: [
      { value: "a", label: "Done 3 days ago. Currently judging everyone.", traits: { active: 2, radiant: 2 } },
      { value: "b", label: "Panic-fueled 3 AM miracle incoming", traits: { volatile: 2, chaotic: 2 } },
      { value: "c", label: "\"I work better under pressure\" (never proven)", traits: { dormant: 2, chaotic: 2 } },
      { value: "d", label: "Detailed plan, perfect execution, mild anxiety", traits: { intense: 3, calm: 1 } },
    ],
  },
  {
    id: "argument",
    emoji: "🔥",
    question: "Someone is wrong on the internet. You...",
    options: [
      { value: "a", label: "Write a thesis-length response with sources", traits: { intense: 3, volatile: 1 } },
      { value: "b", label: "\"Lol ok\" and move on (but it haunts you)", traits: { calm: 2, dormant: 2 } },
      { value: "c", label: "Screenshot, send to 4 group chats, popcorn", traits: { chaotic: 3, radiant: 1 } },
      { value: "d", label: "Go completely silent. They'll figure it out.", traits: { mysterious: 3, intense: 1 } },
    ],
  },
  {
    id: "exercise",
    emoji: "💪",
    question: "Your relationship with exercise is...",
    options: [
      { value: "a", label: "Daily routine. Non-negotiable. Slightly obsessive.", traits: { active: 3, intense: 1 } },
      { value: "b", label: "I walked to the fridge with purpose today", traits: { dormant: 3, calm: 1 } },
      { value: "c", label: "Burst of motivation → buy gear → quit → repeat", traits: { volatile: 3, chaotic: 1 } },
      { value: "d", label: "Yoga at sunrise. Yes, I will tell you about it.", traits: { radiant: 2, calm: 2 } },
    ],
  },
  {
    id: "emotion",
    emoji: "🎭",
    question: "How do you handle your emotions?",
    options: [
      { value: "a", label: "Feel everything at maximum volume, always", traits: { volatile: 2, intense: 2 } },
      { value: "b", label: "Bottle it up → explode → apologize → repeat", traits: { volatile: 2, dormant: 2 } },
      { value: "c", label: "Channel it into something productive or creative", traits: { active: 2, radiant: 2 } },
      { value: "d", label: "Emotions? I simply do not have those.", traits: { mysterious: 3, calm: 1 } },
    ],
  },
  {
    id: "superpower",
    emoji: "⚡",
    question: "If you had a superpower, it would be...",
    options: [
      { value: "a", label: "Super speed — there's too much to do", traits: { active: 3, chaotic: 1 } },
      { value: "b", label: "Invisibility — finally, peace and quiet", traits: { mysterious: 3, calm: 1 } },
      { value: "c", label: "Telekinesis — move things without moving myself", traits: { dormant: 2, intense: 2 } },
      { value: "d", label: "Controlling fire — no explanation needed", traits: { volatile: 2, radiant: 2 } },
    ],
  },
  {
    id: "legacy",
    emoji: "🪦",
    question: "How do you want to be remembered?",
    options: [
      { value: "a", label: "\"They never stopped moving\"", traits: { active: 3, intense: 1 } },
      { value: "b", label: "\"They brought light everywhere they went\"", traits: { radiant: 3, calm: 1 } },
      { value: "c", label: "\"Nobody truly understood them\"", traits: { mysterious: 3, dormant: 1 } },
      { value: "d", label: "\"They were a force of nature — beautiful and destructive\"", traits: { volatile: 2, chaotic: 2 } },
    ],
  },
];

interface EnergyResult {
  id: string;
  emoji: string;
  name: string;
  formula: string;
  tagline: string;
  description: string;
  color: string;
  particle: string;
  stats: { label: string; value: string }[];
  roast: string;
  scientificFact: string;
  dominantTraits: string[];
}

const energyResults: EnergyResult[] = [
  {
    id: "kinetic",
    emoji: "🏃",
    name: "Kinetic Energy",
    formula: "KE = ½mv²",
    tagline: "Can't stop. Won't stop. Physically incapable of stopping.",
    description:
      "You are a body in motion that refuses to stay at rest. You've got 14 tabs open, 3 side projects, and you haven't sat through a full movie in years. Your energy is contagious but exhausting. People love you in small doses.",
    color: "#3b82f6",
    particle: "⚡",
    stats: [
      { label: "Velocity", value: "Maximum" },
      { label: "Rest Days", value: "What?" },
      { label: "Burnout Risk", value: "Imminent" },
      { label: "Productivity", value: "Terrifying" },
    ],
    roast: "You're the reason people need alone time after hanging out with you.",
    scientificFact: "Kinetic energy increases with the square of velocity — just like your anxiety.",
    dominantTraits: ["active", "chaotic", "intense"],
  },
  {
    id: "potential",
    emoji: "🛋️",
    name: "Potential Energy",
    formula: "PE = mgh",
    tagline: "Sitting on the couch with untapped greatness.",
    description:
      "You have unlimited potential. Literally. It's all just sitting there. Unused. Like a boulder on top of a hill that could crush everything in its path but instead just... vibes. One day you'll unleash it. One day. Not today though.",
    color: "#a78bfa",
    particle: "💤",
    stats: [
      { label: "Potential", value: "∞" },
      { label: "Actualized", value: "2%" },
      { label: "Naps Taken", value: "Professional" },
      { label: "Height of Hill", value: "Very Tall" },
    ],
    roast: "You have so much potential it's genuinely tragic that you're doing nothing with it.",
    scientificFact: "Potential energy depends on height — you're the highest you've ever been. Still not moving.",
    dominantTraits: ["dormant", "calm", "mysterious"],
  },
  {
    id: "thermal",
    emoji: "🌡️",
    name: "Thermal Energy",
    formula: "Q = mcΔT",
    tagline: "Hot mess. Emphasis on hot. Emphasis on mess.",
    description:
      "You run warm in every sense. Passionate, intense, and slightly overwhelming. You either love something completely or couldn't care less. There's no in-between with you. You're the friend who's either your ride-or-die or starting an argument at brunch.",
    color: "#f97316",
    particle: "🔥",
    stats: [
      { label: "Temperature", value: "Unstable" },
      { label: "Chill Factor", value: "404 Not Found" },
      { label: "Drama Potential", value: "Volcanic" },
      { label: "Passion", value: "Dangerous" },
    ],
    roast: "Your emotions have a higher carbon footprint than a private jet.",
    scientificFact: "Thermal energy is just molecules vibrating chaotically. That's literally you at a restaurant.",
    dominantTraits: ["volatile", "intense", "active"],
  },
  {
    id: "nuclear",
    emoji: "☢️",
    name: "Nuclear Energy",
    formula: "E = mc²",
    tagline: "About to explode. Beautifully. Destructively.",
    description:
      "You contain an unfathomable amount of power compressed into a deceptively calm exterior. When you finally snap, it's legendary. You're the quiet one in the group that everyone's slightly afraid of because they've seen what happens when you're pushed too far.",
    color: "#22d3ee",
    particle: "✨",
    stats: [
      { label: "Power Level", value: "E = mc²" },
      { label: "Containment", value: "Barely" },
      { label: "Meltdown ETA", value: "Any Day" },
      { label: "Destruction Radius", value: "3 Zip Codes" },
    ],
    roast: "You're one bad day away from a personality change that gets its own Wikipedia article.",
    scientificFact: "A single gram of matter contains the energy of 21.5 kilotons of TNT. So do you, apparently.",
    dominantTraits: ["intense", "volatile", "mysterious"],
  },
  {
    id: "solar",
    emoji: "☀️",
    name: "Solar Energy",
    formula: "P = σAT⁴",
    tagline: "Annoyingly positive. Suspiciously radiant.",
    description:
      "You walk into a room and the energy shifts. People gravitate toward you like planets around a star. You're warm, giving, and almost aggressively optimistic. Your positivity is either inspiring or deeply suspicious depending on who you ask.",
    color: "#facc15",
    particle: "🌟",
    stats: [
      { label: "Brightness", value: "Blinding" },
      { label: "Warmth", value: "Greenhouse Effect" },
      { label: "Sustainability", value: "Renewable" },
      { label: "Morning Person?", value: "Offensively Yes" },
    ],
    roast: "Your positivity is so relentless it makes people uncomfortable.",
    scientificFact: "The sun converts 4 million tons of matter to energy every second. You convert 4 million awkward silences into group activities.",
    dominantTraits: ["radiant", "active", "calm"],
  },
  {
    id: "dark",
    emoji: "🌑",
    name: "Dark Energy",
    formula: "Λ = ???",
    tagline: "Mysterious. Expanding. No one truly gets you.",
    description:
      "You make up 68% of the universe's energy but nobody understands how you work. You're the enigma that keeps people guessing. Quiet, vast, and somehow always growing. Scientists can't explain you. Neither can your therapist.",
    color: "#6366f1",
    particle: "🔮",
    stats: [
      { label: "Understanding", value: "0%" },
      { label: "Presence", value: "68% of Everything" },
      { label: "Approachability", value: "Event Horizon" },
      { label: "Vibes", value: "Incomprehensible" },
    ],
    roast: "You're so mysterious that even you don't know what's going on in your head.",
    scientificFact: "Dark energy is accelerating the expansion of the universe. You're accelerating the expansion of awkward silences.",
    dominantTraits: ["mysterious", "dormant", "calm"],
  },
];

function matchEnergy(answers: Record<string, string>): EnergyResult {
  const traits: Record<string, number> = {
    active: 0, dormant: 0, intense: 0, chaotic: 0,
    radiant: 0, mysterious: 0, volatile: 0, calm: 0,
  };

  for (const q of questions) {
    const chosen = q.options.find((o) => o.value === answers[q.id]);
    if (chosen) {
      for (const [trait, val] of Object.entries(chosen.traits)) {
        traits[trait] = (traits[trait] || 0) + val;
      }
    }
  }

  let best = energyResults[0];
  let bestScore = -Infinity;

  for (const energy of energyResults) {
    let score = 0;
    for (const t of energy.dominantTraits) {
      score += (traits[t] || 0) * 3;
    }
    for (const [t, v] of Object.entries(traits)) {
      if (!energy.dominantTraits.includes(t) && v > 5) score -= 1;
    }
    score += Math.random() * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = energy;
    }
  }

  return best;
}

/* ═══════════════════════════════════════
   ENERGY PARTICLES CANVAS
   ═══════════════════════════════════════ */

function EnergyParticles({ emoji, color }: { emoji: string; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const cx = w / 2;
    const cy = h / 2;

    // Orbiting particles
    const particles: {
      angle: number; radius: number; speed: number;
      size: number; opacity: number; drift: number;
    }[] = [];

    for (let i = 0; i < 24; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 60 + Math.random() * 160,
        speed: 0.003 + Math.random() * 0.008,
        size: 12 + Math.random() * 16,
        opacity: 0.3 + Math.random() * 0.5,
        drift: (Math.random() - 0.5) * 0.2,
      });
    }

    let raf: number;
    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Central glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 100);
      grad.addColorStop(0, color + "15");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (const p of particles) {
        p.angle += p.speed;
        p.radius += Math.sin(p.angle * 3) * p.drift;

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.6; // Elliptical

        ctx.save();
        ctx.globalAlpha = p.opacity * (0.5 + 0.5 * Math.sin(p.angle * 2));
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(emoji, x, y);
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
   POWER METER
   ═══════════════════════════════════════ */

function PowerMeter({ level, color }: { level: number; color: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number;
    const duration = 2000;
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const animate = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setProgress(ease(t) * level);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [level]);

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
        style={{ filter: `drop-shadow(0 0 10px ${color}60)` }}
      />
      <text x="64" y="58" textAnchor="middle" fill="#f4f4f5" fontSize="26" fontWeight="800" fontFamily="Outfit">
        {Math.round(progress)}%
      </text>
      <text x="64" y="78" textAnchor="middle" fill="#71717a" fontSize="9" fontWeight="600" fontFamily="JetBrains Mono">
        POWER LEVEL
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════
   CALCULATING MESSAGES
   ═══════════════════════════════════════ */

const calcMessages = [
  "Measuring your wavelength...",
  "Calculating mass × velocity²...",
  "Consulting the laws of thermodynamics...",
  "Your vibe is being peer-reviewed...",
  "Running quantum probability analysis...",
  "Einstein just rolled in his grave...",
  "Entropy levels: concerning...",
  "Calibrating the vibe spectrometer...",
];

/* ═══════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════ */

export default function EnergyQuiz() {
  const [phase, setPhase] = useState<"intro" | "quiz" | "calculating" | "result">("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EnergyResult | null>(null);
  const [calcMsg, setCalcMsg] = useState(0);
  const [powerLevel, setPowerLevel] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  // Calculating phase
  useEffect(() => {
    if (phase !== "calculating") return;
    const msgInterval = setInterval(() => setCalcMsg((p) => (p + 1) % calcMessages.length), 700);
    const timeout = setTimeout(() => {
      const energy = matchEnergy(answers);
      setResult(energy);
      setPowerLevel(65 + Math.floor(Math.random() * 30)); // 65-94%
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
        setTimeout(() => setCurrentQ((p) => p + 1), 300);
      } else {
        setPhase("calculating");
      }
    },
    [currentQ, answers]
  );

  const shareUrl = "https://dafuqbro.com/energy";
  const shareText = result
    ? `My vibe energy is ${result.name} ${result.emoji} — ${result.tagline}\n\nFind your energy type:`
    : "";

  return (
    <>
      <div className="min-h-screen relative overflow-hidden" style={{ background: "#09090b" }}>
        {/* Ambient glow */}
        <div
          className="absolute top-[-200px] left-[50%] translate-x-[-50%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${
              result ? result.color + "12" : "rgba(99,102,241,0.06)"
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
              <span className="text-[4rem] block mb-4">⚡</span>
              <h1 className="font-['Outfit'] font-extrabold text-[clamp(2rem,6vw,3rem)] tracking-tight leading-tight mb-3">
                What's Your
                <br />
                <span className="text-[#6366f1]">Vibe Energy?</span>
              </h1>
              <p className="text-[#a1a1aa] text-[1.05rem] leading-relaxed max-w-md mx-auto mb-8">
                Physics meets personality. 8 questions to discover whether you're a force of nature or just... static. No wrong answers. Just devastating ones.
              </p>

              {/* Energy type previews */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {energyResults.map((e) => (
                  <span
                    key={e.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.75rem] font-medium border border-white/[0.06] bg-white/[0.03]"
                    style={{ color: e.color }}
                  >
                    {e.emoji} {e.name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setPhase("quiz")}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-['Outfit'] font-bold text-[1rem] text-[#09090b] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}
              >
                Find Your Energy ⚡
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
                      background: "linear-gradient(90deg, #6366f1, #818cf8)",
                    }}
                  />
                </div>
              </div>

              {/* Question */}
              <div key={currentQ} className="animate-[fadeInUp_0.35s_ease]">
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
                <div className="w-16 h-16 border-[3px] border-white/[0.08] border-t-[#6366f1] rounded-full animate-spin" />
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
                  Energy classification
                </p>
                <h2 className="font-['Outfit'] font-extrabold text-[1.8rem] text-[#f4f4f5] tracking-tight">
                  Your vibe is...
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
                {/* Particle animation */}
                <EnergyParticles emoji={result.particle} color={result.color} />

                <div className="relative z-10">
                  {/* Energy emoji + name */}
                  <div className="text-center mb-2">
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
                    <p className="font-['JetBrains_Mono'] text-[0.75rem] font-semibold mt-1" style={{ color: result.color + "80" }}>
                      {result.formula}
                    </p>
                    <p className="text-[#a1a1aa] text-[1rem] italic mt-2">{result.tagline}</p>
                  </div>

                  {/* Power meter */}
                  <div className="flex justify-center my-6">
                    <PowerMeter level={powerLevel} color={result.color} />
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

                  {/* Science fact */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center mb-4">
                    <p className="text-[0.68rem] font-['JetBrains_Mono'] font-semibold uppercase tracking-wider text-[#71717a] mb-1">
                      Science Says
                    </p>
                    <p className="text-[#a1a1aa] text-[0.88rem] leading-relaxed italic">
                      {result.scientificFact}
                    </p>
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
                      dafuqbro.com/energy
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <ShareButtons
                cardRef={resultRef}
                shareUrl={shareUrl}
                shareText={shareText}
                filename={`dafuqbro-energy-${result.id}`}
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
