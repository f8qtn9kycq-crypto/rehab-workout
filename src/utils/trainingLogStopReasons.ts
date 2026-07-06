import type { TrainingLogEntry } from '../types/rehab';

export const EARLY_STOP_REASON_CODE = 'early_stop';
export const USER_EXIT_REASON_CODE = 'user_exit';

const legacyEarlyStopReasonLabels = new Set([
  'Felt discomfort or chose to stop early.',
  '訓練中感到不適或想先停止。',
]);

type Translate = (key: string, params?: Record<string, string | number>) => string;

export function normalizeStopReasonForSave(stopReason: string, stoppedEarly: boolean, notes = ''): string {
  const trimmedReason = stopReason.trim();
  const trimmedNotes = notes.trim();

  return stoppedEarly && !trimmedReason && !trimmedNotes ? EARLY_STOP_REASON_CODE : trimmedReason;
}

export function getLocalizedStopReasonLabel(log: TrainingLogEntry, t: Translate): string | null {
  const stopReason = log.stopReason.trim();

  if (stopReason === USER_EXIT_REASON_CODE) return t('session.exitWithoutSaving');
  if (stopReason === EARLY_STOP_REASON_CODE || legacyEarlyStopReasonLabels.has(stopReason)) {
    return t('session.earlyStopDefault');
  }

  return stopReason || log.notes || null;
}
