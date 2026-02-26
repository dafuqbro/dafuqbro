export interface Tool {
  slug: string;
  emoji: string;
  name: string;
  description: string;
  accent: string;
  badge: "hot" | "new" | "soon" | null;
  active: boolean;
}

export const tools: Tool[] = [
  {
    slug: "shitcoin",
    emoji: "💩",
    name: "Shitcoin Pitch Deck",
    description: "Generate a hilariously legit listing for your fake meme coin. Complete with tokenomics & degen score.",
    accent: "yellow",
    badge: "hot",
    active: true,
  },
  {
    slug: "roast",
    emoji: "🔥",
    name: "Roast My Year",
    description: "Your year in review, but make it brutally honest. A Wrapped-style roast with a Life Score.",
    accent: "pink",
    badge: "hot",
    active: true,
  },
  {
    slug: "flags",
    emoji: "🚩",
    name: "Flag Detector",
    description: "Describe any situation. We'll tell you if it's a red flag or green flag with zero mercy.",
    accent: "red",
    badge: "soon",
    active: false,
  },
  {
    slug: "horror",
    emoji: "🪓",
    name: "Horror Movie Death",
    description: 'How would you die in a horror movie? Get your death scene, survival odds & "first to go" rating.',
    accent: "purple",
    badge: "soon",
    active: false,
  },
  {
    slug: "redflags",
    emoji: "🚨",
    name: "Rate My Red Flags",
    description: "Check all the red flags that apply to you. Get a brutal dateability score and a card to prove it.",
    accent: "orange",
    badge: "hot",
    active: true,
  },
  {
    slug: "dna",
    emoji: "🧬",
    name: "Internet DNA",
    description: "Your internet personality broken down into a chart. Are you more doomscroller or shitposter?",
    accent: "cyan",
    badge: "soon",
    active: false,
  },
  {
    slug: "startup",
    emoji: "🦄",
    name: "Startup or Scam",
    description: 'Pitch any business idea. We\'ll rate it from "$4.2B Unicorn" to "Straight to Jail."',
    accent: "green",
    badge: "soon",
    active: false,
  },
  {
    slug: "villain",
    emoji: "🦹",
    name: "Villain Origin Story",
    description: "Answer 5 questions. Get your villain name, superpower, weakness & evil lair.",
    accent: "blue",
    badge: "soon",
    active: false,
  },
];

export const accentColors: Record<string, string> = {
  yellow: "#facc15",
  pink: "#f472b6",
  red: "#f87171",
  purple: "#a78bfa",
  orange: "#fb923c",
  cyan: "#22d3ee",
  green: "#4ade80",
  blue: "#60a5fa",
};
