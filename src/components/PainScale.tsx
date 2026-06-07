export default function PainScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-base font-semibold text-slate-800">
        {label}
        <span className="rounded-md bg-slate-100 px-3 py-1 text-calm-700">{value} / 10</span>
      </span>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full accent-calm-500"
      />
    </label>
  );
}
