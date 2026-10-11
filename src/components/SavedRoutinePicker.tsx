import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { exercises } from '../data/exercises';
import { useI18n } from '../services/i18n';
import { readSavedRoutines, routineId, saveRoutine, type SavedRoutine } from '../services/savedRoutineStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';
const catalog = new Map(exercises.map(exercise => [exercise.id, exercise]));
const emptyRoutine = (): SavedRoutine => ({ id: routineId(), name: '', exerciseIds: [] });
export default function SavedRoutinePicker() {
  const { t, language } = useI18n();
  const editor = useRef<HTMLDetailsElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(readSavedRoutines);
  const [draft, setDraft] = useState(emptyRoutine);
  const [selected, setSelected] = useState('');
  const [message, setMessage] = useState<'saved' | 'error' | null>(null);
  const label = (id: string) => { const exercise = catalog.get(id); return exercise ? getLocalizedExercise(exercise, language).title : t('savedRoutine.missing', { id }); };
  const button = 'focus-ring min-h-11 rounded-md border border-calm-700 px-3 py-2 font-bold text-calm-800';
  function move(index: number, direction: number) {
    setMessage(null);
    setDraft(current => { const exerciseIds = [...current.exerciseIds]; const target = index + direction;
      if (target < 0 || target >= exerciseIds.length) return current;
      [exerciseIds[index], exerciseIds[target]] = [exerciseIds[target], exerciseIds[index]];
      return { ...current, exerciseIds };
    });
  }
  return <section className="card space-y-4 p-4" aria-labelledby="saved-routine-title">
    <h2 id="saved-routine-title" className="text-xl font-bold">{t('savedRoutine.title')}</h2>
    <p className="text-sm leading-6">{t('savedRoutine.hint')}</p>
    {state.error && <p role="alert" className="text-red-800">{t('savedRoutine.readError')}</p>}
    {state.routines.map(routine => <article key={routine.id} className="space-y-2 rounded-md bg-slate-50 p-3">
      <h3 className="break-words font-bold">{routine.name}</h3>
      <ol className="list-inside list-decimal space-y-2">{routine.exerciseIds.map(id => <li key={id} className="break-words">
        {catalog.has(id) ? <Link className="focus-ring inline-flex min-h-11 items-center underline" to={`/exercise/${id}?mode=all`}>{label(id)}</Link> : <span role="status">{label(id)}</span>}
      </li>)}</ol>
      <button type="button" className={button} onClick={() => { setDraft({ ...routine, exerciseIds: [...routine.exerciseIds] }); setSelected(''); setMessage(null); if (editor.current) editor.current.open = true; requestAnimationFrame(() => { nameInput.current?.focus(); nameInput.current?.scrollIntoView({ block: 'center' }); }); }}>{t('savedRoutine.edit')}</button>
    </article>)}
    <details ref={editor}><summary className="focus-ring min-h-11 cursor-pointer py-3 font-bold">{t('savedRoutine.editor')}</summary>
      <button type="button" className={button} onClick={() => { setDraft(emptyRoutine()); setSelected(''); setMessage(null); }}>{t('savedRoutine.new')}</button>
      <form className="mt-3 space-y-3" onSubmit={event => { event.preventDefault(); const ok = saveRoutine(draft); setMessage(ok ? 'saved' : 'error'); if (ok) setState(readSavedRoutines()); }}>
        <label className="block font-bold">{t('savedRoutine.name')}<input ref={nameInput} required maxLength={100} disabled={state.error} value={draft.name} onChange={event => { setMessage(null); setDraft(current => ({ ...current, name: event.target.value })); }} className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white p-3" /></label>
        <label className="block font-bold">{t('savedRoutine.choose')}<select value={selected} disabled={state.error} onChange={event => setSelected(event.target.value)} className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white p-3">
          <option value="">{t('savedRoutine.select')}</option>{exercises.filter(exercise => !draft.exerciseIds.includes(exercise.id)).map(exercise => <option key={exercise.id} value={exercise.id}>{label(exercise.id)}</option>)}
        </select></label>
        <button type="button" className={button} disabled={state.error || !selected || draft.exerciseIds.length >= 20} onClick={() => { if (!catalog.has(selected) || draft.exerciseIds.includes(selected)) return; setDraft(current => ({ ...current, exerciseIds: [...current.exerciseIds, selected] })); setSelected(''); setMessage(null); }}>{t('savedRoutine.add')}</button>
        <ol className="space-y-3">{draft.exerciseIds.map((id, index) => <li key={id} className="rounded-md border border-slate-200 p-3">
          <p className="break-words">{index + 1}. {label(id)}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className={button} aria-label={`${t('savedRoutine.up')}: ${label(id)}`} disabled={index === 0} onClick={() => move(index, -1)}>{t('savedRoutine.up')}</button>
            <button type="button" className={button} aria-label={`${t('savedRoutine.down')}: ${label(id)}`} disabled={index === draft.exerciseIds.length - 1} onClick={() => move(index, 1)}>{t('savedRoutine.down')}</button>
            <button type="button" className={button} aria-label={`${t('savedRoutine.remove')}: ${label(id)}`} onClick={() => { setDraft(current => ({ ...current, exerciseIds: current.exerciseIds.filter(value => value !== id) })); setMessage(null); }}>{t('savedRoutine.remove')}</button>
          </div>
        </li>)}</ol>
        <button type="submit" className={button} disabled={state.error || !draft.exerciseIds.length}>{t('savedRoutine.save')}</button>
        {message && <p role={message === 'error' ? 'alert' : 'status'}>{t(`savedRoutine.${message}`)}</p>}
      </form>
    </details>
  </section>;
}
