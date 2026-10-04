export const quickExerciseIds = [
  'catalog-bench-press',
  'catalog-shoulder-press',
  'catalog-squat',
  'catalog-pull-up',
  'catalog-dip',
  'catalog-lat-pulldown',
  'catalog-seated-row',
  'catalog-leg-extension',
] as const;

export const quickExerciseGroups = [
  { id: 'push', exerciseIds: ['catalog-bench-press', 'catalog-shoulder-press', 'catalog-dip'] },
  { id: 'pull', exerciseIds: ['catalog-pull-up', 'catalog-lat-pulldown', 'catalog-seated-row'] },
  { id: 'leg', exerciseIds: ['catalog-squat', 'catalog-leg-extension'] },
] as const;

export const quickExerciseCatalogIds: ReadonlySet<string> = new Set(quickExerciseIds);
export const equipmentChoiceIds = ['bodyweight', 'dumbbell', 'barbell', 'machine', 'cable', 'smith_machine', 'resistance_band', 'chair', 'wall', 'kettlebell', 'foam_roller'] as const;
