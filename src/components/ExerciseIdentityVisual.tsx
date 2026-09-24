import { Armchair, Dumbbell, ImageOff, PersonStanding } from 'lucide-react';
import { useState } from 'react';
import type { Exercise, TrainingLogEntry } from '../types/rehab';
import { getExerciseById } from '../utils/exerciseModel';
import { getLocalizedExercise, getLocalizedTrainingLogTitle } from '../utils/localizedExercise';
import { useI18n } from '../services/i18n';
import BodyAreaIcon from './BodyAreaIcon';

const SUPPORTED_VISUALS: Partial<Record<string, { pose: string; muscles: string; primary: string; secondary: string }>> = {
  'hip-sit-to-stand': { pose: '/exercise-visuals/hip-sit-to-stand.svg', muscles: '/exercise-visuals/hip-sit-to-stand-muscles.svg', primary: 'exerciseVisual.sitToStandPrimary', secondary: 'exerciseVisual.sitToStandSecondary' },
};

interface Props { exercise?: Exercise; log?: TrainingLogEntry; compact?: boolean }

export default function ExerciseIdentityVisual({ exercise, log, compact = false }: Props) {
  const { language, t } = useI18n();
  const [failedVisuals, setFailedVisuals] = useState<string[]>([]);
  const sourceExercise = exercise ?? (log ? getExerciseById(log.exerciseId) : undefined);
  const localizedExercise = sourceExercise ? getLocalizedExercise(sourceExercise, language) : undefined;
  const name = localizedExercise?.title ?? (log ? getLocalizedTrainingLogTitle(log, language, t('logs.savedExerciseFallback')) : t('logs.savedExerciseFallback'));
  const bodyArea = sourceExercise?.bodyArea ?? log?.bodyArea;
  const equipment = localizedExercise?.equipment ?? [];
  const visuals = sourceExercise ? SUPPORTED_VISUALS[sourceExercise.id] : undefined;
  const failed = (kind: string) => failedVisuals.includes(kind);
  const markFailed = (kind: string) => setFailedVisuals(current => current.includes(kind) ? current : [...current, kind]);

  return <div className={`overflow-hidden rounded-lg border border-calm-100 bg-calm-50/70 ${compact ? 'p-3' : 'p-4'}`}>
    <div className="min-w-0">
      <p className="break-words text-lg font-black leading-tight text-ink">{name}</p>
      {bodyArea ? <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-calm-800"><BodyAreaIcon area={bodyArea} size={18} /><span>{t('exerciseVisual.targetArea', { area: t(`bodyAreas.${bodyArea}.label`) })}</span></p> : null}
      <p className="mt-1 flex items-start gap-2 break-words text-sm text-slate-600"><Dumbbell size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{t('exerciseVisual.equipment', { equipment: equipment.length > 0 ? equipment.map(item => t(`equipmentLabels.${item}`)).join(t('progress.areaSeparator')) : t('equipmentLabels.bodyweight') })}</span></p>
    </div>
    {visuals ? <>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {[
          { kind: 'pose', src: visuals.pose, label: t('exerciseVisual.poseLabel'), alt: t('exerciseVisual.poseAlt', { exercise: name }) },
          { kind: 'muscles', src: visuals.muscles, label: t('exerciseVisual.muscleMapLabel'), alt: t('exerciseVisual.muscleMapAlt', { exercise: name }) },
        ].map(item => <figure key={item.kind} className="min-w-0 rounded-lg bg-white p-2">
          <figcaption className="mb-1 text-xs font-black text-slate-700">{item.label}</figcaption>
          <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-50">
            {!failed(item.kind) ? <img src={item.src} alt={item.alt} onError={() => markFailed(item.kind)} className="h-full w-full object-contain" /> : <div className="flex flex-col items-center gap-1 text-calm-700" role="img" aria-label={t('exerciseVisual.fallbackAlt', { exercise: name, visual: item.label })}>
              <ImageOff size={22} aria-hidden="true" />{item.kind === 'pose' ? <><PersonStanding size={26} aria-hidden="true" /><Armchair size={20} aria-hidden="true" /></> : <BodyAreaIcon area={bodyArea ?? 'hip'} size={28} />}
            </div>}
          </div>
          {item.kind === 'muscles' ? <div className="mt-1 grid grid-cols-2 text-center text-xs font-bold text-slate-600"><span>{t('exerciseVisual.frontView')}</span><span>{t('exerciseVisual.backView')}</span></div> : null}
        </figure>)}
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p className="rounded-md bg-white p-2"><span className="font-black">{t('exerciseVisual.primaryLabel')}:</span> {t(visuals.primary)}</p>
        <p className="rounded-md bg-white p-2"><span className="font-black">{t('exerciseVisual.secondaryLabel')}:</span> {t(visuals.secondary)}</p>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">{t('exerciseVisual.patternLegend')}</p>
    </> : <div className="mt-3 flex aspect-[4/3] max-w-28 items-center justify-center rounded-lg bg-white text-calm-700" role="img" aria-label={t('exerciseVisual.fallbackAlt', { exercise: name, visual: t('exerciseVisual.poseLabel') })}><PersonStanding size={28} aria-hidden="true" /><Armchair size={22} aria-hidden="true" /></div>}
  </div>;
}
