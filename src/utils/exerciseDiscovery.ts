import { exercisePurposes, type ExercisePurposeFilter } from '../data/exercisePurposes';
import type { Exercise } from '../types/rehab';
import { getLocalizedExercise } from './localizedExercise';
import { matchesManualExercise } from './manualWorkoutSearch';

export function parseExercisePurpose(value: string | null): ExercisePurposeFilter {
  return value === 'rehab' || value === 'strength' ? value : 'all';
}

export function getExercisePurposeInfo(exerciseId: string) {
  return Object.prototype.hasOwnProperty.call(exercisePurposes, exerciseId) ? exercisePurposes[exerciseId] : undefined;
}

export function matchesExercisePurpose(exerciseId: string, purpose: ExercisePurposeFilter): boolean {
  if (purpose === 'all') return true;
  const info = getExercisePurposeInfo(exerciseId);
  return info?.primaryPurpose === purpose || Boolean(info?.secondaryPurposes?.includes(purpose));
}

/** 僅縮小呼叫端已選定的清單；不讀取或修改推薦、安全與儲存狀態。 */
export function matchesExerciseDiscovery(exercise: Exercise, purpose: ExercisePurposeFilter, query: string): boolean {
  return matchesExercisePurpose(exercise.id, purpose)
    && matchesManualExercise(query, [exercise.title, getLocalizedExercise(exercise, 'en').title]);
}
