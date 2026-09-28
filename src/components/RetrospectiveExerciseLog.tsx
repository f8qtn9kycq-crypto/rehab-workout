import { useRef, useState } from 'react';
import { BODY_AREAS, type BodyArea, type TrainingLogEntry, type TrainingSet } from '../types/rehab';
import { createRetrospectiveLog, saveLog, getLogs } from '../services/logService';
import { localDate } from '../services/activityStorage';
import { useI18n } from '../services/i18n';
import TrainingSetEditor from './TrainingSetEditor';

export default function RetrospectiveExerciseLog({ onSaved }: { onSaved: (logs: TrainingLogEntry[]) => void }) {
  const { t } = useI18n();
  const [date, setDate] = useState(localDate());
  const [title, setTitle] = useState('');
  const [bodyArea, setBodyArea] = useState<BodyArea | ''>('');
  const [kind, setKind] = useState<'strength' | 'mobility'>('strength');
  const [sets, setSets] = useState<TrainingSet[]>([{ completed: true }]);
  const [before, setBefore] = useState<number | ''>('');
  const [after, setAfter] = useState<number | ''>('');
  const [effort, setEffort] = useState<number | ''>('');
  const [stoppedEarly, setStoppedEarly] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const saving = useRef(false);
  const control = 'focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white p-3';

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    if (!bodyArea) { setStatus('error'); saving.current = false; return; }
    const log = createRetrospectiveLog({ date, title, bodyArea, type: kind, sets,
      painBefore: Number(before), painAfter: Number(after), difficultyRating: Number(effort), stoppedEarly });
    if (before === '' || after === '' || effort === '' || !log || !saveLog(log)) { setStatus('error'); saving.current = false; return; }
    onSaved(getLogs());
    setTitle('');
    setSets([{ completed: true }]);
    setBodyArea(''); setBefore(''); setAfter(''); setEffort(''); setStoppedEarly(false); setStatus('saved');
    // Release after React flushes the cleared form, so rapid double activation cannot duplicate this record.
    window.setTimeout(() => { saving.current = false; }, 0);
  }

  return <details className="card p-4">
    <summary className="focus-ring min-h-11 cursor-pointer py-2 text-lg font-bold">{t('retro.title')}</summary>
    <form className="mt-4 space-y-4" onSubmit={save}>
      <p className="text-sm text-slate-600">{t('retro.hint')}</p>
      <label className="block">{t('activities.date')}<input className={control} type="date" required max={localDate()} value={date} onChange={e => setDate(e.target.value)} /></label>
      <label className="block">{t('retro.kind')}<select className={control} value={kind} onChange={e => setKind(e.target.value as typeof kind)}><option value="strength">{t('retro.strength')}</option><option value="mobility">{t('retro.rehab')}</option></select></label>
      <label className="block">{t('retro.exercise')}<input className={control} required maxLength={100} value={title} onChange={e => setTitle(e.target.value)} placeholder={t('retro.example')} /></label>
      <label className="block">{t('retro.area')}<select className={control} required value={bodyArea} onChange={e => setBodyArea(e.target.value as BodyArea)}><option value="">{t('activities.choose')}</option>{BODY_AREAS.map(area => <option key={area} value={area}>{t(`bodyAreas.${area}.label`)}</option>)}</select></label>
      <TrainingSetEditor sets={sets} plannedReps={0} onChange={setSets} hintKey="retro.setHint" />
      <div className="grid gap-3 sm:grid-cols-2">
        {(['before', 'after'] as const).map(point => <label key={point} className="block">{t(`retro.${point}`)}<select className={control} required value={point === 'before' ? before : after} onChange={e => (point === 'before' ? setBefore : setAfter)(Number(e.target.value))}><option value="">{t('activities.choose')}</option>{Array.from({ length: 11 }, (_, n) => <option key={n} value={n}>{n}/10</option>)}</select></label>)}
      </div>
      <label className="block">{t('retro.effort')}<select className={control} required value={effort} onChange={e => setEffort(Number(e.target.value))}><option value="">{t('activities.choose')}</option>{Array.from({ length: 11 }, (_, n) => <option key={n} value={n}>{n}/10</option>)}</select></label>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={stoppedEarly} onChange={e => setStoppedEarly(e.target.checked)} />{t('retro.stoppedEarly')}</label>
      {after !== '' && (after > 3 || (before !== '' && after - before > 2)) && <p role="alert" className="rounded-md bg-red-50 p-3 text-red-800">{t(after >= 6 ? 'retro.stopWarning' : 'retro.warning')}</p>}
      <button className="focus-ring min-h-11 w-full rounded-md bg-calm-700 px-4 font-bold text-white" type="submit">{t('retro.save')}</button>
      {status !== 'idle' && <p role={status === 'error' ? 'alert' : 'status'}>{t(`retro.${status}`)}</p>}
    </form>
  </details>;
}
