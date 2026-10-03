import { hasMovementArtInGroup } from '../data/movementArtRegistry';
import WorkoutMovementArt from './WorkoutMovementArt';

export function hasLibraryMovementArt(id: string): boolean {
  return hasMovementArtInGroup(id, 'library');
}

export default function LibraryMovementArt({ id }: { id: string }) {
  return hasLibraryMovementArt(id) ? <WorkoutMovementArt id={id} /> : null;
}
