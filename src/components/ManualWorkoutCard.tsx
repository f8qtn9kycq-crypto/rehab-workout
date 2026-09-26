import { useI18n } from '../services/i18n';
import type { ManualWorkout } from '../services/manualWorkoutStorage';

export default function ManualWorkoutCard({ workout }: { workout: ManualWorkout }) {
  const { t } = useI18n();
  return <article className="card space-y-2 p-4">
    <p className="text-lg font-black text-ink">{t('manualWorkout.recordTitle', { date: workout.date })}</p>
    {workout.exercises.map((exercise, index) => <div key={index} className="border-t border-slate-100 pt-2">
      <p className="font-bold text-ink">{exercise.name}{exercise.equipment ? ` · ${exercise.equipment}` : ''}</p>
      <p className="text-sm text-slate-600">{exercise.sets.map((set, setIndex) => t('manualWorkout.setSummary', { number: setIndex + 1, weight: set.weightKg === undefined ? t('manualWorkout.noWeight') : t('manualWorkout.weightValue', { value: set.weightKg }), reps: set.reps })).join(' · ')}</p>
    </div>)}
    {workout.cyclingMinutes !== undefined && <p className="border-t border-slate-100 pt-2 font-semibold text-calm-800">{t('manualWorkout.cyclingSummary', { minutes: workout.cyclingMinutes })}</p>}
    <p className="text-xs text-slate-600">{t('manualWorkout.noPainData')}</p>
  </article>;
}
