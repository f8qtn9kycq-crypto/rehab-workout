import {
  BODY_AREAS,
  EXERCISE_LEVELS,
  EXERCISE_TYPES,
  type BodyArea,
  type Exercise,
  type ExerciseLevel,
  type ExerciseType,
  type TrainingSet,
  type TrainingLogEntry,
} from '../types/rehab';
import { safeGetItem, safeReadJson, safeRemoveItem, safeSetItem } from './localStorageService';

const LEGACY_LOG_KEY = 'rehab.trainingLogs.v1';
const LOG_KEY = 'rehab.trainingLogs.v2';
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
  sets?: TrainingSet[];
}

const MAX_TRAINING_SETS = 20;

function normalizeTrainingSets(value: unknown): TrainingSet[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_TRAINING_SETS) return undefined;
  const sets = value.map((item): TrainingSet | null => {
    if (!item || typeof item !== 'object') return null;
    const raw = item as Partial<TrainingSet>;
    if (typeof raw.completed !== 'boolean') return null;
    if (raw.warmup !== undefined && typeof raw.warmup !== 'boolean') return null;
    const weightKg = raw.weightKg === undefined ? undefined : Number(raw.weightKg);
    const reps = raw.reps === undefined ? undefined : Number(raw.reps);
    if (weightKg !== undefined && (!Number.isFinite(weightKg) || weightKg < 0 || weightKg > 1000)) return null;
    if (reps !== undefined && (!Number.isInteger(reps) || reps < 0 || reps > 1000)) return null;
    if (weightKg === undefined && reps === undefined) return null;
    return { ...(weightKg === undefined ? {} : { weightKg }), ...(reps === undefined ? {} : { reps }), completed: raw.completed, ...(raw.warmup === undefined ? {} : { warmup: raw.warmup }) };
  });
  return sets.every((set): set is TrainingSet => set !== null) ? sets : undefined;
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

function normalizeLog(rawLog: Partial<TrainingLogEntry>, legacyFivePoint = false): TrainingLogEntry | null {
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
  const rawDifficultyRating = Number(rawLog.difficultyRating ?? (legacyFivePoint ? 3 : 5));
  const difficultyRating = legacyFivePoint && rawDifficultyRating >= 1 && rawDifficultyRating <= 5
    ? rawDifficultyRating * 2
    : rawDifficultyRating;
  const stoppedEarly = Boolean(rawLog.stoppedEarly);

  if ([setsCompleted, repsCompleted, painBefore, painAfter, difficultyRating].some((value) => Number.isNaN(value))) return null;
  if (difficultyRating < 0 || difficultyRating > 10) return null;

  const sets = normalizeTrainingSets(rawLog.sets);
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
    difficultyRating,
    stoppedEarly,
    recoveryMode: Boolean(rawLog.recoveryMode),
    completionStatus: stoppedEarly ? 'stopped_early' : 'completed',
    notes: String(rawLog.notes ?? ''),
    stopReason: String(rawLog.stopReason ?? ''),
    painDelta: painAfter - painBefore,
    ...(sets ? { sets } : {}),
  };
}

export function getLogs(): TrainingLogEntry[] {
  const hasV2Data = safeGetItem(LOG_KEY) !== null;
  const parsed = safeReadJson<unknown>(hasV2Data ? LOG_KEY : LEGACY_LOG_KEY, []);
  if (!Array.isArray(parsed)) return [];
  const logs = parsed
    .map((log) => normalizeLog(log, !hasV2Data))
    .filter((log): log is TrainingLogEntry => Boolean(log));
  if (!hasV2Data) safeSetItem(LOG_KEY, JSON.stringify(logs));
  return logs;
}

export function saveLog(log: TrainingLogEntry): boolean {
  const raw = safeGetItem(LOG_KEY);
  if (raw !== null) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length !== getLogs().length) return false;
    } catch { return false; }
  }
  const logs = [log, ...getLogs()].slice(0, MAX_LOGS);
  return safeSetItem(LOG_KEY, JSON.stringify(logs));
}

export function updateTrainingLogSets(logId: string, sets: TrainingSet[]): TrainingLogEntry[] | null {
  const logs = getLogs();
  if (!logs.some(log => log.id === logId)) return null;
  const normalizedSets = sets.length === 0 ? undefined : normalizeTrainingSets(sets);
  if (sets.length > 0 && !normalizedSets) return null;
  const updated = logs.map(log => log.id === logId
    ? { ...log, sets: normalizedSets }
    : log);
  return safeSetItem(LOG_KEY, JSON.stringify(updated)) ? updated : null;
}

export function createTrainingLog(input: CreateTrainingLogInput): TrainingLogEntry {
  const completedAt = new Date().toISOString();
  const painDelta = input.painAfter - input.painBefore;

  const sets = normalizeTrainingSets(input.sets);
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
    ...(sets ? { sets } : {}),
  };
}

export function createRetrospectiveLog(input: {
  date: string;
  title: string;
  bodyArea: BodyArea;
  type: ExerciseType;
  sets: TrainingSet[];
  painBefore: number;
  painAfter: number;
  difficultyRating: number;
  stoppedEarly: boolean;
}): TrainingLogEntry | null {
  const title = input.title.trim();
  const sets = normalizeTrainingSets(input.sets);
  const date = new Date(`${input.date}T12:00:00`);
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  if (!title || title.length > 100 || !sets || !isBodyArea(input.bodyArea) || !isExerciseType(input.type)
    || !Number.isFinite(date.getTime()) || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` !== input.date
    || input.date > localToday || ![input.painBefore, input.painAfter, input.difficultyRating].every(value => Number.isInteger(value) && value >= 0 && value <= 10)) return null;
  const completed = sets.filter(set => set.completed);
  return {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    date: date.toISOString(), completedAt: date.toISOString(), exerciseId: 'manual', title, exerciseTitle: title,
    bodyArea: input.bodyArea, type: input.type, level: 'beginner',
    plannedSets: sets.length, plannedReps: sets.reduce((sum, set) => sum + (set.reps ?? 0), 0),
    setsCompleted: completed.length, repsCompleted: completed.reduce((sum, set) => sum + (set.reps ?? 0), 0),
    painBefore: input.painBefore, painAfter: input.painAfter, painDelta: input.painAfter - input.painBefore,
    difficultyRating: input.difficultyRating, stoppedEarly: input.stoppedEarly, recoveryMode: false,
    completionStatus: input.stoppedEarly ? 'stopped_early' : 'completed',
    notes: '', stopReason: '', sets,
  };
}

export function clearLogs(): void {
  safeRemoveItem(LOG_KEY);
  safeRemoveItem(LEGACY_LOG_KEY);
}
