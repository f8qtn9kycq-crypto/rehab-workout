import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useI18n } from '../services/i18n';
import type { Exercise } from '../types/rehab';
import { getLocalizedExercise } from '../utils/localizedExercise';
import YouTubeEmbed from './YouTubeEmbed';

export default function ExerciseDetailModal({
  exercise,
  isOpen,
  onClose,
}: {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language, t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !exercise || !dialog) return;

    const opener = document.activeElement;
    dialog.showModal();

    contentRef.current?.scrollTo({ left: 0, top: 0 });
    closeButtonRef.current?.focus();

    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [exercise?.id, isOpen]);

  if (!isOpen || !exercise) return null;

  const displayExercise = getLocalizedExercise(exercise, language);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none items-end border-0 bg-transparent p-0 backdrop:bg-slate-950/70 open:flex md:items-center md:p-6"
      aria-labelledby="exercise-video-title"
      aria-describedby="exercise-video-description"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], iframe'));
        const current = controls.findIndex(control => control === document.activeElement);
        if (current < 0 || controls.length === 0) return;
        event.preventDefault();
        const next = (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
        controls[next].focus();
      }}
    >
      <div ref={contentRef} className="safe-bottom max-h-[92vh] w-full overflow-auto rounded-t-xl bg-white p-4 shadow-soft md:mx-auto md:max-w-3xl md:rounded-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="exercise-video-title" className="text-xl font-bold text-ink">{displayExercise.title}</h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('actions.close')}
            className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>
        <YouTubeEmbed
          title={displayExercise.title}
          url={exercise.youtubeEmbedUrl}
          fallbackUrl={exercise.youtubeSearchUrl}
          active={isOpen}
        />
        <p id="exercise-video-description" className="mt-4 text-slate-700">{displayExercise.detail}</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <h3 className="font-bold text-slate-900">{t('detail.safetyCautions')}</h3>
          <ul className="mt-2 space-y-1 text-slate-700">
            {displayExercise.cautions.map((caution) => <li key={caution}>- {caution}</li>)}
          </ul>
        </div>
      </div>
    </dialog>
  );
}
