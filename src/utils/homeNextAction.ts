import type { BodyArea, FunctionalOutcomeEntry, TrainingLogEntry } from '../types/rehab';

type NextAction = {
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  href: string;
  variant: 'primary' | 'secondary';
};

const recentOutcomeWindowMs = 1000 * 60 * 60 * 24 * 14;

export function hasRecentOutcome(
  outcomes: FunctionalOutcomeEntry[],
  bodyArea: BodyArea | undefined,
  today = new Date(),
): boolean {
  if (!bodyArea) return false;

  return outcomes.some((outcome) => {
    const outcomeDate = new Date(outcome.date);
    const elapsedMs = today.getTime() - outcomeDate.getTime();

    return (
      outcome.bodyArea === bodyArea &&
      !Number.isNaN(outcomeDate.getTime()) &&
      elapsedMs >= 0 &&
      elapsedMs <= recentOutcomeWindowMs
    );
  });
}

export function getNextAction(input: {
  safetyReady: boolean;
  hasAssessment: boolean;
  latestLog?: TrainingLogEntry;
  hasRecentOutcomeEntry: boolean;
}): NextAction {
  if (!input.safetyReady) {
    return {
      titleKey: 'home.nextAction.safety.title',
      bodyKey: 'home.nextAction.safety.body',
      ctaKey: 'home.nextAction.safety.cta',
      href: '/safety',
      variant: 'primary',
    };
  }

  if (!input.hasAssessment) {
    return {
      titleKey: 'home.nextAction.assessment.title',
      bodyKey: 'home.nextAction.assessment.body',
      ctaKey: 'home.nextAction.assessment.cta',
      href: '/assessment',
      variant: 'primary',
    };
  }

  if (input.latestLog && !input.hasRecentOutcomeEntry) {
    return {
      titleKey: 'home.nextAction.outcome.title',
      bodyKey: 'home.nextAction.outcome.body',
      ctaKey: 'home.nextAction.outcome.cta',
      href: '/logs',
      variant: 'primary',
    };
  }

  if (input.latestLog) {
    return {
      titleKey: 'home.nextAction.continue.title',
      bodyKey: 'home.nextAction.continue.body',
      ctaKey: 'home.nextAction.continue.cta',
      href: `/session/${input.latestLog.exerciseId}`,
      variant: 'primary',
    };
  }

  return {
    titleKey: 'home.nextAction.start.title',
    bodyKey: 'home.nextAction.start.body',
    ctaKey: 'home.nextAction.start.cta',
    href: '/exercises',
    variant: 'primary',
  };
}
