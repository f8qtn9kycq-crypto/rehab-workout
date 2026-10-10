import { useRef, useState } from 'react';
import { useI18n } from '../services/i18n';
import { readSavedRoutines, routineId, saveRoutine, type SavedRoutine } from '../services/savedRoutineStorage';
export default function FavoritePlanPicker({ exerciseId, onSaved }: { exerciseId: string; onSaved: (routine: SavedRoutine) => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(readSavedRoutines);
  const [target, setTarget] = useState('new');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<'saved' | 'error' | null>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const control = 'focus-ring min-h-11 rounded-md border border-calm-700 px-3 py-2';
  const selected = state.routines.find(routine => routine.id === target);
  const duplicate = selected?.exerciseIds.includes(exerciseId);
  function save() {
    // Read again at commit time so another tab's changes are preserved.
    const current = readSavedRoutines();
    const existing = current.routines.find(routine => routine.id === target);
    if (current.error || (target !== 'new' && !existing)) { setMessage('error'); setState(current); return; }
    const routine = target === 'new' ? { id: routineId(), name, exerciseIds: [exerciseId] } : existing!;
    if (!routine.exerciseIds.includes(exerciseId)) routine.exerciseIds = [...routine.exerciseIds, exerciseId];
    const ok = saveRoutine(routine);
    setMessage(ok ? 'saved' : 'error');
    setState(readSavedRoutines());
    if (ok) { onSaved(routine); setTarget(routine.id); setName(''); }
  }
  return <div className="space-y-2">
    <button type="button" className={control} aria-expanded={open} onClick={() => { setOpen(value => !value); setState(readSavedRoutines()); setMessage(null); requestAnimationFrame(() => selectRef.current?.focus()); }}>{t('favorites.addToRoutine')}</button>
    {open && <div className="space-y-3 rounded-md border border-slate-200 p-3">
      <label className="block font-bold">{t('favorites.destination')}<select ref={selectRef} className={`${control} mt-1 w-full bg-white`} value={target} disabled={state.error} onChange={event => { setTarget(event.target.value); setMessage(null); }}>
        <option value="new">{t('favorites.newPlan')}</option>
        {state.routines.map(routine => <option key={routine.id} value={routine.id}>{routine.name}</option>)}
      </select></label>
      {target === 'new' && <label className="block font-bold">{t('favorites.planName')}<input className={`${control} mt-1 w-full`} maxLength={100} value={name} onChange={event => { setName(event.target.value); setMessage(null); }} /></label>}
      {duplicate && <p role="status">{t('favorites.alreadyAdded')}</p>}
      <button type="button" className={control} disabled={state.error || duplicate || (target === 'new' ? !name.trim() : !selected || selected.exerciseIds.length >= 20)} onClick={save}>{t(target === 'new' ? 'favorites.createAndAdd' : 'favorites.confirmAdd')}</button>
      {state.error && <p role="alert">{t('savedRoutine.readError')}</p>}
      {message && <p role={message === 'error' ? 'alert' : 'status'}>{t(message === 'error' ? 'savedRoutine.error' : 'favorites.planSaved')}</p>}
    </div>}
  </div>;
}
