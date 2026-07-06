import { useMemo, useState } from 'react';
import FunctionalOutcomeCheckIn from '../components/FunctionalOutcomeCheckIn';
import ProgressSummary from '../components/ProgressSummary';
import TrainingLog from '../components/TrainingLog';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { clearRehabLocalData } from '../services/localStorageService';
import { createOutcomeEntry, getOutcomeEntries, saveOutcomeEntry } from '../services/outcomeStorage';
import type { BodyArea, FunctionalOutcomeEntry, OutcomeScore, TrainingLogEntry } from '../types/rehab';
import { getLocalizedTrainingLogTitle } from '../utils/localizedExercise';
import { buildWeeklyProgressSummary } from '../utils/progressSummary';

function latestByDate<T extends { date: string }>(entries: T[]): T | null {
  return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] ?? null;
}

function SectionHeader({ id, title, subtitle }: { id: string; title: string; subtitle: string }) {
  return (
    <div className="border-l-4 border-calm-500 pl-3">
      <h2 id={id} className="text-xl font-black leading-tight text-ink">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
}

export default function LogsPage() {
  const { language, t } = useI18n();
  const [logs, setLogs] = useState(() => getLogs());
  const [outcomes, setOutcomes] = useState(() => getOutcomeEntries());
  const [clearStatus, setClearStatus] = useState<'idle' | 'success' | 'partial'>('idle');
  const fallbackTitle = t('logs.savedExerciseFallback');
  const summary = useMemo(() => buildWeeklyProgressSummary(logs, outcomes), [logs, outcomes]);
  const latestLog = useMemo<TrainingLogEntry | null>(() => latestByDate(logs), [logs]);
  const latestOutcome = useMemo<FunctionalOutcomeEntry | null>(() => latestByDate(outcomes), [outcomes]);

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString(language);
  }

  function saveOutcome(bodyArea: BodyArea, score: OutcomeScore, note: string): void {
    const entry = createOutcomeEntry({ bodyArea, score, note });
    setOutcomes(saveOutcomeEntry(entry));
    setClearStatus('idle');
  }

  function clearLocalData(): void {
    if (!window.confirm(t('logs.clearLocalDataConfirm'))) return;

    const result = clearRehabLocalData();
    setLogs([]);
    setOutcomes([]);
    setClearStatus(result.failedKeys.length > 0 ? 'partial' : 'success');
  }

  return (
    <div className="page space-y-8">
      <div>
        <h1 className="text-3xl font-black leading-tight text-ink">{t('logs.title')}</h1>
        <p className="mt-2 max-w-2xl leading-7 text-slate-600">{t('logs.subtitle')}</p>
      </div>

      <section className="space-y-4" aria-labelledby="records-latest-title">
        <SectionHeader id="records-latest-title" title={t('records.latest.title')} subtitle={t('records.latest.subtitle')} />
        <div className="grid gap-3 md:grid-cols-2">
          <article className="card border-calm-200 bg-calm-50/80 p-5">
            <div className="text-xs font-black uppercase tracking-wide text-calm-700">{t('records.latest.trainingLabel')}</div>
            <p className="mt-3 text-2xl font-black leading-tight text-ink">
              {latestLog ? getLocalizedTrainingLogTitle(latestLog, language, fallbackTitle) : t('records.latest.noTraining')}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-calm-800">
              {latestLog
                ? t('records.latest.trainingMeta', {
                  date: formatDate(latestLog.date),
                  painBefore: latestLog.painBefore,
                  painAfter: latestLog.painAfter,
                })
                : t('records.latest.trainingEmpty')}
            </p>
          </article>

          <article className="card p-5">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('records.latest.outcomeLabel')}</div>
            <p className="mt-3 text-2xl font-black leading-tight text-ink">
              {latestOutcome
                ? t('records.latest.outcomeValue', {
                  area: t(`bodyAreas.${latestOutcome.bodyArea}.label`),
                  score: latestOutcome.score,
                })
                : t('records.latest.noOutcome')}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {latestOutcome
                ? t('records.latest.outcomeMeta', { date: formatDate(latestOutcome.date) })
                : t('records.latest.outcomeEmpty')}
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="records-progress-title">
        <SectionHeader id="records-progress-title" title={t('records.progress.title')} subtitle={t('records.progress.subtitle')} />
        <ProgressSummary summary={summary} />
      </section>

      <section className="space-y-4" aria-labelledby="records-outcomes-title">
        <SectionHeader id="records-outcomes-title" title={t('records.outcomes.title')} subtitle={t('records.outcomes.subtitle')} />
        <FunctionalOutcomeCheckIn outcomes={outcomes} onSave={saveOutcome} />
      </section>

      <section className="space-y-4" aria-labelledby="records-history-title">
        <SectionHeader id="records-history-title" title={t('records.history.title')} subtitle={t('records.history.subtitle')} />
        <TrainingLog logs={logs} />
      </section>

      <section className="card space-y-3 border-amber-100 bg-amber-50/60 p-5" aria-labelledby="records-local-data-title">
        <div>
          <h2 id="records-local-data-title" className="text-lg font-black text-ink">{t('logs.clearLocalDataTitle')}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{t('logs.clearLocalDataBody')}</p>
        </div>
        {clearStatus !== 'idle' ? (
          <p className="rounded-md bg-white/80 p-3 text-sm font-semibold text-amber-900" role="status">
            {clearStatus === 'success' ? t('logs.clearLocalDataSuccess') : t('logs.clearLocalDataPartial')}
          </p>
        ) : null}
        <button
          type="button"
          onClick={clearLocalData}
          className="focus-ring min-h-11 w-full rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 sm:w-auto"
        >
          {t('logs.clearLocalDataAction')}
        </button>
      </section>
    </div>
  );
}
