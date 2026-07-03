import { ArrowRight, ClipboardCheck, ListChecks, PlayCircle, RotateCcw, ShieldCheck, TrendingUp } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { assessmentStorageKey, onboardingStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
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

function hasSavedAssessment(): boolean {
  try {
    return Boolean(window.localStorage.getItem(assessmentStorageKey));
  } catch {
    return false;
  }
}

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
  const seenOnboarding = window.localStorage.getItem(onboardingStorageKey);
  if (!seenOnboarding) return <Navigate to="/onboarding" replace />;

  const safety = getSafetyStatus();
  const safetyReady = isSafetyGateCurrentForToday(safety) && canEnterSession(safety);
  const hasAssessment = hasSavedAssessment();
  const logs = getLogs();
  const outcomes = getOutcomeEntries();
  const latestLog = logs[0];
  const nextAction = getNextAction({
    safetyReady,
    hasAssessment,
    latestLog,
    hasRecentOutcomeEntry: hasRecentOutcome(outcomes),
  });
  const continueHref = latestLog ? `/session/${latestLog.exerciseId}` : '/exercises';

  return (
    <div className="page space-y-5">
      <section className="grid gap-4 min-[769px]:grid-cols-[1.15fr_0.85fr] min-[769px]:items-center">
        <div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
            <ShieldCheck size={20} />
            {t('home.safetyFirst')}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-ink min-[769px]:text-5xl">{t('home.title')}</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-600 min-[769px]:text-lg">{t('home.subtitle')}</p>
          <div className="mt-5 grid gap-3 min-[640px]:grid-cols-3">
            <Link to="/safety" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-calm-700 px-4 font-bold text-white">
              {t('home.startSafely')}
              <ArrowRight size={20} />
            </Link>
            <Link to="/exercises" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-800">
              <PlayCircle size={20} />
              {t('home.pickBodyArea')}
            </Link>
            <Link to={continueHref} className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-800">
              <RotateCcw size={20} />
              {t('home.continueLastSession')}
            </Link>
          </div>
        </div>
        <section className="card p-4" aria-labelledby="home-next-action-title">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-50 px-3 text-sm font-bold text-calm-800">
            <ClipboardCheck size={18} />
            {t('home.nextAction.label')}
          </div>
          <h2 id="home-next-action-title" className="mt-3 text-xl font-bold text-ink">{t(nextAction.titleKey)}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t(nextAction.bodyKey)}</p>
          <Link
            to={nextAction.href}
            className={`focus-ring mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-4 font-bold ${
              nextAction.variant === 'primary'
                ? 'bg-calm-700 text-white'
                : 'border border-slate-200 bg-white text-slate-800'
            }`}
          >
            {t(nextAction.ctaKey)}
            <ArrowRight size={20} />
          </Link>
          <p className="mt-3 text-xs leading-5 text-slate-500">{t('home.nextAction.guardNote')}</p>
        </section>
      </section>
      <section className="grid gap-3 min-[640px]:grid-cols-3" aria-label={t('home.summaryLabel')}>
        <Link to="/logs" className="focus-ring card block p-4">
          <div className="flex items-center gap-2 text-calm-700">
            <TrendingUp size={18} />
            <h2 className="font-bold text-ink">{t('home.weeklyProgress')}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('home.savedLogs', { count: logs.length })}</p>
        </Link>
        <Link to="/logs" className="focus-ring card block p-4">
          <div className="flex items-center gap-2 text-calm-700">
            <ListChecks size={18} />
            <h2 className="font-bold text-ink">{t('home.functionCheckTitle')}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('home.outcomeSummary', { count: outcomes.length })}</p>
        </Link>
        <a href="#weekly-routine" className="focus-ring card block p-4">
          <div className="flex items-center gap-2 text-calm-700">
            <PlayCircle size={18} />
            <h2 className="font-bold text-ink">{t('home.routineTitle')}</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('home.routineSummary')}</p>
        </a>
      </section>
      <div id="weekly-routine">
        <WeeklyRoutineBuilder />
      </div>
    </div>
  );
}
