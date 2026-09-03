import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { useI18n } from '../services/i18n';

export default function RoutinePage() {
  const { t } = useI18n();
  return (
    <div className="page">
      <h1 className="sr-only">{t('nav.routine')}</h1>
      <WeeklyRoutineBuilder />
    </div>
  );
}
