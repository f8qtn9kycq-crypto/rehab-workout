import { Link, Navigate, useParams } from 'react-router-dom';
import SessionTracker from '../components/SessionTracker';
import { useI18n } from '../services/i18n';
import { getExerciseById } from '../utils/exerciseModel';
import { canEnterSession, getSafetyStatus, isSafetyGateCurrentForToday } from '../utils/safety';

export default function SessionPage() {
  const { exerciseId } = useParams();
  const { t } = useI18n();
  const exercise = getExerciseById(exerciseId);
  const safety = getSafetyStatus();

  if (!exercise) return <Navigate to="/exercises" replace />;

  if (!isSafetyGateCurrentForToday(safety)) {
    return (
      <div className="page">
        <section className="card space-y-4 p-4">
          <h1 className="text-2xl font-bold text-ink">{t('session.safetyRequiredTitle')}</h1>
          <p className="text-slate-600">{t('session.safetyRequiredBody')}</p>
          <Link to="/safety" className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">
            {t('session.goSafety')}
          </Link>
        </section>
      </div>
    );
  }

  if (!canEnterSession(safety)) {
    return (
      <div className="page">
        <section className="card space-y-4 border-red-200 bg-red-50 p-4">
          <h1 className="text-2xl font-bold text-red-800">{t('session.blockedTitle')}</h1>
          <p className="text-red-800">{t('session.blockedBody')}</p>
          <Link to="/safety" className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-white px-4 font-bold text-red-800">
            {t('session.redoSafety')}
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <SessionTracker exercise={exercise} />
    </div>
  );
}
