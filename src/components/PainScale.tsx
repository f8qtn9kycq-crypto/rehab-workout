export default function PainScale({
  label,
  value,
  onChange,
  zeroLabel,
}: {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  zeroLabel?: string;
}) {
  const displayValue = value === null ? '--' : value;
  const zeroSelected = value === 0;

  return (
    <div>
      <label className="block">
        <span className="mb-2 flex items-center justify-between text-base font-semibold text-slate-800">
          {label}
          <span className="rounded-md bg-slate-100 px-3 py-1 text-calm-700">{displayValue} / 10</span>
        </span>
        <input
          type="range"
          min="0"
          max="10"
          value={value ?? 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 w-full accent-calm-500"
        />
      </label>
      {zeroLabel ? (
        <button
          type="button"
          aria-pressed={zeroSelected}
          onClick={() => onChange(0)}
          className={`focus-ring mt-2 min-h-11 rounded-md border px-3 text-sm font-semibold ${
            zeroSelected
              ? 'border-calm-300 bg-calm-50 text-calm-800'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          {zeroLabel}
        </button>
      ) : null}
    </div>
  );
}
