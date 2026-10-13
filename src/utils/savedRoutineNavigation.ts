import { readSavedRoutines } from '../services/savedRoutineStorage';

// Context is a navigation hint, never completion state or safety authorization.
export function getSavedRoutineContext(search: string, exerciseId: string) {
  const id = new URLSearchParams(search).get('routine');
  if (!id) return null;
  const state = readSavedRoutines();
  if (state.error) return null;
  const routine = state.routines.find(item => item.id === id && item.exerciseIds.includes(exerciseId));
  return routine ?? null;
}
