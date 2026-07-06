import {
  BODY_AREAS,
  EXERCISE_LEVELS,
  EXERCISE_TYPES,
  type BodyArea,
  type Exercise,
  type ExerciseLevel,
  type ExerciseType,
  type TrainingLogEntry,
} from '../types/rehab';
import { safeReadJson, safeRemoveItem, safeSetItem } from './localStorageService';

const LOG_KEY = 'rehab.trainingLogs.v1';
const MAX_LOGS = 100;

interface CreateTrainingLogInput {
  exercise: Exercise;
  setsCompleted: number;
  repsCompleted: number;
  painBefore: number;
  painAfter: number;
  difficultyRating: number;
  stoppedEarly: boolean;
  recoveryMode: boolean;
  notes: string;
  stopReason: string;
}

function isBodyArea(value: unknown): value is BodyArea {
  return typeof value === 'string' && BODY_AREAS.includes(value as BodyArea);
}

function isExerciseType(value: unknown): value is ExerciseType {
  return typeof value === 'string' && EXERCISE_TYPES.includes(value as ExerciseType);
}

function isExerciseLevel(value: unknown): value is ExerciseLevel {
  return typeof value === 'string' && EXERCISE_LEVELS.includes(value as ExerciseLevel);
}

function hasValidDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function migrateBodyArea(bodyArea: unknown): BodyArea | null {
  const migratedBodyArea = bodyArea === 'shoulder_hip' ? 'shoulder' : bodyArea;
  return isBodyArea(migratedBodyArea) ? migratedBodyArea : null;
}

function normalizeLog(rawLog: Partial<TrainingLogEntry>): TrainingLogEntry | null {
  if (!rawLog || typeof rawLog !== 'object') return null;
  if (!rawLog.id || !rawLog.exerciseId || !rawLog.exerciseTitle) return null;

  const bodyArea = migrateBodyArea(rawLog.bodyArea);
  const type = isExerciseType(rawLog.type) ? rawLog.type : null;
  const level = isExerciseLevel(rawLog.level) ? rawLog.level : null;
  const date = rawLog.date ?? rawLog.completedAt;
  const completedAt = rawLog.completedAt ?? rawLog.date;

  if (!bodyArea || !type || !level || !hasValidDate(date) || !hasValidDate(completedAt)) return null;

  const setsCompleted = Number(rawLog.setsCompleted ?? 0);
  const repsCompleted = Number(rawLog.repsCompleted ?? 0);
  const painBefore = Number(rawLog.painBefore ?? 0);
  const painAfter = Number(rawLog.painAfter ?? 0);
  const stoppedEarly = Boolean(rawLog.stoppedEarly);

  if ([setsCompleted, repsCompleted, painBefore, painAfter].some((value) => Number.isNaN(value))) return null;

  return {
    id: String(rawLog.id),
    date,
    completedAt,
    exerciseId: String(rawLog.exerciseId),
    title: String(rawLog.title ?? rawLog.exerciseTitle),
    exerciseTitle: String(rawLog.exerciseTitle),
    bodyArea,
    type,
    level,
    plannedSets: Number(rawLog.plannedSets ?? rawLog.setsCompleted ?? 0),
    plannedReps: Number(rawLog.plannedReps ?? rawLog.repsCompleted ?? 0),
    setsCompleted,
    repsCompleted,
    painBefore,
    painAfter,
    difficultyRating: Number(rawLog.difficultyRating ?? 3),
    stoppedEarly,
    recoveryMode: Boolean(rawLog.recoveryMode),
    completionStatus: stoppedEarly ? 'stopped_early' : 'completed',
    notes: String(rawLog.notes ?? ''),
    stopReason: String(rawLog.stopReason ?? ''),
    painDelta: painAfter - painBefore,
  };
}

export function getLogs(): TrainingLogEntry[] {
  const parsed = safeReadJson<unknown>(LOG_KEY, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((log) => normalizeLog(log)).filter((log): log is TrainingLogEntry => Boolean(log));
}

export function saveLog(log: TrainingLogEntry): TrainingLogEntry[] {
  const logs = [log, ...getLogs()].slice(0, MAX_LOGS);
  safeSetItem(LOG_KEY, JSON.stringify(logs));
  return logs;
}

export function createTrainingLog(input: CreateTrainingLogInput): TrainingLogEntry {
  const completedAt = new Date().toISOString();
  const painDelta = input.painAfter - input.painBefore;

  return {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: completedAt,
    completedAt,
    exerciseId: input.exercise.id,
    title: input.exercise.title,
    exerciseTitle: input.exercise.title,
    bodyArea: input.exercise.bodyArea,
    type: input.exercise.type,
    level: input.exercise.level,
    plannedSets: input.exercise.sets,
    plannedReps: input.exercise.reps,
    setsCompleted: input.setsCompleted,
    repsCompleted: input.repsCompleted,
    painBefore: input.painBefore,
    painAfter: input.painAfter,
    difficultyRating: input.difficultyRating,
    stoppedEarly: input.stoppedEarly,
    recoveryMode: input.recoveryMode,
    completionStatus: input.stoppedEarly ? 'stopped_early' : 'completed',
    notes: input.notes,
    stopReason: input.stopReason,
    painDelta,
  };
}

export function clearLogs(): void {
  safeRemoveItem(LOG_KEY);
}
