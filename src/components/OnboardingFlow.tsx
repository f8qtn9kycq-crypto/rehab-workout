import { ArrowRight, Eye, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onboardingStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { safeSetItem } from '../services/localStorageService';
import type { BodyArea } from '../types/rehab';
import BodyAreaSelector from './BodyAreaSelector';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [bodyArea, setBodyArea] = useState<BodyArea | 'all'>('all');

  function beginGuidedPath(): void {
    if (bodyArea === 'all') return;

    safeSetItem(onboardingStorageKey, JSON.stringify(true));
    navigate('/safety', { state: { from: `/assessment?bodyArea=${bodyArea}` } });
  }

  function browseExercises(): void {
    safeSetItem(onboardingStorageKey, JSON.stringify(true));
    navigate('/exercises?mode=all');
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
      <div>
        <h2 className="mb-3 text-lg font-bold text-ink">{t('onboarding.bodyAreaTitle')}</h2>
        <BodyAreaSelector
          selected={bodyArea}
          onChange={setBodyArea}
          compact
          ariaLabel={t('onboarding.bodyAreaTitle')}
        />
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={beginGuidedPath}
          disabled={bodyArea === 'all'}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300"
        >
          {t('onboarding.start')}
          <ArrowRight size={20} />
        </button>
        {bodyArea === 'all' ? <p className="text-center text-sm text-slate-500">{t('onboarding.selectBodyArea')}</p> : null}
        <button
          type="button"
          onClick={browseExercises}
          className="focus-ring inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-bold text-calm-700"
        >
          <Eye size={19} />
          {t('onboarding.browse')}
        </button>
      </div>
    </section>
  );
}
