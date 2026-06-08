export const PAIN_RULES = {
  recoveryModeAbove: 3,
  blockSessionAt: 6,
  afterSessionWarningIncrease: 2,
} as const;

export type PainValue = number | null;

export function hasPainValue(pain: PainValue): pain is number {
  return pain !== null;
}

export function shouldUseRecoveryMode(pain: PainValue): boolean {
  return hasPainValue(pain) && pain > PAIN_RULES.recoveryModeAbove && pain < PAIN_RULES.blockSessionAt;
}

export function shouldStopForPain(pain: PainValue): boolean {
  return hasPainValue(pain) && pain >= PAIN_RULES.blockSessionAt;
}

export function shouldWarnForPainIncrease(painBefore: PainValue, painAfter: PainValue): boolean {
  if (!hasPainValue(painBefore) || !hasPainValue(painAfter)) return false;
  return painAfter > painBefore + PAIN_RULES.afterSessionWarningIncrease || shouldStopForPain(painAfter);
}
