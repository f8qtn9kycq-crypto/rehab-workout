import type { TrainingSet } from '../types/rehab';

export const MAX_TRAINING_SETS = 20;

export function appendCopiedTrainingSet(sets: TrainingSet[], plannedReps: number): TrainingSet[] {
  if (sets.length >= MAX_TRAINING_SETS) return sets;
  const previous = sets[sets.length - 1];
  return [...sets, previous
    ? { ...(previous.weightKg === undefined ? {} : { weightKg: previous.weightKg }), ...(previous.reps === undefined && plannedReps === 0 ? {} : { reps: previous.reps ?? plannedReps }), completed: false }
    : { ...(plannedReps === 0 ? {} : { reps: plannedReps }), completed: false }];
}
