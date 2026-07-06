import { safetyStorageKey } from '../data/safety';
import { safeReadJson, safeSetItem } from '../services/localStorageService';
import { shouldStopForPain, shouldUseRecoveryMode } from './painRules';

export interface SafetyStatus {
  completed: boolean;
  blocked: boolean;
  redFlags: string[];
  safetyDate?: string;
  completedAt?: string;
}

export interface CompleteSafetyGateInput {
  redFlags: string[];
}

const defaultSafetyStatus: SafetyStatus = {
  completed: false,
  blocked: false,
  redFlags: [],
};

export function getTodaySafetyDate(date = new Date()): string {
  return date.toLocaleDateString('en-CA');
}

function getSafetyDateFromCompletedAt(completedAt?: string): string | undefined {
  if (!completedAt) return undefined;
  const parsed = new Date(completedAt);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return getTodaySafetyDate(parsed);
}

function normalizeSafetyStatus(rawStatus: Partial<SafetyStatus>): SafetyStatus {
  const redFlags = Array.isArray(rawStatus.redFlags) ? rawStatus.redFlags.map(String) : [];
  const completedAt = rawStatus.completedAt ? String(rawStatus.completedAt) : undefined;
  const safetyDate = rawStatus.safetyDate ? String(rawStatus.safetyDate) : getSafetyDateFromCompletedAt(completedAt);

  return {
    completed: Boolean(rawStatus.completed),
    blocked: Boolean(rawStatus.blocked),
    redFlags,
    safetyDate,
    completedAt,
  };
}

export function getSafetyStatus(): SafetyStatus {
  const parsed = safeReadJson<Partial<SafetyStatus> | null>(safetyStorageKey, null);
  return parsed && typeof parsed === 'object' ? normalizeSafetyStatus(parsed) : defaultSafetyStatus;
}

export function saveSafetyStatus(input: CompleteSafetyGateInput): SafetyStatus {
  const completedAt = new Date().toISOString();
  const status: SafetyStatus = {
    completed: true,
    blocked: input.redFlags.length > 0,
    redFlags: input.redFlags,
    safetyDate: getTodaySafetyDate(),
    completedAt,
  };

  safeSetItem(safetyStorageKey, JSON.stringify(status));
  return status;
}

export function isSafetyGateCurrentForToday(status: SafetyStatus): boolean {
  return Boolean(status.completed && status.safetyDate === getTodaySafetyDate());
}

export function canEnterSession(status: SafetyStatus): boolean {
  return isSafetyGateCurrentForToday(status) && !status.blocked;
}

export { shouldStopForPain, shouldUseRecoveryMode };
