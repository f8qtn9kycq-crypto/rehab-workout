import { safetyStorageKey } from '../data/safety';

export interface SafetyStatus {
  completed: boolean;
  blocked: boolean;
  redFlags: string[];
  completedAt?: string;
}

export function getSafetyStatus(): SafetyStatus {
  try {
    const raw = window.localStorage.getItem(safetyStorageKey);
    return raw ? JSON.parse(raw) : { completed: false, blocked: false, redFlags: [] };
  } catch {
    return { completed: false, blocked: false, redFlags: [] };
  }
}

export function shouldUseRecoveryMode(pain: number): boolean {
  return pain > 3;
}

export function shouldStopForPain(pain: number): boolean {
  return pain >= 6;
}
