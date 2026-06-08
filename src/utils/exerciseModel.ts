import { SUPPORT_ONLY_EQUIPMENT_IDS } from '../data/equipmentOptions';
import { exercises } from '../data/exercises';
import {
  BODY_AREAS,
  DURATION_FILTERS,
  EQUIPMENT_IDS,
  EXERCISE_FILTER_MODES,
  EXERCISE_LEVELS,
  EXERCISE_TYPES,
  type BodyArea,
  type DurationFilter,
  type Equipment,
  type Exercise,
  type ExerciseFilterMode,
  type ExerciseFilters,
  type ExerciseLevel,
  type ExerciseType,
} from '../types/rehab';

const DEFAULT_AVAILABLE_EQUIPMENT: Equipment[] = [EQUIPMENT_IDS.BODYWEIGHT];
const SUPPORT_ONLY_EQUIPMENT: readonly Equipment[] = SUPPORT_ONLY_EQUIPMENT_IDS;

export function isBodyArea(value: string | null): value is BodyArea {
  return BODY_AREAS.includes(value as BodyArea);
}

export function isEquipment(value: string, validEquipment: readonly Equipment[]): value is Equipment {
  return validEquipment.includes(value as Equipment);
}

export function isExerciseType(value: string | null): value is ExerciseType {
  return EXERCISE_TYPES.includes(value as ExerciseType);
}

export function isExerciseLevel(value: string | null): value is ExerciseLevel {
  return EXERCISE_LEVELS.includes(value as ExerciseLevel);
}

export function isExerciseFilterMode(value: string | null): value is ExerciseFilterMode {
  return EXERCISE_FILTER_MODES.includes(value as ExerciseFilterMode);
}

export function isDurationFilter(value: string | null): value is DurationFilter {
  return DURATION_FILTERS.includes(value as DurationFilter);
}

export function getExerciseById(exerciseId: string | undefined): Exercise | undefined {
  return exercises.find((exercise) => exercise.id === exerciseId);
}

export function isSupportOnlyExercise(exercise: Exercise): boolean {
  if (exercise.equipment.length === 0) return true;
  if (exercise.equipment.includes(EQUIPMENT_IDS.BODYWEIGHT)) return true;
  return exercise.equipment.every((item) => SUPPORT_ONLY_EQUIPMENT.includes(item));
}

export function isCompatibleWithEquipment(exercise: Exercise, availableEquipment: readonly Equipment[]): boolean {
  if (exercise.equipment.length === 0) return true;

  return exercise.equipment.every((item) => {
    if (item === EQUIPMENT_IDS.BODYWEIGHT) return true;
    if (availableEquipment.includes(item)) return true;
    return availableEquipment.includes(EQUIPMENT_IDS.BODYWEIGHT) && SUPPORT_ONLY_EQUIPMENT.includes(item);
  });
}

export function getDurationMinutes(exercise: Exercise): number {
  const match = exercise.durationText.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

export function matchesDuration(exercise: Exercise, duration: DurationFilter): boolean {
  if (duration === 'all') return true;
  const minutes = getDurationMinutes(exercise);
  return duration === 'short' ? minutes <= 5 : minutes <= 10;
}

export function getAvailableEquipment(filters: ExerciseFilters, assessmentEquipment: readonly Equipment[]): Equipment[] {
  if (filters.noEquipmentOnly) return DEFAULT_AVAILABLE_EQUIPMENT;
  if (filters.equipment.length > 0) return filters.equipment;
  if (assessmentEquipment.length > 0) return [...assessmentEquipment];
  return DEFAULT_AVAILABLE_EQUIPMENT;
}

export function filterExercises(
  exerciseList: readonly Exercise[],
  filters: ExerciseFilters,
  context: { hasAssessment: boolean; assessmentEquipment: readonly Equipment[] },
): Exercise[] {
  if (filters.mode === 'recommended' && !context.hasAssessment && filters.bodyArea === 'all') {
    return [];
  }

  const availableEquipment = getAvailableEquipment(filters, context.assessmentEquipment);

  return exerciseList.filter((exercise) => {
    const levelFilter = filters.mode === 'recommended' && filters.level === 'all' ? 'beginner' : filters.level;

    return (
      (filters.bodyArea === 'all' || exercise.bodyArea === filters.bodyArea) &&
      (filters.type === 'all' || exercise.type === filters.type) &&
      (levelFilter === 'all' || exercise.level === levelFilter) &&
      matchesDuration(exercise, filters.duration) &&
      (!filters.painSensitive || (exercise.level === 'beginner' && isSupportOnlyExercise(exercise))) &&
      (!filters.noEquipmentOnly || isSupportOnlyExercise(exercise)) &&
      (filters.mode === 'recommended'
        ? isCompatibleWithEquipment(exercise, availableEquipment)
        : filters.equipment.length === 0 || filters.equipment.some((equipment) => exercise.equipment.includes(equipment)))
    );
  });
}
