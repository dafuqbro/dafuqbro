import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { ShareButtons } from "~/components/ShareButtons";

import { toolMeta, toolJsonLd } from "~/lib/seo";
const TOOL_SLUG = "brainrot";
const TOOL_NAME = "Brainrot Pandemic — How Bad Is Your Brainrot? | DaFuqBro";
const TOOL_DESC = "Your brainrot is spreading. Mutate it, evolve it, and watch it infect the world. Plague Inc meets chronically online internet culture.";
const TOOL_OG   = "/og/brainrot.png";
const _brainrotJsonLd = toolJsonLd({ slug: TOOL_SLUG, name: "Brainrot Pandemic", description: TOOL_DESC, emoji: "🧠" });
export const meta: MetaFunction = () => toolMeta({ slug: TOOL_SLUG, title: TOOL_NAME, description: TOOL_DESC, ogImage: TOOL_OG });

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
type Phase = "intro" | "setup" | "playing" | "result";
type MutCat = "transmission" | "symptom" | "ability" | "evolution";

interface Region {
  id: string; name: string;
  /* main continent outline */
  path: string;
  /* optional extra island/territory paths */
  extra?: string[];
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
  pct: number; day: number;
  active: string[];
  infectivity: number; severity: number; meme: number;
  gameOver: boolean; cureProgress: number;
  ep: number;
}

/* ═══════════════════════════════════════════════════════
   WORLD REGIONS — accurate Natural Earth-style paths
   viewBox="0 0 1000 500"
═══════════════════════════════════════════════════════ */
const REGIONS: Region[] = [
  {
    id: "na", name: "N. America",
    path: `M 110,28 L 130,22 L 155,18 L 182,15 L 208,14 L 232,16 L 252,20
           L 268,26 L 280,34 L 287,43 L 289,53 L 285,63 L 275,71 L 260,77
           L 242,80 L 222,80 L 202,77 L 183,71 L 164,64 L 147,58 L 132,55
           L 118,55 L 106,58 L 96,65 L 90,74 L 88,84 L 90,94 L 96,102
           L 104,108 L 114,111 L 126,110 L 136,105 L 144,97 L 149,87
           L 152,95 L 150,106 L 144,115 L 135,121 L 122,123 L 108,121
           L 97,115 L 90,107 L 87,97 L 87,85 L 91,73 L 99,63 L 110,55
           L 107,44 L 108,35 Z`,
    cx: 190, cy: 58, population: 580, resistance: 0.30,
  },
  {
    id: "sa", name: "S. America",
    path: `M 168,138 L 182,132 L 198,130 L 215,131 L 230,136 L 242,144
           L 250,154 L 254,166 L 253,179 L 248,192 L 239,204 L 228,215
           L 215,224 L 201,230 L 187,233 L 173,232 L 161,227 L 152,218
           L 147,206 L 145,193 L 147,179 L 152,165 L 159,153 L 165,143 Z`,
    cx: 200, cy: 183, population: 430, resistance: 0.25,
  },
  {
    id: "eu", name: "Europe",
    path: `M 432,22 L 445,17 L 460,14 L 476,14 L 492,17 L 505,23 L 514,31
           L 518,40 L 515,49 L 507,56 L 494,61 L 478,63 L 461,62 L 445,58
           L 431,51 L 422,43 L 421,34 Z`,
    extra: [
      // British Isles
      `M 418,24 L 424,21 L 428,25 L 424,31 L 418,29 Z`,
      // Scandinavian tip
      `M 460,6 L 466,3 L 471,7 L 468,14 L 462,14 L 458,10 Z`,
    ],
    cx: 470, cy: 40, population: 750, resistance: 0.42,
  },
  {
    id: "af", name: "Africa",
    path: `M 433,72 L 448,67 L 465,65 L 482,67 L 497,72 L 508,81 L 514,92
           L 515,104 L 511,116 L 502,127 L 489,135 L 473,139 L 456,139
           L 440,134 L 427,125 L 418,113 L 414,100 L 414,87 L 418,77 Z`,
    cx: 465, cy: 103, population: 1400, resistance: 0.15,
  },
  {
    id: "ru", name: "Russia",
    path: `M 520,10 L 558,5 L 602,2 L 650,1 L 698,3 L 742,8 L 778,15
           L 800,24 L 805,34 L 795,43 L 772,49 L 738,52 L 695,53
           L 646,52 L 594,49 L 542,44 L 504,37 L 492,28 L 502,18 Z`,
    cx: 650, cy: 28, population: 145, resistance: 0.38,
  },
  {
    id: "as", name: "Asia",
    path: `M 520,56 L 558,52 L 602,50 L 648,51 L 692,54 L 732,60 L 764,69
           L 786,80 L 796,93 L 792,106 L 778,116 L 754,122 L 720,124
           L 680,122 L 636,116 L 590,107 L 546,97 L 508,86 L 488,74
           L 494,63 Z`,
    extra: [
      // Indian subcontinent
      `M 608,122 L 620,119 L 633,122 L 638,131 L 635,142 L 625,151
         L 614,154 L 604,150 L 598,141 L 598,130 Z`,
      // Korean/Japan peninsula area
      `M 776,80 L 786,78 L 794,83 L 792,92 L 784,94 L 776,90 Z`,
    ],
    cx: 638, cy: 87, population: 3200, resistance: 0.32,
  },
  {
    id: "me", name: "Middle East",
    path: `M 520,72 L 538,68 L 558,69 L 574,75 L 582,85 L 579,96
           L 567,103 L 548,106 L 530,103 L 516,95 L 512,84 Z`,
    cx: 547, cy: 87, population: 420, resistance: 0.28,
  },
  {
    id: "oc", name: "Oceania",
    path: `M 760,190 L 780,184 L 802,183 L 824,187 L 840,196 L 848,208
           L 844,221 L 831,230 L 812,234 L 791,232 L 772,224 L 760,212
           L 756,200 Z`,
    extra: [
      // NZ hint
      `M 850,220 L 856,216 L 860,221 L 856,228 L 850,226 Z`,
    ],
    cx: 803, cy: 208, population: 45, resistance: 0.48,
  },
];

/* ═══════════════════════════════════════════════════════
   MUTATIONS
═══════════════════════════════════════════════════════ */
const MUTS: Mutation[] = [
  // ── Transmission ──
  { id:"airborne",    emoji:"💨", name:"Airborne",        desc:"Spreads through viral exhales & shared timelines",   infectivity:22, severity:5,  meme:12, cat:"transmission", ep:2 },
  { id:"waterborne",  emoji:"💧", name:"Waterborne",       desc:"Via shared WiFi, hotspots & group chats",            infectivity:16, severity:8,  meme:10, cat:"transmission", ep:2 },
  { id:"direct",      emoji:"🤝", name:"Direct Contact",   desc:"Spread through refusing to touch grass",             infectivity:12, severity:14, meme:8,  cat:"transmission", ep:2 },
  { id:"vector",      emoji:"🐀", name:"Influencer Vector",desc:"Carried by macro-influencers to new demos",          infectivity:28, severity:6,  meme:18, cat:"transmission", ep:3, requires:["airborne"] },
  { id:"algorithm",   emoji:"⚙️", name:"Algorithm Boost",  desc:"FYP force-feeds your brainrot to millions",          infectivity:35, severity:5,  meme:28, cat:"transmission", ep:4, requires:["vector"] },
  // ── Symptoms ──
  { id:"skibidi",     emoji:"🚽", name:"Skibidi Syndrome", desc:"Uncontrollable urge to say 'skibidi toilet'",        infectivity:5,  severity:20, meme:32, cat:"symptom",      ep:2 },
  { id:"sigma",       emoji:"🐺", name:"Sigma Delusion",   desc:"Victim thinks they're on a 3am sigma grindset",     infectivity:8,  severity:26, meme:22, cat:"symptom",      ep:2 },
  { id:"npc",         emoji:"🤖", name:"NPC Behavior",     desc:"Repeating the same 3 phrases on loop",              infectivity:10, severity:16, meme:28, cat:"symptom",      ep:2 },
  { id:"aura",        emoji:"✨", name:"Aura Obsession",   desc:"Tracking aura points for every minor life event",   infectivity:14, severity:12, meme:38, cat:"symptom",      ep:3, requires:["skibidi"] },
  { id:"cortisol",    emoji:"😰", name:"Cortisol Face",    desc:"Stress-bloat from 18h doomscrolling sessions",      infectivity:6,  severity:30, meme:15, cat:"symptom",      ep:3, requires:["sigma"] },
  // ── Abilities ──
  { id:"immunity",    emoji:"🧬", name:"Meme Immunity",    desc:"Brainrot evolves past touching grass",               infectivity:5,  severity:12, meme:20, cat:"ability",      ep:3 },
  { id:"streamer",    emoji:"🎮", name:"Streamer Mode",    desc:"Infected hosts livestream their entire life",        infectivity:20, severity:14, meme:22, cat:"ability",      ep:3, requires:["immunity"] },
  { id:"delulu",      emoji:"🦋", name:"Delulu Evolution", desc:"Delusion becomes the solution. Unstoppable.",       infectivity:16, severity:32, meme:45, cat:"ability",      ep:5, requires:["immunity","npc"] },
  { id:"rizz",        emoji:"😏", name:"Unspoken Rizz",    desc:"Brainrot spreads via pure vibes. No words needed.", infectivity:24, severity:8,  meme:35, cat:"ability",      ep:4, requires:["streamer"] },
  // ── Evolution ──
  { id:"omega",       emoji:"☠️", name:"Omega Brainrot",   desc:"Final form. Humanity forgets what outside means.",  infectivity:50, severity:50, meme:100,cat:"evolution",   ep:10, requires:["algorithm","delulu"] },
  { id:"chronically", emoji:"💀", name:"Chronically Online",desc:"Reality and timeline merge. No coming back.",      infectivity:40, severity:40, meme:80, cat:"evolution",   ep:8,  requires:["airborne","cortisol","rizz"] },
];

const SLOTS: Record<MutCat,number> = { transmission:3, symptom:3, ability:2, evolution:1 };

const CAT_META: Record<MutCat,{label:string;color:string;glow:string}> = {
  transmission: { label:"Transmission", color:"#ff6b6b", glow:"rgba(255,107,107,0.5)" },
  symptom:      { label:"Symptoms",     color:"#ffa94d", glow:"rgba(255,169,77,0.5)"  },
  ability:      { label:"Abilities",    color:"#b197fc", glow:"rgba(177,151,252,0.5)" },
  evolution:    { label:"Evolution",    color:"#ffd43b", glow:"rgba(255,212,59,0.5)"  },
};

/* ═══════════════════════════════════════════════════════
   EP MILESTONES
═══════════════════════════════════════════════════════ */
const EP_MILESTONES = [
  {t:10,ep:1,msg:"+1 EP — Outbreak detected"},
  {t:20,ep:1,msg:"+1 EP — Panic spreading"},
  {t:35,ep:2,msg:"+2 EP — WHO concerned"},
  {t:50,ep:2,msg:"+2 EP — Continental crisis"},
  {t:65,ep:3,msg:"+3 EP — Global emergency"},
  {t:80,ep:3,msg:"+3 EP — Governments collapsing"},
  {t:92,ep:5,msg:"+5 EP — Total brainrot"},
];

const PATIENT_ZERO = [
  {id:"doomscroller",emoji:"📱",label:"The Doomscroller", desc:"12+ hrs screen/day",    inf:10,sev:5,  region:"na",ep:3},
  {id:"shitposter",  emoji:"💩",label:"The Shitposter",   desc:"50 memes pre-breakfast",inf:15,sev:8,  region:"eu",ep:4},
  {id:"tiktoker",    emoji:"🎵",label:"The TikToker",     desc:"Everything is content", inf:20,sev:3,  region:"as",ep:5},
  {id:"gamer",       emoji:"🎮",label:"The Gamer",        desc:"No grass since 2019",   inf:8, sev:15, region:"oc",ep:2},
];

const NEWS = {
  early:   ["Brain deterioration linked to phone usage baffles scientists","CDC: teens forgetting how to make eye contact","Local teen diagnosed with 'permanent FYP face'"],
  mid:     ["WHO declares brainrot a global health concern","Schools ban phones — students only speak TikTok audio","NASA scientists caught doomscrolling during launch"],
  late:    ["UN emergency: 'The memes have won'","Last library closes — books officially 'mid'","Touching grass declared illegal in 47 countries"],
  endgame: ["Civilization has fallen. Brainrot is complete.","Earth renamed 'Skibidi Planet' by unanimous vote","AI declares humanity 'cooked beyond repair'"],
};

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function iColor(p:number){
  if(p<=0)  return "#0e1428";
  if(p<8)   return "#1a3d1a";
  if(p<20)  return "#2e6020";
  if(p<40)  return "#6b7a10";
  if(p<60)  return "#a06010";
  if(p<80)  return "#b03010";
  return "#d02020";
}
function iGlow(p:number){
  if(p<=0) return "none";
  const i=Math.min(1,p/100);
  return `drop-shadow(0 0 ${5+i*18}px ${iColor(p)}dd)`;
}
function getResult(gs:GS){
  const avg=Object.values(gs.infected).reduce((a,b)=>a+b,0)/REGIONS.length;
  const m=gs.active.length;
  if(avg>=88&&m>=6) return {title:"EXTINCTION-LEVEL BRAINROT",emoji:"💀",color:"#E05544",grade:"S+",desc:"You ended civilization. Historians will study your brainrot for centuries. If they can still read.",roast:"You are the reason aliens won't visit us."};
  if(avg>=68)       return {title:"GLOBAL PANDEMIC",emoji:"🌍",color:"#fb923c",grade:"S", desc:"Every continent is cooked. WHO gave up. Your brainrot achieved what real pandemics only dream of.",roast:"Your screen time report is a WMD."};
  if(avg>=48)       return {title:"CONTINENTAL CRISIS",emoji:"🦠",color:"#F5C518",grade:"A",desc:"Half the world infected. Governments scrambling. Your brainrot is on the news.",roast:"You're why your mom asks 'what's a sigma' at dinner."};
  if(avg>=28)       return {title:"REGIONAL OUTBREAK",emoji:"📡",color:"#a78bfa",grade:"B",desc:"Spread but never global. You needed more mutations.",roast:"Mid pandemic energy. Even COVID did better."};
  return                  {title:"CONTAINED INCIDENT",emoji:"🧪",color:"#8B7EA8",grade:"C",desc:"Your brainrot barely left your group chat.",roast:"Couldn't even go viral. That's the real brainrot."};
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════ */
export default function BrainrotPandemic(){
  const [phase,   setPhase]   = useState<Phase>("intro");
  const [gs,      setGs]      = useState<GS>({
    infected:Object.fromEntries(REGIONS.map(r=>[r.id,0])),
    pct:0,day:0,active:[],infectivity:10,severity:5,meme:0,
    gameOver:false,cureProgress:0,ep:0,
  });
  const [paused,    setPaused]    = useState(false);
  const [speed,     setSpeed]     = useState(800);
  const [toast,     setToast]     = useState<{txt:string;type:"news"|"ep"}|null>(null);
  const [activeCat, setActiveCat] = useState<MutCat>("transmission");
  const [showPanel, setShowPanel] = useState(false);
  const awarded = useRef<Set<number>>(new Set());

  const showToast=(txt:string,type:"news"|"ep")=>{
    setToast({txt,type}); setTimeout(()=>setToast(null),4000);
  };

  const startGame=(pz:typeof PATIENT_ZERO[0])=>{
    awarded.current=new Set();
    const inf=Object.fromEntries(REGIONS.map(r=>[r.id,0]));
    inf[pz.region]=5;
    setGs({infected:inf,pct:5,day:0,active:[],
      infectivity:10+pz.inf,severity:5+pz.sev,meme:0,
      gameOver:false,cureProgress:0,ep:pz.ep});
    setPhase("playing"); setPaused(false); setShowPanel(false);
  };

  /* tick */
  useEffect(()=>{
    if(phase!=="playing"||paused||gs.gameOver) return;
    const id=setInterval(()=>{
      setGs(prev=>{
        const inf={...prev.infected};
        for(const r of REGIONS){
          const c=inf[r.id]; if(c<=0||c>=100) continue;
          const rate=(prev.infectivity/100)*(1-r.resistance)*(1+prev.meme/200);
          inf[r.id]=Math.min(100, c+c*rate*0.08+rate*0.3);
        }
        for(const r of REGIONS){
          if(inf[r.id]>18) for(const o of REGIONS){
            if(o.id===r.id||inf[o.id]>0) continue;
            if(Math.random()<(prev.infectivity/500)*(inf[r.id]/100)) inf[o.id]=1;
          }
        }
        const totPop=REGIONS.reduce((a,r)=>a+r.population,0);
        const totInf=REGIONS.reduce((a,r)=>a+(inf[r.id]/100)*r.population,0);
        const pct=(totInf/totPop)*100;
        let epGain=0;
        for(const m of EP_MILESTONES){
          if(pct>=m.t&&!awarded.current.has(m.t)){
            awarded.current.add(m.t); epGain+=m.ep;
            showToast(m.msg,"ep");
          }
        }
        const cure=Math.min(100,prev.cureProgress+(prev.day>15?0.55-prev.meme/420:0));
        const day=prev.day+1;
        if(day%9===0){
          const pool=pct<25?NEWS.early:pct<50?NEWS.mid:pct<80?NEWS.late:NEWS.endgame;
          showToast("📰 "+pool[Math.floor(Math.random()*pool.length)],"news");
        }
        const avg=Object.values(inf).reduce((a,b)=>a+b,0)/REGIONS.length;
        const over=avg>=95||cure>=100||day>=120;
        if(over) fetch("/api/track",{method:"POST"}).catch(()=>{});
        return{...prev,infected:inf,pct:Math.round(pct),day,gameOver:over,
          cureProgress:cure,ep:prev.ep+epGain};
      });
    },speed);
    return()=>clearInterval(id);
  },[phase,paused,gs.gameOver,speed]);

  useEffect(()=>{
    if(gs.gameOver&&phase==="playing") setTimeout(()=>setPhase("result"),1600);
  },[gs.gameOver,phase]);

  const activeOf=(cat:MutCat)=>gs.active.filter(id=>MUTS.find(m=>m.id===id)?.cat===cat);
  const canUnlock=(mut:Mutation):{ok:boolean;reason?:string}=>{
    if(gs.active.includes(mut.id))               return{ok:false,reason:"Active"};
    if(gs.ep<mut.ep)                             return{ok:false,reason:`Need ${mut.ep} EP`};
    if(activeOf(mut.cat).length>=SLOTS[mut.cat]) return{ok:false,reason:"Slots full"};
    if(mut.requires) for(const r of mut.requires)
      if(!gs.active.includes(r)) return{ok:false,reason:`Needs ${MUTS.find(m=>m.id===r)?.name}`};
    return{ok:true};
  };
  const unlock=(mut:Mutation)=>{
    if(!canUnlock(mut).ok) return;
    setGs(p=>({...p,active:[...p.active,mut.id],
      infectivity:p.infectivity+mut.infectivity,
      severity:p.severity+mut.severity,
      meme:p.meme+mut.meme,
      ep:p.ep-mut.ep,
    }));
  };

  const result=phase==="result"?getResult(gs):null;

  /* ── RENDER ── */
  return(
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: _brainrotJsonLd }} />
      <Header/>
      <div style={{minHeight:"100vh",background:"#05060f",fontFamily:"'Outfit',sans-serif",position:"relative",overflow:"hidden"}}>

        {/* ── INTRO ── */}
        {phase==="intro"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            minHeight:"calc(100vh - 64px)",padding:32,textAlign:"center",animation:"fadeUp 0.5s ease both"}}>
            <Link to="/" style={{color:"#333355",fontSize:13,textDecoration:"none",marginBottom:36}}>← back to tools</Link>
            <div style={{fontSize:80,marginBottom:20,filter:"drop-shadow(0 0 30px rgba(224,85,68,0.4))"}}>🧠🦠</div>
            <h1 style={{fontSize:"clamp(2.6rem,6vw,4rem)",fontWeight:900,color:"#f0f0f8",margin:"0 0 18px",letterSpacing:"-0.03em",lineHeight:1.05}}>
              Brainrot Pandemic
            </h1>
            <p style={{color:"#6060a0",fontSize:18,lineHeight:1.75,maxWidth:560,marginBottom:12}}>
              Your brainrot is <span style={{color:"#ff6b6b",fontWeight:700}}>Patient Zero</span>. Spread infection, earn EP, unlock mutations with real prerequisites — watch civilization collapse.
            </p>
            <p style={{color:"#282840",fontSize:13,fontFamily:"'JetBrains Mono',monospace",marginBottom:48}}>
              plague inc. but make it chronically online.
            </p>
            <button onClick={()=>setPhase("setup")} style={{
              background:"linear-gradient(135deg,#c02020,#e05544)",color:"#fff",border:"none",
              borderRadius:50,padding:"18px 56px",fontSize:18,fontWeight:800,cursor:"pointer",
              fontFamily:"'Outfit',sans-serif",letterSpacing:"-0.01em",
              boxShadow:"0 8px 40px rgba(224,85,68,0.35)",transition:"all 0.2s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 16px 56px rgba(224,85,68,0.5)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 8px 40px rgba(224,85,68,0.35)";}}
            >🦠 Start Pandemic</button>
          </div>
        )}

        {/* ── SETUP ── */}
        {phase==="setup"&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            minHeight:"calc(100vh - 64px)",padding:32,animation:"fadeUp 0.5s ease both"}}>
            <h2 style={{fontSize:"2.4rem",fontWeight:900,color:"#f0f0f8",margin:"0 0 8px",letterSpacing:"-0.025em"}}>
              Choose Patient Zero
            </h2>
            <p style={{color:"#333355",fontFamily:"'JetBrains Mono',monospace",fontSize:13,marginBottom:36}}>
              who started the outbreak?
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,maxWidth:860,width:"100%"}}>
              {PATIENT_ZERO.map(pz=>(
                <button key={pz.id} onClick={()=>startGame(pz)} style={{
                  background:"linear-gradient(160deg,#14142a,#0e0e1e)",
                  border:"1px solid rgba(255,107,107,0.12)",borderRadius:22,
                  padding:"28px 22px",textAlign:"left",cursor:"pointer",
                  transition:"all 0.2s",fontFamily:"'Outfit',sans-serif",
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,107,107,0.45)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 20px 60px rgba(224,85,68,0.15)";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,107,107,0.12)";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}
                >
                  <span style={{fontSize:40,display:"block",marginBottom:14}}>{pz.emoji}</span>
                  <h3 style={{fontSize:17,fontWeight:800,color:"#f0f0f8",margin:"0 0 5px"}}>{pz.label}</h3>
                  <p style={{color:"#444468",fontSize:13,margin:"0 0 16px",lineHeight:1.5}}>{pz.desc}</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,107,107,0.12)",color:"#ff6b6b"}}>+{pz.inf} inf</span>
                    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 12px",borderRadius:20,background:"rgba(255,212,59,0.10)",color:"#ffd43b"}}>{pz.ep} EP</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PLAYING ── */}
        {phase==="playing"&&(
          <div style={{position:"relative",minHeight:"calc(100vh - 64px)",display:"flex",flexDirection:"column"}}>

            {/* Toast */}
            {toast&&(
              <div style={{position:"fixed",top:64,left:0,right:0,zIndex:200,
                display:"flex",justifyContent:"center",pointerEvents:"none",animation:"slideDown 0.35s ease both"}}>
                <div style={{
                  background:toast.type==="ep"?"#ffd43b":"#c02828",
                  color:toast.type==="ep"?"#1a1500":"#fff",
                  padding:"10px 28px",borderRadius:"0 0 18px 18px",
                  fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,
                  boxShadow:toast.type==="ep"?"0 8px 32px rgba(255,212,59,0.5)":"0 8px 32px rgba(200,0,0,0.5)",
                  maxWidth:"90vw",textAlign:"center",
                }}>{toast.txt}</div>
              </div>
            )}

            {/* ── TOP BAR ── */}
            <div style={{
              display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,
              padding:"12px 20px",
              background:"linear-gradient(180deg,rgba(5,6,15,0.98) 0%,rgba(5,6,15,0.85) 100%)",
              borderBottom:"1px solid rgba(255,255,255,0.05)",
              backdropFilter:"blur(12px)",zIndex:10,flexShrink:0,
            }}>
              {/* Left stats */}
              <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
                <TopStat label="DAY"      val={String(gs.day)}      color="#7070a0"/>
                <TopStat label="INFECTED" val={`${gs.pct}%`}        color="#ff6b6b"/>
                <TopStat label="MEME LVL" val={String(gs.meme)}     color="#ffd43b"/>
                {gs.cureProgress>0&&<TopStat label="CURE" val={`${Math.round(gs.cureProgress)}%`} color="#4ade80"/>}
              </div>

              {/* Center: EP pill */}
              <div style={{display:"flex",alignItems:"center",gap:10,
                padding:"8px 22px",borderRadius:40,
                background:"rgba(255,212,59,0.10)",border:"1px solid rgba(255,212,59,0.28)",
              }}>
                <span style={{fontSize:22}}>⚗️</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:900,color:"#ffd43b"}}>{gs.ep}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#887820",letterSpacing:"0.12em"}}>EP</span>
              </div>

              {/* Right: controls */}
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <CtrlBtn onClick={()=>setPaused(!paused)} label={paused?"▶ PLAY":"⏸ PAUSE"}/>
                <CtrlBtn onClick={()=>setSpeed(s=>s===800?400:s===400?200:800)}
                  label={speed===800?"1×":speed===400?"2×":"3×"}/>
                <button onClick={()=>setShowPanel(!showPanel)} style={{
                  padding:"8px 18px",borderRadius:10,cursor:"pointer",fontWeight:800,
                  fontSize:13,fontFamily:"'JetBrains Mono',monospace",transition:"all 0.15s",border:"none",
                  background:showPanel?"rgba(177,151,252,0.2)":"rgba(177,151,252,0.08)",
                  color:showPanel?"#b197fc":"#6656a0",
                  boxShadow:showPanel?"0 0 20px rgba(177,151,252,0.25)":"none",
                }}>🧬 MUTATIONS {gs.active.length>0&&`(${gs.active.length})`}</button>
              </div>
            </div>

            {/* ── MAP AREA ── */}
            <div style={{position:"relative",flex:1,overflow:"hidden",background:"#060914",minHeight:400}}>

              {/* THE MAP */}
              <svg
                viewBox="0 0 1000 290"
                preserveAspectRatio="xMidYMid meet"
                style={{width:"100%",height:"100%",display:"block",position:"absolute",inset:0}}
              >
                <defs>
                  <radialGradient id="oceanGrad" cx="50%" cy="48%" r="75%">
                    <stop offset="0%" stopColor="#0c1530"/>
                    <stop offset="60%" stopColor="#080e22"/>
                    <stop offset="100%" stopColor="#04060f"/>
                  </radialGradient>
                  <radialGradient id="infGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff3030" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#ff3030" stopOpacity="0"/>
                  </radialGradient>
                  <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="0.8"/>
                  </filter>
                  <filter id="landShadow" x="-10%" y="-10%" width="130%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.7"/>
                  </filter>
                </defs>

                {/* Ocean */}
                <rect width="1000" height="290" fill="url(#oceanGrad)"/>

                {/* Ocean shimmer lines */}
                {[58,116,174,232].map(y=>(
                  <line key={y} x1="0" y1={y} x2="1000" y2={y}
                    stroke="#0d1838" strokeWidth="0.6" strokeDasharray="3,18"/>
                ))}

                {/* Equator */}
                <line x1="0" y1="145" x2="1000" y2="145"
                  stroke="#0e1c38" strokeWidth="1" strokeDasharray="6,10"/>
                <text x="12" y="141" fill="#0e1c32" fontSize="7"
                  fontFamily="'JetBrains Mono',monospace" fontWeight="700" letterSpacing="2">EQUATOR</text>

                {/* Tropic lines */}
                <line x1="0" y1="110" x2="1000" y2="110" stroke="#0a1428" strokeWidth="0.5" strokeDasharray="2,16"/>
                <line x1="0" y1="180" x2="1000" y2="180" stroke="#0a1428" strokeWidth="0.5" strokeDasharray="2,16"/>

                {/* Ocean labels */}
                <text x="85"  y="230" textAnchor="middle" fill="#080e22" fontSize="14" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="5">PACIFIC</text>
                <text x="330" y="200" textAnchor="middle" fill="#080e22" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="4">ATLANTIC</text>
                <text x="860" y="250" textAnchor="middle" fill="#080e22" fontSize="10" fontFamily="'JetBrains Mono',monospace" fontWeight="900" letterSpacing="3">INDIAN</text>

                {/* Graticule verticals */}
                {[250,500,750].map(x=>(
                  <line key={x} x1={x} y1="0" x2={x} y2="290"
                    stroke="#0a1128" strokeWidth="0.5" strokeDasharray="2,20"/>
                ))}

                {/* CONTINENTS */}
                {REGIONS.map(r=>{
                  const p=gs.infected[r.id]||0;
                  const col=iColor(p);
                  const glow=iGlow(p);
                  return(
                    <g key={r.id}>
                      {/* Drop shadow */}
                      <path d={r.path} fill="#000018" transform="translate(1.5,2.5)"
                        opacity="0.65" style={{filter:"blur(2px)"}}/>
                      {/* Main land */}
                      <path d={r.path} fill={col} stroke="#1e2040" strokeWidth="0.6"
                        style={{filter:glow,transition:"fill 0.8s ease,filter 0.8s ease"}}/>
                      {/* Coast highlight */}
                      <path d={r.path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8"/>
                      {/* Extra shapes (islands, etc) */}
                      {r.extra?.map((ep2,i)=>(
                        <path key={i} d={ep2} fill={col} stroke="#1e2040" strokeWidth="0.5"
                          style={{filter:glow,transition:"fill 0.8s ease"}}/>
                      ))}
                      {/* Infection pulse ring */}
                      {p>0&&p<98&&(
                        <circle cx={r.cx} cy={r.cy} r={6+p/12} fill="none"
                          stroke={col} strokeWidth="1.5" opacity="0.4">
                          <animate attributeName="r"
                            from={6+p/12} to={16+p/8} dur="2.8s" repeatCount="indefinite"/>
                          <animate attributeName="opacity"
                            from="0.4" to="0" dur="2.8s" repeatCount="indefinite"/>
                        </circle>
                      )}
                      {/* Infection hotspot dot */}
                      {p>0&&(
                        <circle cx={r.cx} cy={r.cy} r={p>=100?4:3} fill={col} opacity="0.9"
                          style={{filter:`drop-shadow(0 0 4px ${col})`}}/>
                      )}
                      {/* Region label */}
                      <text x={r.cx} y={r.cy-9} textAnchor="middle"
                        fill={p>30?"#ddddf0":"#30305a"} fontSize="7.5"
                        fontFamily="'JetBrains Mono',monospace" fontWeight="700"
                        style={{transition:"fill 0.6s ease",pointerEvents:"none"}}>
                        {r.name}
                      </text>
                      <text x={r.cx} y={r.cy+5} textAnchor="middle"
                        fill={p>0?col:"#1e1e45"} fontSize={p>=100?8:7}
                        fontFamily="'JetBrains Mono',monospace" fontWeight="900"
                        style={{transition:"fill 0.6s ease",pointerEvents:"none"}}>
                        {Math.round(p)}%
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* ── REGION INFECTION BARS ── bottom overlay on map ── */}
              <div style={{
                position:"absolute",bottom:0,left:0,right:0,
                background:"linear-gradient(0deg,rgba(4,6,14,0.98) 0%,rgba(4,6,14,0.7) 80%,transparent 100%)",
                padding:"28px 20px 12px",
                display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",
              }}>
                {REGIONS.map(r=>{
                  const p=gs.infected[r.id]||0;
                  return(
                    <div key={r.id} style={{flex:"1 1 90px",minWidth:80,maxWidth:140}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:10,fontWeight:700,color:p>0?"#b0b0d0":"#2a2a50",
                          fontFamily:"'JetBrains Mono',monospace",letterSpacing:"0.02em"}}>
                          {r.name}
                        </span>
                        <span style={{fontSize:10,fontWeight:900,color:p>0?iColor(p):"#1e1e45",
                          fontFamily:"'JetBrains Mono',monospace"}}>
                          {Math.round(p)}%
                        </span>
                      </div>
                      <div style={{height:3,background:"rgba(255,255,255,0.06)",borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${p}%`,borderRadius:3,background:iColor(p),
                          transition:"width 0.5s ease",
                          boxShadow:p>20?`0 0 6px ${iColor(p)}`:"none"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── MUTATION BUBBLES ── float on map when panel open ── */}
              {showPanel&&(
                <div style={{
                  position:"absolute",inset:0,zIndex:50,
                  background:"rgba(4,6,14,0.88)",
                  backdropFilter:"blur(8px)",
                  display:"flex",flexDirection:"column",overflow:"hidden",
                  animation:"fadeUp 0.25s ease both",
                }}>
                  {/* Category selector row */}
                  <div style={{display:"flex",gap:0,flexShrink:0,borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                    {(Object.keys(CAT_META) as MutCat[]).map(cat=>{
                      const cm=CAT_META[cat];
                      const used=activeOf(cat).length, max=SLOTS[cat];
                      const sel=activeCat===cat;
                      return(
                        <button key={cat} onClick={()=>setActiveCat(cat)} style={{
                          flex:1,padding:"14px 8px",cursor:"pointer",border:"none",
                          borderBottom:sel?`2px solid ${cm.color}`:"2px solid transparent",
                          background:sel?`rgba(${hexToRgb(cm.color)},0.08)`:"transparent",
                          transition:"all 0.15s",fontFamily:"'Outfit',sans-serif",
                        }}>
                          <div style={{fontSize:13,fontWeight:800,color:sel?cm.color:"#444468"}}>{cm.label}</div>
                          <div style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",
                            color:used>=max?cm.color:"#2a2a48",marginTop:3}}>
                            {Array.from({length:max}).map((_,i)=>(
                              <span key={i} style={{
                                display:"inline-block",width:7,height:7,borderRadius:2,
                                background:i<used?cm.color:"rgba(255,255,255,0.08)",
                                marginRight:3,
                                boxShadow:i<used?`0 0 6px ${cm.color}`:"none",
                              }}/>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                    <button onClick={()=>setShowPanel(false)} style={{
                      padding:"14px 18px",cursor:"pointer",border:"none",background:"transparent",
                      color:"#333355",fontSize:20,fontWeight:300,lineHeight:1,
                    }}>✕</button>
                  </div>

                  {/* Mutation bubble grid */}
                  <div style={{
                    flex:1,overflowY:"auto",padding:"20px",
                    display:"flex",flexWrap:"wrap",gap:14,
                    alignContent:"flex-start",
                    scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.07) transparent",
                  }}>
                    {MUTS.filter(m=>m.cat===activeCat).map(mut=>{
                      const active=gs.active.includes(mut.id);
                      const check=canUnlock(mut);
                      const locked=!active&&!check.ok;
                      const cm=CAT_META[mut.cat];
                      const prereqs=mut.requires?.map(id=>MUTS.find(m=>m.id===id)?.name??id);
                      return(
                        <div key={mut.id}
                          onClick={()=>!active&&unlock(mut)}
                          style={{
                            width:"calc(50% - 7px)",
                            minWidth:180,
                            borderRadius:22,padding:"22px 20px",
                            background:active
                              ?`linear-gradient(135deg,rgba(${hexToRgb(cm.color)},0.15),rgba(${hexToRgb(cm.color)},0.06))`
                              :locked
                                ?"rgba(10,10,22,0.9)"
                                :"rgba(14,14,28,0.95)",
                            border:`1px solid ${active?cm.color:locked?"rgba(30,30,50,0.8)":cm.color+"55"}`,
                            cursor:active?"default":locked?"not-allowed":"pointer",
                            transition:"all 0.2s",opacity:locked?0.48:1,
                            boxShadow:active?`0 0 24px rgba(${hexToRgb(cm.color)},0.2)`
                              :check.ok&&!active?`0 4px 24px rgba(${hexToRgb(cm.color)},0.08)`:"none",
                          }}
                          onMouseEnter={e=>{if(!locked&&!active){e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=`0 8px 32px rgba(${hexToRgb(cm.color)},0.2)`;e.currentTarget.style.borderColor=cm.color;}}}
                          onMouseLeave={e=>{if(!locked&&!active){e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=check.ok?`0 4px 24px rgba(${hexToRgb(cm.color)},0.08)`:"none";e.currentTarget.style.borderColor=cm.color+"55";}}}
                        >
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                            <span style={{fontSize:32,lineHeight:1}}>{mut.emoji}</span>
                            {/* EP badge / active badge */}
                            {active?(
                              <span style={{fontSize:10,fontFamily:"'JetBrains Mono',monospace",
                                padding:"3px 10px",borderRadius:20,fontWeight:700,letterSpacing:"0.1em",
                                background:`rgba(${hexToRgb(cm.color)},0.15)`,color:cm.color}}>ACTIVE</span>
                            ):(
                              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                                padding:"8px 12px",borderRadius:14,
                                background:check.ok?`rgba(${hexToRgb(cm.color)},0.12)`:"rgba(20,20,40,0.8)",
                                border:`1px solid ${check.ok?cm.color+"44":"rgba(40,40,60,0.5)"}`,
                                minWidth:46,
                              }}>
                                <span style={{fontSize:14}}>⚗️</span>
                                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:16,fontWeight:900,
                                  color:check.ok?cm.color:"#2a2a50",lineHeight:1.2}}>{mut.ep}</span>
                              </div>
                            )}
                          </div>
                          <h4 style={{fontSize:16,fontWeight:800,color:active?cm.color:"#e8e8f8",
                            margin:"0 0 5px",lineHeight:1.2}}>{mut.name}</h4>
                          <p style={{fontSize:12,color:active?"#9090b8":"#484868",margin:"0 0 10px",lineHeight:1.6}}>{mut.desc}</p>
                          {prereqs&&prereqs.length>0&&(
                            <p style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",margin:"0 0 10px",
                              color:active?"rgba(74,222,128,0.7)":check.ok?"rgba(74,222,128,0.7)":"rgba(255,160,60,0.65)"}}>
                              {active?"✓":"→"} {prereqs.join(", ")}
                            </p>
                          )}
                          {!active&&(
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {mut.infectivity>0&&<MPill v={`+${mut.infectivity} inf`}  c="#ff6b6b"/>}
                              {mut.meme>0        &&<MPill v={`+${mut.meme} meme`}       c="#ffd43b"/>}
                              {mut.severity>0    &&<MPill v={`+${mut.severity} sev`}    c="#b197fc"/>}
                            </div>
                          )}
                          {locked&&check.reason&&(
                            <p style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",
                              color:"rgba(255,140,40,0.5)",margin:"8px 0 0"}}>
                              ⚠ {check.reason}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>{/* end map area */}

            {/* ── CURE PROGRESS BAR ── (only when progressing) */}
            {gs.cureProgress>2&&(
              <div style={{
                flexShrink:0,padding:"6px 20px",
                background:"rgba(4,6,14,0.98)",
                borderTop:"1px solid rgba(74,222,128,0.15)",
              }}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4ade80",
                    letterSpacing:"0.12em",whiteSpace:"nowrap"}}>🧬 CURE</span>
                  <div style={{flex:1,height:4,background:"rgba(255,255,255,0.06)",borderRadius:4,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${gs.cureProgress}%`,borderRadius:4,
                      background:"linear-gradient(90deg,#22c55e,#4ade80)",
                      transition:"width 0.5s ease",
                      boxShadow:"0 0 8px rgba(74,222,128,0.5)"}}/>
                  </div>
                  <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#4ade80",whiteSpace:"nowrap"}}>
                    {Math.round(gs.cureProgress)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── RESULT ── */}
        {phase==="result"&&result&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
            minHeight:"calc(100vh - 64px)",padding:32,animation:"fadeUp 0.5s ease both"}}>
            <div style={{maxWidth:560,width:"100%"}}>
              <h2 style={{fontSize:"2rem",fontWeight:900,color:"#f0f0f8",textAlign:"center",
                margin:"0 0 28px",letterSpacing:"-0.025em"}}>Pandemic Complete</h2>
              <div id="brainrot-card" style={{
                borderRadius:30,overflow:"hidden",marginBottom:28,
                background:`linear-gradient(135deg,#0c0c1c 0%,${result.color}0e 50%,#0c0c1c 100%)`,
                border:`1px solid ${result.color}20`,
                boxShadow:`0 0 60px ${result.color}18`,
              }}>
                <div style={{padding:"36px"}}>
                  <div style={{textAlign:"center",marginBottom:26}}>
                    <div style={{fontSize:64,marginBottom:14,
                      filter:`drop-shadow(0 0 20px ${result.color}80)`}}>{result.emoji}</div>
                    <div style={{display:"inline-flex",alignItems:"center",gap:8,
                      padding:"6px 20px",borderRadius:30,marginBottom:16,
                      background:result.color+"12",color:result.color,border:`1px solid ${result.color}1e`,
                      fontFamily:"'JetBrains Mono',monospace",fontSize:11,fontWeight:700,letterSpacing:"0.15em"}}>
                      GRADE: {result.grade}
                    </div>
                    <h3 style={{fontSize:"clamp(1.4rem,4vw,2rem)",fontWeight:900,color:result.color,
                      margin:0,letterSpacing:"-0.025em"}}>{result.title}</h3>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:22}}>
                    {[{l:"Infected",v:`${gs.pct}%`,c:"#ff6b6b"},{l:"Days",v:String(gs.day),c:"#ffd43b"},{l:"Mutations",v:String(gs.active.length),c:"#b197fc"}].map(s=>(
                      <div key={s.l} style={{textAlign:"center",padding:"16px 8px",borderRadius:18,background:"rgba(255,255,255,0.035)"}}>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:26,fontWeight:900,color:s.c}}>{s.v}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#383858",textTransform:"uppercase",marginTop:5}}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{color:"#7070a0",fontSize:15,lineHeight:1.75,textAlign:"center",marginBottom:18}}>{result.desc}</p>
                  <div style={{borderRadius:18,padding:"20px",textAlign:"center",
                    background:result.color+"07",border:`1px solid ${result.color}10`}}>
                    <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:result.color,
                      letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8}}>The Diagnosis</p>
                    <p style={{color:"#ddddf8",fontSize:16,fontStyle:"italic",fontWeight:600,margin:0}}>"{result.roast}"</p>
                  </div>
                  <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#181830",textAlign:"center",marginTop:22}}>dafuqbro.com/brainrot</p>
                </div>
              </div>
              <ShareButtons cardId="brainrot-card" shareUrl="https://dafuqbro.com/brainrot"
                shareText={`My brainrot got a ${result.grade}: "${result.title}" 🧠🦠 How cooked are you?`}
                accentColor={result.color}/>
              <div style={{textAlign:"center",marginTop:28}}>
                <button onClick={()=>{setPhase("intro");setGs({infected:Object.fromEntries(REGIONS.map(r=>[r.id,0])),pct:0,day:0,active:[],infectivity:10,severity:5,meme:0,gameOver:false,cureProgress:0,ep:0});}}
                  style={{color:"#333358",fontSize:15,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                  ← Start a new pandemic
                </button>
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

/* ── helpers ── */
function hexToRgb(hex:string):string{
  const r=parseInt(hex.slice(1,3),16);
  const g=parseInt(hex.slice(3,5),16);
  const b=parseInt(hex.slice(5,7),16);
  return`${r},${g},${b}`;
}
function TopStat({label,val,color}:{label:string;val:string;color:string}){
  return(
    <div style={{fontFamily:"'JetBrains Mono',monospace",lineHeight:1.1}}>
      <div style={{fontSize:9,color:"#2a2a50",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:1}}>{label}</div>
      <div style={{fontSize:22,fontWeight:900,color}}>{val}</div>
    </div>
  );
}
function CtrlBtn({onClick,label}:{onClick:()=>void;label:string}){
  return(
    <button onClick={onClick} style={{
      padding:"8px 16px",borderRadius:10,background:"rgba(255,255,255,0.04)",
      border:"1px solid rgba(255,255,255,0.07)",color:"#7070a0",fontSize:12,
      fontWeight:700,fontFamily:"'JetBrains Mono',monospace",cursor:"pointer",transition:"all 0.15s",
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="#a0a0c0";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.07)";e.currentTarget.style.color="#7070a0";}}
    >{label}</button>
  );
}
function MPill({v,c}:{v:string;c:string}){
  return(
    <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",padding:"3px 10px",
      borderRadius:20,background:`${c}14`,color:c,border:`1px solid ${c}1e`}}>{v}</span>
  );
}
