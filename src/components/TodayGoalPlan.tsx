import { useState } from 'react';
import { useI18n } from '../services/i18n';
import { readActivities, readActivityPlan } from '../services/activityStorage';
import { getLogs } from '../services/logService';
import { readManualWorkouts } from '../services/manualWorkoutStorage';
import { GOAL_CATEGORIES, readTrainingGoals, saveTrainingGoals } from '../services/trainingGoalStorage';
import { buildRecordsPresentation } from '../utils/recordsPresentation';
import { buildTodayPlan } from '../utils/todayPlan';

export default function TodayGoalPlan() {
  const { t } = useI18n();
  const [state, setState] = useState(readTrainingGoals);
  const [draft, setDraft] = useState(state.goals);
  const [message, setMessage] = useState<'saved' | 'error' | null>(null);
  const plan = readActivityPlan();
  const activities = readActivities();
  const manual = readManualWorkouts();
  const records = buildRecordsPresentation(getLogs(), activities.activities, [], new Date(), manual.workouts);
  const today = buildTodayPlan(plan.error ? [] : plan.days, records);
  return <section className="card mx-auto max-w-xl space-y-3 p-5" aria-labelledby="today-plan-title">
    <h2 id="today-plan-title" className="text-xl font-bold">{t('goalPlan.title')}</h2>
    <p>{t('goalPlan.planned')}: {plan.error ? t('goalPlan.unavailable') : today.planned.map(name => t(`activities.planNames.${name}`)).join(' · ') || t('activities.rest')}</p>
    <p>{t('goalPlan.actualFocus')}: {today.focuses.map(name => t(`goalPlan.focusNames.${name}`)).join(' · ') || t('goalPlan.noFocus')}</p>
    <p className="text-sm leading-6">{t('goalPlan.flexible')}</p>
    <p className="text-sm">{today.sources.map(({ source, count }) => `${t(`records.sources.${source}`)}: ${count}`).join(' · ')}</p>
    <p className="text-sm leading-6">{t('goalPlan.unit')}</p>
    <ul className="space-y-2">{GOAL_CATEGORIES.map(category => <li key={category}>
      <strong>{t(`records.categories.${category}`)}</strong>: {t('goalPlan.progress', { actual: records.weeklyCategoryDays[category], target: state.goals[category] ?? t('goalPlan.unset') })}
    </li>)}</ul>
    {(state.error || plan.error || activities.error || manual.error) && <p role="alert" className="text-red-800">{t('goalPlan.readError')}</p>}
    <details><summary className="focus-ring min-h-11 cursor-pointer py-3 font-bold">{t('goalPlan.edit')}</summary>
      <p className="text-sm leading-6">{t('goalPlan.intent')}</p>
      <form className="mt-3 space-y-3" onSubmit={event => {
        event.preventDefault();
        const ok = saveTrainingGoals(draft);
        setMessage(ok ? 'saved' : 'error');
        if (ok) setState(readTrainingGoals());
      }}>
        {GOAL_CATEGORIES.map(category => <label key={category} className="block font-bold">{t(`records.categories.${category}`)}
          <input type="number" min="0" max="7" step="1" disabled={state.error} value={draft[category] ?? ''} onChange={event => { setMessage(null); setDraft(current => ({ ...current, [category]: event.target.value === '' ? null : Number(event.target.value) })); }} className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white p-3" />
        </label>)}
        <button type="submit" disabled={state.error} className="focus-ring min-h-11 rounded-md bg-calm-700 px-4 font-bold text-white">{t('goalPlan.save')}</button>
        {message && <p role={message === 'error' ? 'alert' : 'status'}>{t(`goalPlan.${message}`)}</p>}
      </form>
    </details>
  </section>;
}
