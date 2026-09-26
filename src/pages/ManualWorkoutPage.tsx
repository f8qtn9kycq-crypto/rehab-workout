import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { localDate } from '../services/activityStorage';
import { useI18n } from '../services/i18n';
import { manualWorkoutId, saveManualWorkout, type ManualExercise } from '../services/manualWorkoutStorage';

const emptyExercise = (): ManualExercise => ({ name: '', equipment: '', sets: [{ reps: 0 }] });

export default function ManualWorkoutPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [date, setDate] = useState(localDate);
  const [exercises, setExercises] = useState<ManualExercise[]>([emptyExercise()]);
  const [cyclingMinutes, setCyclingMinutes] = useState('');
  const [error, setError] = useState(false);
  const saving = useRef(false);
  const control = 'focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2';

  function changeExercise(index: number, update: (exercise: ManualExercise) => ManualExercise) {
    setExercises(current => current.map((exercise, position) => position === index ? update(exercise) : exercise));
    setError(false);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    saving.current = true;
    const workout = {
      id: manualWorkoutId(), date, createdAt: new Date().toISOString(),
      exercises: exercises.map(exercise => ({ ...exercise, name: exercise.name.trim(), equipment: exercise.equipment.trim() })),
      ...(cyclingMinutes === '' ? {} : { cyclingMinutes: Number(cyclingMinutes) }),
    };
    if (!saveManualWorkout(workout)) { saving.current = false; setError(true); return; }
    navigate('/logs', { state: { manualSavedId: workout.id } });
  }

  return <div className="page mx-auto max-w-2xl space-y-5">
    <Link to="/logs" className="focus-ring inline-flex min-h-11 items-center text-calm-800 underline">{t('manualWorkout.back')}</Link>
    <div><h1 className="text-3xl font-black text-ink">{t('manualWorkout.title')}</h1><p className="mt-2 leading-7 text-slate-600">{t('manualWorkout.hint')}</p></div>
    <form onSubmit={save} className="space-y-5">
      <label className="block font-bold">{t('manualWorkout.date')}<input className={control} type="date" required max={localDate()} value={date} onChange={event => setDate(event.target.value)} /></label>
      {exercises.map((exercise, index) => <fieldset key={index} className="card space-y-4 p-4">
        <legend className="px-2 text-lg font-black">{t('manualWorkout.exerciseNumber', { number: index + 1 })}</legend>
        <label className="block font-bold">{t('manualWorkout.name')}<input className={control} required maxLength={100} value={exercise.name} onChange={event => changeExercise(index, value => ({ ...value, name: event.target.value }))} /></label>
        <label className="block font-bold">{t('manualWorkout.equipment')}<input className={control} maxLength={100} value={exercise.equipment} onChange={event => changeExercise(index, value => ({ ...value, equipment: event.target.value }))} /></label>
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
          {exercises.length > 1 && <button className="focus-ring min-h-11 font-bold text-calm-800 underline" type="button" onClick={() => setExercises(current => current.filter((_, position) => position !== index))}>{t('manualWorkout.removeExercise')}</button>}
        </div>
      </fieldset>)}
      {exercises.length < 12 && <button className="focus-ring min-h-11 w-full rounded-md border border-calm-600 px-4 font-bold text-calm-800" type="button" onClick={() => setExercises(current => [...current, emptyExercise()])}>{t('manualWorkout.addExercise')}</button>}
      <label className="block font-bold">{t('manualWorkout.cyclingMinutes')}<input className={control} type="number" inputMode="numeric" min="1" max="1440" step="1" value={cyclingMinutes} onChange={event => setCyclingMinutes(event.target.value)} /></label>
      <p className="text-sm text-slate-600">{t('manualWorkout.cyclingHint')}</p>
      {error && <p role="alert" className="rounded-md bg-red-50 p-3 font-bold text-red-800">{t('manualWorkout.saveError')}</p>}
      <button className="focus-ring min-h-12 w-full rounded-md bg-calm-700 px-4 font-bold text-white" type="submit">{t('manualWorkout.save')}</button>
    </form>
  </div>;
}
