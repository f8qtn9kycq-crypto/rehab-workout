import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { onboardingStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { safeSetItem } from '../services/localStorageService';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { t } = useI18n();

  function finish(): void {
    safeSetItem(onboardingStorageKey, JSON.stringify(true));
    navigate('/safety');
  }

  return (
    <section className="card space-y-5 p-5">
      <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
        <ShieldCheck size={20} />
        {t('onboarding.badge')}
      </div>
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('onboarding.title')}</h1>
        <p className="mt-3 text-lg text-slate-600">{t('onboarding.subtitle')}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {(t('onboarding.steps') as string[]).map((item) => (
          <div key={item} className="rounded-lg bg-slate-50 p-3 font-semibold text-slate-700">{item}</div>
        ))}
      </div>
      <button onClick={finish} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 font-bold text-white md:w-auto">
        {t('onboarding.start')}
        <ArrowRight size={20} />
      </button>
    </section>
  );
}
