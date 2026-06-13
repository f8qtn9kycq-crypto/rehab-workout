import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { useI18n } from '../services/i18n';
import { getExerciseById, getExerciseEquipment } from '../utils/exerciseModel';

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const location = useLocation();
  const { t } = useI18n();
  const exercise = getExerciseById(exerciseId);
  const [modalOpen, setModalOpen] = useState(false);
  const backTarget = `/exercises${location.search}`;

  if (!exercise) return <Navigate to="/exercises" replace />;

  const stopRules = exercise.stopRules.length > 0 ? exercise.stopRules : [t('detail.defaultStopRule')];
  const regressions = exercise.regressions.length > 0 ? exercise.regressions : [t('detail.defaultStopRule')];
  const equipmentBadges = getExerciseEquipment(exercise);

  return (
    <div className="page space-y-5">
      <div className="sticky top-0 z-20 -mx-4 bg-slate-50/95 px-4 py-2 backdrop-blur md:top-[72px]">
        <Link
          to={backTarget}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white sm:w-auto"
        >
          {t('detail.backToLibrary')}
        </Link>
      </div>
      <section className="card space-y-5 p-4">
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="rounded-md bg-calm-100 px-2 py-1 text-calm-700">{t(`bodyAreas.${exercise.bodyArea}.label`)}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`typeLabels.${exercise.type}`)}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`levelLabels.${exercise.level}`)}</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{exercise.title}</h1>
          <p className="mt-2 text-lg text-slate-600">{exercise.detail}</p>
        </div>
        <YouTubeEmbed title={exercise.title} url={exercise.youtubeEmbedUrl} fallbackUrl={exercise.youtubeSearchUrl} />
        <button onClick={() => setModalOpen(true)} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-800">
          <PlayCircle size={20} />
          {t('detail.enlargeVideo')}
        </button>
      </section>
      <section className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <div className="card p-4">
          <h2 className="text-xl font-bold text-ink">{t('detail.steps')}</h2>
          <ol className="mt-3 space-y-2">
            {exercise.steps.map((step, index) => (
              <li key={step} className="rounded-md bg-slate-50 p-3 text-slate-700">{index + 1}. {step}</li>
            ))}
          </ol>
        </div>
        <div className="card space-y-4 p-4">
          <h2 className="text-xl font-bold text-ink">{t('detail.trainingSettings')}</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-md bg-slate-50 p-2"><strong className="block text-xl">{exercise.sets}</strong>{t('exercises.setsUnit')}</div>
            <div className="rounded-md bg-slate-50 p-2"><strong className="block text-xl">{exercise.reps}</strong>{t('exercises.repsUnit')}</div>
            <div className="rounded-md bg-slate-50 p-2"><strong className="block text-xl">{exercise.restSeconds}</strong>{t('exercises.restUnit')}</div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('detail.equipment')}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
              {equipmentBadges.map((equipment) => (
                <span key={equipment} className="rounded-md bg-slate-50 px-2 py-1">{t(`equipmentLabels.${equipment}`)}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('detail.safetyCautions')}</h3>
            <ul className="mt-2 space-y-1 text-slate-700">
              {exercise.cautions.map((caution) => <li key={caution}>- {caution}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('detail.stopRules')}</h3>
            <ul className="mt-2 space-y-1 text-slate-700">
              {stopRules.map((rule) => <li key={rule}>- {rule}</li>)}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{t('detail.regressions')}</h3>
            <ul className="mt-2 space-y-1 text-slate-700">
              {regressions.map((regression) => <li key={regression}>- {regression}</li>)}
            </ul>
          </div>
          <Link to={`/session/${exercise.id}`} className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">
            {t('detail.startSession')}
          </Link>
        </div>
      </section>
      <ExerciseDetailModal exercise={exercise} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
