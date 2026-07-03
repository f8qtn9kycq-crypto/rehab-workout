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
    <section className="card p-4" aria-labelledby="outcome-check-in-title">
      <div>
        <h2 id="outcome-check-in-title" className="text-xl font-bold text-ink">{t('outcomes.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('outcomes.subtitle')}</p>
      </div>

      <form className="mt-4 space-y-4" onSubmit={submit}>
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-800">{t('outcomes.bodyAreaLabel')}</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {BODY_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setBodyArea(area)}
                className={`focus-ring min-h-11 rounded-md border px-3 py-2 text-left text-sm font-bold ${
                  area === bodyArea
                    ? 'border-calm-600 bg-calm-50 text-calm-800'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
                aria-pressed={area === bodyArea}
              >
                {t(`bodyAreas.${area}.label`)}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="rounded-md bg-slate-50 p-3">
          <div className="text-sm font-semibold text-slate-600">{t('outcomes.questionLabel')}</div>
          <p className="mt-1 font-bold text-slate-900">{t(`outcomes.questions.${bodyArea}`)}</p>
          {latestForBodyArea ? (
            <p className="mt-2 text-sm text-slate-600">
              {t('outcomes.latestForArea', {
                score: latestForBodyArea.score,
                date: new Date(latestForBodyArea.date).toLocaleDateString(language),
              })}
            </p>
          ) : null}
        </div>

        <fieldset>
          <legend className="mb-2 font-semibold text-slate-800">{t('outcomes.scoreLabel')}</legend>
          <div className="grid gap-2 sm:grid-cols-5">
            {OUTCOME_SCORES.map((value) => (
              <label key={value} className={`flex min-h-11 items-center gap-3 rounded-md border px-3 py-2 ${
                score === value ? 'border-calm-600 bg-calm-50 text-calm-900' : 'border-slate-200 bg-white text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="outcome-score"
                  value={value}
                  checked={score === value}
                  onChange={() => setScore(value)}
                  className="h-5 w-5 accent-calm-600"
                />
                <span className="text-sm font-semibold">{t(`outcomes.scoreLabels.${value}`)}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-2 block font-semibold text-slate-800">{t('outcomes.noteLabel')}</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="focus-ring min-h-20 w-full rounded-md border border-slate-200 p-3"
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
