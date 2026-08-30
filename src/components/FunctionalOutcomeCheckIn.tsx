import { useState, type FormEvent } from 'react';
import BodyAreaIcon from './BodyAreaIcon';
import PainScale from './PainScale';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type OutcomeScore } from '../types/rehab';

const OUTCOME_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface FunctionalOutcomeCheckInProps {
  outcomes: FunctionalOutcomeEntry[];
  onSave: (bodyArea: BodyArea, score: OutcomeScore, note: string) => void;
}

export default function FunctionalOutcomeCheckIn({ outcomes, onSave }: FunctionalOutcomeCheckInProps) {
  const { language, t } = useI18n();
  const [bodyArea, setBodyArea] = useState<BodyArea>('shoulder');
  const [score, setScore] = useState<OutcomeScore>(5);
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
    <section id="function-check-in" className="card p-5" aria-labelledby="outcome-check-in-title">
      <div>
        <h2 id="outcome-check-in-title" className="text-xl font-black text-ink">{t('outcomes.title')}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{t('outcomes.subtitle')}</p>
      </div>

      <form className="mt-5 space-y-6" onSubmit={submit}>
        <fieldset>
          <legend className="mb-2 font-semibold text-slate-800">{t('outcomes.bodyAreaLabel')}</legend>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
            {BODY_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setBodyArea(area)}
                className={`focus-ring min-h-12 rounded-md border px-3 py-2 text-left text-sm font-bold ${
                  area === bodyArea
                    ? 'border-calm-600 bg-calm-50 text-calm-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
                aria-pressed={area === bodyArea}
              >
                <span className="flex items-center gap-2"><BodyAreaIcon area={area} size={20} />{t(`bodyAreas.${area}.label`)}</span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="rounded-md border border-calm-200 bg-calm-50/80 p-4">
          <div className="text-xs font-black uppercase tracking-wide text-calm-700">
            {t('outcomes.selectedAreaTitle', { area: t(`bodyAreas.${bodyArea}.label`) })}
          </div>
          <p className="mt-3 text-lg font-black leading-7 text-ink">{t(`outcomes.questions.${bodyArea}`)}</p>
          {latestForBodyArea ? (
            <p className="mt-3 text-sm leading-6 text-calm-800">
              {t('outcomes.latestForArea', {
                score: latestForBodyArea.score,
                date: new Date(latestForBodyArea.date).toLocaleDateString(language),
              })}
            </p>
          ) : null}
        </div>

        <div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{t('outcomes.scoreHelper')}</p>
          <div className="mt-3"><PainScale label={t('outcomes.scoreLabel')} value={score} levelDescriptions={Object.fromEntries(OUTCOME_SCORES.map((value) => [value, t(`outcomes.scoreLabels.${value}`)]))} onChange={(value) => setScore(value as OutcomeScore)} /></div>
        </div>

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
