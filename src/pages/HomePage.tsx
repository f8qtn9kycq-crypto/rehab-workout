import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { onboardingStorageKey } from '../data/safety';
import { getSavedAssessment } from '../services/assessmentStorage';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { safeGetItem } from '../services/localStorageService';
import { getOutcomeEntries } from '../services/outcomeStorage';
import { getNextAction, hasRecentOutcome } from '../utils/homeNextAction';
import { canEnterSession, getSafetyStatus, isSafetyGateCurrentForToday } from '../utils/safety';

export default function HomePage({ demo = false }: { demo?: boolean }) {
  const { t } = useI18n();
  const seenOnboarding = safeGetItem(onboardingStorageKey);
  if (!seenOnboarding && !demo) return <Navigate to="/onboarding" replace />;

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
