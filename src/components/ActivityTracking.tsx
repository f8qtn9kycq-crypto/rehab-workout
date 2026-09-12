import ActivityPlan from './ActivityPlan';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { activityId, FOCUSES, localDate, readActivities, RESPONSES, saveActivity, weeklyActivities, type Activity, type Response } from '../services/activityStorage';
import { getLocalizedTrainingLogTitle } from '../utils/localizedExercise';

export default function ActivityTracking() {
  const { t, language } = useI18n();
  const [state, setState] = useState(readActivities);
  const [kind, setKind] = useState<Activity['kind'] | null>(null);
  const [id, setId] = useState(activityId);
  const [date, setDate] = useState(localDate());
  const [minutes, setMinutes] = useState('');
  const [focus, setFocus] = useState<typeof FOCUSES[number]>('mixed');
  const [completed, setCompleted] = useState(true);
  const [response, setResponse] = useState<Response | ''>('');
  const [links, setLinks] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const summary = weeklyActivities(state.activities);
  const usedIds = state.activities.flatMap(a => a.kind === 'resistance' ? a.exerciseLogIds : []);
  const logs = getLogs();
  const available = logs.filter(log => localDate(new Date(log.date)) === date && !usedIds.includes(log.id));
  const selected = available.filter(log => links.includes(log.id));
  const logWarning = selected.some(log => log.painAfter >= 6 || log.painBefore >= 6 || log.stoppedEarly || log.painAfter > 3 || log.painAfter > log.painBefore);
  const control = 'focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white p-3';
  const button = `${control} font-bold text-calm-800`;

  function refresh(ok: boolean) {
    setMessage(ok ? 'saved' : 'error');
    if (ok) setState(readActivities());
  }
  function save() {
    if (!kind || !response || minutes.trim() === '') return;
    const symptomResponse = selected.some(log => log.painAfter >= 6 || log.painBefore >= 6) ? 'red_flag' : logWarning && response !== 'red_flag' ? 'worse' : response;
    const base = { id, date, actualMinutes: Number(minutes), completed, symptomResponse };
    const activity: Activity = kind === 'cycling' ? { ...base, kind } : { ...base, kind, primaryFocus: focus, exerciseLogIds: links };
    const ok = saveActivity(activity);
    refresh(ok);
    if (ok) { setKind(null); setId(activityId()); setLinks([]); setResponse(''); setMinutes(''); }
  }
  const feedbackText = t('activities.feedback', { worse: summary.current.filter(a => ['worse', 'red_flag'].includes(a.symptomResponse) || ['worse', 'red_flag'].includes(a.nextDayResponse ?? '')).length, missing: summary.current.filter(a => !a.nextDayResponse).length });
  const copyText = t('activities.summary', { resistance: summary.resistance, cycling: summary.cycling, minutes: summary.cyclingMinutes }) + ' ' + feedbackText + ' ' + t(`activities.recommendations.${summary.recommendation}`);
  return <section className="card mx-auto w-full max-w-xl space-y-4 p-5" aria-labelledby="activities-title">
    <h2 id="activities-title" className="text-xl font-bold">{t('activities.title')}</h2>
    <p>{t('activities.summary', { resistance: summary.resistance, cycling: summary.cycling, minutes: summary.cyclingMinutes })}</p>
    <p className="text-sm text-slate-600">{t('activities.legacy')}</p>
    <p className="text-sm">{feedbackText}</p>
    <p className="rounded-md bg-amber-50 p-3">{t(`activities.recommendations.${summary.recommendation}`)}</p>
    <div className="grid gap-2 sm:grid-cols-2">
      <button className={button} onClick={() => { setKind('resistance'); setMinutes(''); }}>{t('activities.resistance')}</button>
      <button className={button} onClick={() => { setKind('cycling'); setLinks([]); setMinutes('15'); }}>{t('activities.cycling')}</button>
    </div>
    {state.error && <p role="alert">{t('activities.error')}</p>}
    {kind && <form className="space-y-4" onSubmit={event => { event.preventDefault(); save(); }}>
      <p>{t('activities.recordOnly')}</p>
      {kind === 'resistance' && <Link className={button + ' block text-center'} to="/safety">{t('activities.startSafely')}</Link>}
      <label className="block">{t('activities.date')}<input className={control} type="date" required max={localDate()} value={date} onChange={e => { setDate(e.target.value); setLinks([]); }} /></label>
      {kind === 'resistance' && <>
        <label className="block">{t('activities.focus')}<select className={control} value={focus} onChange={e => setFocus(e.target.value as typeof focus)}>{FOCUSES.map(f => <option key={f} value={f}>{t(`activities.focuses.${f}`)}</option>)}</select></label>
        <fieldset><legend>{t('activities.linkLogs')}</legend>{available.map(log => <label key={log.id} className="flex min-h-11 items-center gap-3 py-2"><input type="checkbox" checked={links.includes(log.id)} onChange={e => setLinks(e.target.checked ? [...links, log.id] : links.filter(id => id !== log.id))} />{getLocalizedTrainingLogTitle(log, language, t('logs.savedExerciseFallback'))}</label>)}</fieldset>
      </>}
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} />{t('activities.completed')}</label>
      <label className="block">{t('activities.minutes')}<input className={control} type="number" required min={completed ? 1 : 0} max="1440" step="1" value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      <label className="block">{t('activities.response')}<select className={control} required value={response} onChange={e => setResponse(e.target.value as Response)}><option value="">{t('activities.choose')}</option>{RESPONSES.map(r => <option key={r} value={r}>{t(`activities.responses.${r}`)}</option>)}</select></label>
      {(logWarning || response === 'worse' || response === 'red_flag') && <p role="alert" className="text-red-800">{t('activities.warning')}</p>}
      <button className={button} disabled={state.error} type="submit">{t('activities.save')}</button>
      <button className={button} type="button" onClick={() => setKind(null)}>{t('activities.cancel')}</button>
    </form>}
    <details><summary className="min-h-11 cursor-pointer py-3 font-bold">{t('activities.history')}</summary>
      <div className="space-y-4">{[...state.activities].sort((a,b) => b.date.localeCompare(a.date)).map(a => <article key={a.id} className="space-y-2 border-t pt-3">
        <p>{a.date} · {t(`activities.${a.kind}`)} · {a.actualMinutes} {t('activities.minuteUnit')} · {t(a.completed ? 'activities.completed' : 'activities.incomplete')}</p>
        {a.kind === 'resistance' && <p>{t(`activities.focuses.${a.primaryFocus}`)} · {a.exerciseLogIds.length} {t('activities.logUnit')}</p>}
        <p>{t('activities.response')}: {t(`activities.responses.${a.symptomResponse}`)}</p>
        {a.date < localDate() && <label className="block">{t('activities.nextDay')}<select className={control} value={a.nextDayResponse ?? ''} onChange={e => { const updated = { ...a }; if (e.target.value) updated.nextDayResponse = e.target.value as Response; else delete updated.nextDayResponse; refresh(saveActivity(updated)); }}><option value="">{t('activities.unknown')}</option>{RESPONSES.map(r => <option key={r} value={r}>{t(`activities.responses.${r}`)}</option>)}</select></label>}
      </article>)}</div>
    </details>
    <ActivityPlan />
    <details><summary className="min-h-11 cursor-pointer py-3 font-bold">{t('activities.share')}</summary><textarea aria-label={t('activities.share')} readOnly value={copyText} className={control + ' min-h-32'} /><p className="text-sm">{t('activities.localOnly')}</p></details>
    {message && <p role="status">{t(`activities.${message}`)}</p>}
  </section>;
}
