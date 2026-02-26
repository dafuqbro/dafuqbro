import { useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import { OptionsGrid } from "~/components/OptionsGrid";
import { ShareButtons } from "~/components/ShareButtons";
import { GeneratingOverlay } from "~/components/GeneratingOverlay";

export const meta: MetaFunction = () => [
  { title: "Shitcoin Pitch Deck — DaFuqBro" },
  { name: "description", content: "Generate a hilariously legit listing for your fake meme coin. Complete with tokenomics, roadmap & degen score." },
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randBetween = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;

const suffixes: Record<string, string[]> = {
  meme: ["Inu", "Moon", "Pepe", "Doge", "Cat", "Frog", "Wojak", "Chad", "Bonk", "Floki"],
  "fake-utility": ["Chain", "Protocol", "Network", "Finance", "Swap", "DAO", "Vault", "Labs", "Pay", "Fi"],
  cult: ["Temple", "Order", "Cult", "Covenant", "Ritual", "Sacred", "Blessed", "Eternal", "Ascend", "Divine"],
  "ai-hype": ["GPT", "Neural", "Cortex", "Synapse", "Matrix", "Quantum", "Tensor", "AGI", "Nexus", "Byte"],
};

const taglines: Record<string, string[]> = {
  meme: ["The coin your financial advisor warned you about", "No utility. No roadmap. Just vibes.", "We put the 'fun' in 'no fundamentals'", "Trust the process (there is no process)", "Community-driven into the ground"],
  "fake-utility": ["Revolutionizing something, probably", "Like Ethereum but worse in every way", "Web3 infrastructure for Web2 problems nobody has", "Enterprise-grade solutions for your degen portfolio", "Our whitepaper has 47 pages of pure fiction"],
  cult: ["Join us. There is no leaving.", "Believe in something bigger than your portfolio", "The prophecy foretold a 1000x. We're still waiting.", "Community so loyal it's actually concerning", "We don't have investors. We have believers."],
  "ai-hype": ["AI-powered blockchain for the AI-powered blockchain", "Our AI generates buy signals (and copium)", "Machine learning, but the machine never learns", "If ChatGPT made a token, it would apologize", "Artificial intelligence, real financial consequences"],
};

const roadmapSets: Record<string, string[][]> = {
  meme: [["Launch on DEX, pray", "Get listed on CoinGecko somehow", "Celebrity tweet (begging phase)", "McDonald's partnership (delusional phase)"]],
  "fake-utility": [["Whitepaper v0.1 (just vibes)", "Testnet launch (it's a form)", "Mainnet beta (still a form)", "Enterprise adoption (one guy in Discord)"]],
  cult: [["Founding ritual complete", "Sacred whitepaper released", "First pilgrimage to Consensus", "Ascension event (just a token burn)"]],
  "ai-hype": [["Train model on crypto Twitter", "AI generates first buy signal", "Model achieves 50% accuracy (coin flip)", "AGI achieved (just an if-else statement)"]],
};

const mascots: Record<string, string[]> = {
  meme: ["💩", "🐸", "🐕", "🦍", "🤡", "🐒", "🌝", "🦧"],
  "fake-utility": ["⚙️", "🔮", "🧊", "💎", "🔬", "🧪", "⚡", "🛸"],
  cult: ["🕯️", "👁️", "🔱", "🌀", "🗿", "☠️", "🪬", "🐍"],
  "ai-hype": ["🤖", "🧠", "💻", "🦾", "👾", "🔮", "⚡", "🌐"],
};

const verdicts = {
  high: ["Absolute degen perfection", "Peak shitcoin energy", "Your parents would be devastated", "Certified rug-worthy masterpiece"],
  mid: ["Solidly unhinged", "Would FOMO into at 2am", "Your portfolio called, it's crying", "Just degen enough to work"],
  low: ["Too safe for a shitcoin honestly", "Needs more chaos", "Almost responsible, which is concerning"],
};

const genMessages = [
  "Deploying smart contract...", "Minting 1 trillion tokens...", "Faking the liquidity pool...",
  "Writing the whitepaper with ChatGPT...", "Bribing CoinGecko for a listing...", "Calculating rug probability...",
  "Adding AI buzzwords to the roadmap...", "Photoshopping team headshots...", "Inflating market cap...",
];

function formatMcap(n: number) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(0) + "K";
  return "$" + n;
}

interface Result {
  ticker: string; coinName: string; tagline: string; chain: string;
  mcap: string; holders: string; rugRisk: number;
  roadmap: string[]; grade: string; gradeColor: string;
  verdict: string; mascot: string;
}

export default function ShitcoinTool() {
  const [theme, setTheme] = useState("");
  const [vibe, setVibe] = useState("");
  const [community, setCommunity] = useState("");
  const [chain, setChain] = useState("");
  const [exit, setExit] = useState("");
  const [redflag, setRedflag] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const generate = () => {
    if (!theme.trim() || !vibe || !community || !chain || !exit || !redflag) return;
    setGenerating(true);

    setTimeout(() => {
      const words = theme.toUpperCase().replace(/[^A-Z\s]/g, "").split(/\s+/).filter(Boolean);
      const ticker = words.length > 0 ? "$" + (words[0].length <= 5 ? words[0] : words[0].substring(0, randBetween(3, 5))) : "$COPE";
      const suffix = pick(suffixes[vibe] || suffixes.meme);
      const base = theme.trim().split(/\s+/)[0];
      const coinName = (base.charAt(0).toUpperCase() + base.slice(1).toLowerCase()) + suffix;

      let pts = 0;
      if (vibe === "meme") pts += 3; if (vibe === "cult") pts += 4;
      if (community === "deranged") pts += 3; if (community === "criminal") pts += 4; if (community === "chaotic") pts += 2;
      if (exit === "rug") pts += 4; if (exit === "none") pts += 3; if (exit === "moon") pts += 2;
      if (redflag === "all") pts += 4; if (redflag === "anon") pts += 2; if (redflag === "liquidity") pts += 3;

      const pct = pts / 16;
      let grade: string, gradeColor: string, verdictPool: keyof typeof verdicts;
      if (pct >= 0.7) { grade = pick(["S+", "S", "A+"]); gradeColor = "#facc15"; verdictPool = "high"; }
      else if (pct >= 0.4) { grade = pick(["A", "B+", "B"]); gradeColor = "#fb923c"; verdictPool = "mid"; }
      else { grade = pick(["C", "D", "F"]); gradeColor = "#71717a"; verdictPool = "low"; }

      const rugRisk = redflag === "all" ? randBetween(85, 99) : redflag === "liquidity" ? randBetween(60, 85) : randBetween(20, 50);
      const holders = community === "criminal" ? randBetween(12, 89) : community === "deranged" ? randBetween(420, 6900) : randBetween(1000, 50000);
      const mcap = vibe === "ai-hype" ? randBetween(1000000, 100000000) : randBetween(10000, 5000000);

      setResult({
        ticker, coinName,
        tagline: pick(taglines[vibe] || taglines.meme),
        chain,
        mcap: formatMcap(mcap),
        holders: holders.toLocaleString(),
        rugRisk,
        roadmap: pick(roadmapSets[vibe] || roadmapSets.meme),
        grade, gradeColor,
        verdict: pick(verdicts[verdictPool]),
        mascot: pick(mascots[vibe] || mascots.meme),
      });
      setGenerating(false);
    }, 2500);
  };

  const retry = () => setResult(null);

  return (
    <>
      <GeneratingOverlay active={generating} messages={genMessages} accentColor="#facc15" />
      
      {/* Top bar */}
      <div className="py-4 px-5 flex items-center gap-3 border-b border-white/[0.06] relative z-10">
        <Link to="/" className="text-[#71717a] text-[0.85rem] hover:text-white transition-colors">DaFuqBro</Link>
        <span className="text-[#71717a] text-[0.75rem]">›</span>
        <span className="text-[#a1a1aa] font-semibold text-[0.85rem]">💩 Shitcoin Pitch Deck</span>
      </div>

      <div className="max-w-[640px] mx-auto px-5 py-10 pb-24 relative z-1">
        {/* Hero */}
        <div className="text-center mb-10">
          <span className="text-[3.5rem] mb-4 block">💩</span>
          <h1 className="font-['Outfit'] font-extrabold text-[2rem] tracking-tight mb-2.5">Shitcoin Pitch Deck</h1>
          <p className="text-[#a1a1aa] text-[0.95rem] leading-relaxed max-w-[420px] mx-auto">
            Answer 6 questions. Get a hilariously legit meme coin listing complete with tokenomics and a degen score.
          </p>
        </div>

        {!result ? (
          <div className="flex flex-col gap-5">
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">
                What's your coin about? <span className="font-normal text-[#71717a] text-[0.8rem]">(the dumber the better)</span>
              </label>
              <input
                type="text" value={theme} onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. cats in suits, grandma's recipes, sentient rugs" maxLength={60}
                className="w-full bg-[#1a1a1f] border border-white/[0.06] rounded-xl py-3.5 px-4 text-[#f4f4f5] font-['Outfit'] text-[0.95rem] outline-none focus:border-[#facc15]/40 placeholder:text-[#71717a]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">Pick a vibe</label>
              <OptionsGrid options={[
                { value: "meme", label: "🤡 Pure Meme" }, { value: "fake-utility", label: "🛠️ Fake Utility" },
                { value: "cult", label: "🕯️ Cult Energy" }, { value: "ai-hype", label: "🤖 AI Buzzwords" },
              ]} selected={vibe} onSelect={setVibe} accentColor="#facc15" />
            </div>
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">How unhinged is the community?</label>
              <OptionsGrid options={[
                { value: "mild", label: "😊 Mild" }, { value: "chaotic", label: "😈 Chaotic" },
                { value: "deranged", label: "🤯 Deranged" }, { value: "criminal", label: "💀 Criminal" },
              ]} selected={community} onSelect={setCommunity} accentColor="#facc15" />
            </div>
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">
                Pick a blockchain <span className="font-normal text-[#71717a] text-[0.8rem]">(it doesn't matter, obviously)</span>
              </label>
              <OptionsGrid options={[
                { value: "Solana", label: "Solana" }, { value: "Ethereum", label: "Ethereum" },
                { value: "Base", label: "Base" }, { value: "BSC", label: "BSC (of course)" },
              ]} selected={chain} onSelect={setChain} accentColor="#facc15" />
            </div>
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">What's your exit strategy?</label>
              <OptionsGrid options={[
                { value: "moon", label: "🚀 Moon or zero" }, { value: "rug", label: "🏃 Rug at ATH" },
                { value: "hold", label: "💎 Diamond hands" }, { value: "none", label: "🤷 No plan" },
              ]} selected={exit} onSelect={setExit} accentColor="#facc15" />
            </div>
            <div>
              <label className="block font-semibold text-[0.9rem] mb-2">Biggest red flag you'd ignore for gains?</label>
              <OptionsGrid options={[
                { value: "anon", label: "👻 Anonymous team" }, { value: "liquidity", label: "🔓 No locked liquidity" },
                { value: "whitepaper", label: "📄 No whitepaper" }, { value: "all", label: "🤡 All of the above" },
              ]} selected={redflag} onSelect={setRedflag} accentColor="#facc15" />
            </div>
            <button
              onClick={generate}
              className="w-full py-4 rounded-[14px] bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#09090b] font-['Outfit'] text-[1.05rem] font-bold cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(250,204,21,0.3)] mt-3"
            >
              Generate My Shitcoin 💩
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-5">
            {/* Result card */}
            <div id="resultCard" className="w-full max-w-[480px] bg-gradient-to-br from-[#1a1a2e] via-[#16162a] to-[#0f0f1a] rounded-[20px] border border-[#facc15]/15 overflow-hidden relative">
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[radial-gradient(circle,rgba(250,204,21,0.06)_0%,transparent_70%)] pointer-events-none" />
              <div className="absolute -bottom-[30%] -left-[30%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(167,139,250,0.05)_0%,transparent_60%)] pointer-events-none" />
              
              <div className="flex justify-between items-start p-7 pb-0">
                <span className="font-['JetBrains_Mono'] text-[0.72rem] text-[#facc15] bg-[#facc15]/10 border border-[#facc15]/20 px-3 py-1 rounded-full font-semibold">{result.ticker}</span>
                <span className="font-['JetBrains_Mono'] text-[0.72rem] text-[#71717a]">{result.chain}</span>
              </div>
              
              <div className="px-7 py-5">
                <div className="text-center mb-3">
                  <span className="text-[4.5rem] leading-none drop-shadow-[0_0_20px_rgba(250,204,21,0.3)] animate-mascotIn block">{result.mascot}</span>
                </div>
                <div className="font-['Outfit'] font-extrabold text-[1.8rem] tracking-tight mb-1">{result.coinName}</div>
                <div className="text-[#a1a1aa] text-[0.88rem] italic mb-5">"{result.tagline}"</div>
                
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/[0.03] rounded-xl p-3.5 text-center">
                    <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-widest mb-1.5">Market Cap</div>
                    <div className="font-['JetBrains_Mono'] font-bold text-[#4ade80]">{result.mcap}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3.5 text-center">
                    <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-widest mb-1.5">Holders</div>
                    <div className="font-['JetBrains_Mono'] font-bold text-[#22d3ee]">{result.holders}</div>
                  </div>
                  <div className="bg-white/[0.03] rounded-xl p-3.5 text-center">
                    <div className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] uppercase tracking-widest mb-1.5">Rug Risk</div>
                    <div className="font-['JetBrains_Mono'] font-bold text-[#f87171]">{result.rugRisk}%</div>
                  </div>
                </div>
                
                <div className="mb-5">
                  <div className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] uppercase tracking-[0.12em] mb-2.5">Roadmap</div>
                  {result.roadmap.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-[0.82rem] text-[#a1a1aa] mb-1.5">
                      <span className="font-['JetBrains_Mono'] text-[0.6rem] text-[#71717a] min-w-[28px]">Q{i + 1}</span>
                      {item}
                    </div>
                  ))}
                </div>
                
                <div className="bg-white/[0.02] rounded-[14px] p-4.5 text-center border border-white/[0.04]">
                  <div className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] uppercase tracking-[0.12em] mb-1.5">Degen Score</div>
                  <div className="font-['Outfit'] font-black text-[2.5rem] tracking-tight" style={{ color: result.gradeColor }}>{result.grade}</div>
                  <div className="text-[0.82rem] text-[#a1a1aa] mt-1">{result.verdict}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center px-7 py-4 border-t border-white/[0.04]">
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">dafuqbro.com</span>
                <span className="font-['JetBrains_Mono'] text-[0.65rem] text-[#71717a] opacity-60">
                  {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>

            <ShareButtons
              shareUrl="https://dafuqbro.com/shitcoin"
              shareText={`My shitcoin ${result.ticker} just got a Degen Score of ${result.grade} 💩\n\nGenerate yours 👇`}
              cardId="resultCard"
              accentColor="#facc15"
            />

            <div className="flex gap-3 w-full max-w-[480px]">
              <button onClick={() => { /* download handled by ShareButtons */ }} className="flex-1 py-3.5 rounded-xl bg-gradient-to-br from-[#facc15] to-[#f59e0b] text-[#09090b] font-['Outfit'] font-semibold text-[0.92rem] cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(250,204,21,0.3)] hover:-translate-y-0.5">
                📸 Save Card
              </button>
              <button onClick={retry} className="flex-1 py-3.5 rounded-xl bg-white/[0.06] text-white font-['Outfit'] font-semibold text-[0.92rem] border border-white/[0.06] cursor-pointer hover:bg-white/[0.1]">
                🔄 Try Again
              </button>
            </div>

            <Link to="/" className="text-[#71717a] text-[0.85rem] hover:text-[#a1a1aa] transition-colors mt-2">
              ← Back to all tools
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
