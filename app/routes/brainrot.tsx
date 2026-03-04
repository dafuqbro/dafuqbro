import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Brainrot Pandemic — DaFuqBro" },
  { name: "description", content: "Your brainrot is spreading. Plague Inc meets internet culture." },
  { property: "og:title", content: "Brainrot Pandemic — DaFuqBro" },
  { property: "og:description", content: "Your brainrot is a global pandemic. Watch it spread." },
  { name: "twitter:card", content: "summary_large_image" },
];

/* ═══════════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════════ */
type Phase = "intro" | "setup" | "playing" | "result";
type MutCat = "transmission" | "symptom" | "ability" | "evolution";

interface Region {
  id: string; name: string;
  paths: string[];   // main + extras all in one array
  cx: number; cy: number;
  population: number; resistance: number;
}

interface Mutation {
  id: string; emoji: string; name: string; desc: string;
  infectivity: number; severity: number; meme: number;
  cat: MutCat; ep: number; requires?: string[];
}

interface GS {
  infected: Record<string, number>;
  pct: number; day: number; active: string[];
  infectivity: number; severity: number; meme: number;
  gameOver: boolean; cureProgress: number; ep: number;
}

/* ═══════════════════════════════════════════════════════════════
   REAL WORLD MAP — equirectangular projection
   All coordinates derived from actual lat/lon:
     x = (lon + 180) / 360 * 1000
     y = (90 − lat) / 180 * 500
═══════════════════════════════════════════════════════════════ */
const REGIONS: Region[] = [
  {
    id: "na", name: "N. America",
    paths: [
      // USA + lower Canada
      "M111.1,83.3 L138.9,100 L152.8,113.9 L236.1,113.9 L272.2,133.3 L291.7,125 L313.9,119.4 L333.3,119.4 L347.2,119.4 L333.3,122.2 L319.4,127.8 L305.6,133.3 L288.9,152.8 L277.8,161.1 L272.2,166.7 L255.6,166.7 L250,169.4 L230.6,177.8 L208.3,186.1 L194.4,186.1 L175,161.1 L166.7,155.6 L155.6,138.9 L155.6,119.4 L138.9,97.2 L111.1,83.3 Z",
      // Canada north fill
      "M111.1,83.3 L166.7,83.3 L222.2,83.3 L277.8,83.3 L319.4,83.3 L333.3,77.8 L347.2,88.9 L333.3,105.6 L319.4,127.8 L291.7,125 L272.2,133.3 L236.1,113.9 L166.7,113.9 L152.8,113.9 L138.9,100 L111.1,83.3 Z",
      // Alaska
      "M33.3,52.8 L69.4,52.8 L108.3,83.3 L88.9,80.6 L77.8,88.9 L61.1,94.4 L50,83.3 L38.9,72.2 L33.3,66.7 L33.3,52.8 Z",
      // Mexico/Central America
      "M194.4,186.1 L208.3,186.1 L205.6,197.2 L200,208.3 L191.7,213.9 L183.3,216.7 L177.8,213.9 L175,200 L180.6,191.7 Z",
    ],
    cx: 230, cy: 130, population: 580, resistance: 0.30,
  },
  {
    id: "sa", name: "S. America",
    paths: [
      "M277.8,222.2 L291.7,219.4 L305.6,216.7 L327.8,219.4 L361.1,236.1 L361.1,263.9 L397.2,277.8 L402.8,272.2 L394.4,288.9 L388.9,305.6 L377.8,313.9 L366.7,327.8 L355.6,344.4 L338.9,355.6 L327.8,361.1 L319.4,402.8 L305.6,402.8 L291.7,388.9 L291.7,361.1 L291.7,333.3 L277.8,263.9 L277.8,250 L277.8,222.2 Z",
    ],
    cx: 333, cy: 310, population: 430, resistance: 0.25,
  },
  {
    id: "eu", name: "Europe",
    paths: [
      // Western + Central Europe
      "M472.2,150 L486.1,150 L500,138.9 L508.3,130.6 L522.2,127.8 L538.9,127.8 L550,138.9 L561.1,136.1 L572.2,136.1 L577.8,133.3 L583.3,122.2 L577.8,111.1 L561.1,100 L550,91.7 L550,83.3 L541.7,77.8 L527.8,75 L513.9,77.8 L500,88.9 L486.1,88.9 L477.8,105.6 L486.1,111.1 L486.1,127.8 L472.2,150 Z",
      // Scandinavia
      "M513.9,88.9 L522.2,91.7 L538.9,94.4 L550,94.4 L561.1,91.7 L572.2,83.3 L583.3,69.4 L577.8,55.6 L561.1,52.8 L550,55.6 L538.9,69.4 L527.8,75 L513.9,77.8 L513.9,88.9 Z",
      // UK island
      "M480,94.4 L486.1,91.7 L489.4,97.2 L483.3,102.8 L478.9,100 L480,94.4 Z",
    ],
    cx: 530, cy: 110, population: 750, resistance: 0.42,
  },
  {
    id: "af", name: "Africa",
    paths: [
      "M450,205.6 L458.3,216.7 L463.9,225 L477.8,236.1 L486.1,236.1 L500,236.1 L511.1,236.1 L522.2,238.9 L527.8,244.4 L538.9,238.9 L550,238.9 L561.1,238.9 L572.2,236.1 L583.3,238.9 L594.4,250 L600,261.1 L605.6,272.2 L611.1,283.3 L600,305.6 L588.9,319.4 L577.8,333.3 L566.7,344.4 L555.6,347.2 L550,344.4 L538.9,322.2 L527.8,308.3 L516.7,294.4 L511.1,272.2 L502.8,252.8 L494.4,238.9 L486.1,236.1 L477.8,236.1 L463.9,225 L450,211.1 L450,205.6 Z",
      // Madagascar
      "M603.3,302.8 L607.8,308.3 L608.9,319.4 L605.6,327.8 L600,325 L597.2,313.9 L598.9,305.6 Z",
    ],
    cx: 530, cy: 280, population: 1400, resistance: 0.15,
  },
  {
    id: "ru", name: "Russia",
    paths: [
      // Western Russia to Urals
      "M577.8,50 L640,47.2 L720,47.2 L800,50 L860,56 L920,61.1 L966.7,83.3 L944.4,94.4 L900,100 L861.1,116.7 L844.4,105.6 L800,105.6 L750,100 L694.4,94.4 L666.7,105.6 L652.8,111.1 L638.9,105.6 L625,111.1 L616.7,122.2 L605.6,116.7 L594.4,111.1 L577.8,100 L561.1,83.3 L566.7,69.4 L577.8,61.1 L577.8,50 Z",
      // Siberia far east bump
      "M944.4,61.1 L966.7,55.6 L983.3,61.1 L983.3,77.8 L966.7,83.3 L944.4,75 Z",
    ],
    cx: 760, cy: 82, population: 145, resistance: 0.38,
  },
  {
    id: "as", name: "Asia",
    paths: [
      // Main Asia body
      "M625,133.3 L638.9,130.6 L666.7,127.8 L694.4,127.8 L722.2,116.7 L750,111.1 L794.4,105.6 L833.3,105.6 L855.6,111.1 L866.7,122.2 L877.8,138.9 L855.6,138.9 L838.9,138.9 L827.8,133.3 L822.2,122.2 L827.8,111.1 L838.9,116.7 L855.6,111.1 L827.8,111.1 L805.6,122.2 L800,133.3 L805.6,144.4 L816.7,152.8 L827.8,155.6 L838.9,150 L855.6,150 L866.7,144.4 L877.8,150 L883.3,161.1 L877.8,172.2 L866.7,177.8 L850,177.8 L838.9,183.3 L827.8,194.4 L816.7,205.6 L805.6,211.1 L794.4,216.7 L783.3,205.6 L772.2,194.4 L766.7,183.3 L755.6,172.2 L744.4,166.7 L733.3,172.2 L722.2,177.8 L711.1,172.2 L705.6,161.1 L700,155.6 L688.9,150 L677.8,144.4 L666.7,150 L655.6,155.6 L644.4,155.6 L633.3,150 L622.2,144.4 L616.7,138.9 L619.4,133.3 L625,133.3 Z",
      // Indian subcontinent
      "M688.9,183.3 L700,188.9 L711.1,194.4 L716.7,200 L722.2,211.1 L716.7,222.2 L711.1,227.8 L705.6,222.2 L700,211.1 L694.4,200 L688.9,188.9 L683.3,183.3 L683.3,177.8 L688.9,177.8 L688.9,183.3 Z",
      // SE Asia peninsula
      "M766.7,183.3 L772.2,194.4 L777.8,205.6 L783.3,216.7 L783.3,230.6 L777.8,238.9 L772.2,244.4 L766.7,238.9 L761.1,227.8 L761.1,216.7 L761.1,205.6 L761.1,194.4 L766.7,183.3 Z",
      // Japan islands
      "M883.3,138.9 L888.9,133.3 L894.4,133.3 L894.4,144.4 L888.9,150 L883.3,147.2 Z",
      "M877.8,150 L883.3,150 L886.1,155.6 L883.3,163.9 L877.8,163.9 L875,158.3 Z",
    ],
    cx: 750, cy: 155, population: 3200, resistance: 0.32,
  },
  {
    id: "me", name: "Middle East",
    paths: [
      "M600,144.4 L613.9,141.7 L622.2,144.4 L633.3,150 L644.4,155.6 L655.6,155.6 L661.1,166.7 L661.1,177.8 L655.6,188.9 L644.4,197.2 L633.3,200 L622.2,197.2 L613.9,188.9 L608.3,180.6 L602.8,172.2 L597.2,161.1 L597.2,152.8 L600,144.4 Z",
      // Arabian peninsula
      "M619.4,200 L627.8,200 L638.9,205.6 L647.2,216.7 L650,230.6 L644.4,241.7 L633.3,244.4 L622.2,238.9 L613.9,227.8 L613.9,213.9 L616.7,205.6 Z",
    ],
    cx: 630, cy: 185, population: 420, resistance: 0.28,
  },
  {
    id: "oc", name: "Oceania",
    paths: [
      // Australia
      "M816.7,311.1 L827.8,300 L838.9,300 L850,294.4 L861.1,288.9 L872.2,283.3 L883.3,283.3 L894.4,288.9 L905.6,300 L911.1,311.1 L922.2,316.7 L927.8,327.8 L927.8,338.9 L922.2,350 L911.1,361.1 L900,361.1 L888.9,355.6 L877.8,350 L866.7,344.4 L855.6,344.4 L844.4,344.4 L833.3,350 L822.2,350 L816.7,338.9 L816.7,311.1 Z",
      // New Zealand
      "M961.1,372.2 L966.7,366.7 L972.2,361.1 L977.8,361.1 L977.8,372.2 L972.2,377.8 L966.7,377.8 Z",
      "M972.2,344.4 L977.8,338.9 L983.3,344.4 L980.6,355.6 L975,358.3 L972.2,352.8 Z",
    ],
    cx: 872, cy: 325, population: 45, resistance: 0.48,
  },
];

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════════════════════════ */
const SLOTS: Record<MutCat, number> = { transmission: 3, symptom: 3, ability: 2, evolution: 1 };

const CAT_META: Record<MutCat, { label: string; color: string; rgb: string }> = {
  transmission: { label: "Transmission", color: "#ff6b6b", rgb: "255,107,107" },
  symptom:      { label: "Symptoms",     color: "#ffa94d", rgb: "255,169,77"  },
  ability:      { label: "Abilities",    color: "#b197fc", rgb: "177,151,252" },
  evolution:    { label: "Evolution",    color: "#ffd43b", rgb: "255,212,59"  },
};

const MUTS: Mutation[] = [
  { id:"airborne",   emoji:"💨", name:"Airborne",         desc:"Spreads through viral exhales & shared timelines",   infectivity:22, severity:5,  meme:12, cat:"transmission", ep:2 },
  { id:"waterborne", emoji:"💧", name:"Waterborne",        desc:"Via shared WiFi, hotspots & group chats",            infectivity:16, severity:8,  meme:10, cat:"transmission", ep:2 },
  { id:"direct",     emoji:"🤝", name:"Direct Contact",    desc:"Spread through refusing to touch grass",             infectivity:12, severity:14, meme:8,  cat:"transmission", ep:2 },
  { id:"vector",     emoji:"🐀", name:"Influencer Vector", desc:"Carried by macro-influencers to new demographics",   infectivity:28, severity:6,  meme:18, cat:"transmission", ep:3, requires:["airborne"] },
  { id:"algorithm",  emoji:"⚙️", name:"Algorithm Boost",   desc:"FYP force-feeds your brainrot to millions daily",    infectivity:35, severity:5,  meme:28, cat:"transmission", ep:4, requires:["vector"] },
  { id:"skibidi",    emoji:"🚽", name:"Skibidi Syndrome",  desc:"Uncontrollable urge to say 'skibidi toilet'",        infectivity:5,  severity:20, meme:32, cat:"symptom",      ep:2 },
  { id:"sigma",      emoji:"🐺", name:"Sigma Delusion",    desc:"Victim thinks they're on a 3am sigma grindset",     infectivity:8,  severity:26, meme:22, cat:"symptom",      ep:2 },
  { id:"npc",        emoji:"🤖", name:"NPC Behavior",      desc:"Repeating the same 3 phrases on loop",              infectivity:10, severity:16, meme:28, cat:"symptom",      ep:2 },
  { id:"aura",       emoji:"✨", name:"Aura Obsession",    desc:"Tracking aura points for every minor life event",   infectivity:14, severity:12, meme:38, cat:"symptom",      ep:3, requires:["skibidi"] },
  { id:"cortisol",   emoji:"😰", name:"Cortisol Face",     desc:"Stress-bloat from 18-hour doomscroll sessions",     infectivity:6,  severity:30, meme:15, cat:"symptom",      ep:3, requires:["sigma"] },
  { id:"immunity",   emoji:"🧬", name:"Meme Immunity",     desc:"Brainrot evolves resistance to touching grass",      infectivity:5,  severity:12, meme:20, cat:"ability",      ep:3 },
  { id:"streamer",   emoji:"🎮", name:"Streamer Mode",     desc:"Infected hosts livestream their entire life",        infectivity:20, severity:14, meme:22, cat:"ability",      ep:3, requires:["immunity"] },
  { id:"delulu",     emoji:"🦋", name:"Delulu Evolution",  desc:"Delusion becomes the solution. Unstoppable.",       infectivity:16, severity:32, meme:45, cat:"ability",      ep:5, requires:["immunity","npc"] },
  { id:"rizz",       emoji:"😏", name:"Unspoken Rizz",     desc:"Brainrot spreads via pure vibes. No words needed.", infectivity:24, severity:8,  meme:35, cat:"ability",      ep:4, requires:["streamer"] },
  { id:"omega",      emoji:"☠️", name:"Omega Brainrot",    desc:"Final form. Humanity forgets what outside means.",  infectivity:50, severity:50, meme:100,cat:"evolution",   ep:10, requires:["algorithm","delulu"] },
  { id:"chrono",     emoji:"💀", name:"Chronically Online",desc:"Reality and timeline merge. No coming back.",       infectivity:40, severity:40, meme:80, cat:"evolution",   ep:8,  requires:["airborne","cortisol","rizz"] },
];

const EP_MILESTONES = [
  {t:10,ep:1,msg:"+1 EP — Outbreak detected"},{t:20,ep:1,msg:"+1 EP — Panic spreading"},
  {t:35,ep:2,msg:"+2 EP — WHO concerned"},{t:50,ep:2,msg:"+2 EP — Continental crisis"},
  {t:65,ep:3,msg:"+3 EP — Global emergency"},{t:80,ep:3,msg:"+3 EP — Governments collapsing"},
  {t:92,ep:5,msg:"+5 EP — Total brainrot"},
];

const NEWS = {
  early:   ["Brain deterioration linked to phones baffles scientists","CDC: teens forgetting eye contact","Local teen diagnosed with 'permanent FYP face'"],
  mid:     ["WHO declares brainrot a global health concern","Schools ban phones — students speak only TikTok audio","NASA scientists caught doomscrolling during launch"],
  late:    ["UN emergency: 'The memes have won'","Last library closes — books officially 'mid'","Touching grass declared illegal in 47 countries"],
  endgame: ["Civilization has fallen. Brainrot is complete.","Earth renamed 'Skibidi Planet' by unanimous vote","AI declares humanity 'cooked beyond repair'"],
};

const PATIENT_ZERO = [
  {id:"doomscroller",emoji:"📱",label:"The Doomscroller", desc:"12+ hrs screen/day",    inf:10,sev:5, region:"na",ep:3},
  {id:"shitposter",  emoji:"💩",label:"The Shitposter",   desc:"50 memes pre-breakfast",inf:15,sev:8, region:"eu",ep:4},
  {id:"tiktoker",    emoji:"🎵",label:"The TikToker",     desc:"Everything is content", inf:20,sev:3, region:"as",ep:5},
  {id:"gamer",       emoji:"🎮",label:"The Gamer",        desc:"No grass since 2019",   inf:8, sev:15,region:"oc",ep:2},
];

/* ═══════════════════════════════════════════════════════════════
   COLOUR HELPERS — Plague Inc style warm infection gradient
═══════════════════════════════════════════════════════════════ */
function iColor(p: number, alpha = 1): string {
  if (p <= 0) return `rgba(20,28,55,${alpha * 0.85})`;   // dark navy (uninfected land)
  // warm gradient: yellow-green → orange → deep red
  if (p < 15)  return `rgba(120,180,40,${alpha})`;
  if (p < 30)  return `rgba(180,200,20,${alpha})`;
  if (p < 50)  return `rgba(220,160,10,${alpha})`;
  if (p < 70)  return `rgba(220,80,10,${alpha})`;
  if (p < 88)  return `rgba(200,30,10,${alpha})`;
  return `rgba(160,10,10,${alpha})`;
}

function iGlow(p: number): string {
  if (p < 5) return "none";
  const i = Math.min(1, p / 100);
  if (p < 15) return `drop-shadow(0 0 ${4+i*8}px rgba(160,220,30,0.7))`;
  if (p < 50) return `drop-shadow(0 0 ${6+i*12}px rgba(220,120,10,0.7))`;
  return `drop-shadow(0 0 ${8+i*16}px rgba(200,30,10,0.8))`;
}

function getResult(gs: GS) {
  const avg = Object.values(gs.infected).reduce((a,b)=>a+b,0) / REGIONS.length;
  const m = gs.active.length;
  if (avg>=88&&m>=6) return {title:"EXTINCTION-LEVEL BRAINROT",emoji:"💀",color:"#E05544",grade:"S+",desc:"You ended civilization. Historians will study your brainrot for centuries. If they can still read.",roast:"You are the reason aliens won't visit us."};
  if (avg>=68)       return {title:"GLOBAL PANDEMIC",emoji:"🌍",color:"#fb923c",grade:"S", desc:"Every continent is cooked. WHO gave up. Your brainrot achieved what real pandemics dream of.",roast:"Your screen time report is a WMD."};
  if (avg>=48)       return {title:"CONTINENTAL CRISIS",emoji:"🦠",color:"#F5C518",grade:"A",desc:"Half the world infected. Governments scrambling. Your brainrot is on the news.",roast:"You're why your mom asks 'what's a sigma' at dinner."};
  if (avg>=28)       return {title:"REGIONAL OUTBREAK",emoji:"📡",color:"#a78bfa",grade:"B",desc:"Spread but never global. Needed more mutations.",roast:"Mid pandemic energy. Even COVID did better."};
  return                   {title:"CONTAINED INCIDENT",emoji:"🧪",color:"#8B7EA8",grade:"C",desc:"Your brainrot barely left your group chat.",roast:"Couldn't even go viral. That's the real brainrot."};
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function BrainrotPandemic() {
  const [phase,     setPhase]     = useState<Phase>("intro");
  const [gs,        setGs]        = useState<GS>({ infected:Object.fromEntries(REGIONS.map(r=>[r.id,0])), pct:0,day:0,active:[], infectivity:10,severity:5,meme:0, gameOver:false,cureProgress:0,ep:0 });
  const [paused,    setPaused]    = useState(false);
  const [speed,     setSpeed]     = useState(800);
  const [toast,     setToast]     = useState<{txt:string;type:"news"|"ep"}|null>(null);
  const [selCat,    setSelCat]    = useState<MutCat>("transmission");
  const [showMuts,  setShowMuts]  = useState(false);
  const awarded = useRef<Set<number>>(new Set());

  const showToast = (txt:string, type:"news"|"ep") => {
    setToast({txt,type}); setTimeout(()=>setToast(null),4200);
  };

  const startGame = (pz: typeof PATIENT_ZERO[0]) => {
    awarded.current = new Set();
    const inf = Object.fromEntries(REGIONS.map(r=>[r.id,0]));
    inf[pz.region] = 5;
    setGs({ infected:inf, pct:5, day:0, active:[], infectivity:10+pz.inf, severity:5+pz.sev, meme:0, gameOver:false, cureProgress:0, ep:pz.ep });
    setPhase("playing"); setPaused(false); setShowMuts(false);
  };

  /* ── TICK ── */
  useEffect(() => {
    if (phase!=="playing"||paused||gs.gameOver) return;
    const id = setInterval(() => {
      setGs(prev => {
        const inf = {...prev.infected};
        for (const r of REGIONS) {
          const c = inf[r.id]; if (c<=0||c>=100) continue;
          const rate = (prev.infectivity/100)*(1-r.resistance)*(1+prev.meme/200);
          inf[r.id] = Math.min(100, c+c*rate*0.08+rate*0.3);
        }
        for (const r of REGIONS) {
          if (inf[r.id]>18) for (const o of REGIONS) {
            if (o.id===r.id||inf[o.id]>0) continue;
            if (Math.random()<(prev.infectivity/500)*(inf[r.id]/100)) inf[o.id]=1;
          }
        }
        const totPop = REGIONS.reduce((a,r)=>a+r.population,0);
        const totInf = REGIONS.reduce((a,r)=>a+(inf[r.id]/100)*r.population,0);
        const pct = (totInf/totPop)*100;
        let epGain=0;
        for (const m of EP_MILESTONES) {
          if (pct>=m.t&&!awarded.current.has(m.t)) { awarded.current.add(m.t); epGain+=m.ep; showToast(m.msg,"ep"); }
        }
        const cure = Math.min(100, prev.cureProgress+(prev.day>15 ? 0.55-prev.meme/420 : 0));
        const day = prev.day+1;
        if (day%9===0) {
          const pool = pct<25?NEWS.early:pct<50?NEWS.mid:pct<80?NEWS.late:NEWS.endgame;
          showToast("📰 "+pool[Math.floor(Math.random()*pool.length)],"news");
        }
        const avg = Object.values(inf).reduce((a,b)=>a+b,0)/REGIONS.length;
        const over = avg>=95||cure>=100||day>=120;
        if (over) fetch("/api/track",{method:"POST"}).catch(()=>{});
        return {...prev,infected:inf,pct:Math.round(pct),day,gameOver:over,cureProgress:cure,ep:prev.ep+epGain};
      });
    }, speed);
    return ()=>clearInterval(id);
  }, [phase,paused,gs.gameOver,speed]);

  useEffect(()=>{ if(gs.gameOver&&phase==="playing") setTimeout(()=>setPhase("result"),1600); },[gs.gameOver,phase]);

  const activeOf = (cat:MutCat) => gs.active.filter(id=>MUTS.find(m=>m.id===id)?.cat===cat);

  const canUnlock = (mut:Mutation):{ok:boolean;reason?:string} => {
    if (gs.active.includes(mut.id))              return {ok:false,reason:"Active"};
    if (gs.ep<mut.ep)                            return {ok:false,reason:`Need ${mut.ep} EP`};
    if (activeOf(mut.cat).length>=SLOTS[mut.cat])return {ok:false,reason:"Slots full"};
    if (mut.requires) for (const r of mut.requires)
      if (!gs.active.includes(r)) return {ok:false,reason:`Needs ${MUTS.find(m=>m.id===r)?.name}`};
    return {ok:true};
  };

  const unlock = (mut:Mutation) => {
    if (!canUnlock(mut).ok) return;
    setGs(p=>({...p, active:[...p.active,mut.id], infectivity:p.infectivity+mut.infectivity, severity:p.severity+mut.severity, meme:p.meme+mut.meme, ep:p.ep-mut.ep}));
  };

  const result = phase==="result" ? getResult(gs) : null;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <>
      <Header />
      <div style={{minHeight:"100vh",background:"#05060e",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>

        {/* ══ INTRO ══ */}
        {phase==="intro" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:32,textAlign:"center",animation:"fadeUp 0.5s ease both"}}>
            <Link to="/" style={{color:"#282840",fontSize:13,textDecoration:"none",marginBottom:36}}>← back to tools</Link>
            <div style={{fontSize:80,marginBottom:20,filter:"drop-shadow(0 0 30px rgba(224,85,68,0.5))"}}>🧠🦠</div>
            <h1 style={{fontSize:"clamp(2.6rem,6vw,4rem)",fontWeight:900,color:"#eeeef8",margin:"0 0 16px",letterSpacing:"-0.03em",lineHeight:1.05}}>Brainrot Pandemic</h1>
            <p style={{color:"#505080",fontSize:17,lineHeight:1.75,maxWidth:540,marginBottom:12}}>
              Your brainrot is <span style={{color:"#ff6b6b",fontWeight:700}}>Patient Zero</span>. Spread infection across the real world, earn EP, unlock mutations with prerequisites.
            </p>
            <p style={{color:"#1e1e36",fontSize:13,fontFamily:"'JetBrains Mono',monospace",marginBottom:48}}>plague inc. but make it chronically online.</p>
            <button onClick={()=>setPhase("setup")} style={{background:"linear-gradient(135deg,#aa1818,#dd3333)",color:"#fff",border:"none",borderRadius:50,padding:"18px 56px",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 8px 40px rgba(200,30,30,0.4)",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 56px rgba(200,30,30,0.55)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 40px rgba(200,30,30,0.4)";}}>
              🦠 Start Pandemic
            </button>
          </div>
        )}

        {/* ══ SETUP ══ */}
        {phase==="setup" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:32,animation:"fadeUp 0.5s ease both"}}>
            <h2 style={{fontSize:"2.4rem",fontWeight:900,color:"#eeeef8",margin:"0 0 8px",letterSpacing:"-0.025em"}}>Choose Patient Zero</h2>
            <p style={{color:"#2a2a4a",fontFamily:"'JetBrains Mono',monospace",fontSize:13,marginBottom:36}}>who started the outbreak?</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,maxWidth:860,width:"100%"}}>
              {PATIENT_ZERO.map(pz=>(
                <button key={pz.id} onClick={()=>startGame(pz)} style={{background:"linear-gradient(160deg,#111120,#0c0c1a)",border:"1px solid rgba(255,80,80,0.10)",borderRadius:22,padding:"28px 22px",textAlign:"left",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Outfit',sans-serif"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,80,80,0.42)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(180,30,30,0.15)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,80,80,0.10)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <span style={{fontSize:40,display:"block",marginBottom:14}}>{pz.emoji}</span>
                  <h3 style={{fontSize:17,fontWeight:800,color:"#eeeef8",margin:"0 0 5px"}}>{pz.label}</h3>
                  <p style={{color:"#363660",fontSize:13,margin:"0 0 16px",lineHeight:1.5}}>{pz.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,80,80,0.12)",color:"#ff6b6b"}}>+{pz.inf} inf</span>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,200,40,0.10)",color:"#ffd43b"}}>{pz.ep} EP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ PLAYING ══ */}
        {phase==="playing" && (
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 64px)",overflow:"hidden"}}>

            {/* Toast */}
            {toast && (
              <div style={{position:"fixed",top:64,left:0,right:0,zIndex:300,display:"flex",justifyContent:"center",pointerEvents:"none",animation:"slideDown 0.3s ease both"}}>
                <div style={{background:toast.type==="ep"?"#e8c000":"#9a1010",color:toast.type==="ep"?"#1a1200":"#fff",padding:"9px 28px",borderRadius:"0 0 16px 16px",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,boxShadow:toast.type==="ep"?"0 6px 28px rgba(220,180,0,0.5)":"0 6px 28px rgba(160,0,0,0.5)",maxWidth:"92vw",textAlign:"center"}}>{toast.txt}</div>
              </div>
            )}

            {/* ── TOP HUD ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,padding:"10px 18px",background:"rgba(3,4,12,0.97)",borderBottom:"1px solid rgba(255,255,255,0.04)",backdropFilter:"blur(10px)",zIndex:20,flexShrink:0}}>
              {/* Stats */}
              <div style={{display:"flex",gap:20,alignItems:"center",flexWrap:"wrap"}}>
                <HudStat label="DAY"      val={String(gs.day)}       color="#606090"/>
                <HudStat label="INFECTED" val={`${gs.pct}%`}         color="#ff4444"/>
                <HudStat label="MEME LVL" val={String(gs.meme)}      color="#ddaa00"/>
                {gs.cureProgress>0 && <HudStat label="CURE" val={`${Math.round(gs.cureProgress)}%`} color="#22c55e"/>}
              </div>
              {/* EP */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 20px",borderRadius:40,background:"rgba(220,180,0,0.10)",border:"1px solid rgba(220,180,0,0.28)"}}>
                <span style={{fontSize:20}}>⚗️</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:24,fontWeight:900,color:"#ffd43b",lineHeight:1}}>{gs.ep}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#806600",letterSpacing:"0.12em"}}>EP</span>
              </div>
              {/* Controls */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <HudBtn onClick={()=>setPaused(!paused)} label={paused?"▶ PLAY":"⏸ PAUSE"}/>
                <HudBtn onClick={()=>setSpeed(s=>s===800?400:s===400?200:800)} label={speed===800?"1×":speed===400?"2×":"3×"}/>
                <button onClick={()=>setShowMuts(!showMuts)} style={{padding:"7px 16px",borderRadius:10,cursor:"pointer",fontWeight:800,fontSize:13,fontFamily:"'JetBrains Mono',monospace",transition:"all 0.15s",border:"none",background:showMuts?"rgba(177,151,252,0.22)":"rgba(177,151,252,0.07)",color:showMuts?"#c4aaff":"#6648aa",boxShadow:showMuts?"0 0 18px rgba(177,151,252,0.3)":"none"}}>
                  🧬 MUTATE {gs.active.length>0&&`(${gs.active.length})`}
                </button>
              </div>
            </div>

            {/* ── MAP ── */}
            <div style={{position:"relative",flex:1,overflow:"hidden",background:"#060914"}}>

              {/* ─── REAL WORLD MAP: accurate equirectangular SVG ─── */}
              <svg
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid slice"
                style={{width:"100%",height:"100%",display:"block",position:"absolute",inset:0}}
              >
                <defs>
                  {/* Deep ocean gradient — warm teal like real Plague Inc map */}
                  <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#0a2040"/>
                    <stop offset="50%"  stopColor="#081830"/>
                    <stop offset="100%" stopColor="#050e20"/>
                  </linearGradient>
                  {/* Latitude gradient overlay for depth */}
                  <linearGradient id="latGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.02"/>
                    <stop offset="50%"  stopColor="#4488ff" stopOpacity="0.03"/>
                    <stop offset="100%" stopColor="#000000" stopOpacity="0.04"/>
                  </linearGradient>
                  <filter id="landShadow">
                    <feDropShadow dx="1.5" dy="2" stdDeviation="2.5" floodColor="#000010" floodOpacity="0.8"/>
                  </filter>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Ocean base */}
                <rect width="1000" height="500" fill="url(#oceanGrad)"/>
                <rect width="1000" height="500" fill="url(#latGrad)"/>

                {/* Ocean texture lines (longitude) */}
                {[0,100,200,300,400,500,600,700,800,900,1000].map(x=>(
                  <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#ffffff" strokeWidth="0.2" strokeOpacity="0.025"/>
                ))}
                {/* Latitude lines */}
                {[83,125,167,208,250,292,333,375,417].map(y=>(
                  <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#4488ff" strokeWidth="0.3" strokeOpacity="0.06"/>
                ))}
                {/* Equator highlighted */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#4488ff" strokeWidth="0.6" strokeOpacity="0.18"/>
                {/* Tropics */}
                <line x1="0" y1="203" x2="1000" y2="203" stroke="#3366cc" strokeWidth="0.4" strokeOpacity="0.10" strokeDasharray="4,8"/>
                <line x1="0" y1="297" x2="1000" y2="297" stroke="#3366cc" strokeWidth="0.4" strokeOpacity="0.10" strokeDasharray="4,8"/>

                {/* Ocean labels */}
                <text x="90"  y="390" textAnchor="middle" fill="#0d2040" fontSize="15" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="6">PACIFIC</text>
                <text x="320" y="300" textAnchor="middle" fill="#0a1830" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="4">ATLANTIC</text>
                <text x="850" y="430" textAnchor="middle" fill="#0a1830" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="3">INDIAN</text>
                <text x="900" y="160" textAnchor="middle" fill="#0a1830" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="3">PACIFIC</text>

                {/* ── CONTINENT PATHS ── */}
                {REGIONS.map(r => {
                  const p = gs.infected[r.id] || 0;
                  const col = iColor(p);
                  const glow = iGlow(p);
                  return (
                    <g key={r.id}>
                      {/* Shadow layer */}
                      {r.paths.map((d,i)=>(
                        <path key={`sh${i}`} d={d} fill="#000418" transform="translate(2,3)" opacity="0.7"
                          style={{filter:"blur(3px)"}}/>
                      ))}
                      {/* Main land fill */}
                      {r.paths.map((d,i)=>(
                        <path key={`land${i}`} d={d} fill={col} stroke="#0a1428" strokeWidth="0.7"
                          style={{filter:glow, transition:"fill 0.9s ease, filter 0.9s ease"}}/>
                      ))}
                      {/* Coastline sheen */}
                      {r.paths.map((d,i)=>(
                        <path key={`coast${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="0.8"/>
                      ))}
                      {/* Infection pulse ring */}
                      {p>0&&p<97&&(
                        <circle cx={r.cx} cy={r.cy} r={5+p/14} fill="none"
                          stroke={p<30?"#90cc30":p<60?"#cc7010":"#cc2010"}
                          strokeWidth="1.5" opacity="0.5">
                          <animate attributeName="r" from={5+p/14} to={13+p/9} dur="2.6s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" from="0.5" to="0" dur="2.6s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      {/* Hotspot dot */}
                      {p>0&&(
                        <circle cx={r.cx} cy={r.cy} r={p>=80?5:3.5} opacity="0.95"
                          fill={p<30?"#a0e020":p<60?"#e08010":"#e02020"}
                          style={{filter:`drop-shadow(0 0 5px ${p<30?"rgba(140,210,20,0.8)":p<60?"rgba(200,100,10,0.8)":"rgba(200,20,10,0.8)"})`}}/>
                      )}
                      {/* Region name */}
                      <text x={r.cx} y={r.cy-9} textAnchor="middle"
                        fill={p>25?"rgba(255,255,255,0.90)":"rgba(80,90,140,0.70)"}
                        fontSize="7" fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                        style={{transition:"fill 0.7s ease",pointerEvents:"none",
                          textShadow:p>25?"0 1px 4px rgba(0,0,0,0.9)":"none"}}>
                        {r.name}
                      </text>
                      {/* Infection % */}
                      <text x={r.cx} y={r.cy+5} textAnchor="middle"
                        fill={p>0?(p<30?"#a0e020":p<60?"#e08010":"#e02020"):"rgba(40,50,100,0.6)"}
                        fontSize="7.5" fontFamily="'JetBrains Mono',monospace" fontWeight="900"
                        style={{transition:"fill 0.7s ease",pointerEvents:"none",
                          textShadow:p>10?"0 1px 5px rgba(0,0,0,0.95)":"none"}}>
                        {p>0?`${Math.round(p)}%`:""}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* ── REGION BARS — bottom of map ── */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"22px 16px 10px",background:"linear-gradient(0deg,rgba(3,4,12,0.98) 0%,rgba(3,4,12,0.75) 60%,transparent 100%)"}}>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end"}}>
                  {REGIONS.map(r=>{
                    const p = gs.infected[r.id]||0;
                    const c = p<30?"#90cc20":p<60?"#cc7010":"#cc2010";
                    return (
                      <div key={r.id} style={{flex:"1 1 88px",minWidth:76,maxWidth:140}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:9.5,fontWeight:700,color:p>0?"#a0a0c8":"#242445",fontFamily:"'JetBrains Mono',monospace"}}>{r.name}</span>
                          <span style={{fontSize:9.5,fontWeight:900,color:p>0?c:"#161630",fontFamily:"'JetBrains Mono',monospace"}}>{p>0?`${Math.round(p)}%`:""}</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${p}%`,borderRadius:3,background:c,transition:"width 0.5s ease",boxShadow:p>15?`0 0 5px ${c}`:""}}/>
                        </div>
                        <div style={{fontSize:8.5,color:"#1e1e40",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                          {p>0?`${Math.round((p/100)*r.population)}M / `:"0M / "}{r.population}M
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cure bar */}
              {gs.cureProgress>2&&(
                <div style={{position:"absolute",top:8,left:16,right:16,zIndex:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,background:"rgba(3,4,12,0.85)",borderRadius:10,padding:"5px 14px",border:"1px solid rgba(34,197,94,0.2)"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#22c55e",letterSpacing:"0.1em"}}>🧬 CURE {Math.round(gs.cureProgress)}%</span>
                    <div style={{flex:1,height:4,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${gs.cureProgress}%`,borderRadius:4,background:"linear-gradient(90deg,#16a34a,#4ade80)",transition:"width 0.5s ease",boxShadow:"0 0 8px rgba(74,222,128,0.5)"}}/>
                    </div>
                  </div>
                </div>
              )}

              {/* ── MUTATION OVERLAY ── */}
              {showMuts&&(
                <div style={{position:"absolute",inset:0,zIndex:100,background:"rgba(3,4,12,0.92)",backdropFilter:"blur(10px)",display:"flex",flexDirection:"column",animation:"fadeUp 0.22s ease both"}}>
                  {/* Category tabs */}
                  <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
                    {(Object.keys(CAT_META) as MutCat[]).map(cat=>{
                      const cm=CAT_META[cat]; const used=activeOf(cat).length; const max=SLOTS[cat]; const sel=selCat===cat;
                      return(
                        <button key={cat} onClick={()=>setSelCat(cat)} style={{flex:1,padding:"13px 6px",cursor:"pointer",border:"none",borderBottom:sel?`2px solid ${cm.color}`:"2px solid transparent",background:sel?`rgba(${cm.rgb},0.09)`:"transparent",transition:"all 0.15s",fontFamily:"'Outfit',sans-serif"}}>
                          <div style={{fontSize:13,fontWeight:800,color:sel?cm.color:"#383860"}}>{cm.label}</div>
                          <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:4}}>
                            {Array.from({length:max}).map((_,i)=>(
                              <span key={i} style={{display:"inline-block",width:8,height:8,borderRadius:2,background:i<used?cm.color:"rgba(255,255,255,0.07)",boxShadow:i<used?`0 0 5px ${cm.color}`:"none"}}/>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                    <button onClick={()=>setShowMuts(false)} style={{padding:"13px 20px",cursor:"pointer",border:"none",background:"transparent",color:"#282850",fontSize:22,lineHeight:1}}>✕</button>
                  </div>

                  {/* EP reminder */}
                  <div style={{padding:"10px 20px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(220,180,0,0.05)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#887000"}}>⚗️ Available EP:</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:18,fontWeight:900,color:"#ffd43b"}}>{gs.ep}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#383820",marginLeft:"auto"}}>Click to unlock · Earn EP by infecting more regions</span>
                  </div>

                  {/* Mutation grid */}
                  <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexWrap:"wrap",gap:14,alignContent:"flex-start",scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.07) transparent"}}>
                    {MUTS.filter(m=>m.cat===selCat).map(mut=>{
                      const active=gs.active.includes(mut.id);
                      const check=canUnlock(mut);
                      const locked=!active&&!check.ok;
                      const cm=CAT_META[mut.cat];
                      const prereqs=mut.requires?.map(id=>MUTS.find(m=>m.id===id)?.name??id);
                      return(
                        <div key={mut.id} onClick={()=>!active&&unlock(mut)} style={{
                          width:"calc(50% - 7px)",minWidth:200,borderRadius:22,padding:"20px",
                          background:active?`linear-gradient(135deg,rgba(${cm.rgb},0.18),rgba(${cm.rgb},0.07))`
                            :locked?"rgba(8,8,18,0.9)":"rgba(12,14,26,0.95)",
                          border:`1px solid ${active?cm.color:locked?"rgba(25,25,45,0.9)":cm.color+"50"}`,
                          cursor:active?"default":locked?"not-allowed":"pointer",
                          transition:"all 0.2s",opacity:locked?0.45:1,
                          boxShadow:active?`0 0 22px rgba(${cm.rgb},0.22)`:check.ok&&!active?`0 4px 20px rgba(${cm.rgb},0.08)`:"none",
                        }}
                          onMouseEnter={e=>{if(!locked&&!active){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 10px 32px rgba(${cm.rgb},0.22)`;e.currentTarget.style.borderColor=cm.color;}}}
                          onMouseLeave={e=>{if(!locked&&!active){e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 4px 20px rgba(${cm.rgb},0.08)`;e.currentTarget.style.borderColor=cm.color+"50";}}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                            <span style={{fontSize:30,lineHeight:1}}>{mut.emoji}</span>
                            {active
                              ? <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",padding:"3px 10px",borderRadius:20,fontWeight:700,letterSpacing:"0.1em",background:`rgba(${cm.rgb},0.18)`,color:cm.color}}>ACTIVE</span>
                              : <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 12px",borderRadius:14,background:check.ok?`rgba(${cm.rgb},0.14)`:"rgba(18,18,36,0.9)",border:`1px solid ${check.ok?cm.color+"44":"rgba(35,35,55,0.6)"}`,minWidth:48}}>
                                  <span style={{fontSize:12}}>⚗️</span>
                                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:900,color:check.ok?cm.color:"#222245",lineHeight:1.2}}>{mut.ep}</span>
                                </div>
                            }
                          </div>
                          <h4 style={{fontSize:16,fontWeight:800,color:active?cm.color:"#e0e0f0",margin:"0 0 5px",lineHeight:1.2}}>{mut.name}</h4>
                          <p style={{fontSize:12,color:active?"#8080b0":"#3a3a62",margin:"0 0 8px",lineHeight:1.6}}>{mut.desc}</p>
                          {prereqs&&prereqs.length>0&&(
                            <p style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",margin:"0 0 8px",color:active?"rgba(74,222,128,0.7)":check.ok?"rgba(74,222,128,0.7)":"rgba(255,150,40,0.6)"}}>
                              {active?"✓":"→"} {prereqs.join(", ")}
                            </p>
                          )}
                          {!active&&(
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              {mut.infectivity>0&&<MPill v={`+${mut.infectivity} inf`}  c="#ff5555"/>}
                              {mut.meme>0        &&<MPill v={`+${mut.meme} meme`}       c="#ddaa00"/>}
                              {mut.severity>0    &&<MPill v={`+${mut.severity} sev`}    c="#9977ee"/>}
                            </div>
                          )}
                          {locked&&check.reason&&(
                            <p style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,140,40,0.5)",margin:"8px 0 0"}}>⚠ {check.reason}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>{/* end map area */}
          </div>
        )}

        {/* ══ RESULT ══ */}
        {phase==="result"&&result&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:32,animation:"fadeUp 0.5s ease both"}}>
            <div style={{maxWidth:560,width:"100%"}}>
              <h2 style={{fontSize:"2rem",fontWeight:900,color:"#eeeef8",textAlign:"center",margin:"0 0 28px",letterSpacing:"-0.025em"}}>Pandemic Complete</h2>
              <div id="brainrot-card" style={{borderRadius:30,overflow:"hidden",marginBottom:28,background:`linear-gradient(135deg,#0c0c1c 0%,${result.color}0e 50%,#0c0c1c 100%)`,border:`1px solid ${result.color}20`,boxShadow:`0 0 60px ${result.color}18`}}>
                <div style={{padding:"36px"}}>
                  <div style={{textAlign:"center",marginBottom:26}}>
                    <div style={{fontSize:64,marginBottom:14,filter:`drop-shadow(0 0 20px ${result.color}80)`}}>{result.emoji}</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 20px",borderRadius:30,marginBottom:16,background:result.color+"12",color:result.color,border:`1px solid ${result.color}1e`,fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.15em"}}>GRADE: {result.grade}</div>
                    <h3 style={{fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:900,color:result.color,margin:0,letterSpacing:"-0.025em"}}>{result.title}</h3>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:22}}>
                    {[{l:"Infected",v:`${gs.pct}%`,c:"#ff4444"},{l:"Days",v:String(gs.day),c:"#ddaa00"},{l:"Mutations",v:String(gs.active.length),c:"#9977ee"}].map(s=>(
                      <div key={s.l} style={{textAlign:"center",padding:"16px 8px",borderRadius:18,background:"rgba(255,255,255,0.03)"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#282848",textTransform:"uppercase",marginTop:5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{color:"#606090",fontSize:15,lineHeight:1.75,textAlign:"center",marginBottom:18}}>{result.desc}</p>
                  <div style={{borderRadius:18,padding:"20px",textAlign:"center",background:result.color+"08",border:`1px solid ${result.color}12`}}>
                    <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:result.color,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>The Diagnosis</p>
                    <p style={{color:"#ddddf8",fontSize:16,fontStyle:"italic",fontWeight:600,margin:0}}>"{result.roast}"</p>
                  </div>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#141430",textAlign:"center",marginTop:22}}>dafuqbro.com/brainrot</p>
                </div>
              </div>
              <ShareButtons cardId="brainrot-card" shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade}: "${result.title}" 🧠🦠 How cooked are you?`} accentColor={result.color}/>
              <div style={{textAlign:"center",marginTop:28}}>
                <button onClick={()=>{setPhase("intro");setGs({infected:Object.fromEntries(REGIONS.map(r=>[r.id,0])),pct:0,day:0,active:[],infectivity:10,severity:5,meme:0,gameOver:false,cureProgress:0,ep:0});}}
                  style={{color:"#282848",fontSize:15,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>← Start a new pandemic</button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap');
          @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
          @keyframes slideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:none} }
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:4px}
        `}</style>
      </div>
      <Footer/>
    </>
  );
}

function HudStat({label,val,color}:{label:string;val:string;color:string}){
  return(
    <div style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1.1}}>
      <div style={{fontSize:9,color:"#202040",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:1}}>{label}</div>
      <div style={{fontSize:20,fontWeight:900,color}}>{val}</div>
    </div>
  );
}
function HudBtn({onClick,label}:{onClick:()=>void;label:string}){
  return(
    <button onClick={onClick} style={{padding:"7px 15px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#606090",fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.16)";e.currentTarget.style.color="#9090c0";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="#606090";}}
    >{label}</button>
  );
}
function MPill({v,c}:{v:string;c:string}){
  return <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 9px",borderRadius:20,background:`${c}14`,color:c,border:`1px solid ${c}1e`}}>{v}</span>;
}
