import { redFlags } from '../data/safety';
import { useI18n } from '../services/i18n';

export default function RedFlagChecklist({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const { t } = useI18n();

  function toggle(id: string): void {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
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
    </div>
  );
}
