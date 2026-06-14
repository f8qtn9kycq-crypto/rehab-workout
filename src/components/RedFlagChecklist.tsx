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
    <fieldset className="space-y-3" aria-describedby="red-flag-instruction">
      <legend className="text-base font-bold text-slate-900">{t('safety.redFlagGroup')}</legend>
      <p id="red-flag-instruction" className="text-sm leading-6 text-slate-600">{t('safety.redFlagInstruction')}</p>
      {redFlags.map((flag) => (
        <label key={flag.id} className="flex min-h-14 gap-3 rounded-lg border border-slate-200 bg-white p-3 focus-within:ring focus-within:ring-calm-200">
          <input
            type="checkbox"
            checked={selected.includes(flag.id)}
            onChange={() => toggle(flag.id)}
            aria-describedby={`${flag.id}-description`}
            className="mt-1 h-5 w-5 accent-calm-600"
          />
          <span>
            <span className="block font-semibold text-slate-900">{t(`safety.redFlags.${flag.id}.label`)}</span>
            <span id={`${flag.id}-description`} className="block text-sm text-slate-600">{t(`safety.redFlags.${flag.id}.description`)}</span>
          </span>
        </label>
      ))}
      <label className="flex min-h-14 gap-3 rounded-lg border-2 border-calm-200 bg-calm-50 p-3 focus-within:ring focus-within:ring-calm-200">
        <input
          type="checkbox"
          checked={noneSelected}
          onChange={toggleNone}
          aria-describedby="none-of-above-description"
          className="mt-1 h-5 w-5 accent-calm-600"
        />
        <span>
          <span className="block font-semibold text-slate-900">{t('safety.noneOfAbove')}</span>
          <span id="none-of-above-description" className="block text-sm text-slate-600">{t('safety.noneOfAboveDescription')}</span>
        </span>
      </label>
    </fieldset>
  );
}
