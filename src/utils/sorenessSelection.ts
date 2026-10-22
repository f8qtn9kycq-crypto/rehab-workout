import type { AnatomicalRegionId } from '../data/anatomicalRegions';
import type { SorenessSide, SorenessView } from '../data/sorenessRegions';
export type SorenessIdentity = { regionId: AnatomicalRegionId; side: SorenessSide; view?: SorenessView };
export const regionKey = (r: SorenessIdentity) => `${r.view ?? 'legacy'}:${r.regionId}.${r.side}`;
export function sorenessPositionName(r: SorenessIdentity, t: (key: string) => string): string {
  if (!r.view) return t(`soreness.regions.${r.regionId}`);
  return r.side === 'center' ? t(`soreness.centralPositions.${r.regionId}`)
    : r.regionId === 'jNeck' ? t(`soreness.${r.view === 'F' ? 'positionFrontNeck' : 'positionBackNeck'}`)
      : t(`soreness.positions.${r.regionId}`);
}
export function sorenessPositionLabel(r: SorenessIdentity, t: (key: string) => string): string {
  const prefix = r.view ? t(`soreness.${r.view === 'F' ? 'front' : 'back'}`) : t('soreness.legacyView');
  return `${prefix} · ${t(`soreness.${r.side}`)} · ${sorenessPositionName(r, t)}`;
}
