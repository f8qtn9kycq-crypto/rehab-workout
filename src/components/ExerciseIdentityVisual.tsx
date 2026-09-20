import { Armchair, Dumbbell, ImageOff, PersonStanding } from 'lucide-react';
import { useState } from 'react';
import type { Exercise, TrainingLogEntry } from '../types/rehab';
import { getExerciseById } from '../utils/exerciseModel';
import { getLocalizedExercise, getLocalizedTrainingLogTitle } from '../utils/localizedExercise';
import { useI18n } from '../services/i18n';
import BodyAreaIcon from './BodyAreaIcon';

const SUPPORTED_VISUALS: Partial<Record<string, string>> = {
  'hip-sit-to-stand': '/exercise-visuals/hip-sit-to-stand.svg',
};

interface Props {
  exercise?: Exercise;
  log?: TrainingLogEntry;
  compact?: boolean;
}

export default function ExerciseIdentityVisual({ exercise, log, compact = false }: Props) {
  const { language, t } = useI18n();
  const [failed, setFailed] = useState(false);
  const sourceExercise = exercise ?? (log ? getExerciseById(log.exerciseId) : undefined);
  const localizedExercise = sourceExercise ? getLocalizedExercise(sourceExercise, language) : undefined;
  const name = localizedExercise?.title ?? (log
    ? getLocalizedTrainingLogTitle(log, language, t('logs.savedExerciseFallback'))
    : t('logs.savedExerciseFallback'));
  const bodyArea = sourceExercise?.bodyArea ?? log?.bodyArea;
  const equipment = localizedExercise?.equipment ?? [];
  const visual = sourceExercise ? SUPPORTED_VISUALS[sourceExercise.id] : undefined;

  return (
    <div className={`overflow-hidden rounded-lg border border-calm-100 bg-calm-50/70 ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`grid items-center gap-3 ${compact ? 'grid-cols-[72px_1fr]' : 'grid-cols-[96px_1fr]'}`}>
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-white">
          {visual && !failed ? (
            <img src={visual} alt={t('exerciseVisual.alt', { exercise: name, area: bodyArea ? t(`bodyAreas.${bodyArea}.label`) : '' })} onError={() => setFailed(true)} className="h-full w-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-calm-700" role="img" aria-label={t('exerciseVisual.fallbackAlt', { exercise: name })}>
              {failed ? <ImageOff size={20} aria-hidden="true" /> : <PersonStanding size={28} aria-hidden="true" />}
              <Armchair size={22} aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="break-words text-lg font-black leading-tight text-ink">{name}</p>
          {bodyArea ? <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-calm-800"><BodyAreaIcon area={bodyArea} size={18} /><span>{t('exerciseVisual.targetArea', { area: t(`bodyAreas.${bodyArea}.label`) })}</span></p> : null}
          <p className="mt-1 flex items-start gap-2 break-words text-sm text-slate-600"><Dumbbell size={16} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{t('exerciseVisual.equipment', { equipment: equipment.length > 0 ? equipment.map(item => t(`equipmentLabels.${item}`)).join(t('progress.areaSeparator')) : t('equipmentLabels.bodyweight') })}</span></p>
        </div>
      </div>
    </div>
  );
}
