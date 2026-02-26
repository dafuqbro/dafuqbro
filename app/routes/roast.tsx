import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Roast My Year — DaFuqBro" },
  { name: "description", content: "Your year in review, but brutally honest. Get a Wrapped-style roast with animated reveals, a Life Score, and a card that proves how bad it really was." },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface Question {
  id: string; emoji: string; question: string;
  options: { value: string; label: string; weight: number }[];
}

const questions: Question[] = [
  { id: "career", emoji: "💼", question: "How's your career going?", options: [
    { value: "thriving", label: "Got promoted / crushing it", weight: 5 },
    { value: "stable", label: "Same job, same vibes", weight: 3 },
    { value: "searching", label: "\"Exploring opportunities\"", weight: 1 },
    { value: "chaos", label: "Got fired / quit dramatically", weight: 0 },
  ]},
  { id: "love", emoji: "❤️", question: "What's your love life situation?", options: [
    { value: "taken", label: "Happily taken", weight: 5 },
    { value: "dating", label: "Dating around / it's complicated", weight: 3 },
    { value: "single", label: "Proudly single (coping)", weight: 2 },
    { value: "disaster", label: "Situationship dumpster fire", weight: 0 },
  ]},
  { id: "health", emoji: "🏃", question: "How's the health & fitness arc?", options: [
    { value: "fit", label: "Gym rat / actually healthy", weight: 5 },
    { value: "trying", label: "Started, quit, started again", weight: 2 },
    { value: "sedentary", label: "Does walking to the fridge count?", weight: 1 },
    { value: "declining", label: "My body is a warning, not a temple", weight: 0 },
  ]},
  { id: "social", emoji: "🎉", question: "Social life this year?", options: [
    { value: "popular", label: "Always booked, always busy", weight: 5 },
    { value: "balanced", label: "Good group, regular hangs", weight: 4 },
    { value: "declining", label: "Lost touch with most people", weight: 1 },
    { value: "hermit", label: "My phone is for memes, not calls", weight: 0 },
  ]},
  { id: "finance", emoji: "💰", question: "Financial situation?", options: [
    { value: "saving", label: "Saving & investing wisely", weight: 5 },
    { value: "stable", label: "Bills paid, nothing extra", weight: 3 },
    { value: "broke", label: "Living paycheck to paycheck", weight: 1 },
    { value: "debt", label: "In debt, still buying nonsense", weight: 0 },
  ]},
  { id: "growth", emoji: "🧠", question: "Personal growth this year?", options: [
    { value: "evolved", label: "Therapy, books, real change", weight: 5 },
    { value: "some", label: "A few breakthroughs here and there", weight: 3 },
    { value: "stagnant", label: "Same person, different year", weight: 1 },
    { value: "regressed", label: "Actually went backwards somehow", weight: 0 },
  ]},
];

const roasts: Record<string, Record<string, string[]>> = {
  career: {
    thriving: ["Okay, LinkedIn influencer. Calm down.", "Career's peaking. Enjoy it before the burnout hits."],
    stable: ["The beige of career achievements. Consistent, forgettable.", "You have a job. That's... something."],
    searching: ["Your LinkedIn says 'open to opportunities.' So does your fridge. Both empty.", "Career gap? More like career nap."],
    chaos: ["Got fired and somehow blame the economy. Classic.", "Your career was a controlled demolition. Without the controlled part."],
  },
  love: {
    taken: ["Congrats on tricking someone into staying.", "Relationship status: settled. Not in a good way."],
    dating: ["Your love life has more plot twists than Netflix. And about as much substance.", "Dating around = collecting rejections like Pokémon."],
    single: ["Single by choice. Just not YOUR choice.", "Your love life is like your savings — empty with no growth."],
    disaster: ["Your situationship needs its own therapist.", "Even your red flags have red flags."],
  },
  health: {
    fit: ["Look at you, gym bro. Your personality still needs work though.", "Fit body, questionable everything else."],
    trying: ["Your gym membership: the most expensive nap reservation.", "Started a routine in January. Quit in February. Classic."],
    sedentary: ["Your most consistent exercise is jumping to conclusions.", "The fridge sees you more than the gym ever will."],
    declining: ["Your body filed a formal complaint.", "Health? In this economy? Of this body?"],
  },
  social: {
    popular: ["Always busy but still somehow lonely. Interesting.", "Social butterfly? More like social try-hard."],
    balanced: ["A healthy social life. How boring of you.", "Regular friend group. The participation trophy of socializing."],
    declining: ["Your contact list is basically a graveyard.", "Lost friends this year? No — they escaped."],
    hermit: ["Your best friend is your phone and that's genuinely sad.", "Introvert or just avoided? Let's not dig too deep."],
  },
  finance: {
    saving: ["Saving money? In 2025? Are you a time traveler?", "Look at Mr. Financial Responsibility over here."],
    stable: ["Bills paid but dreams deferred. The adult special.", "Financially mid. Consistently, reliably mid."],
    broke: ["Your bank account and your love life: same balance — zero.", "Paycheck to paycheck like it's a lifestyle choice."],
    debt: ["In debt but still got Uber Eats. Priorities.", "Your credit score just filed for emotional damage."],
  },
  growth: {
    evolved: ["Personal growth arc? Okay, main character.", "Evolved this year. Let's see if it sticks past January."],
    some: ["A few breakthroughs between the breakdowns. Balanced.", "Growth happened accidentally. Like mold. But growth."],
    stagnant: ["Same you, new year. Groundhog Day energy.", "Consistent at being the same. Every. Single. Year."],
    regressed: ["Went backwards? That takes talent honestly.", "You didn't just stand still — you moonwalked into chaos."],
  },
};

interface CategoryGrade { id: string; emoji: string; name: string; grade: string; gradeColor: string; roast: string; }
interface RoastResult {
  score: number; grade: string; gradeColor: string; tier: string; tierEmoji: string;
  verdict: string; categories: CategoryGrade[]; mascot: string;
}

const gradeFromWeight = (w: number) => {
  if (w >= 5) return { grade: "A+", color: "#4ade80" };
  if (w >= 4) return { grade: "A", color: "#a3e635" };
  if (w >= 3) return { grade: "B", color: "#facc15" };
  if (w >= 2) return { grade: "C", color: "#fb923c" };
  if (w >= 1) return { grade: "D", color: "#f87171" };
  return { grade: "F", color: "#dc2626" };
};

const overallTier = (score: number) => {
  if (score >= 85) return { grade: "A+", color: "#4ade80", tier: "Main Character Energy", emoji: "👑",
    verdicts: ["Disgusting. You actually had a good year.", "Annoyingly well-adjusted. Reported.", "Your year was so good it's giving the rest of us anxiety."] };
  if (score >= 70) return { grade: "A", color: "#a3e635", tier: "Quietly Winning", emoji: "✨",
    verdicts: ["Not bad. Suspiciously not bad.", "You had a solid year. Don't let it go to your head.", "Above average in a below-average world."] };
  if (score >= 55) return { grade: "B", color: "#facc15", tier: "Painfully Average", emoji: "😐",
    verdicts: ["The human equivalent of room temperature water.", "Survived the year. Not thrived. Survived.", "Your year was a 5/10. And you know it."] };
  if (score >= 40) return { grade: "C", color: "#fb923c", tier: "Struggling Gracefully", emoji: "🫠",
    verdicts: ["Held it together with duct tape and delusion.", "Your year was a controlled crash landing.", "Points for showing up. That's about it."] };
  if (score >= 25) return { grade: "D", color: "#f87171", tier: "Emotional Wreckage", emoji: "💀",
    verdicts: ["Your year needs a trigger warning.", "This year tested you and you failed.", "Rock bottom? You brought a shovel."] };
  return { grade: "F", color: "#dc2626", tier: "Certified Disaster", emoji: "☠️",
    verdicts: ["Your year should be studied as a cautionary tale.", "God tested you and you demanded extra credit.", "Honestly iconic. Terrible, but iconic."] };
};

/* ═══ FLAME PARTICLES ═══ */
function FlameParticles({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2);
    interface P { x:number;y:number;vx:number;vy:number;size:number;life:number;maxLife:number;hue:number; }
    const ps: P[] = []; const max = Math.floor(40 * intensity);
    const spawn = () => {
      if (ps.length >= max * 2) return;
      ps.push({ x: Math.random() * c.offsetWidth, y: c.offsetHeight + 10,
        vx: (Math.random() - 0.5) * 2, vy: -(1 + Math.random() * 3) * intensity,
        size: 2 + Math.random() * 6, life: 0, maxLife: 40 + Math.random() * 60,
        hue: Math.random() * 40 - 10 });
    };
    let id: number;
    const loop = () => {
      ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
      for (let i = 0; i < Math.ceil(3 * intensity); i++) spawn();
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life++; p.x += p.vx + Math.sin(p.life * 0.05) * 0.5;
        p.y += p.vy; p.vy *= 0.99; p.size *= 0.98;
        const prog = p.life / p.maxLife; const alpha = prog < 0.5 ? 1 : 1 - (prog - 0.5) * 2;
        if (p.life > p.maxLife || p.size < 0.3) { ps.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,${50 + prog * 30}%,${alpha * 0.7})`; ctx.fill();
      }
      id = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(id);
  }, [intensity]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ opacity: 0.6 }} />;
}

/* ═══ RAINBOW CONFETTI ═══ */
function RainbowConfetti({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = c.offsetWidth * 2; c.height = c.offsetHeight * 2; ctx.scale(2, 2);
    const colors = ["#f87171","#fb923c","#facc15","#4ade80","#22d3ee","#a78bfa","#f472b6"];
    interface C { x:number;y:number;vx:number;vy:number;size:number;rot:number;rs:number;color:string;rect:boolean; }
    const ps: C[] = [];
    const w = c.offsetWidth, h = c.offsetHeight;
    for (let i = 0; i < 120; i++) ps.push({
      x: Math.random() * w, y: -20 - Math.random() * h * 0.5,
      vx: (Math.random()-0.5)*4, vy: 2+Math.random()*4, size: 3+Math.random()*6,
      rot: Math.random()*Math.PI*2, rs: (Math.random()-0.5)*0.2,
      color: colors[Math.floor(Math.random()*colors.length)], rect: Math.random()>0.5 });
    let id: number;
    const loop = () => {
      ctx.clearRect(0,0,w,h); let alive = false;
      for (const p of ps) {
        p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.vx*=0.99; p.rot+=p.rs;
        if (p.y > h+20) continue; alive = true;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.color;
        if (p.rect) ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2);
        else { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        ctx.restore();
      }
      if (alive) id = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(id);
  }, [active]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none z-10" />;
}

/* ═══ SCORE RING ═══ */
function ScoreRing({ score, color, active }: { score: number; color: string; active: boolean }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    if (!active) return; setD(0);
    const dur = 2200, start = performance.now();
    const go = (now: number) => {
      const p = Math.min((now-start)/dur,1); setD(Math.round((1-Math.pow(1-p,3))*score));
      if (p<1) requestAnimationFrame(go);
    }; requestAnimationFrame(go);
  }, [active, score]);
  const circ = 2*Math.PI*80;
  return (
    <div className="relative w-[180px] h-[180px] mx-auto">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
        <circle cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ-(circ*d)/100}
          style={{ filter: `drop-shadow(0 0 10px ${color}50)` }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-['Outfit'] font-black text-[3rem] leading-none" style={{ color }}>{d}</span>
        <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-widest mt-1">Life Score</span>
      </div>
    </div>
  );
}

/* ═══ REVEAL SLIDE ═══ */
function RevealSlide({ children, bgColor, flames, flameIntensity, confetti }: {
  children: React.ReactNode; bgColor?: string; flames?: boolean; flameIntensity?: number; confetti?: boolean;
}) {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden rounded-3xl border border-white/[0.06]"
      style={{ background: bgColor || "linear-gradient(180deg, #131316 0%, #0f0f1a 100%)" }}>
      {flames && <FlameParticles intensity={flameIntensity || 1} />}
      {confetti && <RainbowConfetti active />}
      <div className="relative z-5">{children}</div>
    </div>
  );
}

/* ═══ MAIN ═══ */
type Phase = "intro" | "quiz" | "calculating" | "reveal" | "result";

export default function RoastTool() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir] = useState<"left"|"right">("left");
  const [calcMsg, setCalcMsg] = useState(0);
  const [result, setResult] = useState<RoastResult|null>(null);
  const [revIdx, setRevIdx] = useState(0);
  const [revVis, setRevVis] = useState(true);
  const [scoreActive, setScoreActive] = useState(false);

  const calcMsgs = ["Reviewing your life choices...", "Consulting your disappointed parents...",
    "Cross-referencing with your New Year's resolutions...", "Measuring expectations vs reality...",
    "Generating your emotional damage report...", "Calibrating roast intensity...", "Loading brutal honesty..."];

  const curQ = questions[qIdx];

  const selectAnswer = (v: string) => {
    setAnswers(p => ({ ...p, [curQ.id]: v }));
    setTimeout(() => {
      if (qIdx < questions.length - 1) {
        setSlideDir("left"); setTransitioning(true);
        setTimeout(() => { setQIdx(i => i + 1); setTransitioning(false); }, 300);
      } else setPhase("calculating");
    }, 400);
  };

  const prevQ = () => {
    if (qIdx > 0) { setSlideDir("right"); setTransitioning(true);
      setTimeout(() => { setQIdx(i => i - 1); setTransitioning(false); }, 300); }
  };

  useEffect(() => {
    if (phase !== "calculating") return;
    const mi = setInterval(() => setCalcMsg(m => (m+1)%calcMsgs.length), 500);
    const t = setTimeout(() => {
      clearInterval(mi);
      let tw = 0; const cats: CategoryGrade[] = [];
      const nameMap: Record<string,string> = { career:"Career", love:"Love Life", health:"Health & Fitness", social:"Social Life", finance:"Finances", growth:"Personal Growth" };
      for (const q of questions) {
        const ans = answers[q.id] || q.options[0].value;
        const opt = q.options.find(o => o.value === ans) || q.options[0];
        tw += opt.weight; const g = gradeFromWeight(opt.weight);
        cats.push({ id: q.id, emoji: q.emoji, name: nameMap[q.id]||q.id, grade: g.grade, gradeColor: g.color,
          roast: pick(roasts[q.id]?.[ans] || ["No comment."]) });
      }
      const score = Math.round((tw / (questions.length * 5)) * 100);
      const t2 = overallTier(score);
      setResult({ score, grade: t2.grade, gradeColor: t2.color, tier: t2.tier, tierEmoji: t2.emoji,
        verdict: pick(t2.verdicts), categories: cats, mascot: t2.emoji });
      setPhase("reveal"); setRevIdx(0);
    }, 3500);
    return () => { clearTimeout(t); clearInterval(mi); };
  }, [phase, answers]);

  const nextReveal = () => {
    if (!result) return;
    const total = result.categories.length + 1;
    if (revIdx < total - 1) { setRevVis(false); setTimeout(() => { setRevIdx(i=>i+1); setRevVis(true); }, 300); }
    else { setPhase("result"); setTimeout(() => setScoreActive(true), 500); }
  };

  const retry = () => {
    setPhase("intro"); setQIdx(0); setAnswers({}); setResult(null);
    setRevIdx(0); setRevVis(true); setScoreActive(false);
  };

  const pPct = phase === "quiz" ? ((qIdx+1)/questions.length)*100 : 0;

  return (
    <>
      <div className="py-4 px-5 flex items-center gap-3 border-b border-white/[0.06] relative z-10">
        <Link to="/" className="text-[#71717a] text-[0.85rem] hover:text-white transition-colors">DaFuqBro</Link>
        <span className="text-[#71717a] text-[0.75rem]">›</span>
        <span className="text-[#a1a1aa] font-semibold text-[0.85rem]">🔥 Roast My Year</span>
      </div>

      <div className="max-w-[640px] mx-auto px-5 py-10 pb-24 relative z-1">

        {/* INTRO */}
        {phase === "intro" && (
          <div className="animate-fadeInUp text-center">
            <div className="relative inline-block mb-6">
              <span className="text-[5rem] leading-none block relative z-1">🔥</span>
              <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(251,146,60,0.15)_0%,transparent_70%)] pointer-events-none" />
            </div>
            <h1 className="font-['Outfit'] font-extrabold text-[2.2rem] tracking-tight mb-3">Roast My Year</h1>
            <p className="text-[#a1a1aa] text-[1rem] leading-relaxed max-w-[440px] mx-auto mb-3">
              Answer 6 questions about your year. Get a Wrapped-style roast with animated reveals, brutal grades, and a Life Score.
            </p>
            <p className="text-[#71717a] text-[0.82rem] mb-10">Spoiler: it probably wasn't your year either.</p>
            <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-[420px] mx-auto">
              {questions.map(q => (
                <span key={q.id} className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-full px-3 py-1.5 text-[0.78rem] text-[#a1a1aa]">
                  {q.emoji} {q.id.charAt(0).toUpperCase()+q.id.slice(1)}
                </span>
              ))}
            </div>
            <button onClick={() => setPhase("quiz")}
              className="w-full max-w-[400px] py-4 rounded-[14px] bg-gradient-to-br from-[#f472b6] to-[#fb923c] text-white font-['Outfit'] text-[1.1rem] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(244,114,182,0.3)]">
              Roast Me 🔥
            </button>
          </div>
        )}

        {/* QUIZ */}
        {phase === "quiz" && (
          <div>
            <div className="w-full max-w-[480px] mx-auto mb-8">
              <div className="flex justify-between text-[0.7rem] font-['JetBrains_Mono'] text-[#71717a] mb-2">
                <span>Question {qIdx+1} of {questions.length}</span><span>{Math.round(pPct)}%</span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${pPct}%`, background: "linear-gradient(90deg, #f472b6, #fb923c)" }} />
              </div>
            </div>
            <div className={`transition-all duration-300 ${transitioning ? (slideDir==="left" ? "translate-x-[-30px] opacity-0" : "translate-x-[30px] opacity-0") : "translate-x-0 opacity-100"}`}>
              <div className="text-center mb-8">
                <span className="text-[3.5rem] block mb-3">{curQ.emoji}</span>
                <h2 className="font-['Outfit'] font-bold text-[1.6rem] tracking-tight">{curQ.question}</h2>
              </div>
              <div className="flex flex-col gap-3 max-w-[480px] mx-auto">
                {curQ.options.map((opt, i) => (
                  <button key={opt.value} onClick={() => selectAnswer(opt.value)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 animate-fadeInUp ${
                      answers[curQ.id]===opt.value ? "bg-[#f472b6]/15 border-[#f472b6]/40 scale-[1.02]"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] hover:scale-[1.01]"}`}
                    style={{ animationDelay: `${0.05*i}s`, animationFillMode: "both" }}>
                    <span className={`text-[1rem] font-medium ${answers[curQ.id]===opt.value ? "text-white" : "text-[#a1a1aa]"}`}>{opt.label}</span>
                  </button>
                ))}
              </div>
              {qIdx > 0 && <button onClick={prevQ} className="mt-6 text-[#71717a] text-[0.85rem] hover:text-[#a1a1aa] transition-colors mx-auto block">← Previous question</button>}
            </div>
          </div>
        )}

        {/* CALCULATING */}
        {phase === "calculating" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fadeInUp">
            <div className="relative">
              <div className="w-[80px] h-[80px] rounded-full border-[3px] border-white/[0.06] border-t-[#f472b6] animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-3xl">🔥</span>
            </div>
            <div className="text-[1.1rem] font-semibold text-[#a1a1aa] text-center">{calcMsgs[calcMsg]}</div>
            <div className="flex gap-1.5">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-[#f472b6] animate-pulse-dot" style={{ animationDelay: `${i*0.3}s` }} />)}
            </div>
          </div>
        )}

        {/* REVEAL SLIDES */}
        {phase === "reveal" && result && (
          <div>
            <div className={`transition-all duration-300 ${revVis ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
              {revIdx < result.categories.length ? (() => {
                const cat = result.categories[revIdx];
                const isGood = ["A+","A"].includes(cat.grade);
                const isBad = ["D","F"].includes(cat.grade);
                return (
                  <RevealSlide flames={isBad} flameIntensity={cat.grade==="F"?2:1} confetti={isGood}
                    bgColor={isBad ? "linear-gradient(180deg, #1a0a0a 0%, #0f0f1a 100%)" : isGood ? "linear-gradient(180deg, #0a1a10 0%, #0f0f1a 100%)" : undefined}>
                    <span className="text-[0.7rem] font-['JetBrains_Mono'] text-[#71717a] uppercase tracking-widest mb-4 block">{revIdx+1} / {result.categories.length}</span>
                    <span className="text-[4rem] block mb-3">{cat.emoji}</span>
                    <h2 className="font-['Outfit'] font-bold text-[1.4rem] text-[#a1a1aa] mb-2">{cat.name}</h2>
                    <div className="font-['Outfit'] font-black text-[5rem] leading-none mb-4 animate-mascotIn"
                      style={{ color: cat.gradeColor, filter: `drop-shadow(0 0 30px ${cat.gradeColor}40)` }}>{cat.grade}</div>
                    <p className="text-[#a1a1aa] text-[1.05rem] italic leading-relaxed max-w-[380px] mx-auto mb-6">"{cat.roast}"</p>
                  </RevealSlide>
                );
              })() : (
                <RevealSlide flames={result.score<40} flameIntensity={result.score<25?2.5:1.5} confetti={result.score>=70}
                  bgColor={result.score<40 ? "linear-gradient(180deg, #1a0505 0%, #0f0f1a 100%)" : result.score>=70 ? "linear-gradient(180deg, #051a0a 0%, #0f0f1a 100%)" : undefined}>
                  <span className="text-[0.7rem] font-['JetBrains_Mono'] text-[#71717a] uppercase tracking-widest mb-4 block">Final Verdict</span>
                  <div className="text-[5rem] mb-2 animate-mascotIn">{result.tierEmoji}</div>
                  <div className="font-['Outfit'] font-black text-[2.2rem] tracking-tight mb-2" style={{ color: result.gradeColor }}>{result.tier}</div>
                  <p className="text-[#a1a1aa] text-[1.05rem] italic leading-relaxed max-w-[400px] mx-auto mb-4">"{result.verdict}"</p>
                  <div className="font-['Outfit'] font-black text-[3.5rem] leading-none" style={{ color: result.gradeColor }}>{result.score}/100</div>
                </RevealSlide>
              )}
            </div>
            <button onClick={nextReveal}
              className="w-full mt-5 py-4 rounded-[14px] bg-white/[0.06] border border-white/[0.08] text-white font-['Outfit'] font-semibold text-[1rem] cursor-pointer hover:bg-white/[0.1] transition-all">
              {revIdx < result.categories.length ? "Next →" : "See Full Results →"}
            </button>
          </div>
        )}

        {/* FINAL RESULT */}
        {phase === "result" && result && (
          <div className="flex flex-col items-center gap-6 animate-fadeInUp">
            <div id="resultCard" className="w-full max-w-[480px] bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] rounded-[20px] border overflow-hidden relative"
              style={{ borderColor: result.gradeColor + "25" }}>
              <div className="absolute -top-[40%] -right-[30%] w-[70%] h-[70%] rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${result.gradeColor}10 0%, transparent 70%)` }} />
              <div className="flex justify-between items-center p-6 pb-0">
                <span className="font-['JetBrains_Mono'] text-[0.72rem] px-3 py-1 rounded-full font-semibold border"
                  style={{ color: result.gradeColor, borderColor: result.gradeColor+"30", background: result.gradeColor+"15" }}>LIFE SCORE</span>
                <span className="font-['JetBrains_Mono'] text-[0.72rem] text-[#71717a]">2025</span>
              </div>
              <div className="px-6 pt-5 pb-2"><ScoreRing score={result.score} color={result.gradeColor} active={scoreActive} /></div>
              <div className="text-center px-6 pb-4">
                <div className="text-[2.5rem] mb-1 animate-mascotIn">{result.tierEmoji}</div>
                <div className="font-['Outfit'] font-extrabold text-[1.5rem] tracking-tight mb-1" style={{ color: result.gradeColor }}>{result.tier}</div>
                <div className="text-[#a1a1aa] text-[0.85rem] italic max-w-[360px] mx-auto">"{result.verdict}"</div>
              </div>
              <div className="px-6 pb-5">
                <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-[0.15em] mb-3">Category Breakdown</div>
                <div className="grid grid-cols-2 gap-2">
                  {result.categories.map((cat, i) => (
                    <div key={cat.id} className="bg-white/[0.03] rounded-xl p-3 flex items-center gap-3 animate-fadeInUp"
                      style={{ animationDelay: `${0.5+i*0.1}s`, animationFillMode: "both" }}>
                      <span className="text-lg">{cat.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[0.72rem] text-[#71717a] truncate">{cat.name}</div>
                        <div className="font-['Outfit'] font-bold text-[1.1rem]" style={{ color: cat.gradeColor }}>{cat.grade}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center px-6 py-4 border-t border-white/[0.04]">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">dafuqbro.com</span>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">{new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
              </div>
            </div>
            <ShareButtons shareUrl="https://dafuqbro.com/roast"
              shareText={`My Life Score is ${result.score}/100 🔥 — "${result.tier}"\n\nGet roasted 👇`}
              cardId="resultCard" accentColor={result.gradeColor} />
            <div className="flex gap-3 w-full max-w-[480px]">
              <button onClick={retry} className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1] transition-all">🔄 Try Again</button>
              <Link to="/" className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1] transition-all text-center">← All Tools</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
