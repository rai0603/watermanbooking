interface NumberStepperProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 50,
}: NumberStepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:border-ocean-400 hover:text-ocean-700"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
        className="h-9 w-14 rounded-lg border border-slate-300 text-center"
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-lg font-bold text-slate-600 hover:border-ocean-400 hover:text-ocean-700"
      >
        +
      </button>
    </div>
  );
}
