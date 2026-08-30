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
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      {labels.map((label, index) => {
        const score = index + 1;
        return (
          <label key={score} className={`focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-calm-700 flex min-h-[84px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-center ${value === score ? 'border-calm-600 bg-calm-50 text-calm-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'}`}>
            <input type="radio" name={name} value={score} checked={value === score} onChange={() => onChange(score)} className="sr-only" />
            <span className="text-xl font-black leading-none">{score}</span>
            <span className="text-[11px] font-semibold leading-tight">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
