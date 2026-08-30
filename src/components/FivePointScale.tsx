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
      <div className="grid grid-cols-5 text-center text-xs font-bold text-slate-600" aria-hidden="true">
        {labels.map((label, index) => <span key={index} className={value === index + 1 ? 'text-calm-800' : ''}>{index + 1}<span className="mt-1 block truncate text-[10px] font-semibold">{label}</span></span>)}
      </div>
    </div>
  );
}
