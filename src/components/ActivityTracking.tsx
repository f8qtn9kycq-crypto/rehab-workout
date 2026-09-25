import ActivityPlan from './ActivityPlan';
import { useId, useState } from 'react';
import ActivityIdentityVisual from './ActivityIdentityVisual';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { activityId, exerciseDecision, exerciseQuality, FOCUSES, localDate, PERFORMANCE_QUALITIES, readActivities, RESPONSES, saveActivity, SESSION_PHASES, weeklyActivities, type Activity, type PerformanceQuality, type Response, type SessionPhase, type SessionSegment } from '../services/activityStorage';
import { getLocalizedTrainingLogTitle } from '../utils/localizedExercise';

const newSegment = (phase: SessionPhase = 'main'): SessionSegment => ({ phase, exerciseLogIds: [], exerciseResults: [] });

export default function ActivityTracking({ onActivitiesChange = () => {}, initialKind = null }: { onActivitiesChange?: () => void; initialKind?: Activity['kind'] | null }) {
  const { t, language } = useI18n();
  const titleId = useId();
  const [savedActivity, setSavedActivity] = useState<Activity | null>(null);
  const [state, setState] = useState(readActivities);
  const [kind, setKind] = useState<Activity['kind'] | null>(initialKind);
  const [id, setId] = useState(activityId);
  const [date, setDate] = useState(localDate());
  const [minutes, setMinutes] = useState('');
  const [focus, setFocus] = useState<typeof FOCUSES[number]>('mixed');
  const [completed, setCompleted] = useState(true);
  const [response, setResponse] = useState<Response | ''>('');
  const [segments, setSegments] = useState<SessionSegment[]>([newSegment()]);
  const [message, setMessage] = useState('');
  const summary = weeklyActivities(state.activities);
  const links = segments.flatMap(segment => segment.exerciseLogIds);
  const usedIds = state.activities.flatMap(a => a.kind === 'resistance' ? a.exerciseLogIds : []);
  const logs = getLogs();
  const available = logs.filter(log => localDate(new Date(log.date)) === date && !usedIds.includes(log.id));
  const linkedLogTitle = (logId: string) => {
    const log = logs.find(item => item.id === logId);
    return log ? getLocalizedTrainingLogTitle(log, language, t('logs.savedExerciseFallback')) : t('logs.savedExerciseFallback');
  };
  const selected = available.filter(log => links.includes(log.id));
  const logWarning = selected.some(log => log.painAfter >= 6 || log.painBefore >= 6 || log.stoppedEarly || log.painAfter > 3 || log.painAfter > log.painBefore);
  const control = 'focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white p-3';
  const button = `${control} font-bold text-calm-800`;

  function refresh(ok: boolean) {
    setMessage(ok ? 'saved' : 'error');
    if (ok) {
      setState(readActivities());
      onActivitiesChange();
    }
  }
  function updateExerciseQuality(phase: SessionPhase, logId: string, performanceQuality: PerformanceQuality) {
    setSegments(current => current.map(segment => segment.phase === phase ? {
      ...segment,
      exerciseResults: (segment.exerciseResults ?? []).map(result => result.exerciseLogId === logId ? { ...result, performanceQuality } : result),
    } : segment));
  }
  function toggleExercise(phase: SessionPhase, logId: string, checked: boolean) {
    setSegments(current => current.map(segment => segment.phase === phase ? {
      ...segment,
      exerciseLogIds: checked ? [...segment.exerciseLogIds, logId] : segment.exerciseLogIds.filter(id => id !== logId),
      exerciseResults: checked
        ? [...(segment.exerciseResults ?? []), { exerciseLogId: logId, performanceQuality: 'controlled' }]
        : (segment.exerciseResults ?? []).filter(result => result.exerciseLogId !== logId),
    } : segment));
  }
  function save() {
    if (!kind || !response || minutes.trim() === '' || (kind === 'resistance' && segments.length === 0)) return;
    const symptomResponse = selected.some(log => log.painAfter >= 6 || log.painBefore >= 6) ? 'red_flag' : logWarning && response !== 'red_flag' ? 'worse' : response;
    const base = { id, date, actualMinutes: Number(minutes), completed, symptomResponse };
    const activity: Activity = kind === 'cycling' ? { ...base, kind } : { ...base, kind, primaryFocus: focus, exerciseLogIds: links, segments };
    const ok = saveActivity(activity);
    refresh(ok);
    if (ok) { setSavedActivity(activity); setKind(null); setId(activityId()); setResponse(''); setMinutes(''); setSegments([newSegment()]); }
  }
  const feedbackText = t('activities.feedback', { worse: summary.current.filter(a => ['worse', 'red_flag'].includes(a.symptomResponse) || ['worse', 'red_flag'].includes(a.nextDayResponse ?? '')).length, missing: summary.missingNextDay, pending: summary.pendingNextDay });
  const copyText = t('activities.summary', { resistance: summary.resistance, cycling: summary.cycling, minutes: summary.cyclingMinutes }) + ' ' + feedbackText + ' ' + t(`activities.recommendations.${summary.recommendation}`);
  return <section className="card mx-auto w-full max-w-xl space-y-4 p-5" aria-labelledby={titleId}>
    <h2 id={titleId} className="text-xl font-bold">{t(initialKind ? `activities.${initialKind}` : 'activities.title')}</h2>
    {!initialKind && <>
    <p>{t('activities.summary', { resistance: summary.resistance, cycling: summary.cycling, minutes: summary.cyclingMinutes })}</p>
    <p className="text-sm text-slate-600">{t('activities.legacy')}</p>
    <p className="text-sm">{feedbackText}</p>
    <p className="rounded-md bg-amber-50 p-3">{t(`activities.recommendations.${summary.recommendation}`)}</p>
    </>}
    <div className="grid gap-2 sm:grid-cols-2">
      {!initialKind && <button className={button} onClick={() => { setKind('resistance'); setMinutes(''); }}>{t('activities.resistance')}</button>}
      {(!initialKind || !kind) && <button className={button} onClick={() => { setKind('cycling'); setSegments([newSegment()]); setMinutes('15'); setSavedActivity(null); }}>{t('activities.cycling')}</button>}
    </div>
    {savedActivity && <ActivityIdentityVisual activity={savedActivity} />}
    {state.error && <p role="alert">{t('activities.error')}</p>}
    {kind && <form className="space-y-4" onSubmit={event => { event.preventDefault(); save(); }}>
      <p>{t('activities.recordOnly')}</p>
      {kind === 'resistance' && <Link className={button + ' block text-center'} to="/safety">{t('activities.startSafely')}</Link>}
      <label className="block">{t('activities.date')}<input className={control} type="date" required max={localDate()} value={date} onChange={e => { setDate(e.target.value); setSegments(current => current.map(segment => ({ ...segment, exerciseLogIds: [], exerciseResults: [] }))); }} /></label>
      {kind === 'resistance' && <>
        <p className="rounded-md bg-calm-50 p-3 text-sm">{t('activities.unifiedSessionHint')}</p>
        <label className="block">{t('activities.focus')}<select className={control} value={focus} onChange={e => setFocus(e.target.value as typeof focus)}>{FOCUSES.map(f => <option key={f} value={f}>{t(`activities.focuses.${f}`)}</option>)}</select></label>
        <fieldset><legend>{t('activities.phase')}</legend><div className="grid gap-2 sm:grid-cols-2">{SESSION_PHASES.map(value => <label key={value} className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={segments.some(segment => segment.phase === value)} onChange={event => setSegments(current => event.target.checked ? [...current, newSegment(value)] : current.filter(segment => segment.phase !== value))} />{t(`activities.phases.${value}`)}</label>)}</div></fieldset>
        {segments.map(segment => <fieldset key={segment.phase} className="space-y-3 rounded-md border border-slate-200 p-3"><legend className="px-1 font-bold">{t(`activities.phases.${segment.phase}`)}</legend>
          <fieldset><legend>{t('activities.linkLogs')}</legend>{available.map(log => {
            const assignedElsewhere = segments.some(item => item.phase !== segment.phase && item.exerciseLogIds.includes(log.id));
            const checked = segment.exerciseLogIds.includes(log.id);
            const quality = segment.exerciseResults?.find(result => result.exerciseLogId === log.id)?.performanceQuality ?? 'controlled';
            return <div key={log.id} className="border-b border-slate-100 py-2 last:border-0">
              <label className="flex min-h-11 items-center gap-3"><input type="checkbox" disabled={assignedElsewhere} checked={checked} onChange={e => toggleExercise(segment.phase, log.id, e.target.checked)} />{getLocalizedTrainingLogTitle(log, language, t('logs.savedExerciseFallback'))}</label>
              {checked && <label className="mt-2 block pl-7">{t('activities.quality')}<select className={control} value={quality} onChange={e => updateExerciseQuality(segment.phase, log.id, e.target.value as PerformanceQuality)}>{PERFORMANCE_QUALITIES.map(value => <option key={value} value={value}>{t(`activities.qualities.${value}`)}</option>)}</select></label>}
            </div>;
          })}</fieldset>
        </fieldset>)}
      </>}
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} />{t('activities.completed')}</label>
      <label className="block">{t('activities.minutes')}<input className={control} type="number" required min={completed ? 1 : 0} max="1440" step="1" value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      <label className="block">{t('activities.response')}<select className={control} required value={response} onChange={e => setResponse(e.target.value as Response)}><option value="">{t('activities.choose')}</option>{RESPONSES.map(r => <option key={r} value={r}>{t(`activities.responses.${r}`)}</option>)}</select></label>
      {(logWarning || response === 'worse' || response === 'red_flag') && <p role="alert" className="text-red-800">{t('activities.warning')}</p>}
      <button className={button} disabled={state.error} type="submit">{t('activities.save')}</button>
      <button className={button} type="button" onClick={() => setKind(null)}>{t('activities.cancel')}</button>
    </form>}
    {!initialKind && <><details><summary className="min-h-11 cursor-pointer py-3 font-bold">{t('activities.history')}</summary>
      <div className="space-y-4">{[...state.activities].sort((a,b) => b.date.localeCompare(a.date)).map(a => <article key={a.id} className="space-y-2 border-t pt-3">
        <p>{a.date} · {t(`activities.${a.kind}`)} · {a.actualMinutes} {t('activities.minuteUnit')} · {t(a.completed ? 'activities.completed' : 'activities.incomplete')}</p>
        {a.kind === 'resistance' && <><p>{t(`activities.focuses.${a.primaryFocus}`)} · {a.exerciseLogIds.length} {t('activities.logUnit')}</p>{a.segments && <ul className="space-y-2 pl-5">{a.segments.map((segment, index) => <li key={`${segment.phase}-${index}`} className="list-disc">{t(`activities.phases.${segment.phase}`)} · {segment.exerciseLogIds.length} {t('activities.logUnit')}{segment.exerciseLogIds.length > 0 && <ul className="pl-5">{segment.exerciseLogIds.map(logId => {
          const linkedLog = logs.find(log => log.id === logId);
          return <li key={logId} className="list-[circle]">{linkedLogTitle(logId)} · {t(`activities.qualities.${exerciseQuality(a, logId)}`)} · → {exerciseDecision(a, logId).toUpperCase()}{linkedLog?.sets?.length ? <ol className="pl-5">{linkedLog.sets.map((set, setIndex) => <li key={setIndex}>{t('logs.setSummary', { number: setIndex + 1, weight: set.weightKg === undefined ? t('logs.noWeight') : t('logs.weightValue', { value: set.weightKg }), reps: set.reps ?? 0, status: t(set.completed ? 'logs.completedSet' : 'logs.partialSet') })}</li>)}</ol> : null}</li>;
        })}</ul>}</li>)}</ul>}</>}
        <p>{t('activities.response')}: {t(`activities.responses.${a.symptomResponse}`)}</p>
        {a.date < localDate() && <label className="block">{t('activities.nextDay')}<select className={control} value={a.nextDayResponse ?? ''} onChange={e => { const updated = { ...a }; if (e.target.value) updated.nextDayResponse = e.target.value as Response; else delete updated.nextDayResponse; refresh(saveActivity(updated)); }}><option value="">{t('activities.unknown')}</option>{RESPONSES.map(r => <option key={r} value={r}>{t(`activities.responses.${r}`)}</option>)}</select></label>}
      </article>)}</div>
    </details>
    <ActivityPlan />
    <details><summary className="min-h-11 cursor-pointer py-3 font-bold">{t('activities.share')}</summary><textarea aria-label={t('activities.share')} readOnly value={copyText} className={control + ' min-h-32'} /><p className="text-sm">{t('activities.localOnly')}</p></details>
    </>}
    {message && <p role={message === 'error' ? 'alert' : 'status'}>{t(`activities.${message}`)}</p>}
  </section>;
}
