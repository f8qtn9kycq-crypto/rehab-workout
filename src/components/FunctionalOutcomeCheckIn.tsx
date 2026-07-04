import { useState, type FormEvent } from 'react';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type OutcomeScore } from '../types/rehab';

const OUTCOME_SCORES = [1, 2, 3, 4, 5] as const;

interface FunctionalOutcomeCheckInProps {
  outcomes: FunctionalOutcomeEntry[];
  onSave: (bodyArea: BodyArea, score: OutcomeScore, note: string) => void;
}

export default function FunctionalOutcomeCheckIn({ outcomes, onSave }: FunctionalOutcomeCheckInProps) {
  const { language, t } = useI18n();
  const [bodyArea, setBodyArea] = useState<BodyArea>('shoulder');
  const [score, setScore] = useState<OutcomeScore>(3);
  const [note, setNote] = useState('');

  const latestForBodyArea = outcomes
    .filter((entry) => entry.bodyArea === bodyArea)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSave(bodyArea, score, note);
    setNote('');
  }

  return (
    <section id="function-check-in" className="card p-4" aria-labelledby="outcome-check-in-title">
      <div>
        <h2 id="outcome-check-in-title" className="text-xl font-bold text-ink">{t('outcomes.title')}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{t('outcomes.subtitle')}</p>
      </div>

      <form className="mt-4 space-y-5" onSubmit={submit}>
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-800">{t('outcomes.bodyAreaLabel')}</legend>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {BODY_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setBodyArea(area)}
                className={`focus-ring min-h-11 rounded-md border px-3 py-2 text-left text-sm font-bold ${
                  area === bodyArea
                    ? 'border-calm-600 bg-calm-50 text-calm-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
                aria-pressed={area === bodyArea}
              >
                {t(`bodyAreas.${area}.label`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="rounded-md border border-calm-100 bg-calm-50 p-4">
          <div className="text-sm font-semibold text-calm-700">
            {t('outcomes.selectedAreaTitle', { area: t(`bodyAreas.${bodyArea}.label`) })}
          </div>
          <p className="mt-2 text-lg font-bold leading-7 text-ink">{t(`outcomes.questions.${bodyArea}`)}</p>
          {latestForBodyArea ? (
            <p className="mt-3 text-sm leading-6 text-calm-800">
              {t('outcomes.latestForArea', {
                score: latestForBodyArea.score,
                date: new Date(latestForBodyArea.date).toLocaleDateString(language),
              })}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className="font-semibold text-slate-800">{t('outcomes.scoreLabel')}</legend>
          <p className="mt-1 text-sm leading-6 text-slate-600">{t('outcomes.scoreHelper')}</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {OUTCOME_SCORES.map((value) => (
              <label key={value} className={`focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-calm-700 flex min-h-[76px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md border px-1 py-2 text-center ${
                score === value ? 'border-calm-600 bg-calm-50 text-calm-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="outcome-score"
                  value={value}
                  checked={score === value}
                  onChange={() => setScore(value)}
                  className="sr-only"
                />
                <span className="text-lg font-black leading-none">{value}</span>
                <span className="text-[11px] font-semibold leading-tight">{t(`outcomes.scoreLabels.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block font-semibold text-slate-800">{t('outcomes.noteLabel')}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3"
            placeholder={t('outcomes.notePlaceholder')}
          />
        </label>

        <button type="submit" className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white">
          {t('outcomes.save')}
        </button>
      </form>
    </section>
  );
}
