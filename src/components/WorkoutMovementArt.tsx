import { getMovementArt, hasMovementArt } from '../data/movementArtRegistry';

export function hasWorkoutMovementArt(id: string | undefined): id is string {
  return hasMovementArt(id);
}

export default function WorkoutMovementArt({ id, loading = 'lazy' }: { id: string; loading?: 'eager' | 'lazy' }) {
  const art = getMovementArt(id);
  if (!art) return null;

  return <span aria-hidden="true" className="block aspect-[155/89] w-full overflow-hidden bg-white">
    <img
      src={art.src}
      alt=""
      width={art.width}
      height={art.height}
      loading={loading}
      decoding="async"
      className="h-full w-full object-contain"
    />
  </span>;
}
