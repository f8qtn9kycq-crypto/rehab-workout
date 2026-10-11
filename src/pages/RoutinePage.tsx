import SavedRoutinePicker from '../components/SavedRoutinePicker';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { useI18n } from '../services/i18n';

export default function RoutinePage() {
  const { t } = useI18n();
  return (
    <div className="page space-y-5">
      <h1 className="sr-only">{t('nav.routine')}</h1>
      <SavedRoutinePicker />
      <WeeklyRoutineBuilder />
    </div>
  );
}
