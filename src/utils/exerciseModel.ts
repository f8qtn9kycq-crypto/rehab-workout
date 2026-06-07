import { BODY_AREAS, EXERCISE_LEVELS, EXERCISE_TYPES, type BodyArea, type Equipment, type ExerciseLevel, type ExerciseType } from '../types/rehab';

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
