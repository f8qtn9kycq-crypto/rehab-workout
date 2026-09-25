import ActivityTracking from '../components/ActivityTracking';
import BodyTrainingEntry from '../components/BodyTrainingEntry';
import { useMemo, useState } from 'react';
import FunctionalOutcomeCheckIn from '../components/FunctionalOutcomeCheckIn';
import ProgressSummary from '../components/ProgressSummary';
import TrainingLog from '../components/TrainingLog';
import ExerciseIdentityVisual from '../components/ExerciseIdentityVisual';
import ActivityIdentityVisual from '../components/ActivityIdentityVisual';
import TrainingSetSummary from '../components/TrainingSetSummary';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { readActivities } from '../services/activityStorage';
import { getSavedAssessment } from '../services/assessmentStorage';
import { clearRehabLocalData } from '../services/localStorageService';
import { createOutcomeEntry, getOutcomeEntries, saveOutcomeEntry } from '../services/outcomeStorage';
import type { BodyArea, OutcomeScore } from '../types/rehab';
import { buildWeeklyProgressSummary } from '../utils/progressSummary';
import { buildRecordsPresentation } from '../utils/recordsPresentation';

function SectionHeader({ id, title, subtitle, icon: Icon }: { id: string; title: string; subtitle: string; icon: typeof Activity }) {
  return (
    <div className="border-l-4 border-calm-500 pl-3">
      <h2 id={id} className="flex items-center gap-2 text-xl font-black leading-tight text-ink"><Icon size={22} className="text-calm-700" aria-hidden="true" />{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
}

export default function LogsPage() {
  const { language, t } = useI18n();
  const [logs, setLogs] = useState(() => getLogs());
  const [outcomes, setOutcomes] = useState(() => getOutcomeEntries());
  const [activities, setActivities] = useState(() => readActivities().activities);
  const savedAssessment = useMemo(() => getSavedAssessment(), []);
  const [clearStatus, setClearStatus] = useState<'idle' | 'success' | 'partial'>('idle');
  const summary = useMemo(() => buildWeeklyProgressSummary(logs, outcomes), [logs, outcomes]);
  const presentation = useMemo(() => buildRecordsPresentation(logs, activities, outcomes), [logs, activities, outcomes]);
  const latestOutcome = presentation.validOutcomes[0] ?? null;

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
    setActivities([]);
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

      <BodyTrainingEntry onActivitiesChange={() => setActivities(readActivities().activities)} />

      <section className="space-y-4" aria-labelledby="records-recent-title">
        <SectionHeader id="records-recent-title" title={t('records.recent.title')} subtitle={t('records.recent.subtitle')} icon={History} />
        {presentation.hasActivityHistory ? (
          <div className="space-y-3">
            {presentation.recentActivities.slice(0, 5).map(item => item.source === 'training' ? (
              <article key={item.id} className="card space-y-3 p-4">
                <ExerciseIdentityVisual log={item.log} compact />
                <p className="text-sm font-semibold text-calm-800">{t('records.recent.trainingMeta', { date: formatDate(item.date), painBefore: item.log.painBefore, painAfter: item.log.painAfter })}</p>
                <TrainingSetSummary sets={item.log.sets} />
              </article>
            ) : (
              <article key={item.id} className="card p-4">
                <ActivityIdentityVisual activity={item.activity} />
                <p className="mt-2 text-lg font-black text-ink">{t('records.recent.activityMeta', { date: formatDate(item.date), minutes: item.activity.actualMinutes })}</p>
                {item.activity.kind === 'resistance' ? <p className="mt-1 text-sm text-slate-600">{t(`activities.focuses.${item.activity.primaryFocus}`)}</p> : null}
              </article>
            ))}
          </div>
        ) : <div className="card p-5 text-sm leading-6 text-slate-600">{t('records.recent.empty')}</div>}
      </section>

      <section className="space-y-4" aria-labelledby="records-week-title">
        <SectionHeader id="records-week-title" title={t('records.week.title')} subtitle={t('records.week.subtitle')} icon={TrendingUp} />
        <article className="card border-calm-200 bg-calm-50/80 p-5">
          <p className="text-3xl font-black text-ink">{t('records.week.count', { count: presentation.weeklyActivityCount })}</p>
          <p className="mt-2 text-sm leading-6 text-calm-800">{t('records.week.helper')}</p>
        </article>
      </section>

      <section className="space-y-4" aria-labelledby="records-recovery-title">
        <SectionHeader id="records-recovery-title" title={t('records.recovery.title')} subtitle={t('records.recovery.subtitle')} icon={ClipboardCheck} />
        <ProgressSummary summary={summary} />
        <div className="grid gap-3 md:grid-cols-2">
          <article className="card p-5">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('records.latest.outcomeLabel')}</div>
            <p className="mt-3 text-lg font-black text-ink">{latestOutcome ? t('records.latest.outcomeValue', { area: t(`bodyAreas.${latestOutcome.bodyArea}.label`), score: latestOutcome.score }) : t('records.latest.noOutcome')}</p>
            <p className="mt-2 text-sm text-slate-600">{latestOutcome ? t('records.latest.outcomeMeta', { date: formatDate(latestOutcome.date) }) : t('records.latest.outcomeEmpty')}</p>
          </article>
          <article className="card p-5">
            <div className="text-xs font-black uppercase tracking-wide text-slate-500">{t('records.latest.baselineLabel')}</div>
            <p className="mt-3 text-lg font-black text-ink">{savedAssessment?.functionalBaseline !== undefined ? t('records.latest.baselineValue', { score: savedAssessment.functionalBaseline }) : t('records.latest.noBaseline')}</p>
          </article>
        </div>
        <FunctionalOutcomeCheckIn outcomes={outcomes} onSave={saveOutcome} />
      </section>

      <section className="space-y-4" aria-labelledby="records-history-title">
        <SectionHeader id="records-history-title" title={t('records.history.title')} subtitle={t('records.history.subtitle')} icon={History} />
        <details className="card p-3">
          <summary className="focus-ring flex min-h-11 cursor-pointer items-center rounded-md px-1 font-bold text-ink">{t('records.history.open')}</summary>
          <div className="mt-4 space-y-5">
            <ActivityTracking onActivitiesChange={() => setActivities(readActivities().activities)} />
            {logs.length > 0 ? <TrainingLog logs={logs} onLogsChange={setLogs} /> : null}
          </div>
        </details>
      </section>

      <section className="card space-y-3 border-amber-100 bg-amber-50/60 p-5" aria-labelledby="records-local-data-title">
        <div>
          <h2 id="records-local-data-title" className="flex items-center gap-2 text-lg font-black text-ink"><Trash2 size={20} className="text-amber-800" aria-hidden="true" />{t('logs.clearLocalDataTitle')}</h2>
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
import { Activity, ClipboardCheck, History, Trash2, TrendingUp } from 'lucide-react';
