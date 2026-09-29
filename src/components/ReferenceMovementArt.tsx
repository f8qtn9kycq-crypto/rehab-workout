import type { QuickMovementId } from './QuickMovementIcon';

// Keep the approved reference sheet's two-pose crops together for the seven quick choices.
const crop: Record<QuickMovementId, { left: string; top: string }> = {
  benchPress: { left: '-26.45%', top: '-492.1%' },
  shoulderPress: { left: '-132.25%', top: '-492.1%' },
  squat: { left: '-26.45%', top: '-603.4%' },
  pullUp: { left: '-132.25%', top: '-603.4%' },
  dip: { left: '-26.45%', top: '-714.6%' },
  latPulldown: { left: '-132.25%', top: '-714.6%' },
  seatedRow: { left: '-26.45%', top: '-825.9%' },
};

export default function ReferenceMovementArt({ id }: { id: QuickMovementId }) {
  return <span aria-hidden="true" className="relative block w-full overflow-hidden" style={{ aspectRatio: '155 / 89' }}>
    <img
      src="/exercise-visuals/manual-workout-reference-all-seven.png"
      alt=""
      className="absolute h-auto max-w-none"
      style={{ width: '255.8%', left: crop[id].left, top: crop[id].top }}
    />
  </span>;
}
