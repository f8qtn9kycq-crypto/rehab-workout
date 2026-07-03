import { Clock, Dumbbell, Layers3, MapPin, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import ExerciseDetailModal from '../components/ExerciseDetailModal';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { useI18n } from '../services/i18n';
import { getExerciseById, getExerciseEquipment } from '../utils/exerciseModel';
import { getLocalizedExercise } from '../utils/localizedExercise';

export default function ExerciseDetailPage() {
  const { exerciseId } = useParams();
  const location = useLocation();
  const { language, t } = useI18n();
  const exercise = getExerciseById(exerciseId);
  const [modalOpen, setModalOpen] = useState(false);
  const backTarget = `/exercises${location.search}`;

  useEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [exerciseId]);

  if (!exercise) return <Navigate to="/exercises" replace />;

  const displayExercise = getLocalizedExercise(exercise, language);
  const stopRules = displayExercise.stopRules.length > 0 ? displayExercise.stopRules : [t('detail.defaultStopRule')];
  const regressions = displayExercise.regressions.length > 0 ? displayExercise.regressions : [t('detail.defaultStopRule')];
  const progressions = displayExercise.progressions.length > 0 ? displayExercise.progressions : [];
  const equipmentBadges = getExerciseEquipment(exercise);
  const sectionLinks = [
    ['overview', t('detail.sectionOverview')],
    ['steps', t('detail.sectionSteps')],
    ['safety', t('detail.sectionSafety')],
    ['adjustments', t('detail.sectionAdjustments')],
    ['start', t('detail.sectionStart')],
  ] as const;

  return (
    <div className="page space-y-5">
      <div className="sticky top-0 z-20 -mx-4 space-y-2 bg-slate-50/95 px-4 py-2 backdrop-blur md:top-[72px]">
        <Link
          to={backTarget}
          className="focus-ring inline-flex min-h-12 w-full items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white sm:w-auto"
        >
          {t('detail.backToLibrary')}
        </Link>
        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5" aria-label={t('detail.sectionNavLabel')}>
          {sectionLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-center text-sm font-bold text-slate-700">
              {label}
            </a>
          ))}
        </nav>
      </div>
      <section id="overview" className="card scroll-mt-40 space-y-5 p-4">
        <h2 className="text-xl font-bold text-ink">{t('detail.sectionOverview')}</h2>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="inline-flex items-center gap-1 rounded-md bg-calm-100 px-2 py-1 text-calm-700"><MapPin size={14} />{t(`bodyAreas.${exercise.bodyArea}.label`)}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700"><Layers3 size={14} />{t(`typeLabels.${exercise.type}`)}</span>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`levelLabels.${exercise.level}`)}</span>
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700"><Clock size={14} />{displayExercise.durationText}</span>
          {equipmentBadges.slice(0, 2).map((equipment) => (
            <span key={equipment} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700"><Dumbbell size={14} />{t(`equipmentLabels.${equipment}`)}</span>
          ))}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-ink">{displayExercise.title}</h1>
          <p className="mt-2 text-lg text-slate-600">{displayExercise.description}</p>
        </div>
        <YouTubeEmbed title={displayExercise.title} url={exercise.youtubeEmbedUrl} fallbackUrl={exercise.youtubeSearchUrl} />
        <button onClick={() => setModalOpen(true)} className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 font-bold text-slate-800">
          <PlayCircle size={20} />
          {t('detail.enlargeVideo')}
        </button>
        <div className="rounded-lg bg-slate-50 p-3 text-slate-700">
          <p>{displayExercise.detail}</p>
          <p className="mt-3"><strong>{t('detail.benefits')}:</strong> {displayExercise.benefits}</p>
        </div>
      </section>
      <section id="steps" className="card scroll-mt-40 p-4">
        <h2 className="text-xl font-bold text-ink">{t('detail.sectionSteps')}</h2>
        <ol className="mt-3 space-y-2">
          {displayExercise.steps.map((step, index) => (
            <li key={step} className="rounded-md bg-slate-50 p-3 text-slate-700">{index + 1}. {step}</li>
          ))}
        </ol>
      </section>
      <section id="safety" className="card scroll-mt-40 space-y-4 p-4">
        <h2 className="text-xl font-bold text-ink">{t('detail.sectionSafety')}</h2>
        <div>
          <h3 className="font-bold text-slate-900">{t('detail.safetyCautions')}</h3>
          <ul className="mt-2 space-y-1 text-slate-700">
            {displayExercise.cautions.map((caution) => <li key={caution}>- {caution}</li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{t('detail.stopRules')}</h3>
          <ul className="mt-2 space-y-1 text-slate-700">
            {stopRules.map((rule) => <li key={rule}>- {rule}</li>)}
          </ul>
        </div>
      </section>
      <section id="adjustments" className="card scroll-mt-40 space-y-4 p-4">
        <h2 className="text-xl font-bold text-ink">{t('detail.sectionAdjustments')}</h2>
        <div>
          <h3 className="font-bold text-slate-900">{t('detail.regressions')}</h3>
          <ul className="mt-2 space-y-1 text-slate-700">
            {regressions.map((regression) => <li key={regression}>- {regression}</li>)}
          </ul>
        </div>
        {progressions.length > 0 ? (
          <div>
            <h3 className="font-bold text-slate-900">{t('detail.progressions')}</h3>
            <ul className="mt-2 space-y-1 text-slate-700">
              {progressions.map((progression) => <li key={progression}>- {progression}</li>)}
            </ul>
          </div>
        ) : null}
      </section>
      <section id="start" className="card scroll-mt-40 space-y-4 p-4">
        <h2 className="text-xl font-bold text-ink">{t('detail.sectionStart')}</h2>
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
        <Link to={`/session/${exercise.id}`} className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">
          {t('detail.startSession')}
        </Link>
      </section>
      <ExerciseDetailModal exercise={exercise} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
