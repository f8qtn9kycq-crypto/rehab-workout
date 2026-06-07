import { X } from 'lucide-react';
import { useI18n } from '../services/i18n';
import type { Exercise } from '../types/rehab';
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
  const { t } = useI18n();

  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/70 p-0 md:items-center md:p-6" role="dialog" aria-modal="true">
      <div className="safe-bottom max-h-[92vh] w-full overflow-auto rounded-t-xl bg-white p-4 shadow-soft md:mx-auto md:max-w-3xl md:rounded-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">{exercise.title}</h2>
          <button onClick={onClose} className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-slate-100">
            <X size={22} />
          </button>
        </div>
        <YouTubeEmbed
          title={exercise.title}
          url={exercise.youtubeEmbedUrl}
          fallbackUrl={exercise.youtubeSearchUrl}
          active={isOpen}
        />
        <p className="mt-4 text-slate-700">{exercise.detail}</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3">
          <h3 className="font-bold text-slate-900">{t('detail.safetyCautions')}</h3>
          <ul className="mt-2 space-y-1 text-slate-700">
            {exercise.cautions.map((caution) => <li key={caution}>- {caution}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
