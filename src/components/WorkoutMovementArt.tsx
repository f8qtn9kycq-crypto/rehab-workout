import { getMovementArt, hasMovementArt } from '../data/movementArtRegistry';
import { useI18n } from '../services/i18n';

const heldPositions = new Set([
  'neck-isometric', 'neck-heat-relax', 'neck-wall-posture', 'pec-doorway-stretch',
  'knee-rice-care', 'ankle-gastrocnemius-stretch', 'ankle-soleus-stretch',
]);

const motionPhases: Record<string, string> = {
  'shoulder-scapular-squeeze': 'scapular',
  'hip-clamshell': 'clam',
  'shoulder-neck-chin-tuck': 'chin',
  'shoulder-neck-thoracic-extension-chair': 'thoracic',
  'shoulder-neck-serratus-wall-push': 'serratus',
  'ankle-circles': 'circle',
  'ankle-alphabet': 'alphabet',
  'ankle-band-inversion-eversion': 'band',
  'ankle-seated-soleus-raise': 'heel',
};

export function hasWorkoutMovementArt(id: string | undefined): id is string {
  return hasMovementArt(id);
}

export default function WorkoutMovementArt({ id, loading = 'lazy' }: { id: string; loading?: 'eager' | 'lazy' }) {
  const { t } = useI18n();
  const art = getMovementArt(id);
  if (!art) return null;

  return <span className="block w-full">
    <span aria-hidden="true" className="block aspect-[40/23] w-full overflow-hidden bg-white">
      <img
        src={art.src}
        alt=""
        width={art.width}
        height={art.height}
        loading={loading}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </span>
    {motionPhases[id] && <span className="grid grid-cols-2 gap-1 text-center text-xs text-slate-600">
      <span>{t(`movementArt.${motionPhases[id]}.start`)}</span>
      <span>{t(`movementArt.${motionPhases[id]}.finish`)}</span>
    </span>}
    {heldPositions.has(id) && <span className="block text-center text-xs text-slate-600">
      <span className="grid grid-cols-2 gap-1">
        <span>{t('movementArt.setup')}</span>
        <span>{t('movementArt.hold')}</span>
      </span>
      <span className="mt-1 block">{t('movementArt.staticHint')}</span>
    </span>}
  </span>;
}
