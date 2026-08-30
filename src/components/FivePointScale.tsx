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
    <div className="grid grid-cols-5 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
      {labels.map((label, index) => {
        const score = index + 1;
        return (
          <label key={score} className={`focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-calm-700 flex min-h-12 cursor-pointer flex-col items-center justify-center gap-0.5 border-r border-slate-200 px-1 text-center last:border-r-0 ${value === score ? 'bg-calm-700 text-white' : 'bg-white text-slate-700'}`}>
            <input type="radio" name={name} value={score} checked={value === score} onChange={() => onChange(score)} className="sr-only" />
            <span className="text-base font-black leading-none">{score}</span>
            <span className="truncate text-[10px] font-semibold leading-tight">{label}</span>
          </label>
        );
      })}
    </div>
  );
}
