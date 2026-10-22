import type { TrainingSet } from '../types/rehab';
import { useI18n } from '../services/i18n';

export default function TrainingSetSummary({ sets }: { sets?: TrainingSet[] }) {
  const { t } = useI18n();
  if (!sets?.length) return null;

  return (
    <ol className="space-y-1 rounded-md bg-slate-50 p-3 text-sm" aria-label={t('logs.setSummaryLabel')}>
      {sets.map((set, index) => (
        <li key={index} className="break-words">
          {t('logs.setSummary', {
            number: index + 1,
            weight: set.weightKg === undefined ? t('logs.noWeight') : t('logs.weightValue', { value: set.weightKg }),
            reps: set.reps ?? 0,
            status: t(set.completed ? 'logs.completedSet' : 'logs.partialSet'),
          })}
        </li>
      ))}
    </ol>
  );
}
