import { EQUIPMENT_IDS } from '../types/rehab';
import type { Equipment, Exercise, ExerciseFilters, SavedAssessment, TrainingLogEntry } from '../types/rehab';
import {
  getAvailableEquipment,
  getDurationMinutes,
  isCompatibleWithEquipment,
  isSupportOnlyExercise,
  matchesDuration,
} from './exerciseModel';
import { hasPainValue, shouldStopForPain, shouldUseRecoveryMode } from './painRules';

interface RecommendationContext {
  assessment: SavedAssessment | null;
  assessmentEquipment: readonly Equipment[];
  logs: readonly TrainingLogEntry[];
}

interface RankedExercise {
  exercise: Exercise;
  score: number;
}

const DEFAULT_RECOMMENDATION_LIMIT = 12;
const SUPPORT_EQUIPMENT: readonly Equipment[] = [EQUIPMENT_IDS.BODYWEIGHT, EQUIPMENT_IDS.CHAIR, EQUIPMENT_IDS.WALL];
const RECENT_LOG_LIMIT = 8;

function containsAny(value: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => value.toLowerCase().includes(keyword.toLowerCase()));
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
    ...exercise.progressions,
  ].join(' ');
}

function isConservativeDefault(exercise: Exercise): boolean {
  const text = getExerciseText(exercise);

  if (exercise.level === 'advanced') return false;
  if (containsAny(text, ['jump', 'plyometric', 'impact', '跳', '衝刺', '爆發'])) return false;
  if (containsAny(text, ['deep squat', 'full squat', '深蹲', '全蹲'])) return false;
  if (containsAny(text, ['overhead press', 'overhead load', '推舉', '過頭負重'])) return false;
  if ((exercise.type === 'balance' || exercise.type === 'proprioception') && !exercise.equipment.some((item) => SUPPORT_EQUIPMENT.includes(item))) {
    return false;
  }

  return true;
}

function getRecentLogScore(exercise: Exercise, logs: readonly TrainingLogEntry[]): number {
  const recentLogs = logs.slice(0, RECENT_LOG_LIMIT);
  const exerciseLogs = recentLogs.filter((log) => log.exerciseId === exercise.id);
  const areaLogs = recentLogs.filter((log) => log.bodyArea === exercise.bodyArea);
  const lastExerciseLog = exerciseLogs[0];

  let score = areaLogs.length * 2;

  if (lastExerciseLog) {
    score += 4;
    if (lastExerciseLog.stoppedEarly) score -= 8;
    if (lastExerciseLog.painAfter >= lastExerciseLog.painBefore + 2) score -= 8;
    if (lastExerciseLog.painAfter > 3) score -= 5;
  }

  return score;
}

function hasRecentSafetyRegression(exercise: Exercise, logs: readonly TrainingLogEntry[]): boolean {
  const lastExerciseLog = logs.find((log) => log.exerciseId === exercise.id);
  if (!lastExerciseLog) return false;

  return (
    lastExerciseLog.stoppedEarly === true ||
    lastExerciseLog.painAfter > lastExerciseLog.painBefore + 2 ||
    lastExerciseLog.painAfter >= 6
  );
}

function getSafetyScore(exercise: Exercise, recoveryMode: boolean): number {
  let score = 0;

  if (exercise.level === 'beginner') score += 30;
  if (exercise.level === 'intermediate') score += recoveryMode ? -8 : 4;
  if (isSupportOnlyExercise(exercise)) score += 18;
  if (exercise.type === 'mobility' || exercise.type === 'stretch' || exercise.type === 'relaxation') score += 10;
  if (exercise.type === 'balance' || exercise.type === 'proprioception') score += recoveryMode ? -6 : 2;
  if (getDurationMinutes(exercise) <= 5) score += 8;
  if (exercise.regressions.length > 0) score += recoveryMode ? 8 : 2;

  return score;
}

function rankExercises(
  exerciseList: readonly Exercise[],
  filters: ExerciseFilters,
  context: RecommendationContext,
): RankedExercise[] {
  const availableEquipment = getAvailableEquipment(filters, context.assessmentEquipment);
  const targetBodyArea = filters.bodyArea !== 'all' ? filters.bodyArea : context.assessment?.bodyArea;
  const pain = context.assessment?.pain ?? null;
  const recoveryMode = context.assessment?.mode === 'recovery' || shouldUseRecoveryMode(pain) || filters.painSensitive;
  const levelFilter = filters.level === 'all' ? null : filters.level;
  const typeFilter = filters.type === 'all' ? null : filters.type;

  return exerciseList
    .filter((exercise) => {
      if (!isConservativeDefault(exercise)) return false;
      if (targetBodyArea && exercise.bodyArea !== targetBodyArea) return false;
      if (hasRecentSafetyRegression(exercise, context.logs)) return false;
      if (typeFilter && exercise.type !== typeFilter) return false;
      if (levelFilter && exercise.level !== levelFilter) return false;
      if (!matchesDuration(exercise, filters.duration)) return false;
      if (filters.noEquipmentOnly && !isSupportOnlyExercise(exercise)) return false;
      if (!isCompatibleWithEquipment(exercise, availableEquipment)) return false;
      if (recoveryMode && (exercise.level !== 'beginner' || !isSupportOnlyExercise(exercise))) return false;

      return true;
    })
    .map((exercise) => {
      let score = getSafetyScore(exercise, recoveryMode);

      if (targetBodyArea && exercise.bodyArea === targetBodyArea) score += 45;
      if (context.assessment?.mode === 'beginner' && exercise.level === 'beginner') score += 10;
      if (context.assessment?.mode === 'standard' && exercise.level === 'intermediate' && !recoveryMode) score += 4;
      if (hasPainValue(pain) && pain > 3 && exercise.regressions.length > 0) score += 10;
      if (exercise.equipment.every((item) => item === EQUIPMENT_IDS.BODYWEIGHT || availableEquipment.includes(item))) score += 8;
      if (exercise.equipment.some((item) => context.assessmentEquipment.includes(item))) score += 4;
      score += getRecentLogScore(exercise, context.logs);

      return { exercise, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.exercise.level !== b.exercise.level) return a.exercise.level === 'beginner' ? -1 : 1;
      return getDurationMinutes(a.exercise) - getDurationMinutes(b.exercise);
    });
}

export function getRecommendedExercises(
  exerciseList: readonly Exercise[],
  filters: ExerciseFilters,
  context: RecommendationContext,
): Exercise[] {
  const pain = context.assessment?.pain ?? null;
  if (shouldStopForPain(pain)) return [];

  const ranked = rankExercises(exerciseList, filters, context);
  const fallbackRanked = ranked.length > 0
    ? ranked
    : rankExercises(exerciseList, {
      ...filters,
      bodyArea: filters.bodyArea,
      type: 'all',
      level: 'all',
      duration: 'all',
      equipment: [],
      noEquipmentOnly: false,
      painSensitive: true,
    }, context);

  return fallbackRanked.slice(0, DEFAULT_RECOMMENDATION_LIMIT).map(({ exercise }) => exercise);
}
