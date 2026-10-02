import { exercises as catalog } from '../data/exercises';
import { equipmentChoiceIds, quickExerciseIds } from '../data/manualWorkoutOptions';
import { useI18n } from '../services/i18n';
import type { ManualWorkout } from '../services/manualWorkoutStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';

export default function ManualWorkoutCard({ workout }: { workout: ManualWorkout }) {
  const { t, language } = useI18n();
  return <article className="card space-y-2 p-4">
    <p className="text-lg font-black text-ink">{t('manualWorkout.recordTitle', { date: workout.date })}</p>
    {workout.exercises.map((exercise, index) => {
      const quickId = quickExerciseIds.find(id => id === exercise.exerciseId);
      const catalogExercise = catalog.find(item => item.id === exercise.exerciseId);
      const name = quickId ? t(`manualWorkout.quickExercises.${quickId}`) : catalogExercise ? getLocalizedExercise(catalogExercise, language).title : exercise.name;
      const equipmentId = equipmentChoiceIds.find(id => id === exercise.equipmentId);
      const equipment = equipmentId ? t(`manualWorkout.equipmentChoices.${equipmentId}`) : exercise.equipment;
      return <div key={index} className="border-t border-slate-100 pt-2">
        <p className="font-bold text-ink">{name}{equipment ? ` · ${equipment}` : ''}</p>
        {(exercise.kind || exercise.bodyArea) && <p className="text-sm text-slate-600">{[exercise.kind ? t(`manualWorkout.${exercise.kind}`) : null, exercise.bodyArea ? t(`bodyAreas.${exercise.bodyArea}.label`) : null].filter(Boolean).join(' · ')}</p>}
        <p className="text-sm text-slate-600">{exercise.sets.map((set, setIndex) => `${set.warmup ? `${t('manualWorkout.warmup')} · ` : ''}${t('manualWorkout.setSummary', { number: setIndex + 1, weight: set.weightKg === undefined ? t('manualWorkout.noWeight') : t('manualWorkout.weightValue', { value: set.weightKg }), reps: set.reps })}`).join(' · ')}</p>
        {exercise.painBefore !== undefined && exercise.painAfter !== undefined && <p className="text-sm text-slate-600">{t('manualWorkout.painSummary', { before: exercise.painBefore, after: exercise.painAfter })}</p>}
        {exercise.effort !== undefined && <p className="text-sm text-slate-600">{t('manualWorkout.effortSummary', { effort: exercise.effort })}</p>}
      </div>;
    })}
    {workout.cyclingMinutes !== undefined && <p className="border-t border-slate-100 pt-2 font-semibold text-calm-800">{t('manualWorkout.cyclingSummary', { minutes: workout.cyclingMinutes })}</p>}
    <p className="text-xs text-slate-600">{t('manualWorkout.recommendationNote')}</p>
  </article>;
}
