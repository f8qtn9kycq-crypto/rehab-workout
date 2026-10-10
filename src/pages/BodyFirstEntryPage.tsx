import { ArrowRight, Dumbbell, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BodyAreaSelector from '../components/BodyAreaSelector';
import { useI18n } from '../services/i18n';
import type { BodyArea } from '../types/rehab';
import { getBodyFirstDestination, type TrainingIntent } from '../utils/bodyFirstEntry';
import { canEnterSession, getSafetyStatus, isSafetyGateCurrentForToday } from '../utils/safety';

export default function BodyFirstEntryPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [bodyArea, setBodyArea] = useState<BodyArea | 'all'>('all');
  const [intent, setIntent] = useState<TrainingIntent | null>(null);

  function selectBodyArea(nextBodyArea: BodyArea): void {
    setBodyArea(nextBodyArea);
    setIntent(null);
  }

  function continueToExistingFlow(): void {
    if (bodyArea === 'all' || !intent) return;

    const safety = getSafetyStatus();
    const safetyReady = isSafetyGateCurrentForToday(safety) && canEnterSession(safety);
    const destination = getBodyFirstDestination(bodyArea, intent, safetyReady);
    navigate(
      { pathname: destination.pathname, search: destination.search },
      destination.state ? { state: destination.state } : undefined,
    );
  }

  return (
    <div className="page">
      <section className="card mx-auto max-w-2xl space-y-6 p-4 sm:p-6" aria-labelledby="body-first-title">
        <div>
          <p className="font-bold text-calm-700">{t('bodyFirst.stepLabel')}</p>
          <h1 id="body-first-title" className="mt-2 text-2xl font-bold leading-relaxed text-ink sm:text-3xl">
            {t('bodyFirst.title')}
          </h1>
          <p className="mt-2 leading-7 text-slate-600">{t('bodyFirst.subtitle')}</p>
        </div>

        <fieldset>
          <legend className="mb-3 text-lg font-bold text-slate-800">{t('bodyFirst.areaLegend')}</legend>
          <BodyAreaSelector
            selected={bodyArea}
            onChange={selectBodyArea}
            compact
            ariaLabel={t('bodyFirst.areaLegend')}
          />
        </fieldset>

        {bodyArea !== 'all' ? (
          <fieldset className="space-y-3">
            <legend className="text-lg font-bold text-slate-800">
              {t('bodyFirst.intentLegend', { bodyArea: t(`bodyAreas.${bodyArea}.label`) })}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['train', 'discomfort'] as const).map((option) => {
                const Icon = option === 'train' ? Dumbbell : HeartPulse;
                const selected = intent === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setIntent(option)}
                    className={`focus-ring min-h-[88px] rounded-lg border p-4 text-left ${
                      selected
                        ? 'border-calm-500 bg-calm-100 text-calm-800'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-3 font-bold">
                      <Icon size={22} aria-hidden="true" />
                      {t(`bodyFirst.intents.${option}.label`)}
                    </span>
                    <span className="mt-2 block text-sm leading-6">{t(`bodyFirst.intents.${option}.hint`)}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        <button
          type="button"
          onClick={continueToExistingFlow}
          disabled={bodyArea === 'all' || !intent}
          className="focus-ring inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 py-3 text-lg font-bold text-white disabled:bg-slate-300"
        >
          {t('bodyFirst.continue')}
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        <p className="text-sm leading-6 text-slate-600">{t('bodyFirst.safetyNote')}</p>
      </section>
    </div>
  );
}
