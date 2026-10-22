import { equipmentChoiceIds } from '../data/manualWorkoutOptions';
import { getExerciseById } from './exerciseModel';

export interface LibraryRecordingSelection { exerciseId: string; equipmentId?: string; grip?: string }

/** URL selections are recording metadata, never exercise substitutions or safety evidence. */
export function readLibraryRecordingSelection(search: string): LibraryRecordingSelection | null {
  const params = new URLSearchParams(search);
  const exercise = getExerciseById(params.get('exercise') ?? undefined);
  if (!exercise) return null;
  const equipment = params.get('equipment');
  const grip = params.get('grip');
  if ((equipment !== null && !equipmentChoiceIds.some(id => id === equipment)) || (grip !== null && grip.length > 100)) return null;
  return { exerciseId: exercise.id, ...(equipment ? { equipmentId: equipment } : {}), ...(grip ? { grip } : {}) };
}

export function libraryRecordingUrl(selection: LibraryRecordingSelection): string {
  const params = new URLSearchParams({ exercise: selection.exerciseId });
  if (selection.equipmentId) params.set('equipment', selection.equipmentId);
  if (selection.grip) params.set('grip', selection.grip);
  return `/logs/new?${params.toString()}`;
}
