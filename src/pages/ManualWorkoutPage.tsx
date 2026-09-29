import { useRef, useState, type FormEvent } from 'react';
import { Armchair, Cable, Dumbbell, GripHorizontal, Hand, PersonStanding, StretchHorizontal, Waves, Weight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import BodyAreaIcon from '../components/BodyAreaIcon';
import type { QuickMovementId } from '../components/QuickMovementIcon';
import ReferenceMovementArt from '../components/ReferenceMovementArt';
import { exercises as catalog } from '../data/exercises';
import { localDate } from '../services/activityStorage';
import { useI18n } from '../services/i18n';
import { manualWorkoutId, saveManualWorkout, type ManualExercise } from '../services/manualWorkoutStorage';
import { getLocalizedExercise } from '../utils/localizedExercise';

const emptyExercise = (): ManualExercise => ({ name: '', equipment: '', sets: [{ reps: 0 }] });
const quickExerciseIds: QuickMovementId[] = ['benchPress', 'shoulderPress', 'squat', 'pullUp', 'dip', 'latPulldown', 'seatedRow'];
const isQuickExercise = (id: string): id is QuickMovementId => quickExerciseIds.some(quickId => quickId === id);
const equipmentChoices = [
  { id: 'bodyweight', Icon: PersonStanding }, { id: 'dumbbell', Icon: Dumbbell },
  { id: 'barbell', Icon: GripHorizontal }, { id: 'machine', Icon: Cable },
  { id: 'resistance_band', Icon: StretchHorizontal }, { id: 'chair', Icon: Armchair },
  { id: 'wall', Icon: Hand }, { id: 'kettlebell', Icon: Weight },
  { id: 'foam_roller', Icon: Waves },
];

export default function ManualWorkoutPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [date, setDate] = useState(localDate);
  const [exercises, setExercises] = useState<ManualExercise[]>([emptyExercise()]);
  const [selectedIds, setSelectedIds] = useState<string[]>(['']);
  const [equipmentIds, setEquipmentIds] = useState<string[]>(['']);
  const [cyclingMinutes, setCyclingMinutes] = useState('');
  const [error, setError] = useState<'input' | 'storage' | 'write' | null>(null);
  const saving = useRef(false);
  const control = 'focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2';

  function changeExercise(index: number, update: (exercise: ManualExercise) => ManualExercise) {
    setExercises(current => current.map((exercise, position) => position === index ? update(exercise) : exercise));
    setError(null);
  }

  function chooseExercise(index: number, id: string) {
    setSelectedIds(current => current.map((value, position) => position === index ? id : value));
    setEquipmentIds(current => current.map((value, position) => position === index ? '' : value));
    const selected = catalog.find(item => item.id === id);
    changeExercise(index, value => ({ ...value, name: isQuickExercise(id) ? t(`manualWorkout.quickExercises.${id}`) : selected ? getLocalizedExercise(selected, language).title : '', equipment: '' }));
  }

  function chooseEquipment(index: number, id: string) {
    const nextId = equipmentIds[index] === id ? '' : id;
    setEquipmentIds(current => current.map((value, position) => position === index ? nextId : value));
    changeExercise(index, value => ({ ...value, equipment: nextId ? t(`manualWorkout.equipmentChoices.${nextId}`) : '' }));
  }

  function removeExercise(index: number) {
    setExercises(current => current.filter((_, position) => position !== index));
    setSelectedIds(current => current.filter((_, position) => position !== index));
    setEquipmentIds(current => current.filter((_, position) => position !== index));
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    if (selectedIds.some(id => !id)) { setError('input'); return; }
    saving.current = true;
    const workout = {
      id: manualWorkoutId(), date, createdAt: new Date().toISOString(),
      exercises: exercises.map((exercise, index) => {
        const id = selectedIds[index];
        const catalogExercise = catalog.find(item => item.id === id);
        return {
          ...exercise,
          name: (isQuickExercise(id) ? t(`manualWorkout.quickExercises.${id}`) : catalogExercise ? getLocalizedExercise(catalogExercise, language).title : exercise.name).trim(),
          equipment: (equipmentIds[index] ? t(`manualWorkout.equipmentChoices.${equipmentIds[index]}`) : '').trim(),
        };
      }),
      ...(cyclingMinutes === '' ? {} : { cyclingMinutes: Number(cyclingMinutes) }),
    };
    const result = saveManualWorkout(workout);
    if (result !== 'ok') { saving.current = false; setError(result === 'corrupt' ? 'storage' : result === 'write-failed' ? 'write' : 'input'); return; }
    navigate('/logs', { state: { manualSavedId: workout.id } });
  }

  return <div className="page mx-auto max-w-2xl space-y-5">
    <Link to="/logs" className="focus-ring inline-flex min-h-11 items-center text-calm-800 underline">{t('manualWorkout.back')}</Link>
    <div><h1 className="text-3xl font-black text-ink">{t('manualWorkout.title')}</h1><p className="mt-2 leading-7 text-slate-600">{t('manualWorkout.hint')}</p></div>
    <form onSubmit={save} className="space-y-5">
      <label className="block font-bold">{t('manualWorkout.date')}<input className={control} type="date" required max={localDate()} value={date} onChange={event => setDate(event.target.value)} /></label>
      {exercises.map((exercise, index) => <fieldset key={index} className="card space-y-4 p-4">
        <legend className="px-2 text-lg font-black">{t('manualWorkout.exerciseNumber', { number: index + 1 })}</legend>
        <div>
          <p className="font-bold">{t('manualWorkout.chooseExercise')}</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {quickExerciseIds.map(id => <button key={id} type="button" aria-pressed={selectedIds[index] === id} onClick={() => chooseExercise(index, id)} className={`focus-ring flex min-h-28 flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center text-sm font-bold ${selectedIds[index] === id ? 'border-calm-700 bg-calm-100 text-calm-900' : 'border-slate-300 bg-white text-ink'}`}><ReferenceMovementArt id={id} /><span>{t(`manualWorkout.quickExercises.${id}`)}</span></button>)}
          </div>
          <details className="mt-3 rounded-lg border border-slate-200 p-3"><summary className="focus-ring cursor-pointer font-bold text-calm-800">{t('manualWorkout.moreExercises')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{catalog.map(item => <button key={item.id} type="button" aria-pressed={selectedIds[index] === item.id} onClick={() => chooseExercise(index, item.id)} className={`focus-ring flex min-h-20 flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center text-sm font-bold ${selectedIds[index] === item.id ? 'border-calm-700 bg-calm-100 text-calm-900' : 'border-slate-300 bg-white text-ink'}`}><BodyAreaIcon area={item.bodyArea} size={25} /><span>{getLocalizedExercise(item, language).title}</span></button>)}</div>
          </details>
          <button type="button" aria-pressed={selectedIds[index] === 'custom'} onClick={() => chooseExercise(index, 'custom')} className={`focus-ring mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border p-2 font-bold ${selectedIds[index] === 'custom' ? 'border-calm-700 bg-calm-100 text-calm-900' : 'border-slate-300 bg-white text-calm-800'}`}><Hand size={20} aria-hidden="true" />{t('manualWorkout.otherExercise')}</button>
          {selectedIds[index] === 'custom' && <label className="mt-3 block font-bold">{t('manualWorkout.name')}<input className={control} required maxLength={100} value={exercise.name} onChange={event => changeExercise(index, value => ({ ...value, name: event.target.value }))} /></label>}
        </div>
        <div><p className="font-bold">{t('manualWorkout.equipment')}</p><div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">{equipmentChoices.map(({ id, Icon }) => <button key={id} type="button" aria-pressed={equipmentIds[index] === id} onClick={() => chooseEquipment(index, id)} className={`focus-ring flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center text-xs font-bold ${equipmentIds[index] === id ? 'border-calm-700 bg-calm-100 text-calm-900' : 'border-slate-300 bg-white text-ink'}`}><Icon size={22} aria-hidden="true" /><span>{t(`manualWorkout.equipmentChoices.${id}`)}</span></button>)}</div></div>
        {exercise.sets.map((set, setIndex) => <div key={setIndex} className="rounded-md bg-slate-50 p-3">
          <p className="mb-2 font-bold">{t('manualWorkout.setNumber', { number: setIndex + 1 })}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-bold">{t('manualWorkout.weight')}<input className={control} type="number" inputMode="decimal" min="0" max="1000" step="any" value={set.weightKg ?? ''} onChange={event => changeExercise(index, value => ({ ...value, sets: value.sets.map((row, position) => position === setIndex ? { ...row, weightKg: event.target.value === '' ? undefined : Number(event.target.value) } : row) }))} /></label>
            <label className="text-sm font-bold">{t('manualWorkout.reps')}<input className={control} type="number" inputMode="numeric" required min="1" max="1000" step="1" value={set.reps || ''} onChange={event => changeExercise(index, value => ({ ...value, sets: value.sets.map((row, position) => position === setIndex ? { ...row, reps: Number(event.target.value) } : row) }))} /></label>
          </div>
          {exercise.sets.length > 1 && <button className="focus-ring mt-2 min-h-11 text-sm font-bold text-calm-800 underline" type="button" onClick={() => changeExercise(index, value => ({ ...value, sets: value.sets.filter((_, position) => position !== setIndex) }))}>{t('manualWorkout.removeSet')}</button>}
        </div>)}
        <div className="flex flex-wrap gap-4">
          {exercise.sets.length < 20 && <button className="focus-ring min-h-11 font-bold text-calm-800 underline" type="button" onClick={() => changeExercise(index, value => ({ ...value, sets: [...value.sets, { reps: 0 }] }))}>{t('manualWorkout.addSet')}</button>}
          {exercises.length > 1 && <button className="focus-ring min-h-11 font-bold text-calm-800 underline" type="button" onClick={() => removeExercise(index)}>{t('manualWorkout.removeExercise')}</button>}
        </div>
      </fieldset>)}
      {exercises.length < 12 && <button className="focus-ring min-h-11 w-full rounded-md border border-calm-600 px-4 font-bold text-calm-800" type="button" onClick={() => { setExercises(current => [...current, emptyExercise()]); setSelectedIds(current => [...current, '']); setEquipmentIds(current => [...current, '']); }}>{t('manualWorkout.addExercise')}</button>}
      <label className="block font-bold">{t('manualWorkout.cyclingMinutes')}<input className={control} type="number" inputMode="numeric" min="1" max="1440" step="1" value={cyclingMinutes} onChange={event => setCyclingMinutes(event.target.value)} /></label>
      <p className="text-sm text-slate-600">{t('manualWorkout.cyclingHint')}</p>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 font-bold text-red-800">{t(error === 'storage' ? 'manualWorkout.storageError' : error === 'write' ? 'manualWorkout.writeError' : 'manualWorkout.saveError')}</p>}
      <button className="focus-ring min-h-12 w-full rounded-md bg-calm-700 px-4 font-bold text-white" type="submit">{t('manualWorkout.save')}</button>
    </form>
  </div>;
}
