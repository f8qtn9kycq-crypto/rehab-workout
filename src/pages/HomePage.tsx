import ActivityTracking from '../components/ActivityTracking';
import { ArrowRight, MapPin } from 'lucide-react';
import { Navigate, Link } from 'react-router-dom';
import { onboardingStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { safeGetItem } from '../services/localStorageService';

export default function HomePage({ demo = false }: { demo?: boolean }) {
  const { t } = useI18n();
  const seenOnboarding = safeGetItem(onboardingStorageKey);
  if (!seenOnboarding && !demo) return <Navigate to="/onboarding" replace />;

  return (
    <div className="page space-y-5">
      <section className="card mx-auto max-w-xl space-y-6 p-5 sm:p-6" aria-labelledby="home-next-action-title">
        <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
          <MapPin size={20} aria-hidden="true" />
          {t('bodyFirst.stepLabel')}
        </div>
        <h1 id="home-next-action-title" className="text-3xl font-bold leading-relaxed text-ink">{t('bodyFirst.homeTitle')}</h1>
        <p className="text-lg leading-8 text-slate-600">{t('bodyFirst.homeBody')}</p>
        <Link to="/start" className="focus-ring inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 text-lg font-bold text-white">
          {t('bodyFirst.homeCta')}
          <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </section>
      {!demo && <ActivityTracking />}
    </div>
  );
}
