import { useId } from 'react';

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
  const id = useId();
  const displayValue = value === null ? '--' : value;
  const zeroSelected = value === 0;
  const valueText = value === null ? `${label}: ${displayValue}` : `${label}: ${value} / 10`;

  return (
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={`${id}-value`}>
      <label htmlFor={`${id}-range`} className="block">
        <span id={`${id}-label`} className="mb-2 flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-slate-800">
          {label}
          <span id={`${id}-value`} className="rounded-md bg-slate-100 px-3 py-1 text-calm-700" aria-live="polite">
            {displayValue} / 10
          </span>
        </span>
        <input
          id={`${id}-range`}
          type="range"
          min="0"
          max="10"
          value={value ?? 0}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={valueText}
          className="h-11 w-full accent-calm-500"
        />
      </label>
      {zeroLabel ? (
        <button
          type="button"
          aria-pressed={zeroSelected}
          aria-label={zeroLabel}
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
