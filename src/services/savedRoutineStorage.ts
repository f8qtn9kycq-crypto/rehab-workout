import { exercises } from '../data/exercises';
import { safeSetItem } from './localStorageService';
export const ROUTINE_KEY = 'rehab.savedRoutines.v1';
export interface SavedRoutine { id: string; name: string; exerciseIds: string[]; }
const canonicalIds = new Set(exercises.map(exercise => exercise.id));
const normalizedName = (name: string) => name.trim().normalize('NFKC').toLocaleLowerCase();
function validRoutine(value: unknown): value is SavedRoutine {
  if (!value || typeof value !== 'object') return false;
  const routine = value as SavedRoutine;
  return typeof routine.id === 'string' && /^routine-[a-zA-Z0-9_-]{1,90}$/.test(routine.id)
    && typeof routine.name === 'string' && routine.name.trim().length > 0 && routine.name.length <= 100
    && Array.isArray(routine.exerciseIds) && routine.exerciseIds.length > 0 && routine.exerciseIds.length <= 20
    && routine.exerciseIds.every(id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(id) && !id.startsWith('custom-'))
    && new Set(routine.exerciseIds).size === routine.exerciseIds.length;
}
export function readSavedRoutines(): { routines: SavedRoutine[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(ROUTINE_KEY);
    if (raw === null) return { routines: [], error: false };
    const routines: unknown = JSON.parse(raw);
    if (!Array.isArray(routines) || routines.length > 50 || !routines.every(validRoutine)
      || new Set(routines.map(routine => routine.id)).size !== routines.length
      || new Set(routines.map(routine => normalizedName(routine.name))).size !== routines.length) return { routines: [], error: true };
    return { routines, error: false };
  } catch { return { routines: [], error: true }; }
}
export function saveRoutine(routine: SavedRoutine): boolean {
  const state = readSavedRoutines();
  if (state.error || !validRoutine(routine) || !routine.exerciseIds.every(id => canonicalIds.has(id))) return false;
  if (state.routines.some(item => item.id !== routine.id && normalizedName(item.name) === normalizedName(routine.name))) return false;
  const others = state.routines.filter(item => item.id !== routine.id);
  return others.length < 50 && safeSetItem(ROUTINE_KEY, JSON.stringify([...others, { ...routine, name: routine.name.trim() }]));
}
export function routineId(): string {
  return `routine-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}
