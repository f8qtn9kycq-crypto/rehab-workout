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
      {value === null && zeroLabel ? (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="focus-ring mt-2 min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
        >
          {zeroLabel}
        </button>
      ) : null}
    </div>
  );
}
