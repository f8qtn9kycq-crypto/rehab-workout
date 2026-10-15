import { useState } from 'react';
import { exercises as catalog } from '../data/exercises';
import { equipmentChoiceIds } from '../data/manualWorkoutOptions';
import { useI18n } from '../services/i18n';
import { customExerciseId, normalizedExerciseName, saveCustomExercise, type CustomExercise, type CustomExerciseResult } from '../services/customExerciseStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';

export default function RecordOnlyExercisePicker({ exercises, storageError, onSelect, onCreated }: {
  exercises: CustomExercise[];
  storageError: boolean;
  onSelect: (exercise: CustomExercise) => void;
  onCreated: (exercise: CustomExercise) => void;
}) {
  const { t } = useI18n();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CustomExercise['kind']>('strength');
  const [equipmentId, setEquipmentId] = useState('');
  const [result, setResult] = useState<CustomExerciseResult | null>(null);
  const control = 'focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2';

  function create(): void {
    if (catalog.some(item => [item.title, getLocalizedExercise(item, 'en').title].some(title => normalizedExerciseName(title) === normalizedExerciseName(name)))) {
      setResult('duplicate'); return;
    }
    const exercise: CustomExercise = { id: customExerciseId(), name: name.trim(), kind, recordOnly: true, ...(equipmentId ? { equipmentId } : {}) };
    const saved = saveCustomExercise(exercise);
    setResult(saved);
    if (saved === 'ok') { setName(''); setEquipmentId(''); setKind('strength'); setAdding(false); onCreated(exercise); }
  }

  return <details className="mt-3 rounded-md border border-slate-200 p-3">
    <summary className="focus-ring min-h-11 cursor-pointer py-2 font-bold text-calm-800">{t('manualWorkout.customTitle')}</summary>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t('manualWorkout.recordOnly')}</p>
    {storageError && <p role="alert" className="mt-2 text-red-800">{t('manualWorkout.customStorageError')}</p>}
    <div className="mt-3 flex flex-wrap gap-2">{exercises.map(exercise => <button type="button" key={exercise.id} className="focus-ring min-h-11 rounded-md border border-calm-700 px-3 py-2 font-bold text-calm-800" onClick={() => onSelect(exercise)}>{exercise.name}</button>)}</div>
    {!adding ? <button type="button" className="focus-ring mt-3 min-h-11 font-bold text-calm-800 underline" disabled={storageError} onClick={() => { setResult(null); setAdding(true); }}>{t('manualWorkout.addCustom')}</button> : <div className="mt-3 space-y-3">
      <label className="block text-sm font-bold">{t('manualWorkout.customName')}<input className={control} maxLength={100} value={name} onChange={event => { setName(event.target.value); setResult(null); }} /></label>
      <label className="block text-sm font-bold">{t('manualWorkout.kind')}<select className={control} value={kind} onChange={event => setKind(event.target.value as CustomExercise['kind'])}><option value="strength">{t('manualWorkout.strength')}</option><option value="mobility">{t('manualWorkout.mobility')}</option></select></label>
      <label className="block text-sm font-bold">{t('manualWorkout.equipment')}<select className={control} value={equipmentId} onChange={event => setEquipmentId(event.target.value)}><option value="">{t('manualWorkout.unknown')}</option>{equipmentChoiceIds.map(id => <option key={id} value={id}>{t(`manualWorkout.equipmentChoices.${id}`)}</option>)}</select></label>
      <div className="flex flex-wrap gap-4">
        <button type="button" className="focus-ring min-h-11 rounded-md border border-calm-700 px-3 font-bold text-calm-800" onClick={create} disabled={storageError || !name.trim()}>{t('manualWorkout.saveCustom')}</button>
        <button type="button" className="focus-ring min-h-11 px-3 font-bold text-calm-800 underline" onClick={() => { setAdding(false); setName(''); setEquipmentId(''); setKind('strength'); setResult(null); }}>{t('activities.cancel')}</button>
      </div>
      {result && result !== 'ok' && <p role="alert" className="text-sm text-red-800">{t(result === 'duplicate' ? 'manualWorkout.customDuplicate' : result === 'corrupt' ? 'manualWorkout.customStorageError' : result === 'write-failed' ? 'manualWorkout.writeError' : 'manualWorkout.saveError')}</p>}
    </div>}
  </details>;
}
