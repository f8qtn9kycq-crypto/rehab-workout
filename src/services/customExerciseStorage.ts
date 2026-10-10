import { safeSetItem } from './localStorageService';
import { equipmentChoiceIds } from '../data/manualWorkoutOptions';

export const CUSTOM_EXERCISE_KEY = 'rehab.customExercises.v1';
export interface CustomExercise {
  id: string;
  name: string;
  kind: 'strength' | 'mobility';
  equipmentId?: string;
  recordOnly: true;
}
export type CustomExerciseResult = 'ok' | 'duplicate' | 'invalid' | 'corrupt' | 'write-failed';
export const normalizedExerciseName = (name: string): string => name.trim().normalize('NFKC').toLocaleLowerCase();

export function validCustomExercise(value: unknown): value is CustomExercise {
  if (!value || typeof value !== 'object') return false;
  const exercise = value as CustomExercise;
  return typeof exercise.id === 'string' && /^custom-[a-zA-Z0-9_-]{1,90}$/.test(exercise.id)
    && typeof exercise.name === 'string' && exercise.name.trim().length > 0 && exercise.name.length <= 100
    && ['strength', 'mobility'].includes(exercise.kind) && exercise.recordOnly === true
    && (exercise.equipmentId === undefined || equipmentChoiceIds.some(id => id === exercise.equipmentId));
}

export function readCustomExercises(): { exercises: CustomExercise[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(CUSTOM_EXERCISE_KEY);
    if (raw === null) return { exercises: [], error: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > 200 || !parsed.every(validCustomExercise)
      || new Set(parsed.map(item => item.id)).size !== parsed.length
      || new Set(parsed.map(item => normalizedExerciseName(item.name))).size !== parsed.length) return { exercises: [], error: true };
    return { exercises: parsed, error: false };
  } catch { return { exercises: [], error: true }; }
}

export function saveCustomExercise(exercise: CustomExercise): CustomExerciseResult {
  const current = readCustomExercises();
  if (current.error) return 'corrupt';
  if (!validCustomExercise(exercise) || current.exercises.length >= 200) return 'invalid';
  if (current.exercises.some(item => item.id === exercise.id || normalizedExerciseName(item.name) === normalizedExerciseName(exercise.name))) return 'duplicate';
  return safeSetItem(CUSTOM_EXERCISE_KEY, JSON.stringify([...current.exercises, { ...exercise, name: exercise.name.trim() }])) ? 'ok' : 'write-failed';
}

export function customExerciseId(): string {
  return `custom-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
