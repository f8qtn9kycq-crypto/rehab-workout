import { exercises } from '../data/exercises';
import { BODY_AREAS, type BodyArea, type TrainingLogEntry } from '../types/rehab';
import type { ManualExercise } from '../services/manualWorkoutStorage';
import type { RecordsActivityItem, RecordsPresentation } from './recordsPresentation';

const canonicalAreas = new Map(exercises.map(exercise => [exercise.id, exercise.bodyArea]));

/** Historical snapshots take precedence; only missing snapshots use canonical IDs. */
export function recordedBodyArea(record: { bodyArea?: unknown; exerciseId?: string }): BodyArea | undefined {
  if (record.bodyArea !== undefined && record.bodyArea !== null) {
    return BODY_AREAS.includes(record.bodyArea as BodyArea) ? record.bodyArea as BodyArea : undefined;
  }
  return record.exerciseId ? canonicalAreas.get(record.exerciseId) : undefined;
}

export function matchingManualExercises(item: RecordsActivityItem, area: BodyArea): ManualExercise[] {
  return item.source === 'manual' ? item.workout.exercises.filter(exercise => recordedBodyArea(exercise) === area) : [];
}

export function recordMatchesBodyArea(item: RecordsActivityItem, area: BodyArea, logs: TrainingLogEntry[]): boolean {
  if (item.source === 'training') return recordedBodyArea(item.log) === area;
  if (item.source === 'manual') return matchingManualExercises(item, area).length > 0;
  return item.activity.kind === 'resistance' && item.activity.exerciseLogIds.some(id => {
    const log = logs.find(candidate => candidate.id === id);
    return log !== undefined && recordedBodyArea(log) === area;
  });
}

/** Display projection only: filter every date before the page applies its day limit. */
export function filterRecordsDays(days: RecordsPresentation['days'], area: BodyArea | 'all', logs: TrainingLogEntry[]): RecordsPresentation['days'] {
  if (area === 'all') return days;
  return days.map(day => ({ ...day, items: day.items.filter(item => recordMatchesBodyArea(item, area, logs)) }))
    .filter(day => day.items.length > 0);
}
