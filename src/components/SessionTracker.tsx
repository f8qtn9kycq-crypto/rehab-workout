import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { createTrainingLog, saveLog } from '../services/logService';
import type { Exercise } from '../types/rehab';
import { shouldStopForPain, shouldUseRecoveryMode } from '../utils/safety';
import PainScale from './PainScale';
import RestTimer from './RestTimer';

export default function SessionTracker({ exercise }: { exercise: Exercise }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [phase, setPhase] = useState<'before' | 'active' | 'finish'>('before');
  const [painBefore, setPainBefore] = useState(0);
  const [painAfter, setPainAfter] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentRep, setCurrentRep] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [stopReason, setStopReason] = useState('');

  const painBlocksStart = shouldStopForPain(painBefore);
  const recoveryMode = shouldUseRecoveryMode(painBefore);
  const painAfterWarning = painAfter > painBefore + 2 || shouldStopForPain(painAfter);

  function nextRep(): void {
    if (currentRep + 1 < exercise.reps) {
      setCurrentRep(currentRep + 1);
      return;
    }

    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1);
      setCurrentRep(0);
      return;
    }

    setPhase('finish');
  }

  function stopEarly(): void {
    setStoppedEarly(true);
    setStopReason(t('session.earlyStopDefault'));
    setPhase('finish');
  }

  function completeLog(): void {
    const log = createTrainingLog({
      exercise,
      setsCompleted: stoppedEarly ? currentSet : exercise.sets,
      repsCompleted: stoppedEarly ? currentRep : exercise.reps,
      painBefore,
      painAfter,
      difficultyRating,
      stoppedEarly,
      notes,
      stopReason,
    });

    saveLog(log);
    navigate('/logs');
  }

  if (phase === 'before') {
    return (
      <section className="card space-y-5 p-4">
        <h1 className="text-2xl font-bold text-ink">{exercise.title}</h1>
        <PainScale label={t('session.painBefore')} value={painBefore} onChange={setPainBefore} />
        {recoveryMode ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
            {t('session.recoveryCopy')}
          </div>
        ) : null}
        {painBlocksStart ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {t('session.painBlockCopy')}
          </div>
        ) : null}
        <button
          disabled={painBlocksStart}
          onClick={() => setPhase('active')}
          className="focus-ring w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300"
        >
          {t('session.start')}
        </button>
      </section>
    );
  }

  if (phase === 'finish') {
    return (
      <section className="card space-y-5 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="text-calm-700" />
          <h1 className="text-2xl font-bold text-ink">{t('session.finishTitle')}</h1>
        </div>
        <PainScale label={t('session.painAfter')} value={painAfter} onChange={setPainAfter} />
        {painAfterWarning ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {t('session.painAfterWarning')}
          </div>
        ) : null}
        <label className="block">
          <span className="mb-2 block font-semibold text-slate-800">{t('session.difficulty')}</span>
          <input className="h-11 w-full accent-calm-500" type="range" min="1" max="5" value={difficultyRating} onChange={(event) => setDifficultyRating(Number(event.target.value))} />
          <span className="text-sm text-slate-600">{t('session.currentDifficulty', { value: difficultyRating })}</span>
        </label>
        <label className="block">
          <span className="mb-2 block font-semibold text-slate-800">{t('session.notes')}</span>
          <textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="focus-ring min-h-24 w-full rounded-md border border-slate-200 p-3" placeholder={t('session.notesPlaceholder')} />
        </label>
        {stoppedEarly ? (
          <label className="block">
            <span className="mb-2 block font-semibold text-slate-800">{t('session.stopReason')}</span>
            <input value={stopReason} onChange={(event) => setStopReason(event.target.value)} className="focus-ring min-h-11 w-full rounded-md border border-slate-200 px-3" />
          </label>
        ) : null}
        <button onClick={completeLog} className="focus-ring w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white">
          {t('session.saveLog')}
        </button>
      </section>
    );
  }

  return (
    <section className="card space-y-5 p-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">{exercise.title}</h1>
        <p className="mt-1 text-slate-600">{t('session.activeHint')}</p>
      </div>
      <div className="rounded-lg bg-calm-100 p-5 text-center">
        <div className="text-sm font-semibold text-calm-700">{t('session.currentProgress')}</div>
        <div className="mt-1 text-4xl font-bold text-calm-700">{t('session.progressText', { set: currentSet, rep: currentRep + 1 })}</div>
        <div className="mt-1 text-slate-700">{t('session.targetText', { sets: exercise.sets, reps: exercise.reps })}</div>
      </div>
      <ol className="space-y-2">
        {exercise.steps.map((step) => (
          <li key={step} className="rounded-md bg-slate-50 p-3 text-slate-700">{step}</li>
        ))}
      </ol>
      <RestTimer seconds={exercise.restSeconds} />
      <div className="grid gap-3 md:grid-cols-2">
        <button onClick={nextRep} className="focus-ring rounded-md bg-calm-700 px-4 py-3 font-bold text-white">
          {t('session.nextRep')}
        </button>
        <button onClick={stopEarly} className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-3 font-bold text-red-700">
          <AlertTriangle size={18} />
          {t('session.stopSession')}
        </button>
      </div>
    </section>
  );
}
