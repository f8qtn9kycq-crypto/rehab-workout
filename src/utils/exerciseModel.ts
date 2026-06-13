import { SUPPORT_ONLY_EQUIPMENT_IDS, sortEquipmentByPriority } from '../data/equipmentOptions';
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
  type RecommendationSafetyLevel,
  type SafetyTag,
} from '../types/rehab';

const DEFAULT_AVAILABLE_EQUIPMENT: Equipment[] = [EQUIPMENT_IDS.BODYWEIGHT];
const SUPPORT_ONLY_EQUIPMENT: readonly Equipment[] = SUPPORT_ONLY_EQUIPMENT_IDS;
const LOADED_EQUIPMENT: readonly Equipment[] = [EQUIPMENT_IDS.DUMBBELL, EQUIPMENT_IDS.KETTLEBELL];
const PAIN_HIGH_SAFETY_TAGS: readonly SafetyTag[] = [
  'high_impact',
  'deep_knee_flexion',
  'aggressive_overhead_loading',
  'unsupported_balance',
  'pain_sensitive',
];

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

function uniqueEquipment(values: readonly Equipment[]): Equipment[] {
  return [...new Set(values)];
}

function getExerciseText(exercise: Exercise): string {
  return [
    exercise.title,
    exercise.condition,
    exercise.description,
    exercise.detail,
    exercise.benefits,
    ...exercise.cautions,
    ...exercise.stopRules,
    ...exercise.regressions,
    ...exercise.progressions,
  ].join(' ');
}

function includesAny(value: string, keywords: readonly string[]): boolean {
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function getRequiredEquipment(exercise: Exercise): Equipment[] {
  if (exercise.requiredEquipment) return sortEquipmentByPriority(exercise.requiredEquipment);
  if (exercise.progressionEquipment || exercise.optionalEquipment) {
    const optional = new Set([...(exercise.optionalEquipment ?? []), ...(exercise.progressionEquipment ?? [])]);
    return sortEquipmentByPriority(exercise.equipment.filter((item) => !optional.has(item)));
  }
  return sortEquipmentByPriority(exercise.equipment);
}

export function getOptionalEquipment(exercise: Exercise): Equipment[] {
  return sortEquipmentByPriority(exercise.optionalEquipment ?? []);
}

export function getProgressionEquipment(exercise: Exercise): Equipment[] {
  return sortEquipmentByPriority(exercise.progressionEquipment ?? []);
}

export function getExerciseEquipment(exercise: Exercise): Equipment[] {
  return sortEquipmentByPriority(uniqueEquipment([
    ...getRequiredEquipment(exercise),
    ...getOptionalEquipment(exercise),
    ...getProgressionEquipment(exercise),
    ...exercise.equipment,
  ]));
}

export function requiresSupport(exercise: Exercise): boolean {
  if (typeof exercise.supportRequired === 'boolean') return exercise.supportRequired;
  return getRequiredEquipment(exercise).some((item) => SUPPORT_ONLY_EQUIPMENT.includes(item));
}

export function getSafetyTags(exercise: Exercise): SafetyTag[] {
  const tags = new Set<SafetyTag>(exercise.safetyTags ?? []);
  const text = getExerciseText(exercise);

  if (includesAny(text, ['jump', 'plyometric', 'impact', '跳', '衝刺', '爆發'])) tags.add('high_impact');
  if (includesAny(text, ['deep squat', 'full squat', '深蹲', '全蹲'])) tags.add('deep_knee_flexion');
  if (includesAny(text, ['overhead press', 'overhead load', '推舉', '過頭負重'])) tags.add('aggressive_overhead_loading');
  if ((exercise.type === 'balance' || exercise.type === 'proprioception') && !requiresSupport(exercise)) tags.add('unsupported_balance');
  if (getProgressionEquipment(exercise).some((item) => LOADED_EQUIPMENT.includes(item))) tags.add('loaded_progression');

  return [...tags];
}

export function getRecommendationSafetyLevel(exercise: Exercise): RecommendationSafetyLevel {
  if (exercise.recommendationSafetyLevel) return exercise.recommendationSafetyLevel;
  if (exercise.level === 'advanced') return 'advanced_only';
  if (getSafetyTags(exercise).some((tag) => PAIN_HIGH_SAFETY_TAGS.includes(tag))) return 'caution';
  if (exercise.level === 'beginner' && (exercise.type === 'mobility' || exercise.type === 'stretch' || exercise.type === 'relaxation')) return 'gentle';
  return 'standard';
}

export function shouldAvoidIfPainHigh(exercise: Exercise): boolean {
  if (typeof exercise.avoidIfPainHigh === 'boolean') return exercise.avoidIfPainHigh;
  return getRecommendationSafetyLevel(exercise) === 'caution' ||
    getRecommendationSafetyLevel(exercise) === 'advanced_only' ||
    getSafetyTags(exercise).some((tag) => PAIN_HIGH_SAFETY_TAGS.includes(tag));
}

export function isSupportOnlyExercise(exercise: Exercise): boolean {
  const requiredEquipment = getRequiredEquipment(exercise);
  if (requiredEquipment.length === 0) return true;
  return requiredEquipment.every((item) => item === EQUIPMENT_IDS.BODYWEIGHT || SUPPORT_ONLY_EQUIPMENT.includes(item));
}

export function isCompatibleWithEquipment(exercise: Exercise, availableEquipment: readonly Equipment[]): boolean {
  const requiredEquipment = getRequiredEquipment(exercise);
  if (requiredEquipment.length === 0) return true;

  return requiredEquipment.every((item) => {
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
  if (filters.equipment.length > 0) return sortEquipmentByPriority(filters.equipment);
  if (assessmentEquipment.length > 0) return sortEquipmentByPriority(assessmentEquipment);
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
        : filters.equipment.length === 0 || filters.equipment.some((equipment) => getExerciseEquipment(exercise).includes(equipment)))
    );
  });
}
