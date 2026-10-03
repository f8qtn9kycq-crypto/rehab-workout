import type { QuickMovementId as ExistingQuickMovementId } from './QuickMovementIcon';
import { hasMovementArtInGroup } from '../data/movementArtRegistry';
import WorkoutMovementArt from './WorkoutMovementArt';

export type QuickMovementId = ExistingQuickMovementId | 'legExtension';

export function hasReferenceMovementArt(id: string): id is QuickMovementId {
  return hasMovementArtInGroup(id, 'quick');
}

export default function ReferenceMovementArt({ id }: { id: QuickMovementId }) {
  return <WorkoutMovementArt id={id} loading="eager" />;
}
