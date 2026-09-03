import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { onboardingStorageKey } from '../data/safety';
import { getSavedAssessment } from '../services/assessmentStorage';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { safeGetItem } from '../services/localStorageService';
import { getOutcomeEntries } from '../services/outcomeStorage';
import type { FunctionalOutcomeEntry, TrainingLogEntry } from '../types/rehab';
import { canEnterSession, getSafetyStatus, isSafetyGateCurrentForToday } from '../utils/safety';

type NextAction = {
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  href: string;
  variant: 'primary' | 'secondary';
};

const recentOutcomeWindowMs = 1000 * 60 * 60 * 24 * 14;

function hasRecentOutcome(outcomes: FunctionalOutcomeEntry[], today = new Date()): boolean {
  return outcomes.some((outcome) => {
    const outcomeDate = new Date(outcome.date);
    return !Number.isNaN(outcomeDate.getTime()) && today.getTime() - outcomeDate.getTime() <= recentOutcomeWindowMs;
  });
}

function getNextAction(input: {
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

export default function HomePage() {
  const { t } = useI18n();
  const seenOnboarding = safeGetItem(onboardingStorageKey);
  if (!seenOnboarding) return <Navigate to="/onboarding" replace />;

  const safety = getSafetyStatus();
  const safetyReady = isSafetyGateCurrentForToday(safety) && canEnterSession(safety);
  const hasAssessment = Boolean(getSavedAssessment());
  const logs = getLogs();
  const outcomes = getOutcomeEntries();
  const latestLog = logs[0];
  const nextAction = getNextAction({
    safetyReady,
    hasAssessment,
    latestLog,
    hasRecentOutcomeEntry: hasRecentOutcome(outcomes),
  });

  return (
    <div className="page">
      <section className="card mx-auto max-w-xl space-y-6 p-5 sm:p-6" aria-labelledby="home-next-action-title">
        <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
          <ShieldCheck size={20} aria-hidden="true" />
          {t('home.safetyFirst')}
        </div>
        <h1 id="home-next-action-title" className="text-3xl font-bold leading-relaxed text-ink">{t(nextAction.titleKey)}</h1>
        <p className="text-lg leading-8 text-slate-600">{t(nextAction.bodyKey)}</p>
        <Link to={nextAction.href} className="focus-ring inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 text-lg font-bold text-white">
          {t(nextAction.ctaKey)}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
