import { useState } from 'react';
import { Bike } from 'lucide-react';
import { useI18n } from '../services/i18n';
import type { BodyArea } from '../types/rehab';
import { exercises } from '../data/exercises';
import BodyMapSelector from './BodyMapSelector';
import ExerciseCard from './ExerciseCard';
import ActivityTracking from './ActivityTracking';
import MuscleMapSelector, { type MuscleGroup } from './MuscleMapSelector';

const muscleExercises: Record<MuscleGroup, string[]> = {
  chest: [],
  shoulders: ['shoulder-external-rotation-band', 'shoulder-internal-rotation-band'],
  back: ['shoulder-scapular-squeeze', 'shoulder-neck-band-row-low'],
  legs: ['hip-abduction', 'glute-bridge', 'hip-clamshell', 'hip-sit-to-stand', 'knee-straight-leg-raise', 'knee-wall-squat', 'knee-hamstring-curl', 'knee-calf-raise', 'ankle-calf-raise', 'ankle-seated-soleus-raise'],
};

export default function BodyTrainingEntry({ onActivitiesChange }: { onActivitiesChange: () => void }) {
  const { t } = useI18n();
  const [area, setArea] = useState<BodyArea | 'all'>('all');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);
  const [kind, setKind] = useState<'rehab' | 'resistance' | 'cycling'>('rehab');
  const matches = exercises.filter(exercise => kind === 'resistance'
    ? muscle !== null && muscleExercises[muscle].includes(exercise.id)
    : exercise.bodyArea === area);
  return <section className="card space-y-4 p-4" aria-labelledby="body-entry-title">
    <h2 id="body-entry-title" className="text-xl font-black">{t('bodyEntry.title')}</h2>
    <div className="grid grid-cols-3 gap-2">
      {(['rehab', 'resistance', 'cycling'] as const).map(value => <button key={value} type="button" onClick={() => setKind(value)} aria-pressed={kind === value}
        className={`focus-ring min-h-11 rounded-md border px-2 text-sm font-bold ${kind === value ? 'bg-calm-700 text-white' : 'bg-white text-calm-800'}`}>
        {t(`bodyEntry.${value}`)}
      </button>)}
    </div>
    {kind === 'cycling' ? <>
      <Bike size={64} className="mx-auto text-calm-700" role="img" aria-label={t('activityVisual.cyclingAlt')} />
      <ActivityTracking initialKind="cycling" onActivitiesChange={onActivitiesChange} />
    </> : <>
      <p className="text-sm text-slate-600">{t('bodyEntry.hint')}</p>
      {kind === 'resistance' ? <MuscleMapSelector selected={muscle} onChange={setMuscle} /> : <BodyMapSelector selected={area} onChange={setArea} />}
      {(kind === 'resistance' ? muscle !== null : area !== 'all') && <div className="space-y-3">
        <p className="text-sm text-slate-600">{t('bodyEntry.recordHint')}</p>
        {kind === 'resistance' && <p className="text-sm text-slate-600">{t('muscleEntry.catalogNote')}</p>}
        {matches.length ? matches.map(exercise => <ExerciseCard key={exercise.id} exercise={exercise} />) : <p role="status">{t('muscleEntry.empty')}</p>}
      </div>}
    </>}
  </section>;
}
