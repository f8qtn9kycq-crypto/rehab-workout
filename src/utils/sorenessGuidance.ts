import type { SorenessRegion } from '../services/sorenessStorage';
export function sorenessGuidance(regions: readonly { severity?: number; symptoms: SorenessRegion['symptoms'] }[]): 'observe' | 'modify' | 'stop' {
  if (regions.some(r => r.symptoms.includes('numb') || (r.severity !== undefined && r.severity >= 6))) return 'stop';
  return regions.some(r => r.severity !== undefined && r.severity > 3) ? 'modify' : 'observe';
}
