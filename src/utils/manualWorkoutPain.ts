import { shouldStopForPain, shouldUseRecoveryMode, shouldWarnForPainIncrease } from './painRules';

export function manualWorkoutPainNotice(before?: number, after?: number): 'stop' | 'warning' | null {
  const painBefore = before ?? null;
  const painAfter = after ?? null;
  if (shouldStopForPain(painBefore) || shouldStopForPain(painAfter)) return 'stop';
  if (shouldUseRecoveryMode(painBefore) || shouldUseRecoveryMode(painAfter) || shouldWarnForPainIncrease(painBefore, painAfter)) return 'warning';
  return null;
}
