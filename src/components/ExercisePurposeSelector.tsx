import { EXERCISE_PURPOSES, type ExercisePurposeFilter } from '../data/exercisePurposes';
import { useI18n } from '../services/i18n';

export default function ExercisePurposeSelector({ value, onChange }: {
  value: ExercisePurposeFilter;
  onChange: (value: ExercisePurposeFilter) => void;
}) {
  const { t } = useI18n();
  return <fieldset className="space-y-2">
    <legend className="mb-2 text-base font-bold text-ink">{t('discovery.purpose')}</legend>
    <div className="grid grid-cols-3 gap-2">
      {(['all', ...EXERCISE_PURPOSES] as const).map(purpose => <button
        key={purpose}
        type="button"
        aria-pressed={value === purpose}
        onClick={() => onChange(purpose)}
        className={`focus-ring min-h-11 rounded-md border px-2 py-2 text-sm font-bold ${value === purpose ? 'border-calm-900 bg-calm-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}
      >{t(`discovery.purposes.${purpose}`)}</button>)}
    </div>
    <p className="text-sm leading-6 text-slate-600">{t('discovery.purposeHint')}</p>
  </fieldset>;
}
