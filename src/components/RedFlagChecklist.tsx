import { redFlags } from '../data/safety';
import { useI18n } from '../services/i18n';

export default function RedFlagChecklist({
  selected,
  noneSelected,
  onChange,
  onNoneChange,
}: {
  selected: string[];
  noneSelected: boolean;
  onChange: (selected: string[]) => void;
  onNoneChange: (selected: boolean) => void;
}) {
  const { t } = useI18n();

  function toggle(id: string): void {
    onNoneChange(false);
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  }

  function toggleNone(): void {
    const nextSelected = !noneSelected;
    onNoneChange(nextSelected);
    if (nextSelected) onChange([]);
  }

  return (
    <div className="space-y-3">
      {redFlags.map((flag) => (
        <label key={flag.id} className="flex min-h-14 gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <input
            type="checkbox"
            checked={selected.includes(flag.id)}
            onChange={() => toggle(flag.id)}
            className="mt-1 h-5 w-5 accent-calm-600"
          />
          <span>
            <span className="block font-semibold text-slate-900">{t(`safety.redFlags.${flag.id}.label`)}</span>
            <span className="block text-sm text-slate-600">{t(`safety.redFlags.${flag.id}.description`)}</span>
          </span>
        </label>
      ))}
      <label className="flex min-h-14 gap-3 rounded-lg border-2 border-calm-200 bg-calm-50 p-3">
        <input
          type="checkbox"
          checked={noneSelected}
          onChange={toggleNone}
          className="mt-1 h-5 w-5 accent-calm-600"
        />
        <span>
          <span className="block font-semibold text-slate-900">{t('safety.noneOfAbove')}</span>
          <span className="block text-sm text-slate-600">{t('safety.noneOfAboveDescription')}</span>
        </span>
      </label>
    </div>
  );
}
