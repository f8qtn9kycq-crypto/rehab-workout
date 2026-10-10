import { quickExerciseGroups } from '../data/manualWorkoutOptions';
import { localDate } from '../services/activityStorage';
import type { RecordsPresentation } from './recordsPresentation';
export const PLAN_NAMES = ['lower', 'push', 'pull', 'cycling', 'cycling', 'cycling', 'cycling'];
export function buildTodayPlan(days: number[], records: RecordsPresentation, today = new Date()) {
  const items = records.days.find(day => day.date === localDate(today))?.items ?? [];
  const focuses = new Set<string>();
  for (const item of items) {
    if (item.source === 'activity' && item.activity.kind === 'resistance') focuses.add(item.activity.primaryFocus);
    if (item.source === 'manual') for (const exercise of item.workout.exercises) {
      const group = quickExerciseGroups.find(group => group.exerciseIds.some(id => id === exercise.exerciseId));
      if (group) focuses.add(group.id === 'leg' ? 'lower' : group.id);
      else if (exercise.kind === 'strength') focuses.add('mixed');
    }
  }
  return {
    planned: days.flatMap((day, index) => day === today.getDay() ? [PLAN_NAMES[index]] : []),
    focuses: [...focuses],
    sources: (['training', 'manual', 'activity'] as const).map(source => ({ source, count: items.filter(item => item.source === source).length })),
  };
}
