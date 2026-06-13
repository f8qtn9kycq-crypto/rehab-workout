import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import type { Exercise } from '../types/rehab';
import { getExerciseEquipment } from '../utils/exerciseModel';

export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const location = useLocation();
  const { t } = useI18n();
  const detailSearch = location.pathname === '/exercises' ? location.search : '';
  const equipmentBadges = getExerciseEquipment(exercise);

  return (
    <article className="card flex h-full flex-col p-4">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        <span className="rounded-md bg-calm-100 px-2 py-1 text-calm-700">{t(`bodyAreas.${exercise.bodyArea}.label`)}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`typeLabels.${exercise.type}`)}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`levelLabels.${exercise.level}`)}</span>
      </div>
      <h3 className="mt-3 text-xl font-bold text-ink">{exercise.title}</h3>
      <p className="mt-2 flex-1 text-base text-slate-600">{exercise.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {equipmentBadges.map((equipment) => (
          <span key={equipment} className="rounded-md bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700">
            {t(`equipmentLabels.${equipment}`)}
          </span>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-md bg-slate-50 p-2">
          <strong className="block text-slate-900">{exercise.sets}</strong>{t('exercises.setsUnit')}
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <strong className="block text-slate-900">{exercise.reps}</strong>{t('exercises.repsUnit')}
        </div>
        <div className="rounded-md bg-slate-50 p-2">
          <strong className="block text-slate-900">{exercise.restSeconds}</strong>{t('exercises.restUnit')}
        </div>
      </div>
      <Link
        to={`/exercise/${exercise.id}${detailSearch}`}
        className="focus-ring mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-calm-700 px-4 font-semibold text-white"
      >
        {t('exercises.viewDetail')}
      </Link>
    </article>
  );
}
