import LibraryMovementArt, { hasLibraryMovementArt } from './LibraryMovementArt';
import ReferenceMovementArt, { hasReferenceMovementArt } from './ReferenceMovementArt';

export function hasWorkoutMovementArt(id: string | undefined): id is string {
  return typeof id === 'string' && (hasReferenceMovementArt(id) || hasLibraryMovementArt(id));
}

export default function WorkoutMovementArt({ id }: { id: string }) {
  if (hasReferenceMovementArt(id)) return <ReferenceMovementArt id={id} />;
  if (hasLibraryMovementArt(id)) return <LibraryMovementArt id={id} />;
  return null;
}
