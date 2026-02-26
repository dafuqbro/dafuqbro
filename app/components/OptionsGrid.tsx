interface OptionsGridProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  accentColor?: string;
}

export function OptionsGrid({ options, selected, onSelect, accentColor = "#facc15" }: OptionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`bg-[#1a1a1f] border rounded-xl py-3.5 px-3 text-[0.88rem] font-medium font-['Outfit'] cursor-pointer transition-all text-center ${
            selected === opt.value
              ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-dim)]"
              : "text-[#a1a1aa] border-white/[0.06] hover:border-white/[0.12] hover:text-[#f4f4f5]"
          }`}
          style={{
            "--accent": accentColor,
            "--accent-dim": accentColor + "18",
          } as React.CSSProperties}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
