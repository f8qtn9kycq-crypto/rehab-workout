/** Observation colours only; these bands never grant training clearance. */
export const sorenessBands = ['unknown', 'zero', 'mild', 'moderate', 'high'] as const;
export type SorenessBand = typeof sorenessBands[number];
export const sorenessTones: Record<SorenessBand, { fill: string; classes: string }> = {
  unknown: { fill: '#e2e8f0', classes: 'border-slate-400 bg-slate-100 text-slate-800' },
  zero: { fill: '#bfdbfe', classes: 'border-blue-400 bg-blue-100 text-blue-950' },
  mild: { fill: '#fde047', classes: 'border-yellow-500 bg-yellow-100 text-yellow-950' },
  moderate: { fill: '#fdba74', classes: 'border-orange-500 bg-orange-100 text-orange-950' },
  high: { fill: '#fca5a5', classes: 'border-red-500 bg-red-100 text-red-950' },
};
export function sorenessBand(severity?: number): SorenessBand {
  if (severity === undefined || !Number.isInteger(severity) || severity < 0 || severity > 10) return 'unknown';
  if (severity === 0) return 'zero';
  if (severity <= 3) return 'mild';
  return severity <= 5 ? 'moderate' : 'high';
}
export function sorenessTone(severity?: number) { return sorenessTones[sorenessBand(severity)]; }
