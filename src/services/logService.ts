import type { BodyArea, Exercise, ExerciseLevel, ExerciseType, TrainingLogEntry } from '../types/rehab';

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

function migrateBodyArea(bodyArea: unknown): BodyArea {
  return bodyArea === 'shoulder_hip' ? 'shoulder' : (bodyArea as BodyArea);
}

function normalizeLog(rawLog: Partial<TrainingLogEntry>): TrainingLogEntry | null {
  if (!rawLog.id || !rawLog.exerciseId || !rawLog.exerciseTitle) return null;

  const setsCompleted = Number(rawLog.setsCompleted ?? 0);
  const repsCompleted = Number(rawLog.repsCompleted ?? 0);
  const painBefore = Number(rawLog.painBefore ?? 0);
  const painAfter = Number(rawLog.painAfter ?? 0);
  const stoppedEarly = Boolean(rawLog.stoppedEarly);

  return {
    id: String(rawLog.id),
    date: String(rawLog.date ?? rawLog.completedAt ?? new Date().toISOString()),
    completedAt: String(rawLog.completedAt ?? rawLog.date ?? new Date().toISOString()),
    exerciseId: String(rawLog.exerciseId),
    title: String(rawLog.title ?? rawLog.exerciseTitle),
    exerciseTitle: String(rawLog.exerciseTitle),
    bodyArea: migrateBodyArea(rawLog.bodyArea),
    type: rawLog.type as ExerciseType,
    level: rawLog.level as ExerciseLevel,
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
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((log) => normalizeLog(log)).filter((log): log is TrainingLogEntry => Boolean(log));
  } catch {
    return [];
  }
}

export function saveLog(log: TrainingLogEntry): TrainingLogEntry[] {
  const logs = [log, ...getLogs()].slice(0, MAX_LOGS);
  window.localStorage.setItem(LOG_KEY, JSON.stringify(logs));
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
  window.localStorage.removeItem(LOG_KEY);
}
