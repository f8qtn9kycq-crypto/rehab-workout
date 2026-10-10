import { safeSetItem } from './localStorageService';
import { exercises } from '../data/exercises';
export const FAVORITES_KEY = 'rehab.favoriteExercises.v1';
const canonicalIds = new Set(exercises.map(exercise => exercise.id));
export function readFavorites(): { ids: string[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    if (raw === null) return { ids: [], error: false };
    const ids: unknown = JSON.parse(raw);
    if (!Array.isArray(ids) || ids.length > 500 || ids.some(id => typeof id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(id)) || new Set(ids).size !== ids.length) return { ids: [], error: true };
    return { ids, error: false };
  } catch { return { ids: [], error: true }; }
}
export function toggleFavorite(id: string): boolean {
  const state = readFavorites();
  if (state.error || !canonicalIds.has(id)) return false;
  const ids = state.ids.includes(id) ? state.ids.filter(value => value !== id) : [...state.ids, id];
  if (ids.length > 500 || !safeSetItem(FAVORITES_KEY, JSON.stringify(ids))) return false;
  window.dispatchEvent(new Event('rehab:favorites'));
  return true;
}
