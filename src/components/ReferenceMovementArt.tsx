import type { QuickMovementId as ExistingQuickMovementId } from './QuickMovementIcon';

export type QuickMovementId = ExistingQuickMovementId | 'legExtension';

// Keep the approved reference sheets' two-pose crops together for the quick choices.
const crop: Record<QuickMovementId, { left: string; top: string }> = {
  benchPress: { left: '-26.45%', top: '-492.1%' },
  shoulderPress: { left: '-132.25%', top: '-492.1%' },
  squat: { left: '-26.45%', top: '-603.4%' },
  pullUp: { left: '-132.25%', top: '-603.4%' },
  dip: { left: '-26.45%', top: '-714.6%' },
  latPulldown: { left: '-132.25%', top: '-714.6%' },
  seatedRow: { left: '-26.45%', top: '-825.9%' },
  legExtension: { left: '-132.25%', top: '-825.9%' },
};

const poseCorrected: QuickMovementId[] = ['benchPress', 'seatedRow'];

function artSource(id: QuickMovementId) {
  if (id === 'pullUp') return '/exercise-visuals/manual-workout-reference-pullup-airborne.png';
  if (poseCorrected.includes(id)) return '/exercise-visuals/manual-workout-reference-pose-corrected.png';
  if (id === 'legExtension') return '/exercise-visuals/manual-workout-reference-eight.png';
  return '/exercise-visuals/manual-workout-reference-all-seven.png';
}

export default function ReferenceMovementArt({ id }: { id: QuickMovementId }) {
  return <span aria-hidden="true" className="relative block w-full overflow-hidden rounded-md bg-white ring-1 ring-inset ring-slate-200" style={{ aspectRatio: '155 / 89' }}>
    <img
      src={artSource(id)}
      alt=""
      className="absolute h-auto max-w-none"
      style={{ width: '255.8%', left: crop[id].left, top: crop[id].top }}
    />
  </span>;
}
