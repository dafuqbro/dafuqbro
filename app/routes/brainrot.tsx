import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ShareButtons } from "~/components/ShareButtons";

export const meta: MetaFunction = () => [
  { title: "Brainrot Pandemic — DaFuqBro" },
  { name: "description", content: "Your brainrot is spreading. Plague meets internet culture." },
  { property: "og:title", content: "Brainrot Pandemic — DaFuqBro" },
  { property: "og:description", content: "Your brainrot is a global pandemic. Watch it spread." },
  { name: "twitter:card", content: "summary_large_image" },
];

type Phase = "intro" | "setup" | "playing" | "result";
type MutCat = "transmission" | "symptom" | "ability" | "evolution";

interface Region {
  id: string; name: string;
  paths: string[];
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
   WORLD REGIONS — mathematically projected from real lat/lon
   Formula: x = (lon+180)/360*1000  |  y = (90-lat)/180*500
═══════════════════════════════════════════════════════════════ */
const REGIONS: Region[] = [
  {
    id: "na", name: "N. America",
    paths: [
      // Main continent: Pacific coast → Mexico → Gulf → East coast → Canada
      "M33.3,50 L38.9,61.1 L47.2,83.3 L61.1,94.4 L77.8,88.9 L86.1,80.6 L97.2,83.3 L111.1,83.3 L122.2,94.4 L138.9,100 L150,111.1 L155.6,119.4 L155.6,138.9 L166.7,152.8 L175,161.1 L200,186.1 L208.3,194.4 L250,205.6 L263.9,222.2 L280,227.8 L288.9,225 L272.2,166.7 L255.6,166.7 L250,169.4 L230.6,177.8 L277.8,161.1 L288.9,152.8 L305.6,133.3 L313.9,119.4 L333.3,119.4 L344.4,111.1 L347.2,119.4 L333.3,119.4 L291.7,127.8 L269.4,122.2 L236.1,113.9 L194.4,113.9 L166.7,113.9 L138.9,100 L111.1,83.3 L138.9,83.3 L222.2,83.3 L263.9,97.2 L272.2,83.3 L283.3,77.8 L311.1,75 L319.4,83.3 L333.3,75 L319.4,55.6 L311.1,44.4 L263.9,33.3 L222.2,33.3 L166.7,44.4 L125,50 L69.4,50 L33.3,50 Z",
      // Alaska
      "M33.3,50 L33.3,66.7 L38.9,83.3 L50,83.3 L61.1,94.4 L77.8,88.9 L86.1,80.6 L97.2,83.3 L108.3,83.3 L83.3,69.4 L55.6,72.2 L33.3,66.7 L33.3,50 Z",
      // Greenland
      "M300,38.9 L333.3,22.2 L375,16.7 L430.6,16.7 L450,38.9 L450,55.6 L433.3,66.7 L377.8,83.3 L347.2,83.3 L316.7,66.7 L300,38.9 Z",
    ],
    cx: 210, cy: 128, population: 580, resistance: 0.30,
  },
  {
    id: "sa", name: "S. America",
    paths: [
      "M277.8,216.7 L286.1,227.8 L288.9,241.7 L291.7,250 L294.4,263.9 L300,277.8 L319.4,277.8 L333.3,263.9 L355.6,263.9 L361.1,244.4 L341.7,233.3 L327.8,219.4 L361.1,244.4 L361.1,263.9 L388.9,305.6 L377.8,313.9 L366.7,327.8 L355.6,344.4 L338.9,355.6 L327.8,361.1 L319.4,402.8 L311.1,402.8 L305.6,388.9 L300,366.7 L300,347.2 L305.6,333.3 L291.7,311.1 L277.8,263.9 L277.8,250 L277.8,222.2 L277.8,216.7 Z",
    ],
    cx: 325, cy: 312, population: 430, resistance: 0.25,
  },
  {
    id: "eu", name: "Europe",
    paths: [
      // Main W+C Europe
      "M475,150 L477.8,144.4 L475,133.3 L477.8,127.8 L494.4,127.8 L508.3,127.8 L519.4,127.8 L522.2,127.8 L527.8,127.8 L533.3,127.8 L538.9,133.3 L544.4,138.9 L550,138.9 L555.6,138.9 L561.1,136.1 L566.7,144.4 L572.2,133.3 L577.8,133.3 L583.3,122.2 L577.8,111.1 L566.7,105.6 L561.1,100 L550,91.7 L550,83.3 L541.7,77.8 L527.8,75 L513.9,77.8 L500,88.9 L494.4,94.4 L486.1,94.4 L486.1,105.6 L491.7,111.1 L486.1,116.7 L486.1,127.8 L477.8,127.8 L475,133.3 L477.8,144.4 L475,150 Z",
      // Scandinavia
      "M513.9,88.9 L519.4,91.7 L527.8,91.7 L538.9,94.4 L550,94.4 L561.1,88.9 L566.7,83.3 L572.2,77.8 L577.8,72.2 L583.3,66.7 L577.8,55.6 L566.7,50 L561.1,52.8 L550,55.6 L538.9,66.7 L527.8,75 L519.4,77.8 L513.9,77.8 L513.9,88.9 Z",
      // Great Britain
      "M483.3,94.4 L486.1,88.9 L491.7,91.7 L497.2,100 L500,105.6 L500,108.3 L491.7,108.3 L483.3,111.1 L483.3,111.1 L486.1,111.1 L491.7,108.3 L497.2,100 L486.1,97.2 L483.3,94.4 Z",
      // Iceland
      "M394.4,52.8 L402.8,50 L411.1,52.8 L411.1,58.3 L402.8,61.1 L394.4,58.3 L394.4,52.8 Z",
    ],
    cx: 530, cy: 108, population: 750, resistance: 0.42,
  },
  {
    id: "af", name: "Africa",
    paths: [
      // Main continent
      "M450,205.6 L452.8,208.3 L458.3,216.7 L463.9,225 L472.2,233.3 L477.8,236.1 L494.4,236.1 L511.1,236.1 L522.2,238.9 L527.8,244.4 L538.9,238.9 L550,241.7 L561.1,241.7 L572.2,236.1 L583.3,241.7 L594.4,250 L605.6,272.2 L611.1,283.3 L600,305.6 L588.9,316.7 L583.3,327.8 L577.8,333.3 L566.7,344.4 L555.6,347.2 L544.4,344.4 L538.9,316.7 L533.3,294.4 L527.8,263.9 L522.2,238.9 L513.9,236.1 L497.2,236.1 L486.1,236.1 L477.8,236.1 L472.2,233.3 L463.9,225 L458.3,211.1 L450,205.6 Z",
      // Madagascar
      "M622.2,283.3 L633.3,294.4 L638.9,305.6 L633.3,316.7 L622.2,319.4 L619.4,305.6 L622.2,291.7 L622.2,283.3 Z",
    ],
    cx: 527, cy: 278, population: 1400, resistance: 0.15,
  },
  {
    id: "ru", name: "Russia",
    paths: [
      // Full Russia west to Kamchatka
      "M577.8,50 L600,61.1 L633.3,55.6 L652.8,50 L694.4,47.2 L763.9,44.4 L844.4,47.2 L888.9,50 L944.4,61.1 L966.7,72.2 L972.2,83.3 L966.7,94.4 L944.4,100 L902.8,116.7 L888.9,105.6 L861.1,116.7 L844.4,105.6 L811.1,100 L777.8,105.6 L750,100 L722.2,100 L694.4,94.4 L652.8,97.2 L638.9,100 L627.8,116.7 L616.7,122.2 L600,116.7 L583.3,100 L566.7,88.9 L561.1,83.3 L566.7,72.2 L577.8,61.1 L577.8,50 Z",
      // Kamchatka/Far East tip
      "M966.7,72.2 L972.2,66.7 L977.8,72.2 L972.2,83.3 L966.7,72.2 Z",
    ],
    cx: 760, cy: 80, population: 145, resistance: 0.38,
  },
  {
    id: "as", name: "Asia",
    paths: [
      // Main Asia body (China, Central Asia, SE Asia)
      "M625,133.3 L633.3,133.3 L644.4,138.9 L661.1,150 L677.8,155.6 L688.9,161.1 L700,161.1 L705.6,150 L716.7,155.6 L722.2,166.7 L733.3,172.2 L744.4,172.2 L755.6,183.3 L766.7,183.3 L777.8,194.4 L788.9,216.7 L800,238.9 L816.7,238.9 L827.8,238.9 L838.9,211.1 L844.4,183.3 L855.6,144.4 L861.1,138.9 L855.6,133.3 L838.9,138.9 L827.8,133.3 L827.8,111.1 L822.2,111.1 L805.6,111.1 L777.8,105.6 L750,111.1 L722.2,116.7 L700,127.8 L677.8,127.8 L655.6,127.8 L638.9,127.8 L625,133.3 Z",
      // Indian subcontinent
      "M688.9,183.3 L700,194.4 L711.1,211.1 L716.7,222.2 L722.2,227.8 L727.8,211.1 L733.3,200 L738.9,188.9 L744.4,183.3 L733.3,172.2 L722.2,172.2 L711.1,172.2 L700,177.8 L688.9,183.3 Z",
      // SE Asia / Indochina peninsula
      "M777.8,194.4 L783.3,205.6 L788.9,216.7 L788.9,233.3 L783.3,244.4 L777.8,244.4 L777.8,233.3 L783.3,222.2 L783.3,205.6 L777.8,194.4 Z",
      // Korea/Manchuria protrusion
      "M844.4,105.6 L855.6,111.1 L866.7,122.2 L877.8,127.8 L877.8,138.9 L866.7,144.4 L855.6,144.4 L844.4,138.9 L838.9,127.8 L844.4,116.7 L844.4,105.6 Z",
      // Japan (Honshu rough)
      "M883.3,127.8 L888.9,122.2 L894.4,127.8 L894.4,138.9 L888.9,144.4 L883.3,138.9 L883.3,127.8 Z",
    ],
    cx: 745, cy: 155, population: 3200, resistance: 0.32,
  },
  {
    id: "me", name: "Middle East",
    paths: [
      // Levant + Turkey
      "M600,144.4 L616.7,144.4 L627.8,150 L638.9,166.7 L652.8,177.8 L658.3,188.9 L655.6,200 L644.4,205.6 L633.3,211.1 L622.2,211.1 L611.1,200 L600,188.9 L594.4,177.8 L594.4,166.7 L597.2,155.6 L600,150 L600,144.4 Z",
      // Arabian peninsula
      "M600,166.7 L616.7,188.9 L625,200 L638.9,211.1 L652.8,205.6 L658.3,188.9 L652.8,183.3 L638.9,183.3 L627.8,166.7 L611.1,161.1 L600,166.7 Z",
    ],
    cx: 628, cy: 183, population: 420, resistance: 0.28,
  },
  {
    id: "oc", name: "Oceania",
    paths: [
      // Australia - detailed outline
      "M816.7,311.1 L816.7,322.2 L816.7,333.3 L819.4,344.4 L833.3,344.4 L855.6,344.4 L877.8,350 L900,355.6 L916.7,350 L922.2,338.9 L927.8,327.8 L927.8,316.7 L922.2,311.1 L916.7,300 L911.1,294.4 L900,288.9 L877.8,283.3 L866.7,283.3 L861.1,288.9 L850,294.4 L838.9,300 L827.8,305.6 L816.7,311.1 Z",
      // NZ North Island
      "M983.3,352.8 L988.9,355.6 L994.4,355.6 L994.4,361.1 L983.3,363.9 L977.8,361.1 L977.8,355.6 L983.3,352.8 Z",
      // NZ South Island
      "M966.7,372.2 L977.8,372.2 L983.3,372.2 L983.3,377.8 L972.2,378.9 L966.7,375 L966.7,372.2 Z",
      // Papua New Guinea rough
      "M844.4,250 L855.6,244.4 L866.7,241.7 L877.8,244.4 L883.3,252.8 L877.8,261.1 L866.7,261.1 L855.6,258.3 L844.4,250 Z",
    ],
    cx: 870, cy: 322, population: 45, resistance: 0.48,
  },
];

/* ════════════════════════════════════════════════
   GAME CONSTANTS
════════════════════════════════════════════════ */
const SLOTS: Record<MutCat, number> = { transmission:3, symptom:3, ability:2, evolution:1 };

const CAT_META: Record<MutCat, {label:string;color:string;rgb:string}> = {
  transmission: {label:"Transmission",color:"#ff6b6b",rgb:"255,107,107"},
  symptom:      {label:"Symptoms",    color:"#ffa94d",rgb:"255,169,77"},
  ability:      {label:"Abilities",   color:"#b197fc",rgb:"177,151,252"},
  evolution:    {label:"Evolution",   color:"#ffd43b",rgb:"255,212,59"},
};

const MUTS: Mutation[] = [
  {id:"airborne",  emoji:"💨",name:"Airborne",        desc:"Spreads through viral exhales & shared timelines",  infectivity:22,severity:5, meme:12,cat:"transmission",ep:2},
  {id:"waterborne",emoji:"💧",name:"Waterborne",       desc:"Via shared WiFi, hotspots & group chats",           infectivity:16,severity:8, meme:10,cat:"transmission",ep:2},
  {id:"direct",    emoji:"🤝",name:"Direct Contact",   desc:"Spread through refusing to touch grass",            infectivity:12,severity:14,meme:8, cat:"transmission",ep:2},
  {id:"vector",    emoji:"🐀",name:"Influencer Vector",desc:"Carried by macro-influencers to new demographics",  infectivity:28,severity:6, meme:18,cat:"transmission",ep:3,requires:["airborne"]},
  {id:"algorithm", emoji:"⚙️",name:"Algorithm Boost",  desc:"FYP force-feeds your brainrot to millions daily",   infectivity:35,severity:5, meme:28,cat:"transmission",ep:4,requires:["vector"]},
  {id:"skibidi",   emoji:"🚽",name:"Skibidi Syndrome", desc:"Uncontrollable urge to say 'skibidi toilet'",       infectivity:5, severity:20,meme:32,cat:"symptom",ep:2},
  {id:"sigma",     emoji:"🐺",name:"Sigma Delusion",   desc:"Victim thinks they're on a 3am sigma grindset",    infectivity:8, severity:26,meme:22,cat:"symptom",ep:2},
  {id:"npc",       emoji:"🤖",name:"NPC Behavior",     desc:"Repeating the same 3 phrases on loop",             infectivity:10,severity:16,meme:28,cat:"symptom",ep:2},
  {id:"aura",      emoji:"✨",name:"Aura Obsession",   desc:"Tracking aura points for every minor life event",  infectivity:14,severity:12,meme:38,cat:"symptom",ep:3,requires:["skibidi"]},
  {id:"cortisol",  emoji:"😰",name:"Cortisol Face",    desc:"Stress-bloat from 18-hour doomscroll sessions",    infectivity:6, severity:30,meme:15,cat:"symptom",ep:3,requires:["sigma"]},
  {id:"immunity",  emoji:"🧬",name:"Meme Immunity",    desc:"Brainrot evolves resistance to touching grass",     infectivity:5, severity:12,meme:20,cat:"ability",ep:3},
  {id:"streamer",  emoji:"🎮",name:"Streamer Mode",    desc:"Infected hosts livestream their entire life",       infectivity:20,severity:14,meme:22,cat:"ability",ep:3,requires:["immunity"]},
  {id:"delulu",    emoji:"🦋",name:"Delulu Evolution", desc:"Delusion becomes the solution. Unstoppable.",      infectivity:16,severity:32,meme:45,cat:"ability",ep:5,requires:["immunity","npc"]},
  {id:"rizz",      emoji:"😏",name:"Unspoken Rizz",    desc:"Brainrot spreads via pure vibes. No words needed.",infectivity:24,severity:8, meme:35,cat:"ability",ep:4,requires:["streamer"]},
  {id:"omega",     emoji:"☠️",name:"Omega Brainrot",   desc:"Final form. Humanity forgets what outside means.", infectivity:50,severity:50,meme:100,cat:"evolution",ep:10,requires:["algorithm","delulu"]},
  {id:"chrono",    emoji:"💀",name:"Chronically Online",desc:"Reality and timeline merge. No coming back.",     infectivity:40,severity:40,meme:80,cat:"evolution",ep:8,requires:["airborne","cortisol","rizz"]},
];

const EP_MILESTONES = [
  {t:10,ep:1,msg:"+1 EP — Outbreak detected"},
  {t:20,ep:1,msg:"+1 EP — Panic spreading"},
  {t:35,ep:2,msg:"+2 EP — WHO concerned"},
  {t:50,ep:2,msg:"+2 EP — Continental crisis"},
  {t:65,ep:3,msg:"+3 EP — Global emergency"},
  {t:80,ep:3,msg:"+3 EP — Governments collapsing"},
  {t:92,ep:5,msg:"+5 EP — Total brainrot"},
];

const NEWS = {
  early:  ["Doctors baffled by wave of teens forgetting eye contact","CDC: Screen time linked to brain shrinkage — nobody cares","'Permanent FYP face' diagnosed in millions"],
  mid:    ["WHO emergency summit on brainrot pandemic","Schools ban phones — students communicate only in TikTok sounds","NASA scientists caught doomscrolling during launch"],
  late:   ["UN declares: 'The memes have won'","Last library closes — books declared 'mid'","Touching grass now illegal in 47 countries"],
  endgame:["Civilization over. Brainrot complete.","Earth renamed 'Skibidi Planet' by unanimous vote","AI declares humanity 'cooked beyond repair'"],
};

const PATIENT_ZERO = [
  {id:"doom",  emoji:"📱",label:"The Doomscroller", desc:"12+ hrs screen/day",    inf:10,sev:5, region:"na",ep:3},
  {id:"shit",  emoji:"💩",label:"The Shitposter",   desc:"50 memes pre-breakfast",inf:15,sev:8, region:"eu",ep:4},
  {id:"tiktok",emoji:"🎵",label:"The TikToker",     desc:"Everything is content", inf:20,sev:3, region:"as",ep:5},
  {id:"gamer", emoji:"🎮",label:"The Gamer",        desc:"No grass since 2019",   inf:8, sev:15,region:"oc",ep:2},
];

/* ════════════════════════
   COLOUR — Plague Inc warm gradient
════════════════════════ */
function iColor(p: number): string {
  if (p <= 0)  return "#14204a";          // uninfected: dark navy
  if (p < 10)  return "rgba(80,160,20,0.9)";
  if (p < 25)  return "rgba(130,190,10,0.95)";
  if (p < 45)  return "rgba(200,170,0,0.97)";
  if (p < 65)  return "rgba(210,90,5,0.98)";
  if (p < 82)  return "rgba(190,30,10,0.99)";
  return "rgba(140,8,8,1)";
}
function iGlow(p: number): string {
  if (p < 5) return "none";
  if (p < 25) return `drop-shadow(0 0 ${4+p/6}px rgba(120,210,20,0.65))`;
  if (p < 55) return `drop-shadow(0 0 ${6+p/8}px rgba(200,100,5,0.70))`;
  return `drop-shadow(0 0 ${9+p/10}px rgba(190,20,5,0.80))`;
}

function getResult(gs: GS) {
  const avg = Object.values(gs.infected).reduce((a,b)=>a+b,0)/REGIONS.length;
  const m = gs.active.length;
  if(avg>=88&&m>=6) return {title:"EXTINCTION-LEVEL BRAINROT",emoji:"💀",color:"#E05544",grade:"S+",desc:"You ended civilization. Historians will study your brainrot for centuries. If they can still read.",roast:"You are the reason aliens won't visit us."};
  if(avg>=68)       return {title:"GLOBAL PANDEMIC",emoji:"🌍",color:"#fb923c",grade:"S", desc:"Every continent is cooked. WHO gave up. Your brainrot achieved what real pandemics dream of.",roast:"Your screen time report is a WMD."};
  if(avg>=48)       return {title:"CONTINENTAL CRISIS",emoji:"🦠",color:"#F5C518",grade:"A",desc:"Half the world infected. Governments scrambling. Your brainrot is on the news.",roast:"You're why your mom asks 'what's a sigma' at dinner."};
  if(avg>=28)       return {title:"REGIONAL OUTBREAK",emoji:"📡",color:"#a78bfa",grade:"B",desc:"Spread but never global. Needed more mutations.",roast:"Mid pandemic energy. Even COVID did better."};
  return                   {title:"CONTAINED INCIDENT",emoji:"🧪",color:"#8B7EA8",grade:"C",desc:"Your brainrot barely left your group chat.",roast:"Couldn't even go viral. That's the real brainrot."};
}

/* ════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════ */
export default function BrainrotPandemic() {
  const [phase,    setPhase]    = useState<Phase>("intro");
  const [gs,       setGs]       = useState<GS>({
    infected: Object.fromEntries(REGIONS.map(r=>[r.id,0])),
    pct:0, day:0, active:[], infectivity:10, severity:5, meme:0,
    gameOver:false, cureProgress:0, ep:0,
  });
  const [paused,   setPaused]   = useState(false);
  const [speed,    setSpeed]    = useState(800);
  // news reel separate from EP toasts — shown in a non-blocking ticker at bottom
  const [newsLine, setNewsLine] = useState<string|null>(null);
  const [epToast,  setEpToast]  = useState<string|null>(null);
  const [selCat,   setSelCat]   = useState<MutCat>("transmission");
  const [showMuts, setShowMuts] = useState(false);
  // sparkle: true when ep available & panel closed
  const [sparkle,  setSparkle]  = useState(false);
  const awarded = useRef<Set<number>>(new Set());
  const sparkleTimer = useRef<ReturnType<typeof setInterval>|null>(null);

  // Sparkle effect: shake when EP > 0 and panel closed
  useEffect(() => {
    const hasEP = gs.ep > 0 && !showMuts && phase === "playing";
    if (hasEP && !sparkle) {
      setSparkle(true);
      sparkleTimer.current = setInterval(() => setSparkle(s => s), 1000);
    }
    if (!hasEP) {
      setSparkle(false);
      if (sparkleTimer.current) clearInterval(sparkleTimer.current);
    }
    return () => { if (sparkleTimer.current) clearInterval(sparkleTimer.current); };
  }, [gs.ep, showMuts, phase]);

  const showEpToast = (msg: string) => {
    setEpToast(msg);
    setTimeout(()=>setEpToast(null), 3500);
  };

  const startGame = (pz: typeof PATIENT_ZERO[0]) => {
    awarded.current = new Set();
    const inf = Object.fromEntries(REGIONS.map(r=>[r.id,0]));
    inf[pz.region] = 5;
    setGs({infected:inf,pct:5,day:0,active:[],infectivity:10+pz.inf,severity:5+pz.sev,meme:0,gameOver:false,cureProgress:0,ep:pz.ep});
    setPhase("playing"); setPaused(false); setShowMuts(false);
  };

  /* ── GAME TICK ── */
  useEffect(()=>{
    if(phase!=="playing"||paused||gs.gameOver) return;
    const id = setInterval(()=>{
      setGs(prev=>{
        const inf = {...prev.infected};
        for(const r of REGIONS){
          const c = inf[r.id]; if(c<=0||c>=100) continue;
          const rate = (prev.infectivity/100)*(1-r.resistance)*(1+prev.meme/200);
          inf[r.id] = Math.min(100, c+c*rate*0.08+rate*0.3);
        }
        for(const r of REGIONS){
          if(inf[r.id]>18) for(const o of REGIONS){
            if(o.id===r.id||inf[o.id]>0) continue;
            if(Math.random()<(prev.infectivity/500)*(inf[r.id]/100)) inf[o.id]=1;
          }
        }
        const totPop = REGIONS.reduce((a,r)=>a+r.population,0);
        const totInf = REGIONS.reduce((a,r)=>a+(inf[r.id]/100)*r.population,0);
        const pct = (totInf/totPop)*100;

        let epGain = 0;
        for(const m of EP_MILESTONES){
          if(pct>=m.t&&!awarded.current.has(m.t)){
            awarded.current.add(m.t); epGain+=m.ep;
            showEpToast(m.msg);
          }
        }
        const cure = Math.min(100, prev.cureProgress+(prev.day>15?0.55-prev.meme/420:0));
        const day = prev.day+1;
        if(day%9===0){
          const pool = pct<25?NEWS.early:pct<50?NEWS.mid:pct<80?NEWS.late:NEWS.endgame;
          setNewsLine("📰 "+pool[Math.floor(Math.random()*pool.length)]);
          setTimeout(()=>setNewsLine(null), 5000);
        }
        const avg = Object.values(inf).reduce((a,b)=>a+b,0)/REGIONS.length;
        const over = avg>=95||cure>=100||day>=120;
        if(over) fetch("/api/track",{method:"POST"}).catch(()=>{});
        return {...prev,infected:inf,pct:Math.round(pct),day,gameOver:over,cureProgress:cure,ep:prev.ep+epGain};
      });
    }, speed);
    return ()=>clearInterval(id);
  },[phase,paused,gs.gameOver,speed]);

  useEffect(()=>{
    if(gs.gameOver&&phase==="playing") setTimeout(()=>setPhase("result"),1600);
  },[gs.gameOver,phase]);

  const activeOf = (cat:MutCat) => gs.active.filter(id=>MUTS.find(m=>m.id===id)?.cat===cat);
  const canUnlock = (mut:Mutation):{ok:boolean;reason?:string} => {
    if(gs.active.includes(mut.id))               return {ok:false,reason:"Active"};
    if(gs.ep<mut.ep)                             return {ok:false,reason:`Need ${mut.ep} EP`};
    if(activeOf(mut.cat).length>=SLOTS[mut.cat]) return {ok:false,reason:"Slots full"};
    if(mut.requires) for(const r of mut.requires)
      if(!gs.active.includes(r)) return {ok:false,reason:`Needs ${MUTS.find(m=>m.id===r)?.name}`};
    return {ok:true};
  };
  const unlock = (mut:Mutation) => {
    if(!canUnlock(mut).ok) return;
    setGs(p=>({...p,active:[...p.active,mut.id],infectivity:p.infectivity+mut.infectivity,severity:p.severity+mut.severity,meme:p.meme+mut.meme,ep:p.ep-mut.ep}));
  };
  const result = phase==="result" ? getResult(gs) : null;

  /* ════════════════════════ RENDER ════════════════════════ */
  return (
    <>
      <Header/>
      <div style={{minHeight:"100vh",background:"#05060e",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>

        {/* ══ INTRO ══ */}
        {phase==="intro"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:32,textAlign:"center",animation:"fadeUp 0.5s ease both"}}>
            <Link to="/" style={{color:"#202038",fontSize:13,textDecoration:"none",marginBottom:36}}>← back to tools</Link>
            <div style={{fontSize:80,marginBottom:20,filter:"drop-shadow(0 0 30px rgba(200,30,30,0.5))"}}>🧠🦠</div>
            <h1 style={{fontSize:"clamp(2.6rem,6vw,4rem)",fontWeight:900,color:"#eeeef8",margin:"0 0 16px",letterSpacing:"-0.03em",lineHeight:1.05}}>Brainrot Pandemic</h1>
            <p style={{color:"#404070",fontSize:17,lineHeight:1.75,maxWidth:540,marginBottom:12}}>
              Your brainrot is <span style={{color:"#ff5555",fontWeight:700}}>Patient Zero</span>. Spread infection across the real world, earn EP, unlock mutations — watch civilization collapse.
            </p>
            <p style={{color:"#181830",fontSize:13,fontFamily:"'JetBrains Mono',monospace",marginBottom:48}}>plague but make it chronically online.</p>
            <button onClick={()=>setPhase("setup")} style={{background:"linear-gradient(135deg,#aa1818,#dd3333)",color:"#fff",border:"none",borderRadius:50,padding:"18px 56px",fontSize:18,fontWeight:800,cursor:"pointer",fontFamily:"'Outfit',sans-serif",boxShadow:"0 8px 40px rgba(200,30,30,0.4)",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 56px rgba(200,30,30,0.55)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 40px rgba(200,30,30,0.4)";}}>
              🦠 Start Pandemic
            </button>
          </div>
        )}

        {/* ══ SETUP ══ */}
        {phase==="setup"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"calc(100vh - 64px)",padding:32,animation:"fadeUp 0.5s ease both"}}>
            <h2 style={{fontSize:"2.4rem",fontWeight:900,color:"#eeeef8",margin:"0 0 8px",letterSpacing:"-0.025em"}}>Choose Patient Zero</h2>
            <p style={{color:"#222240",fontFamily:"'JetBrains Mono',monospace",fontSize:13,marginBottom:36}}>who started the outbreak?</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,maxWidth:860,width:"100%"}}>
              {PATIENT_ZERO.map(pz=>(
                <button key={pz.id} onClick={()=>startGame(pz)} style={{background:"linear-gradient(160deg,#111120,#0c0c1a)",border:"1px solid rgba(255,60,60,0.10)",borderRadius:22,padding:"28px 22px",textAlign:"left",cursor:"pointer",transition:"all 0.2s",fontFamily:"'Outfit',sans-serif"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,60,60,0.42)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(180,20,20,0.15)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,60,60,0.10)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                  <span style={{fontSize:40,display:"block",marginBottom:14}}>{pz.emoji}</span>
                  <h3 style={{fontSize:17,fontWeight:800,color:"#eeeef8",margin:"0 0 5px"}}>{pz.label}</h3>
                  <p style={{color:"#303055",fontSize:13,margin:"0 0 16px",lineHeight:1.5}}>{pz.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,60,60,0.12)",color:"#ff6b6b"}}>+{pz.inf} inf</span>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,200,40,0.10)",color:"#ffd43b"}}>{pz.ep} EP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ══ PLAYING ══ */}
        {phase==="playing"&&(
          <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 64px)",overflow:"hidden"}}>

            {/* EP toast — top centre, compact, doesn't block HUD */}
            {epToast&&(
              <div style={{position:"fixed",top:68,left:"50%",transform:"translateX(-50%)",zIndex:300,pointerEvents:"none",animation:"slideDown 0.3s ease both"}}>
                <div style={{background:"#c8a000",color:"#0e0a00",padding:"7px 22px",borderRadius:30,fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:800,boxShadow:"0 4px 24px rgba(200,160,0,0.55)",whiteSpace:"nowrap"}}>
                  ⚗️ {epToast}
                </div>
              </div>
            )}

            {/* ── TOP HUD BAR ── */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,padding:"8px 16px",background:"rgba(2,3,10,0.97)",borderBottom:"1px solid rgba(255,255,255,0.05)",backdropFilter:"blur(10px)",zIndex:20,flexShrink:0}}>

              {/* Left: game stats */}
              <div style={{display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
                <HudStat label="DAY"      val={String(gs.day)}       color="#505080"/>
                <HudStat label="INFECTED" val={`${gs.pct}%`}         color="#ff4444"/>
                <HudStat label="MEME LVL" val={String(gs.meme)}      color="#cc9900"/>
                {gs.cureProgress>0&&<HudStat label="CURE" val={`${Math.round(gs.cureProgress)}%`} color="#22c55e"/>}
              </div>

              {/* Centre: EP pill */}
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:40,background:"rgba(200,160,0,0.10)",border:"1px solid rgba(200,160,0,0.28)"}}>
                <span style={{fontSize:18}}>⚗️</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:22,fontWeight:900,color:"#ffd43b",lineHeight:1}}>{gs.ep}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#6a5500",letterSpacing:"0.12em"}}>EP</span>
              </div>

              {/* Right: controls + MUTATE */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <HudBtn onClick={()=>setPaused(!paused)} label={paused?"▶ PLAY":"⏸ PAUSE"}/>
                <HudBtn onClick={()=>setSpeed(s=>s===800?400:s===400?200:800)} label={speed===800?"1×":speed===400?"2×":"3×"}/>

                {/* ── SPARKLE MUTATE BUTTON ── */}
                <button
                  onClick={()=>{setShowMuts(!showMuts); if(!showMuts) setSparkle(false);}}
                  style={{
                    padding:"7px 16px",borderRadius:10,cursor:"pointer",fontWeight:800,
                    fontSize:13,fontFamily:"'JetBrains Mono',monospace",transition:"background 0.2s, color 0.2s",
                    border:"none",position:"relative",overflow:"visible",
                    background:showMuts
                      ?"rgba(177,151,252,0.22)"
                      :sparkle
                        ?"rgba(177,151,252,0.18)"
                        :"rgba(177,151,252,0.07)",
                    color:showMuts||sparkle?"#c4aaff":"#6648aa",
                    boxShadow:showMuts
                      ?"0 0 18px rgba(177,151,252,0.35)"
                      :sparkle
                        ?"0 0 22px rgba(177,151,252,0.45)"
                        :"none",
                    animation:sparkle&&!showMuts?"mutateShake 0.55s ease infinite":"none",
                  }}>
                  {/* Sparkle particles */}
                  {sparkle&&!showMuts&&(
                    <>
                      <span style={{position:"absolute",top:-6,right:-4,fontSize:11,animation:"sparkle1 1.2s ease infinite",pointerEvents:"none"}}>✨</span>
                      <span style={{position:"absolute",bottom:-5,left:2,fontSize:10,animation:"sparkle2 1.4s ease infinite 0.3s",pointerEvents:"none"}}>⭐</span>
                      <span style={{position:"absolute",top:-4,left:6,fontSize:9,animation:"sparkle1 1s ease infinite 0.6s",pointerEvents:"none"}}>✦</span>
                    </>
                  )}
                  🧬 MUTATE {gs.active.length>0&&`(${gs.active.length})`}
                  {gs.ep>0&&!showMuts&&(
                    <span style={{position:"absolute",top:-7,right:-7,background:"#ff4444",color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",lineHeight:1,boxShadow:"0 0 8px rgba(255,68,68,0.6)"}}>{gs.ep}</span>
                  )}
                </button>
              </div>
            </div>

            {/* ── MAP AREA ── */}
            <div style={{position:"relative",flex:1,overflow:"hidden",background:"#060914"}}>

              {/* ═══ REAL WORLD MAP SVG ═══ */}
              <svg
                viewBox="0 0 1000 500"
                preserveAspectRatio="xMidYMid slice"
                style={{width:"100%",height:"100%",display:"block",position:"absolute",inset:0}}
              >
                <defs>
                  <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%"  stopColor="#0c2244"/>
                    <stop offset="45%" stopColor="#091830"/>
                    <stop offset="100%" stopColor="#050e1e"/>
                  </linearGradient>
                  <radialGradient id="centerGlow" cx="40%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#0e2448" stopOpacity="1"/>
                    <stop offset="100%" stopColor="#060e1e" stopOpacity="1"/>
                  </radialGradient>
                  <filter id="landShadow">
                    <feDropShadow dx="1.5" dy="2.5" stdDeviation="3" floodColor="#000008" floodOpacity="0.85"/>
                  </filter>
                </defs>

                {/* Ocean */}
                <rect width="1000" height="500" fill="url(#centerGlow)"/>

                {/* Grid — longitude lines */}
                {[0,100,200,300,400,500,600,700,800,900].map(x=>(
                  <line key={x} x1={x} y1="0" x2={x} y2="500" stroke="#1a3060" strokeWidth="0.25" strokeOpacity="0.4"/>
                ))}
                {/* Latitude lines */}
                {[83,125,167,208,250,292,333,375,417].map(y=>(
                  <line key={y} x1="0" y1={y} x2="1000" y2={y} stroke="#1a3060" strokeWidth="0.25" strokeOpacity="0.4"/>
                ))}
                {/* Equator */}
                <line x1="0" y1="250" x2="1000" y2="250" stroke="#2244aa" strokeWidth="0.7" strokeOpacity="0.22"/>
                {/* Tropics */}
                <line x1="0" y1="203" x2="1000" y2="203" stroke="#1a3377" strokeWidth="0.4" strokeOpacity="0.14" strokeDasharray="5,10"/>
                <line x1="0" y1="297" x2="1000" y2="297" stroke="#1a3377" strokeWidth="0.4" strokeOpacity="0.14" strokeDasharray="5,10"/>

                {/* Ocean labels */}
                <text x="80"  y="380" textAnchor="middle" fill="#0c1e3e" fontSize="14" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="5">PACIFIC</text>
                <text x="318" y="310" textAnchor="middle" fill="#0a1830" fontSize="9.5" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="4">ATLANTIC</text>
                <text x="852" y="430" textAnchor="middle" fill="#0a1830" fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="3">INDIAN</text>
                <text x="910" y="180" textAnchor="middle" fill="#0a1830" fontSize="9" fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="3">PACIFIC</text>

                {/* ── CONTINENTS ── */}
                {REGIONS.map(r=>{
                  const p = gs.infected[r.id]||0;
                  const col = iColor(p);
                  const glow = iGlow(p);
                  const dotColor = p<25?"#90d820":p<55?"#e08010":"#e02010";
                  return (
                    <g key={r.id}>
                      {/* Drop shadow */}
                      {r.paths.map((d,i)=>(
                        <path key={`sh${i}`} d={d} fill="#00000e" transform="translate(2,3.5)" opacity="0.6" style={{filter:"blur(3.5px)"}}/>
                      ))}
                      {/* Land fill — transitions colour as infection spreads */}
                      {r.paths.map((d,i)=>(
                        <path key={`f${i}`} d={d} fill={col} stroke="#0a1428" strokeWidth="0.7"
                          style={{filter:glow,transition:"fill 0.85s ease,filter 0.85s ease"}}/>
                      ))}
                      {/* Coast highlight */}
                      {r.paths.map((d,i)=>(
                        <path key={`c${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="0.9"/>
                      ))}
                      {/* Pulse ring when actively spreading */}
                      {p>0&&p<97&&(
                        <circle cx={r.cx} cy={r.cy} r={4+p/16} fill="none" stroke={dotColor} strokeWidth="1.4" opacity="0.45">
                          <animate attributeName="r"       from={4+p/16} to={12+p/10} dur="2.8s" repeatCount="indefinite"/>
                          <animate attributeName="opacity" from="0.45"   to="0"       dur="2.8s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      {/* Hotspot dot */}
                      {p>0&&(
                        <circle cx={r.cx} cy={r.cy} r={p>=80?5:3.5} fill={dotColor} opacity="0.92"
                          style={{filter:`drop-shadow(0 0 5px ${dotColor}bb)`}}/>
                      )}
                      {/* Region label */}
                      <text x={r.cx} y={r.cy-10} textAnchor="middle"
                        fill={p>20?"rgba(240,240,255,0.92)":"rgba(60,80,130,0.65)"}
                        fontSize="7.2" fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                        style={{transition:"fill 0.7s",pointerEvents:"none",textShadow:p>20?"0 1px 5px rgba(0,0,0,0.95)":"none"}}>
                        {r.name}
                      </text>
                      {/* Infection % */}
                      {p>0&&(
                        <text x={r.cx} y={r.cy+4} textAnchor="middle"
                          fill={dotColor} fontSize="7.5" fontFamily="'JetBrains Mono',monospace" fontWeight="900"
                          style={{pointerEvents:"none",textShadow:"0 1px 6px rgba(0,0,0,0.95)"}}>
                          {Math.round(p)}%
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* ── REGION BARS — bottom gradient overlay on map ── */}
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"26px 16px 10px",background:"linear-gradient(0deg,rgba(2,3,10,0.98) 0%,rgba(2,3,10,0.8) 55%,transparent 100%)"}}>
                {/* Cure bar — sits just above region bars */}
                {gs.cureProgress>2&&(
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:"rgba(2,3,10,0.7)",borderRadius:8,padding:"4px 12px",border:"1px solid rgba(34,197,94,0.18)"}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#22c55e",letterSpacing:"0.1em",whiteSpace:"nowrap"}}>🧬 CURE {Math.round(gs.cureProgress)}%</span>
                    <div style={{flex:1,height:3,background:"rgba(255,255,255,0.05)",borderRadius:4,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${gs.cureProgress}%`,borderRadius:4,background:"linear-gradient(90deg,#16a34a,#4ade80)",transition:"width 0.5s ease",boxShadow:"0 0 6px rgba(74,222,128,0.5)"}}/>
                    </div>
                  </div>
                )}
                {/* Region bars */}
                <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"flex-end"}}>
                  {REGIONS.map(r=>{
                    const p = gs.infected[r.id]||0;
                    const c = p<25?"#80c018":p<55?"#cc7008":"#cc1c08";
                    return (
                      <div key={r.id} style={{flex:"1 1 90px",minWidth:76,maxWidth:145}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:9,fontWeight:700,color:p>0?"#9090c0":"#1e1e40",fontFamily:"'JetBrains Mono',monospace"}}>{r.name}</span>
                          <span style={{fontSize:9,fontWeight:900,color:p>0?c:"#141430",fontFamily:"'JetBrains Mono',monospace"}}>{p>0?`${Math.round(p)}%`:""}</span>
                        </div>
                        <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${p}%`,borderRadius:3,background:c,transition:"width 0.5s ease",boxShadow:p>12?`0 0 5px ${c}`:""}}/>
                        </div>
                        <div style={{fontSize:8,color:"#18183a",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>
                          {Math.round((p/100)*r.population)}M/{r.population}M
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── NEWS TICKER — very bottom, non-blocking ── */}
              {newsLine&&(
                <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:50,background:"rgba(160,0,0,0.88)",borderTop:"1px solid rgba(255,80,80,0.25)",padding:"5px 18px",overflow:"hidden",animation:"slideUp 0.3s ease both"}}>
                  <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#ffd0d0",whiteSpace:"nowrap",animation:"tickerScroll 12s linear"}}>
                    {newsLine}
                  </div>
                </div>
              )}

              {/* ── MUTATION OVERLAY PANEL ── */}
              {showMuts&&(
                <div style={{position:"absolute",inset:0,zIndex:100,background:"rgba(2,3,10,0.93)",backdropFilter:"blur(10px)",display:"flex",flexDirection:"column",animation:"fadeUp 0.22s ease both"}}>
                  {/* Category tabs */}
                  <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.06)",flexShrink:0}}>
                    {(Object.keys(CAT_META) as MutCat[]).map(cat=>{
                      const cm=CAT_META[cat]; const used=activeOf(cat).length; const max=SLOTS[cat]; const sel=selCat===cat;
                      return(
                        <button key={cat} onClick={()=>setSelCat(cat)} style={{flex:1,padding:"12px 6px",cursor:"pointer",border:"none",borderBottom:sel?`2px solid ${cm.color}`:"2px solid transparent",background:sel?`rgba(${cm.rgb},0.09)`:"transparent",transition:"all 0.15s",fontFamily:"'Outfit',sans-serif"}}>
                          <div style={{fontSize:13,fontWeight:800,color:sel?cm.color:"#303058"}}>{cm.label}</div>
                          <div style={{display:"flex",justifyContent:"center",gap:4,marginTop:4}}>
                            {Array.from({length:max}).map((_,i)=>(
                              <span key={i} style={{display:"inline-block",width:8,height:8,borderRadius:2,background:i<used?cm.color:"rgba(255,255,255,0.07)",boxShadow:i<used?`0 0 5px ${cm.color}`:"none"}}/>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                    <button onClick={()=>setShowMuts(false)} style={{padding:"12px 18px",cursor:"pointer",border:"none",background:"transparent",color:"#222248",fontSize:22,lineHeight:1}}>✕</button>
                  </div>

                  {/* EP reminder strip */}
                  <div style={{padding:"8px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)",background:"rgba(180,140,0,0.06)",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#7a6000"}}>⚗️ Available EP:</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:17,fontWeight:900,color:"#ffd43b"}}>{gs.ep}</span>
                    <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#282820",marginLeft:"auto"}}>Click card to unlock</span>
                  </div>

                  {/* Mutation grid */}
                  <div style={{flex:1,overflowY:"auto",padding:"14px 18px",display:"flex",flexWrap:"wrap",gap:12,alignContent:"flex-start",scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.07) transparent"}}>
                    {MUTS.filter(m=>m.cat===selCat).map(mut=>{
                      const active=gs.active.includes(mut.id);
                      const check=canUnlock(mut);
                      const locked=!active&&!check.ok;
                      const cm=CAT_META[mut.cat];
                      const prereqs=mut.requires?.map(id=>MUTS.find(m=>m.id===id)?.name??id);
                      return(
                        <div key={mut.id} onClick={()=>!active&&unlock(mut)} style={{
                          width:"calc(50% - 6px)",minWidth:180,borderRadius:20,padding:"18px",
                          background:active?`linear-gradient(135deg,rgba(${cm.rgb},0.18),rgba(${cm.rgb},0.07))`
                            :locked?"rgba(8,8,18,0.9)":"rgba(12,14,26,0.95)",
                          border:`1px solid ${active?cm.color:locked?"rgba(22,22,42,0.9)":cm.color+"50"}`,
                          cursor:active?"default":locked?"not-allowed":"pointer",
                          transition:"all 0.2s",opacity:locked?0.45:1,
                          boxShadow:active?`0 0 20px rgba(${cm.rgb},0.22)`:check.ok&&!active?`0 3px 18px rgba(${cm.rgb},0.09)`:"none",
                        }}
                          onMouseEnter={e=>{if(!locked&&!active){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 28px rgba(${cm.rgb},0.22)`;e.currentTarget.style.borderColor=cm.color;}}}
                          onMouseLeave={e=>{if(!locked&&!active){e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 3px 18px rgba(${cm.rgb},0.09)`;e.currentTarget.style.borderColor=cm.color+"50";}}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <span style={{fontSize:28,lineHeight:1}}>{mut.emoji}</span>
                            {active
                              ?<span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",padding:"3px 10px",borderRadius:20,fontWeight:700,letterSpacing:"0.1em",background:`rgba(${cm.rgb},0.18)`,color:cm.color}}>ACTIVE</span>
                              :<div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 10px",borderRadius:12,background:check.ok?`rgba(${cm.rgb},0.14)`:"rgba(15,15,30,0.9)",border:`1px solid ${check.ok?cm.color+"44":"rgba(30,30,50,0.6)"}`,minWidth:44}}>
                                <span style={{fontSize:11}}>⚗️</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:900,color:check.ok?cm.color:"#1e1e44",lineHeight:1.2}}>{mut.ep}</span>
                              </div>
                            }
                          </div>
                          <h4 style={{fontSize:15,fontWeight:800,color:active?cm.color:"#dcdcf0",margin:"0 0 4px",lineHeight:1.2}}>{mut.name}</h4>
                          <p style={{fontSize:11.5,color:active?"#7878b0":"#363660",margin:"0 0 8px",lineHeight:1.6}}>{mut.desc}</p>
                          {prereqs&&prereqs.length>0&&(
                            <p style={{fontSize:10.5,fontFamily:"'JetBrains Mono',monospace",margin:"0 0 8px",color:active?"rgba(74,222,128,0.7)":check.ok?"rgba(74,222,128,0.7)":"rgba(255,150,40,0.6)"}}>
                              {active?"✓":"→"} {prereqs.join(", ")}
                            </p>
                          )}
                          {!active&&(
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                              {mut.infectivity>0&&<MPill v={`+${mut.infectivity} inf`}  c="#ff5555"/>}
                              {mut.meme>0&&       <MPill v={`+${mut.meme} meme`}        c="#cc9900"/>}
                              {mut.severity>0&&   <MPill v={`+${mut.severity} sev`}     c="#9977ee"/>}
                            </div>
                          )}
                          {locked&&check.reason&&(
                            <p style={{fontSize:10.5,fontFamily:"'JetBrains Mono',monospace",color:"rgba(255,140,40,0.5)",margin:"7px 0 0"}}>⚠ {check.reason}</p>
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
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#252545",textTransform:"uppercase",marginTop:5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{color:"#505080",fontSize:15,lineHeight:1.75,textAlign:"center",marginBottom:18}}>{result.desc}</p>
                  <div style={{borderRadius:18,padding:"20px",textAlign:"center",background:result.color+"08",border:`1px solid ${result.color}12`}}>
                    <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:result.color,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>The Diagnosis</p>
                    <p style={{color:"#ddddf8",fontSize:16,fontStyle:"italic",fontWeight:600,margin:0}}>"{result.roast}"</p>
                  </div>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#111128",textAlign:"center",marginTop:22}}>dafuqbro.com/brainrot</p>
                </div>
              </div>
              <ShareButtons cardId="brainrot-card" shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade}: "${result.title}" 🧠🦠 How cooked are you?`} accentColor={result.color}/>
              <div style={{textAlign:"center",marginTop:28}}>
                <button onClick={()=>{setPhase("intro");setGs({infected:Object.fromEntries(REGIONS.map(r=>[r.id,0])),pct:0,day:0,active:[],infectivity:10,severity:5,meme:0,gameOver:false,cureProgress:0,ep:0});}}
                  style={{color:"#222244",fontSize:15,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  ← Start a new pandemic
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600;700;800&display=swap');
          @keyframes fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:none} }
          @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:none} }
          @keyframes slideUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
          @keyframes tickerScroll { from{transform:translateX(0)} to{transform:translateX(-30%)} }
          @keyframes mutateShake {
            0%,100%{transform:translateX(0) rotate(0deg)}
            15%    {transform:translateX(-3px) rotate(-1.5deg)}
            30%    {transform:translateX(3px)  rotate(1.5deg)}
            45%    {transform:translateX(-2px) rotate(-1deg)}
            60%    {transform:translateX(2px)  rotate(1deg)}
            75%    {transform:translateX(-1px) rotate(-0.5deg)}
          }
          @keyframes sparkle1 {
            0%,100%{opacity:0;transform:scale(0.6) rotate(0deg)}
            50%{opacity:1;transform:scale(1.2) rotate(20deg)}
          }
          @keyframes sparkle2 {
            0%,100%{opacity:0;transform:scale(0.5) rotate(0deg)}
            50%{opacity:0.9;transform:scale(1.1) rotate(-15deg)}
          }
          ::-webkit-scrollbar{width:4px}
          ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.07);border-radius:4px}
        `}</style>
      </div>
      <Footer/>
    </>
  );
}

/* ── Sub-components ── */
function HudStat({label,val,color}:{label:string;val:string;color:string}){
  return(
    <div style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1.1}}>
      <div style={{fontSize:8.5,color:"#1a1a38",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:1}}>{label}</div>
      <div style={{fontSize:19,fontWeight:900,color}}>{val}</div>
    </div>
  );
}
function HudBtn({onClick,label}:{onClick:()=>void;label:string}){
  return(
    <button onClick={onClick} style={{padding:"6px 14px",borderRadius:9,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#505080",fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",transition:"all 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.16)";e.currentTarget.style.color="#8888bb";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="#505080";}}>
      {label}
    </button>
  );
}
function MPill({v,c}:{v:string;c:string}){
  return <span style={{fontSize:10.5,fontFamily:"'JetBrains Mono',monospace",padding:"3px 9px",borderRadius:20,background:`${c}14`,color:c,border:`1px solid ${c}1e`}}>{v}</span>;
}
