const libraryArtIds = [
  'shoulder-flexion', 'shoulder-scapular-squeeze', 'shoulder-external-rotation-band', 'shoulder-standing-arm-swings', 'shoulder-internal-rotation-band',
  'hip-flexion-seated', 'hip-abduction', 'glute-bridge', 'hip-clamshell', 'hip-sit-to-stand',
  'shoulder-wall-slide', 'shoulder-neck-chin-tuck', 'neck-isometric', 'upper-trap-stretch', 'pec-doorway-stretch',
  'neck-heat-relax', 'neck-rotation-stretch', 'neck-wall-posture', 'shoulder-neck-thoracic-extension-chair', 'shoulder-neck-band-row-low',
  'shoulder-neck-serratus-wall-push', 'knee-rice-care', 'knee-straight-leg-raise', 'knee-wall-squat', 'knee-hamstring-curl',
  'knee-calf-raise', 'ankle-circles', 'ankle-alphabet', 'ankle-band-inversion-eversion', 'ankle-single-leg-stand',
  'ankle-calf-raise', 'ankle-gastrocnemius-stretch', 'ankle-soleus-stretch', 'ankle-seated-soleus-raise', 'ankle-single-leg-reach',
] as const;

export function hasLibraryMovementArt(id: string): boolean {
  return libraryArtIds.some(libraryId => libraryId === id);
}

export default function LibraryMovementArt({ id }: { id: string }) {
  const index = libraryArtIds.indexOf(id as typeof libraryArtIds[number]);
  if (index < 0) return null;
  const column = index % 5;
  const row = Math.floor(index / 5);
  return <span
    aria-hidden="true"
    className="block w-full overflow-hidden rounded-md bg-white bg-no-repeat ring-1 ring-inset ring-slate-200"
    style={{
      aspectRatio: '155 / 89',
      backgroundImage: "url('/exercise-visuals/manual-workout-library-line-art-v2.png')",
      backgroundSize: '500% 700%',
      backgroundPosition: `${column * 25}% ${row * (100 / 6)}%`,
    }}
  />;
}
