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
    <section className="card space-y-4 p-4 min-[640px]:p-5">
      <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 font-semibold text-calm-700">
        <ShieldCheck size={20} />
        {t('onboarding.badge')}
      </div>
      <div>
        <h1 className="text-2xl font-bold text-ink min-[640px]:text-3xl">{t('onboarding.title')}</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 min-[640px]:text-lg">{t('onboarding.subtitle')}</p>
      </div>
      <ol className="grid gap-2" aria-label={t('onboarding.stepsLabel')}>
        {(t('onboarding.steps') as string[]).map((item, index) => (
          <li key={item} className="flex items-center gap-3 rounded-md bg-slate-50 p-3 font-semibold text-slate-700">
            <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-calm-100 text-sm font-black text-calm-800">{index + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
      <button type="button" onClick={finish} className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 font-bold text-white md:w-auto">
        {t('onboarding.start')}
        <ArrowRight size={20} />
      </button>
    </section>
  );
}
