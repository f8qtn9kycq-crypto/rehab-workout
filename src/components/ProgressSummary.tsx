import { useI18n } from '../services/i18n';
import { BODY_AREAS } from '../types/rehab';
import type { TrendDirection, WeeklyProgressSummary } from '../utils/progressSummary';

function formatAverage(value: number | null): string {
  return value === null ? '-' : String(value);
}

function recoveryStatusKey(trend: TrendDirection): string {
  if (trend === 'lower' || trend === 'improved') return 'improving';
  if (trend === 'higher' || trend === 'declined') return 'declining';
  return trend;
}

export default function ProgressSummary({ summary }: { summary: WeeklyProgressSummary }) {
  const { language, t } = useI18n();
  const hasPainAverages = summary.averagePainBefore !== null && summary.averagePainAfter !== null;
  const statusKey = recoveryStatusKey(summary.painTrend);
  const functionStatusKey = recoveryStatusKey(summary.functionTrend);
  const trainedAreas = summary.trainedBodyAreas.length > 0
    ? summary.trainedBodyAreas.map((bodyArea) => t(`bodyAreas.${bodyArea}.label`)).join(t('progress.areaSeparator'))
    : t('progress.noAreas');

  return (
    <section className="space-y-4" aria-labelledby="weekly-progress-title">
      <div>
        <h2 id="weekly-progress-title" className="text-lg font-black text-ink">{t('progress.title')}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {t('progress.weekStart', { date: new Date(summary.weekStart).toLocaleDateString(language) })}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <article className="card border-calm-200 bg-calm-50/80 p-5">
          <div className="text-xs font-black uppercase tracking-wide text-calm-700">{t('progress.recoveryStatus')}</div>
          <p className="mt-3 text-2xl font-black leading-tight text-ink">{t(`progress.trends.${statusKey}`)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('progress.recoveryStatusHelper')}</p>
        </article>

        <article className="card p-5">
          <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('progress.functionTrend')}</div>
          <p className="mt-3 text-2xl font-black leading-tight text-ink">{t(`progress.trends.${functionStatusKey}`)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('progress.functionHelper')}</p>
        </article>

        <article className="card p-5">
          <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('progress.painChange')}</div>
          <p className="mt-3 text-2xl font-black leading-tight text-ink">
            {hasPainAverages
              ? t('progress.painChangeValue', {
                before: formatAverage(summary.averagePainBefore),
                after: formatAverage(summary.averagePainAfter),
              })
              : t('progress.noPainChange')}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasPainAverages ? t('progress.painChangeHelper') : t('progress.notEnoughLogs')}
          </p>
        </article>

        <article className="card p-5">
          <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('progress.thisWeek')}</div>
          <p className="mt-3 text-2xl font-black leading-tight text-ink">{t('progress.sessionsCompleted', { count: summary.sessionsThisWeek })}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t('progress.trainedAreas', { areas: trainedAreas })}</p>
        </article>
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

      <div className="card p-5">
        <h3 className="text-lg font-black text-ink">{t('progress.latestOutcomes')}</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {BODY_AREAS.map((bodyArea) => {
            const outcome = summary.latestOutcomeByArea[bodyArea];
            return (
              <div key={bodyArea} className="min-h-[76px] rounded-md bg-slate-50 p-3">
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
