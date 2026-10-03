import type { QuickMovementId as ExistingQuickMovementId } from './QuickMovementIcon';

export type QuickMovementId = ExistingQuickMovementId | 'legExtension';

const quickArtIds: QuickMovementId[] = ['benchPress', 'shoulderPress', 'squat', 'pullUp', 'dip', 'latPulldown', 'seatedRow', 'legExtension'];

export function hasReferenceMovementArt(id: string): id is QuickMovementId {
  return quickArtIds.some(quickId => quickId === id);
}

export default function ReferenceMovementArt({ id }: { id: QuickMovementId }) {
  const index = quickArtIds.indexOf(id);
  const column = index % 4;
  const row = Math.floor(index / 4);
  return <span
    aria-hidden="true"
    className="block w-full overflow-hidden rounded-md bg-white bg-no-repeat ring-1 ring-inset ring-slate-200"
    style={{
      aspectRatio: '155 / 89',
      backgroundImage: "url('/exercise-visuals/manual-workout-quick-line-art-v2.png')",
      backgroundSize: '400% 200%',
      backgroundPosition: `${column * (100 / 3)}% ${row * 100}%`,
    }}
  />;
}
