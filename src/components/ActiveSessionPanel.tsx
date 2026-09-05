import { AlertTriangle, ChevronDown } from 'lucide-react';
import type { Exercise } from '../types/rehab';
import { useI18n } from '../services/i18n';
import RestTimer from './RestTimer';

interface ActiveSessionPanelProps {
  exercise: Exercise;
  currentSet: number;
  resting: boolean;
  restTimerKey: number;
  useRecoveryMode: boolean;
  onCompleteSet: () => void;
  onNextSet: () => void;
  onStop: () => void;
}

export default function ActiveSessionPanel({
  exercise,
  currentSet,
  resting,
  restTimerKey,
  useRecoveryMode,
  onCompleteSet,
  onNextSet,
  onStop,
}: ActiveSessionPanelProps) {
  const { t } = useI18n();

  return (
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

      <div
        className="rounded-lg bg-calm-100 p-5 text-center"
        role="status"
        aria-live="polite"
        aria-label={t('session.progressA11y', { set: currentSet, sets: exercise.sets, reps: exercise.reps })}
      >
        <div className="text-sm font-semibold text-calm-700">{t('session.currentProgress')}</div>
        <div className="mt-1 text-4xl font-bold text-calm-700">{t('session.setProgressText', { set: currentSet, sets: exercise.sets })}</div>
        <div className="mt-1 text-xl font-bold text-slate-800">{t('session.repInstruction', { reps: exercise.reps })}</div>
      </div>

      {resting ? (
        <RestTimer seconds={exercise.restSeconds} autoStartKey={restTimerKey} />
      ) : (
        <div className="rounded-lg border-l-4 border-calm-600 bg-white px-4 py-3 shadow-sm">
          <div className="text-sm font-bold text-calm-700">{t('session.currentCue')}</div>
          <p className="mt-1 text-lg font-semibold leading-7 text-ink">{exercise.steps[0]}</p>
        </div>
      )}

      <details className="group rounded-lg border border-slate-200 bg-white">
        <summary className="focus-ring flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 font-bold text-slate-800">
          {t('session.instructionsAndSafety')}
          <ChevronDown className="shrink-0 transition-transform group-open:rotate-180" size={20} aria-hidden="true" />
        </summary>
        <div className="space-y-4 border-t border-slate-200 px-4 py-4">
          <div>
            <h2 className="font-bold text-ink">{t('session.stepsTitle')}</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-slate-700">
              {exercise.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div>
            <h2 className="font-bold text-ink">{t('session.cautionsTitle')}</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-700">
              {exercise.cautions.map((caution) => <li key={caution}>{caution}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-red-800">{t('session.stopRulesTitle')}</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-red-800">
              {exercise.stopRules.map((rule) => <li key={rule}>{rule}</li>)}
            </ul>
          </div>
        </div>
      </details>

      <div className="sticky bottom-[calc(64px+env(safe-area-inset-bottom))] z-20 -mx-1 grid gap-2 rounded-lg border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur min-[769px]:static min-[769px]:mx-0 min-[769px]:grid-cols-2 min-[769px]:border-0 min-[769px]:bg-transparent min-[769px]:p-0 min-[769px]:shadow-none">
        <button
          type="button"
          onClick={resting ? onNextSet : onCompleteSet}
          className="focus-ring min-h-12 rounded-md bg-calm-700 px-4 py-3 font-bold text-white"
        >
          {resting
            ? t('session.nextSet')
            : currentSet >= exercise.sets
              ? t('session.completeSession')
              : t('session.completeSet')}
        </button>
        <button type="button" onClick={onStop} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 py-3 font-bold text-red-700">
          <AlertTriangle size={18} aria-hidden="true" />
          {t('session.stopSession')}
        </button>
      </div>
    </section>
  );
}
