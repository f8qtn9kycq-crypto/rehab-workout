import type { SessionLog } from '../types/rehab';

const LOG_KEY = 'rehab.trainingLogs.v1';

export type TrainingLogEntry = SessionLog & {
  date: string;
  title: string;
  bodyArea: string;
  type: string;
  level: string;
  difficultyRating: number;
  stoppedEarly: boolean;
  stopReason: string;
};

export function getLogs(): TrainingLogEntry[] {
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLog(log: TrainingLogEntry): TrainingLogEntry[] {
  const logs = [log, ...getLogs()].slice(0, 100);
  window.localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  return logs;
}

export function clearLogs(): void {
  window.localStorage.removeItem(LOG_KEY);
}
