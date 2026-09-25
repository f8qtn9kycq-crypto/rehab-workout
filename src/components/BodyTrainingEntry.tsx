import { useState } from 'react';
import { Bike } from 'lucide-react';
import { useI18n } from '../services/i18n';
import type { BodyArea } from '../types/rehab';
import { exercises } from '../data/exercises';
import BodyMapSelector from './BodyMapSelector';
import ExerciseCard from './ExerciseCard';
import ActivityTracking from './ActivityTracking';

export default function BodyTrainingEntry({ onActivitiesChange }: { onActivitiesChange: () => void }) {
  const { t } = useI18n();
  const [area, setArea] = useState<BodyArea | 'all'>('all');
  const [kind, setKind] = useState<'rehab' | 'resistance' | 'cycling'>('rehab');
  const matches = exercises.filter(exercise => exercise.bodyArea === area && (kind !== 'resistance' || exercise.type === 'strength'));
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
      <BodyMapSelector selected={area} onChange={setArea} />
      {area !== 'all' && <div className="space-y-3">
        <p className="text-sm text-slate-600">{t('bodyEntry.recordHint')}</p>
        {matches.length ? matches.map(exercise => <ExerciseCard key={exercise.id} exercise={exercise} />) : <p role="status">{t('bodyEntry.empty')}</p>}
      </div>}
    </>}
  </section>;
}
