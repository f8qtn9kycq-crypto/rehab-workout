import { useI18n } from '../services/i18n';
import type { TrainingLogEntry } from '../services/logService';

function migrateBodyArea(bodyArea: string): string {
  return bodyArea === 'shoulder_hip' ? 'shoulder' : bodyArea;
}

export default function TrainingLog({ logs }: { logs: TrainingLogEntry[] }) {
  const { language, t } = useI18n();

  if (logs.length === 0) {
    return <div className="card p-5 text-slate-600">{t('logs.empty')}</div>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <article key={log.id} className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-ink">{log.title}</h2>
              <p className="text-sm text-slate-600">{new Date(log.date).toLocaleString(language)}</p>
            </div>
            {log.stoppedEarly ? <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-semibold text-red-700">{t('logs.stoppedEarly')}</span> : null}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            <div className="rounded-md bg-slate-50 p-2">{t(`bodyAreas.${migrateBodyArea(log.bodyArea)}.label`)}</div>
            <div className="rounded-md bg-slate-50 p-2">{t(`typeLabels.${log.type}`)}</div>
            <div className="rounded-md bg-slate-50 p-2">{t(`levelLabels.${log.level}`)}</div>
            <div className="rounded-md bg-slate-50 p-2">{t('logs.pain', { before: log.painBefore, after: log.painAfter })}</div>
          </div>
          {log.notes || log.stopReason ? <p className="mt-3 text-slate-700">{log.stopReason || log.notes}</p> : null}
        </article>
      ))}
    </div>
  );
}
