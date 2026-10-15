import { Link, useLocation } from 'react-router-dom';
import ActivityPlan, { revealWeeklyScheduleEditor } from '../components/ActivityPlan';
import SavedRoutinePicker from '../components/SavedRoutinePicker';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { useI18n } from '../services/i18n';

export default function RoutinePage() {
  const { t } = useI18n();
  const { search } = useLocation();
  return (
    <div className="page space-y-5">
      <section className="card space-y-3 p-4">
        <h1 className="text-2xl font-bold">{t('nav.routine')}</h1>
        <p>{t('weeklySchedule.explanation')}</p>
        <Link to={{ search, hash: '#weekly-schedule' }} onClick={revealWeeklyScheduleEditor} className="focus-ring inline-flex min-h-11 items-center font-bold text-calm-800 underline">{t('weeklySchedule.edit')}</Link>
        <ActivityPlan />
      </section>
      <SavedRoutinePicker />
      <WeeklyRoutineBuilder />
    </div>
  );
}
