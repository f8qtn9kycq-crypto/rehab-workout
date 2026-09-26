import { localDate } from './activityStorage';
import { safeSetItem } from './localStorageService';

export const MANUAL_WORKOUT_KEY = 'rehab.manualWorkouts.v1';
export interface ManualSet { weightKg?: number; reps: number }
export interface ManualExercise { name: string; equipment: string; sets: ManualSet[] }
export interface ManualWorkout { id: string; date: string; createdAt: string; exercises: ManualExercise[]; cyclingMinutes?: number }

function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > localDate()) return false;
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
      && Array.isArray(exercise.sets) && exercise.sets.length >= 1 && exercise.sets.length <= 20
      && exercise.sets.every(set => Number.isInteger(set.reps) && set.reps >= 1 && set.reps <= 1000
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

export function saveManualWorkout(workout: ManualWorkout): boolean {
  const current = readManualWorkouts();
  if (current.error || !validManualWorkout(workout) || current.workouts.some(item => item.id === workout.id)) return false;
  return safeSetItem(MANUAL_WORKOUT_KEY, JSON.stringify([workout, ...current.workouts]));
}

export function manualWorkoutId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
