import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { getSavedRoutineContext } from '../utils/savedRoutineNavigation';

export default function SavedRoutineReturnLink({ exerciseId }: { exerciseId: string }) {
  const { search } = useLocation();
  const { t } = useI18n();
  const routine = getSavedRoutineContext(search, exerciseId);
  if (!routine) return null;
  return <Link to={`/routine#${routine.id}`} className="focus-ring inline-flex min-h-11 max-w-full items-center break-words rounded-md border border-calm-700 px-3 py-2 font-bold text-calm-800">
    {t('savedRoutine.returnTo', { name: routine.name })}
  </Link>;
}
