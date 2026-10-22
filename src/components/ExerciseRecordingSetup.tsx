import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';
import type { Exercise } from '../types/rehab';
import type { ManualSet } from '../services/manualWorkoutStorage';
import { getExerciseEquipment, getRequiredEquipment } from '../utils/exerciseModel';
import { libraryRecordingUrl } from '../utils/libraryRecording';
import RecordingEquipmentFields from './RecordingEquipmentFields';

export default function ExerciseRecordingSetup({ exercise }: { exercise: Exercise }) {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Pick<ManualSet, 'equipmentId' | 'equipment' | 'grip'>>(() => {
    const required = getRequiredEquipment(exercise);
    return { equipmentId: required.length === 1 ? required[0] : undefined };
  });
  return <section id="record" className="card scroll-mt-60 sm:scroll-mt-40 md:scroll-mt-52 space-y-3 p-4" aria-labelledby="recording-setup-title">
    <h2 id="recording-setup-title" className="text-xl font-bold text-ink">{t('detail.recordingSetup')}</h2>
    <p className="text-slate-600">{t('detail.recordingSetupHint')}</p>
    <p className="text-sm text-slate-600">{t('detail.originalEquipment')}: {getExerciseEquipment(exercise).map(id => t(`equipmentLabels.${id}`)).join(' · ')}</p>
    <RecordingEquipmentFields value={settings} onChange={update => setSettings(current => ({ ...current, ...update }))} />
    <p className="text-sm text-slate-600">{t('manualWorkout.artEquipmentHint')}</p>
    <Link to={libraryRecordingUrl({ exerciseId: exercise.id, equipmentId: settings.equipmentId, grip: settings.grip })} className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">{t('detail.recordWithSelection')}</Link>
  </section>;
}
