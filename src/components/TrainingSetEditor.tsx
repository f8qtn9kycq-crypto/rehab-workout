import { useI18n } from '../services/i18n';
import type { TrainingSet } from '../types/rehab';

interface Props {
  sets: TrainingSet[];
  plannedReps: number;
  onChange: (sets: TrainingSet[]) => void;
}

export default function TrainingSetEditor({ sets, plannedReps, onChange }: Props) {
  const { t } = useI18n();
  const control = 'focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2';
  const addSet = () => sets.length < 20 && onChange([...sets, { reps: plannedReps, completed: true }]);
  const updateSet = (index: number, update: Partial<TrainingSet>) => onChange(sets.map((set, i) => i === index ? { ...set, ...update } : set));
  const updateNumber = (index: number, field: 'weightKg' | 'reps', value: string) => {
    const next = { ...sets[index] };
    if (value === '') delete next[field];
    else next[field] = Number(value);
    onChange(sets.map((set, i) => i === index ? next : set));
  };

  return <fieldset className="space-y-3 rounded-lg border border-calm-100 bg-calm-50/50 p-3">
    <legend className="px-1 font-bold text-ink">{t('logs.setDetails')}</legend>
    <p className="text-sm leading-6 text-slate-600">{t('logs.setDetailsHint')}</p>
    {sets.map((set, index) => <div key={index} className="rounded-md border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2"><span className="font-bold">{t('logs.setNumber', { number: index + 1 })}</span><button type="button" onClick={() => onChange(sets.filter((_, i) => i !== index))} className="focus-ring min-h-11 rounded-md px-3 font-bold text-red-700">{t('logs.removeSet')}</button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold">{t('logs.weightKg')}<input className={control} inputMode="decimal" type="number" min="0" max="1000" step="0.5" value={set.weightKg ?? ''} onChange={event => updateNumber(index, 'weightKg', event.target.value)} /></label>
        <label className="block text-sm font-semibold">{t('logs.repsPerSet')}<input className={control} inputMode="numeric" type="number" min="0" max="1000" step="1" value={set.reps ?? ''} onChange={event => updateNumber(index, 'reps', event.target.value)} /></label>
      </div>
      <label className="mt-2 flex min-h-11 items-center gap-3 font-semibold"><input type="checkbox" checked={set.completed} onChange={event => updateSet(index, { completed: event.target.checked })} />{t('logs.setCompleted')}</label>
    </div>)}
    <button type="button" disabled={sets.length >= 20} onClick={addSet} className="focus-ring min-h-11 w-full rounded-md border border-calm-300 bg-white px-4 font-bold text-calm-800 disabled:text-slate-400">{t('logs.addSet')}</button>
  </fieldset>;
}
