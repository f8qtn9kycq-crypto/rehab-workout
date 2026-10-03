import type { QuickMovementId } from '../components/ReferenceMovementArt';

export const quickExerciseIds: QuickMovementId[] = ['benchPress', 'shoulderPress', 'squat', 'pullUp', 'dip', 'latPulldown', 'seatedRow', 'legExtension'];
export const quickExerciseCatalogIds: ReadonlySet<string> = new Set(['catalog-bench-press', 'catalog-shoulder-press', 'catalog-squat', 'catalog-pull-up', 'catalog-dip', 'catalog-lat-pulldown', 'catalog-seated-row']);
export const equipmentChoiceIds = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'smith_machine', 'resistance_band', 'chair', 'wall', 'kettlebell', 'foam_roller'] as const;
