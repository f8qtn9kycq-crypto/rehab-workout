import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { createTrainingLog, saveLog } from '../services/logService';
import type { Exercise } from '../types/rehab';
import { hasPainValue, shouldStopForPain, shouldUseRecoveryMode, shouldWarnForPainIncrease } from '../utils/painRules';
import PainScale from './PainScale';
import RestTimer from './RestTimer';

interface SessionTrackerProps {
  exercise: Exercise;
  onNavigateBack: () => void;
}

export default function SessionTracker({ exercise, onNavigateBack }: SessionTrackerProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [phase, setPhase] = useState<'before' | 'active' | 'finish'>('before');
  const [painBefore, setPainBefore] = useState<number | null>(null);
  const [painAfter, setPainAfter] = useState<number | null>(null);
  const [useRecoveryMode, setUseRecoveryMode] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState(0);
  const [resting, setResting] = useState(false);
  const [restTimerKey, setRestTimerKey] = useState(0);
  const [difficultyRating, setDifficultyRating] = useState(3);
  const [notes, setNotes] = useState('');
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [stopReason, setStopReason] = useState('');
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const backButtonRef = useRef<HTMLButtonElement>(null);
  const exitButtonRef = useRef<HTMLButtonElement>(null);
  const continueSessionButtonRef = useRef<HTMLButtonElement>(null);
  const lastExitTriggerRef = useRef<HTMLButtonElement | null>(null);

  const painBlocksStart = shouldStopForPain(painBefore);
  const recoveryModeSuggested = shouldUseRecoveryMode(painBefore);
  const painAfterWarning = shouldWarnForPainIncrease(painBefore, painAfter);
  const canStart = hasPainValue(painBefore) && !painBlocksStart;
  const canSaveLog = hasPainValue(painBefore) && hasPainValue(painAfter);
  const hasStartedExercise = phase !== 'before';
  const canSaveExitLog = hasStartedExercise && hasPainValue(painBefore) && hasPainValue(painAfter);
  const recoverySuggestion = exercise.regressions?.[0];

  useEffect(() => {
    if (exitDialogOpen) {
      continueSessionButtonRef.current?.focus();
      return;
    }

    lastExitTriggerRef.current?.focus();
  }, [exitDialogOpen]);

  function completedRepCount(): number {
    return completedSets > 0 ? exercise.reps : 0;
  }

  function completeSet(): void {
    const nextCompletedSets = currentSet;
    setCompletedSets(nextCompletedSets);

    if (currentSet >= exercise.sets) {
      setResting(false);
      setPhase('finish');
      return;
    }

    setResting(true);
    setRestTimerKey((value) => value + 1);
  }

  function startNextSet(): void {
    setCurrentSet((value) => Math.min(value + 1, exercise.sets));
    setResting(false);
  }

  function stopEarly(): void {
    setStoppedEarly(true);
    setStopReason(t('session.earlyStopDefault'));
    setPhase('finish');
  }

  function completeLog(): void {
    if (!hasPainValue(painBefore) || !hasPainValue(painAfter)) return;

    const log = createTrainingLog({
      exercise,
      setsCompleted: stoppedEarly ? completedSets : exercise.sets,
      repsCompleted: stoppedEarly ? completedRepCount() : exercise.reps,
      painBefore,
      painAfter,
      difficultyRating,
      stoppedEarly,
      recoveryMode: useRecoveryMode,
      notes,
      stopReason,
    });

    saveLog(log);
    navigate('/logs');
  }

  function saveAndExit(): void {
    if (!canSaveExitLog || !hasPainValue(painBefore) || !hasPainValue(painAfter)) return;

    const log = createTrainingLog({
      exercise,
      setsCompleted: completedSets,
      repsCompleted: completedRepCount(),
      painBefore,
      painAfter,
      difficultyRating,
      stoppedEarly: true,
      recoveryMode: useRecoveryMode,
      notes,
      stopReason: 'user_exit',
    });

    saveLog(log);
    navigate('/logs');
  }

  function exitWithoutSaving(): void {
    setExitDialogOpen(false);
    onNavigateBack();
  }

  function openExitDialog(trigger: HTMLButtonElement | null): void {
    lastExitTriggerRef.current = trigger;
    setExitDialogOpen(true);
  }

  function handleBack(): void {
    if (hasStartedExercise) {
      openExitDialog(backButtonRef.current);
      return;
    }

    onNavigateBack();
  }

  const sessionHeader = (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <button
        ref={backButtonRef}
        type="button"
        onClick={handleBack}
        className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-700"
      >
        <ArrowLeft size={18} />
        {t('session.back')}
      </button>
      {hasStartedExercise ? (
        <button
          ref={exitButtonRef}
          type="button"
          onClick={() => openExitDialog(exitButtonRef.current)}
          className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-red-200 bg-red-50 px-4 font-bold text-red-700"
        >
          {t('session.exitSession')}
        </button>
      ) : null}
    </div>
  );

  const exitDialog = exitDialogOpen ? (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-5 sm:items-center sm:justify-center sm:py-5" role="dialog" aria-modal="true" aria-labelledby="session-exit-title" aria-describedby="session-exit-description">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle size={22} />
          <h2 id="session-exit-title" className="text-xl font-bold">{t('session.exitTitle')}</h2>
        </div>
        <p id="session-exit-description" className="mt-3 text-slate-700">{t('session.exitConfirmCopy')}</p>
        {hasStartedExercise ? (
          <div className="mt-4 space-y-3">
            <PainScale label={t('session.painAfter')} value={painAfter} onChange={setPainAfter} zeroLabel={t('session.confirmNoPain')} />
            {!hasPainValue(painAfter) ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {t('session.exitPainAfterRequired')}
              </div>
            ) : null}
            {painAfterWarning ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {t('session.painAfterWarning')}
              </div>
            ) : null}
          </div>
        ) : null}
        {!hasPainValue(painBefore) ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {t('session.painRequiredBefore')}
          </div>
        ) : null}
        <div className="mt-5 grid gap-2">
          <button
            ref={continueSessionButtonRef}
            type="button"
            onClick={() => setExitDialogOpen(false)}
            className="focus-ring min-h-11 rounded-md bg-calm-700 px-4 font-bold text-white"
          >
            {t('session.continueSession')}
          </button>
          <button
            type="button"
            disabled={!canSaveExitLog}
            onClick={saveAndExit}
            className="focus-ring min-h-11 rounded-md border border-calm-200 bg-calm-50 px-4 font-bold text-calm-800 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {t('session.saveAndExit')}
          </button>
          <button
            type="button"
            onClick={exitWithoutSaving}
            className="focus-ring min-h-11 rounded-md border border-red-300 bg-white px-4 font-bold text-red-700"
          >
            {t('session.exitWithoutSaving')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (phase === 'before') {
    return (
      <>
        {sessionHeader}
        {exitDialog}
        <section className="card space-y-5 p-4">
          <h1 className="text-2xl font-bold text-ink">{exercise.title}</h1>
          <PainScale label={t('session.painBefore')} value={painBefore} onChange={setPainBefore} zeroLabel={t('session.confirmNoPain')} />
          {!hasPainValue(painBefore) ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              {t('session.painRequiredBefore')}
            </div>
          ) : null}
          {recoveryModeSuggested ? (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <p>{t('session.recoveryCopy')}</p>
              {recoverySuggestion ? <p className="font-semibold">{t('session.recoverySuggestion', { value: recoverySuggestion })}</p> : null}
              <label className="flex min-h-11 items-center gap-3 rounded-md bg-white/70 px-3 font-bold">
                <input type="checkbox" checked={useRecoveryMode} onChange={(event) => setUseRecoveryMode(event.target.checked)} className="h-5 w-5 accent-calm-600" />
                {t('session.useRecoveryMode')}
              </label>
            </div>
          ) : null}
          {painBlocksStart ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {t('session.painBlockCopy')}
            </div>
          ) : null}
          <button
            disabled={!canStart}
            type="button"
            onClick={() => setPhase('active')}
            className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300"
          >
            {t('session.start')}
          </button>
        </section>
      </>
    );
  }

  if (phase === 'finish') {
    return (
      <>
        {sessionHeader}
        {exitDialog}
        <section className="card space-y-5 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-calm-700" />
            <h1 className="text-2xl font-bold text-ink">{t('session.finishTitle')}</h1>
          </div>
          <PainScale label={t('session.painAfter')} value={painAfter} onChange={setPainAfter} zeroLabel={t('session.confirmNoPain')} />
          {!hasPainValue(painAfter) ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
              {t('session.painRequiredAfter')}
            </div>
          ) : null}
          {painAfterWarning ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              {t('session.painAfterWarning')}
            </div>
          ) : null}
          <label className="block">
            <span className="mb-2 block font-semibold text-slate-800">{t('session.difficulty')}</span>
            <input className="h-11 w-full accent-calm-500" type="range" min="1" max="5" value={difficultyRating} onChange={(event) => setDifficultyRating(Number(event.target.value))} aria-valuetext={t('session.currentDifficulty', { value: difficultyRating })} />
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
          <button type="button" disabled={!canSaveLog} onClick={completeLog} className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300">
            {t('session.saveLog')}
          </button>
        </section>
      </>
    );
  }

  return (
    <>
      {sessionHeader}
      {exitDialog}
      <section className="card space-y-5 p-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{exercise.title}</h1>
          <p className="mt-1 text-slate-600">{t('session.activeHint')}</p>
        </div>
        {useRecoveryMode ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900">
            {t('session.recoveryActive')}
          </div>
        ) : null}
        <div className="rounded-lg bg-calm-100 p-5 text-center" role="status" aria-live="polite" aria-label={t('session.progressA11y', { set: currentSet, sets: exercise.sets, reps: exercise.reps })}>
          <div className="text-sm font-semibold text-calm-700">{t('session.currentProgress')}</div>
          <div className="mt-1 text-4xl font-bold text-calm-700">{t('session.setProgressText', { set: currentSet, sets: exercise.sets })}</div>
          <div className="mt-1 text-lg font-semibold text-slate-800">{t('session.repInstruction', { reps: exercise.reps })}</div>
          <div className="mt-1 text-slate-700">{t('session.targetText', { sets: exercise.sets, reps: exercise.reps })}</div>
        </div>
        <ol className="space-y-2">
          {exercise.steps.map((step) => (
            <li key={step} className="rounded-md bg-slate-50 p-3 text-slate-700">{step}</li>
          ))}
        </ol>
        {resting ? (
          <div className="space-y-3">
            <RestTimer seconds={exercise.restSeconds} autoStartKey={restTimerKey} />
            <button type="button" onClick={startNextSet} className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white">
              {t('session.nextSet')}
            </button>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <button type="button" onClick={completeSet} disabled={resting} className="focus-ring min-h-11 rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300">
            {currentSet >= exercise.sets ? t('session.completeSession') : t('session.completeSet')}
          </button>
          <button type="button" onClick={stopEarly} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-3 font-bold text-red-700">
            <AlertTriangle size={18} />
            {t('session.stopSession')}
          </button>
        </div>
      </section>
    </>
  );
}
