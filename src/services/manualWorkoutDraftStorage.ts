import { localDate } from './activityStorage';
import { safeSetItem } from './localStorageService';
import { manualWorkoutId, readManualWorkouts, validManualWorkout, type ManualExercise, type ManualSet, type ManualWorkout, type ManualWorkoutSaveResult, MANUAL_WORKOUT_KEY } from './manualWorkoutStorage';

export const MANUAL_DRAFT_KEY = 'rehab.manualWorkoutDrafts.v1';
export type DoseMode = 'reps' | 'durationSeconds' | 'holdSeconds';
export interface DraftSet extends ManualSet { id: string; completed: boolean }
export interface DraftExercise extends Omit<ManualExercise, 'sets'> {
  id: string; sets: DraftSet[]; doseMode: DoseMode; previousNotes?: string; legacy: boolean;
}
export interface ManualWorkoutDraft {
  id: string; date: string; createdAt: string; exercises: DraftExercise[];
  cyclingMinutes?: number; cyclingConfirmed: boolean; revision: number;
}
export function draftExercise(exercise: ManualExercise = { name: '', equipment: '', sets: [{}] }, legacy = false, previousNotes?: string): DraftExercise {
  return { ...exercise, id: manualWorkoutId(), legacy, previousNotes,
    doseMode: exercise.sets[0]?.durationSeconds !== undefined ? 'durationSeconds' : exercise.sets[0]?.holdSeconds !== undefined ? 'holdSeconds' : 'reps',
    sets: exercise.sets.map(set => ({ ...set, id: manualWorkoutId(), completed: false })),
  };
}
const doseFields = ['reps', 'durationSeconds', 'holdSeconds'] as const;
export function validDraft(value: unknown): value is ManualWorkoutDraft {
  try {
    const d = value as ManualWorkoutDraft;
    const ids = [d.id, ...d.exercises.flatMap(e => [e.id, ...e.sets.map(s => s.id)])];
    if (!ids.every(id => typeof id === 'string' && id.length > 0) || new Set(ids).size !== ids.length || typeof d.cyclingConfirmed !== 'boolean' || !Number.isInteger(d.revision) || d.revision < 0) return false;
    // Incomplete doses and unselected movements are valid drafts; validate their filled values through the existing validator.
    return d.exercises.length >= 1 && d.exercises.length <= 12 && d.exercises.every(e =>
      typeof e.legacy === 'boolean' && doseFields.includes(e.doseMode) && (e.previousNotes === undefined || (typeof e.previousNotes === 'string' && e.previousNotes.length <= 2000))
      && e.sets.every(s => typeof s.completed === 'boolean' && (!s.completed || validCompletedExercise({ ...e, sets: [s] }))))
      && validManualWorkout({ ...d, exercises: d.exercises.map(e => ({ ...e, painBefore: e.painBefore ?? e.painAfter, painAfter: e.painAfter ?? e.painBefore, name: e.name || 'draft', sets: e.sets.map(s => doseFields.some(field => s[field] !== undefined) ? s : { ...s, reps: 1 }) })) });
  } catch { return false; }
}
function validCompletedExercise(exercise: ManualExercise): boolean {
  return !!exercise.name.trim() && validManualWorkout({ id: 'validation', date: localDate(), createdAt: new Date().toISOString(), exercises: [{ ...exercise, painBefore: undefined, painAfter: undefined }] })
    && (!exercise.exerciseId?.startsWith('custom-') || exercise.recordOnly === true);
}
export function readManualDrafts(): { drafts: ManualWorkoutDraft[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(MANUAL_DRAFT_KEY);
    if (raw === null) return { drafts: [], error: false };
    const values: unknown = JSON.parse(raw);
    if (!Array.isArray(values) || !values.every(validDraft) || new Set(values.map(d => d.id)).size !== values.length) return { drafts: [], error: true };
    return { drafts: values, error: false };
  } catch { return { drafts: [], error: true }; }
}
export function projectManualDraft(draft: ManualWorkoutDraft): ManualWorkout | null {
  const exercises = draft.exercises.flatMap(({ id, legacy, previousNotes, doseMode, sets, painBefore, painAfter, ...exercise }) => {
    const completed = sets.filter(set => set.completed).map(({ id, completed, ...set }) => set);
    return completed.length ? [{ ...exercise, sets: completed, ...(painBefore !== undefined && painAfter !== undefined ? { painBefore, painAfter } : {}) }] : [];
  });
  if (!exercises.length) return null;
  return { id: draft.id, date: draft.date, createdAt: draft.createdAt, exercises,
    ...(draft.cyclingConfirmed && draft.cyclingMinutes !== undefined ? { cyclingMinutes: draft.cyclingMinutes } : {}),
  };
}
/** Draft first, history second. Retry is idempotent when the second write fails. */
function persistUnlocked(draft: ManualWorkoutDraft): ManualWorkoutSaveResult | 'conflict' {
  const state = readManualDrafts();
  const history = readManualWorkouts();
  if (state.error || history.error) return 'corrupt';
  if (!validDraft(draft) || draft.date > localDate()) return 'invalid';
  const saved = history.workouts.find(w => w.id === draft.id);
  const previous = state.drafts.find(d => d.id === draft.id);
  if ((previous && previous.revision !== draft.revision) || (saved && !previous)) return 'conflict';
  const next = { ...draft, revision: draft.revision + 1 };
  if (!safeSetItem(MANUAL_DRAFT_KEY, JSON.stringify([next, ...state.drafts.filter(d => d.id !== draft.id)]))) return 'write-failed';
  draft.revision = next.revision;
  const projected = projectManualDraft(draft);
  if (projected && !validManualWorkout(projected)) return 'invalid';
  const others = history.workouts.filter(w => w.id !== draft.id);
  // Removing the last completed set removes only this draft's projection.
  if (!safeSetItem(MANUAL_WORKOUT_KEY, JSON.stringify(projected ? [projected, ...others] : others))) return 'write-failed';
  return 'ok';
}

/** Serialize the complete two-key update across tabs. IndexedDB is the Safari fallback. */
export async function persistManualDraft(draft: ManualWorkoutDraft): Promise<ManualWorkoutSaveResult | 'conflict'> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('rehab.manualWorkout.write', () => persistUnlocked(draft));
  }
  return new Promise(resolve => {
    try {
      const open = indexedDB.open('rehab.manualWorkoutMutex.v1', 1);
      open.onupgradeneeded = () => open.result.createObjectStore('mutex');
      open.onerror = () => resolve('write-failed');
      open.onblocked = () => resolve('write-failed');
      open.onsuccess = () => {
        const db = open.result;
        const transaction = db.transaction('mutex', 'readwrite');
        let result: ManualWorkoutSaveResult | 'conflict' = 'write-failed';
        transaction.objectStore('mutex').get('write').onsuccess = () => { result = persistUnlocked(draft); };
        transaction.oncomplete = () => { db.close(); resolve(result); };
        transaction.onerror = transaction.onabort = () => { db.close(); resolve('write-failed'); };
      };
    } catch { resolve('write-failed'); }
  });
}
