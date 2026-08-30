export default function FivePointScale({
  name,
  value,
  labels,
  onChange,
}: {
  name: string;
  value: number;
  labels: string[];
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block">
        <span className="sr-only">{name}</span>
        <input type="range" min="1" max="5" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label={name} className="h-11 w-full accent-calm-600" />
      </label>
      <p className="mt-1 text-sm text-slate-600" aria-live="polite">{value} / 5 · {labels[value - 1]}</p>
    </div>
  );
}
