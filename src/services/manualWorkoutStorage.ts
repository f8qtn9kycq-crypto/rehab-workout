import { localDate } from './activityStorage';
import { safeSetItem } from './localStorageService';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

export const MANUAL_WORKOUT_KEY = 'rehab.manualWorkouts.v1';
export interface ManualSet { weightKg?: number; reps?: number; durationSeconds?: number; holdSeconds?: number; warmup?: boolean }
export interface ManualExercise { name: string; equipment: string; sets: ManualSet[]; exerciseId?: string; equipmentId?: string; bodyArea?: BodyArea; kind?: 'strength' | 'mobility'; painBefore?: number; painAfter?: number; effort?: number }
export interface ManualWorkout { id: string; date: string; createdAt: string; exercises: ManualExercise[]; cyclingMinutes?: number }

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}

export function validManualWorkout(value: unknown): value is ManualWorkout {
  if (!value || typeof value !== 'object') return false;
  const workout = value as ManualWorkout;
  return typeof workout.id === 'string' && workout.id.length > 0 && validDate(workout.date)
    && typeof workout.createdAt === 'string' && Number.isFinite(Date.parse(workout.createdAt))
    && (workout.cyclingMinutes === undefined || (Number.isInteger(workout.cyclingMinutes) && workout.cyclingMinutes >= 1 && workout.cyclingMinutes <= 1440))
    && Array.isArray(workout.exercises) && workout.exercises.length >= 1 && workout.exercises.length <= 12
    && workout.exercises.every(exercise => typeof exercise.name === 'string' && exercise.name.trim().length > 0 && exercise.name.length <= 100
      && typeof exercise.equipment === 'string' && exercise.equipment.length <= 100
      && (exercise.exerciseId === undefined || (typeof exercise.exerciseId === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(exercise.exerciseId)))
      && (exercise.equipmentId === undefined || (typeof exercise.equipmentId === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(exercise.equipmentId)))
      && (exercise.bodyArea === undefined || BODY_AREAS.includes(exercise.bodyArea))
      && (exercise.kind === undefined || exercise.kind === 'strength' || exercise.kind === 'mobility')
      && (exercise.painBefore === undefined) === (exercise.painAfter === undefined)
      && [exercise.painBefore, exercise.painAfter, exercise.effort].every(value => value === undefined || (Number.isInteger(value) && value >= 0 && value <= 10))
      && Array.isArray(exercise.sets) && exercise.sets.length >= 1 && exercise.sets.length <= 20
      && exercise.sets.every(set => (set.reps !== undefined || set.durationSeconds !== undefined || set.holdSeconds !== undefined)
        && (set.reps === undefined || (Number.isInteger(set.reps) && set.reps >= 1 && set.reps <= 1000))
        && [set.durationSeconds, set.holdSeconds].every(seconds => seconds === undefined || (Number.isInteger(seconds) && seconds >= 1 && seconds <= 86400))
        && (set.warmup === undefined || typeof set.warmup === 'boolean')
        && (set.weightKg === undefined || (Number.isFinite(set.weightKg) && set.weightKg >= 0 && set.weightKg <= 1000))));
}

export function readManualWorkouts(): { workouts: ManualWorkout[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(MANUAL_WORKOUT_KEY);
    if (raw === null) return { workouts: [], error: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(validManualWorkout)) return { workouts: [], error: true };
    const ids = parsed.map(workout => workout.id);
    if (new Set(ids).size !== ids.length) return { workouts: [], error: true };
    return { workouts: parsed, error: false };
  } catch { return { workouts: [], error: true }; }
}

export type ManualWorkoutSaveResult = 'ok' | 'corrupt' | 'invalid' | 'write-failed';

export function saveManualWorkout(workout: ManualWorkout): ManualWorkoutSaveResult {
  const current = readManualWorkouts();
  if (current.error) return 'corrupt';
  if (!validManualWorkout(workout) || workout.date > localDate() || current.workouts.some(item => item.id === workout.id)) return 'invalid';
  return safeSetItem(MANUAL_WORKOUT_KEY, JSON.stringify([workout, ...current.workouts])) ? 'ok' : 'write-failed';
}

export function manualWorkoutId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
