import { useState } from 'react';
import { Activity, CalendarDays } from 'lucide-react';
import { useI18n } from '../services/i18n';
import { updateTrainingLogSets } from '../services/logService';
import type { TrainingLogEntry, TrainingSet } from '../types/rehab';
import { getLocalizedStopReasonLabel } from '../utils/trainingLogStopReasons';
import { getExerciseById } from '../utils/exerciseModel';
import TrainingSetEditor from './TrainingSetEditor';
import ExerciseIdentityVisual from './ExerciseIdentityVisual';
import TrainingSetSummary from './TrainingSetSummary';

function TrainingSetLogEditor({ log, onSaved }: { log: TrainingLogEntry; onSaved: (logs: TrainingLogEntry[]) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState<TrainingSet[]>(log.sets ?? []);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const exercise = getExerciseById(log.exerciseId);
  const supportsSetDetails = Boolean(log.sets?.length) || Boolean(exercise?.type === 'strength' && exercise.equipment.some(item => item === 'dumbbell' || item === 'kettlebell'));
  if (!supportsSetDetails) return null;

  function save(): void {
    const updated = updateTrainingLogSets(log.id, draft);
    setStatus(updated ? 'saved' : 'error');
    if (updated) onSaved(updated);
  }

  return <details className="mt-3 rounded-md border border-slate-200 p-3">
    <summary className="min-h-11 cursor-pointer py-2 font-bold text-calm-800">{t('logs.editSetDetails')}</summary>
    <div className="space-y-3 pt-2">
      <TrainingSetEditor sets={draft} plannedReps={log.plannedReps} onChange={sets => { setDraft(sets); setStatus('idle'); }} />
      <button type="button" onClick={save} className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 font-bold text-white">{t('logs.saveSetDetails')}</button>
      {status !== 'idle' ? <p role={status === 'error' ? 'alert' : 'status'}>{t(`logs.setDetails${status === 'saved' ? 'Saved' : 'Error'}`)}</p> : null}
    </div>
  </details>;
}

export default function TrainingLog({ logs, onLogsChange = () => {} }: { logs: TrainingLogEntry[]; onLogsChange?: (logs: TrainingLogEntry[]) => void }) {
  const { language, t } = useI18n();

  if (logs.length === 0) {
    return <div className="card p-5 text-sm leading-6 text-slate-600">{t('logs.empty')}</div>;
  }

  function getStopReasonLabel(log: TrainingLogEntry): string | null {
    return getLocalizedStopReasonLabel(log, t);
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => {
        const stopReasonLabel = getStopReasonLabel(log);

        return (
          <article key={log.id} className="card bg-white/80 p-4">
            <ExerciseIdentityVisual log={log} compact />
            <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
              <p className="flex items-center gap-1 text-sm text-slate-600"><CalendarDays size={14} aria-hidden="true" />{new Date(log.date).toLocaleString(language)}</p>
              {log.stoppedEarly ? <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-semibold text-red-700">{t('logs.stoppedEarly')}</span> : null}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3">{t(`bodyAreas.${log.bodyArea}.label`)}</div>
              <div className="rounded-md bg-slate-50 p-3">{t(`typeLabels.${log.type}`)}</div>
              <div className="rounded-md bg-slate-50 p-3">{t(`levelLabels.${log.level}`)}</div>
              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-3 font-semibold text-slate-800"><Activity size={16} aria-hidden="true" />{t('logs.pain', { before: log.painBefore, after: log.painAfter })}</div>
            </div>
            <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
              <div className="rounded-md bg-calm-50 p-3 font-semibold text-calm-700">
                {t('logs.volume', {
                  sets: log.setsCompleted,
                  plannedSets: log.plannedSets,
                  reps: log.repsCompleted,
                  plannedReps: log.plannedReps,
                })}
              </div>
              <div className="rounded-md bg-slate-50 p-3 text-slate-700">
                {t('logs.effort', { value: log.difficultyRating })}
              </div>
            </div>
            <div className="mt-3"><TrainingSetSummary sets={log.sets} /></div>
            <TrainingSetLogEditor log={log} onSaved={onLogsChange} />
            {stopReasonLabel ? <p className="mt-3 text-sm leading-6 text-slate-700">{stopReasonLabel}</p> : null}
          </article>
        );
      })}
    </div>
  );
}
