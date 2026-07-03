import { useI18n } from '../services/i18n';
import { BODY_AREAS } from '../types/rehab';
import type { WeeklyProgressSummary } from '../utils/progressSummary';

function formatAverage(value: number | null): string {
  return value === null ? '-' : String(value);
}

export default function ProgressSummary({ summary }: { summary: WeeklyProgressSummary }) {
  const { language, t } = useI18n();
  const hasPainAverages = summary.averagePainBefore !== null && summary.averagePainAfter !== null;
  const trainedAreas = summary.trainedBodyAreas.length > 0
    ? summary.trainedBodyAreas.map((bodyArea) => t(`bodyAreas.${bodyArea}.label`)).join(t('progress.areaSeparator'))
    : t('progress.noAreas');

  return (
    <section className="space-y-3" aria-labelledby="weekly-progress-title">
      <div>
        <h2 id="weekly-progress-title" className="text-xl font-bold text-ink">{t('progress.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {t('progress.weekStart', { date: new Date(summary.weekStart).toLocaleDateString(language) })}
        </p>
      </div>

      <details className="card p-3">
        <summary className="focus-ring flex min-h-11 cursor-pointer items-center rounded-md px-1 font-bold text-ink">
          {t('progress.education.title')}
        </summary>
        <ul className="mt-2 space-y-2 text-sm text-slate-600">
          <li>{t('progress.education.pain')}</li>
          <li>{t('progress.education.function')}</li>
          <li>{t('progress.education.consistency')}</li>
          <li>{t('progress.education.insufficient')}</li>
        </ul>
      </details>

      <div className="grid gap-3 md:grid-cols-3">
        <article className="card p-4">
          <div className="text-sm font-semibold text-slate-500">{t('progress.recoveryTrend')}</div>
          <p className="mt-2 text-lg font-bold text-ink">{t(`progress.trends.${summary.painTrend}`)}</p>
          <p className="mt-2 text-sm text-slate-600">
            {hasPainAverages
              ? t('progress.painAverages', {
                before: formatAverage(summary.averagePainBefore),
                after: formatAverage(summary.averagePainAfter),
              })
              : t('progress.notEnoughLogs')}
          </p>
        </article>

        <article className="card p-4">
          <div className="text-sm font-semibold text-slate-500">{t('progress.functionTrend')}</div>
          <p className="mt-2 text-lg font-bold text-ink">{t(`progress.trends.${summary.functionTrend}`)}</p>
          <p className="mt-2 text-sm text-slate-600">{t('progress.functionHelper')}</p>
        </article>

        <article className="card p-4">
          <div className="text-sm font-semibold text-slate-500">{t('progress.consistency')}</div>
          <p className="mt-2 text-lg font-bold text-ink">{t('progress.sessions', { count: summary.sessionsThisWeek })}</p>
          <p className="mt-2 text-sm text-slate-600">{trainedAreas}</p>
        </article>
      </div>

      <div className="card p-4">
        <h3 className="font-bold text-ink">{t('progress.latestOutcomes')}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {BODY_AREAS.map((bodyArea) => {
            const outcome = summary.latestOutcomeByArea[bodyArea];
            return (
              <div key={bodyArea} className="rounded-md bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-700">{t(`bodyAreas.${bodyArea}.label`)}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {outcome
                    ? t('progress.latestOutcomeValue', {
                      score: outcome.score,
                      date: new Date(outcome.date).toLocaleDateString(language),
                    })
                    : t('progress.noOutcomeYet')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
