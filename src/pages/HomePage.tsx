import { ArrowRight, PlayCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { onboardingStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';

export default function HomePage() {
  const { t } = useI18n();
  const seenOnboarding = window.localStorage.getItem(onboardingStorageKey);
  if (!seenOnboarding) return <Navigate to="/onboarding" replace />;

  const logs = getLogs();
  const latestLog = logs[0];
  const continueHref = latestLog ? `/session/${latestLog.exerciseId}` : '/exercises';

  return (
    <div className="page space-y-5">
      <section className="grid gap-4 md:grid-cols-[1.15fr_0.85fr] md:items-center">
        <div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
            <ShieldCheck size={20} />
            {t('home.safetyFirst')}
          </div>
          <h1 className="mt-4 text-3xl font-bold text-ink md:text-5xl">{t('home.title')}</h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">{t('home.subtitle')}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
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
        <div className="card p-4">
          <h2 className="text-xl font-bold text-ink">{t('home.weeklyProgress')}</h2>
          <p className="mt-2 text-slate-600">{t('home.savedLogs', { count: logs.length })}</p>
          <div className="mt-4 rounded-lg bg-slate-50 p-4 text-slate-700">{t('home.todayFocus')}</div>
        </div>
      </section>
      <WeeklyRoutineBuilder />
    </div>
  );
}
