import { exercises as catalog } from '../data/exercises';
import { equipmentChoiceIds } from '../data/manualWorkoutOptions';
import { useI18n } from '../services/i18n';
import type { ManualExercise, ManualWorkout } from '../services/manualWorkoutStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';
import WorkoutMovementArt, { hasWorkoutMovementArt } from './WorkoutMovementArt';

// These catalog IDs have explicitly revised equipment or posture. Saved records
// have no content version; preserve the stored title and suppress reinterpreted art.
export function isLegacyShoulderPressRecord(exercise: ManualExercise): boolean {
  return isLegacyRevisedCatalogRecord(exercise);
}

export function isLegacyRevisedCatalogRecord(exercise: ManualExercise): boolean {
  const revisedEquipment: Record<string, string> = {
    'catalog-shoulder-press': 'barbell',
    'catalog-squat': 'barbell',
    'catalog-lat-pulldown': 'machine',
    'catalog-seated-row': 'machine',
    'catalog-leg-extension': 'machine',
  };
  const expected = revisedEquipment[exercise.exerciseId ?? ''];
  if (!expected) return false;
  if (exercise.equipmentId && exercise.equipmentId !== expected) return true;
  const current = catalog.find(item => item.id === exercise.exerciseId);
  return !current || ![current.title, getLocalizedExercise(current, 'en').title].includes(exercise.name.trim());
}

export default function ManualWorkoutCard({ workout }: { workout: ManualWorkout }) {
  const { t, language } = useI18n();
  return <article className="card space-y-2 p-4">
    <p className="text-lg font-black text-ink">{t('manualWorkout.recordTitle', { date: workout.date })}</p>
    {workout.exercises.map((exercise, index) => {
      const catalogExercise = catalog.find(item => item.id === exercise.exerciseId);
      const legacyRevisedCatalog = isLegacyRevisedCatalogRecord(exercise);
      const name = !legacyRevisedCatalog && catalogExercise ? getLocalizedExercise(catalogExercise, language).title : exercise.name;
      const equipmentId = equipmentChoiceIds.find(id => id === exercise.equipmentId);
      const equipment = equipmentId ? t(`manualWorkout.equipmentChoices.${equipmentId}`) : exercise.equipment;
      return <div key={index} className="border-t border-slate-100 pt-2">
        {!legacyRevisedCatalog && hasWorkoutMovementArt(exercise.exerciseId) && <div className="mb-2 w-full max-w-sm"><WorkoutMovementArt id={exercise.exerciseId} /></div>}
        {(exercise.recordOnly || exercise.exerciseId?.startsWith('custom-')) && <p className="text-sm text-slate-600">{t('manualWorkout.recordOnly')}</p>}
        <p className="font-bold text-ink">{name}{equipment ? ` · ${equipment}` : ''}</p>
        {(exercise.kind || exercise.bodyArea) && <p className="text-sm text-slate-600">{[exercise.kind ? t(`manualWorkout.${exercise.kind}`) : null, exercise.bodyArea ? t(`bodyAreas.${exercise.bodyArea}.label`) : null].filter(Boolean).join(' · ')}</p>}
        <p className="text-sm text-slate-600">{exercise.sets.map((set, setIndex) => {
          const prefix = set.warmup ? `${t('manualWorkout.warmup')} · ` : '';
          if (set.durationSeconds !== undefined || set.holdSeconds !== undefined) {
            const dose = [set.reps !== undefined ? t('manualWorkout.repsValue', { value: set.reps }) : null,
              set.durationSeconds !== undefined ? t('manualWorkout.durationValue', { value: set.durationSeconds }) : null,
              set.holdSeconds !== undefined ? t('manualWorkout.holdValue', { value: set.holdSeconds }) : null].filter(Boolean).join(' · ');
            return `${prefix}${t('manualWorkout.setNumber', { number: setIndex + 1 })} · ${dose}${set.weightKg !== undefined ? ` · ${t('manualWorkout.weightValue', { value: set.weightKg })}` : ''}`;
          }
          return `${prefix}${t('manualWorkout.setSummary', { number: setIndex + 1, weight: set.weightKg === undefined ? t('manualWorkout.noWeight') : t('manualWorkout.weightValue', { value: set.weightKg }), reps: set.reps ?? t('manualWorkout.unknown') })}`;
        }).join(' · ')}</p>
        {exercise.painBefore !== undefined && exercise.painAfter !== undefined && <p className="text-sm text-slate-600">{t('manualWorkout.painSummary', { before: exercise.painBefore, after: exercise.painAfter })}</p>}
        {exercise.effort !== undefined && <p className="text-sm text-slate-600">{t('manualWorkout.effortSummary', { effort: exercise.effort })}</p>}
      </div>;
    })}
    {workout.cyclingMinutes !== undefined && <p className="border-t border-slate-100 pt-2 font-semibold text-calm-800">{t('manualWorkout.cyclingSummary', { minutes: workout.cyclingMinutes })}</p>}
    <p className="text-xs text-slate-600">{t('manualWorkout.recommendationNote')}</p>
  </article>;
}
