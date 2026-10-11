import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { exercises } from '../data/exercises';
import { useI18n } from '../services/i18n';
import { readFavorites } from '../services/favoriteStorage';
import { readSavedRoutines } from '../services/savedRoutineStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';
const catalog = new Map(exercises.map(exercise => [exercise.id, exercise]));
export default function HomeSavedPlans() {
  const { t, language } = useI18n();
  const [plans, setPlans] = useState(readSavedRoutines);
  const [favorites, setFavorites] = useState(readFavorites);
  useEffect(() => {
    const refresh = () => { setPlans(readSavedRoutines()); setFavorites(readFavorites()); };
    window.addEventListener('storage', refresh);
    window.addEventListener('rehab:favorites', refresh);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('rehab:favorites', refresh); };
  }, []);
  const favoriteCount = favorites.ids.filter(id => catalog.has(id)).length;
  const link = 'focus-ring inline-flex min-h-11 items-center font-bold text-calm-800 underline';
  return <>
    <section className="card mx-auto max-w-xl space-y-3 p-5" aria-labelledby="home-plans-title">
      <h2 id="home-plans-title" className="text-xl font-bold">{t('homePlans.title')}</h2>
      {plans.error ? <p role="alert">{t('savedRoutine.readError')}</p> : plans.routines.length === 0 ? <p>{t('homePlans.empty')}</p> : [...plans.routines].reverse().slice(0, 3).map(plan => <details key={plan.id} className="rounded-md border border-slate-200 p-3">
        <summary className="focus-ring min-h-11 cursor-pointer break-words py-2 font-bold">{plan.name} · {t('homePlans.count', { count: plan.exerciseIds.length })}</summary>
        <ol className="list-inside list-decimal space-y-2">{plan.exerciseIds.map(id => {
          const exercise = catalog.get(id);
          return <li key={id} className="break-words">{exercise ? <Link className={link} to={`/exercise/${id}?mode=all`}>{getLocalizedExercise(exercise, language).title}</Link> : <span>{t('savedRoutine.missing', { id })}</span>}</li>;
        })}</ol>
        <Link className={link} to={`/routine?edit=${encodeURIComponent(plan.id)}`}>{t('savedRoutine.edit')}</Link>
      </details>)}
      <div className="flex flex-wrap gap-4">
        <Link className={link} to="/routine">{t('homePlans.all')}</Link>
        <Link className={link} to="/routine?new=1">{t(plans.routines.length ? 'homePlans.create' : 'homePlans.fromFavorites')}</Link>
      </div>
    </section>
    <section className="card mx-auto max-w-xl space-y-2 p-5" aria-labelledby="home-favorites-title">
      <h2 id="home-favorites-title" className="text-xl font-bold">{t('favorites.section')}</h2>
      {favorites.error ? <p role="alert">{t('favorites.error')}</p> : <Link className={link} to={favoriteCount ? '/routine#saved-routine-title' : '/exercises?mode=all'}>{favoriteCount ? t('homePlans.favorites', { count: favoriteCount }) : t('homePlans.find')}</Link>}
    </section>
  </>;
}
