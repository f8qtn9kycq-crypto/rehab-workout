import { safeSetItem } from './localStorageService';
export const GOAL_KEY = 'rehab.trainingGoals.v1';
export const GOAL_CATEGORIES = ['rehab', 'strength', 'cardio'] as const;
export type GoalCategory = typeof GOAL_CATEGORIES[number];
export type TrainingGoals = Record<GoalCategory, number | null>;
export function emptyGoals(): TrainingGoals { return { rehab: null, strength: null, cardio: null }; }
export function validGoals(value: unknown): value is TrainingGoals {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return GOAL_CATEGORIES.every(key => { const n = (value as TrainingGoals)[key]; return n === null || (Number.isInteger(n) && Number(n) >= 0 && Number(n) <= 7); });
}
export function readTrainingGoals(): { goals: TrainingGoals; error: boolean } {
  try {
    const raw = window.localStorage.getItem(GOAL_KEY);
    if (raw === null) return { goals: emptyGoals(), error: false };
    const goals: unknown = JSON.parse(raw);
    return validGoals(goals) ? { goals, error: false } : { goals: emptyGoals(), error: true };
  } catch { return { goals: emptyGoals(), error: true }; }
}
export function saveTrainingGoals(goals: TrainingGoals): boolean {
  return !readTrainingGoals().error && validGoals(goals) && safeSetItem(GOAL_KEY, JSON.stringify(goals));
}
