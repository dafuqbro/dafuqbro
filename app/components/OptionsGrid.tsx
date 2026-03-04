interface OptionsGridProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  accentColor?: string;
}

export function OptionsGrid({ options, selected, onSelect, accentColor = "#F5C518" }: OptionsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`bg-[#2A2640] border rounded-xl py-3.5 px-3 text-[0.88rem] font-medium font-['Outfit'] cursor-pointer transition-all text-center ${
            selected === opt.value
              ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-dim)]"
              : "text-[#9B95A8] border-[#3A3555]/50 hover:border-[#3A3555] hover:text-[#F5F5F7]"
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
