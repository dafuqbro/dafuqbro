import { useState, useEffect } from "react";

interface GeneratingOverlayProps {
  active: boolean;
  messages: string[];
  accentColor?: string;
}

export function GeneratingOverlay({ active, messages, accentColor = "#F5C518" }: GeneratingOverlayProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setMsgIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 400);
    return () => clearInterval(interval);
  }, [active, messages]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/92 backdrop-blur-lg z-[200] flex flex-col items-center justify-center gap-6">
      <div
        className="w-[60px] h-[60px] border-[3px] border-[#3A3555]/50 rounded-full animate-spin"
        style={{ borderTopColor: accentColor }}
      />
      <div className="text-[1.1rem] font-semibold text-[#9B95A8]">{messages[msgIdx]}</div>
      <div className="font-['JetBrains_Mono'] text-[0.78rem] text-[#6B6580] text-center max-w-[280px]">
        just kidding, we're making up numbers
      </div>
    </div>
  );
}
