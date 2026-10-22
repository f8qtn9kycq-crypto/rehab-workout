import { localSorenessDate, type SorenessEntry } from '../services/sorenessStorage';
import { regionKey, type SorenessIdentity } from './sorenessSelection';

export const trendDays = [7, 30, 90] as const;
export type TrendDays = typeof trendDays[number];
export function validHistoryDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && localSorenessDate(new Date(`${value}T12:00:00`)) === value;
}
export function trendRange(days: TrendDays, today = new Date()) {
  if (!trendDays.includes(days) || !Number.isFinite(today.getTime())) throw new Error('invalid-range');
  const first = new Date(today); first.setDate(first.getDate() - days + 1);
  return { firstDay: localSorenessDate(first), lastDay: localSorenessDate(today) };
}
export function observedPositions(entries: readonly SorenessEntry[]): SorenessIdentity[] {
  const positions = new Map<string, SorenessIdentity>();
  for (const entry of entries) for (const region of entry.regions) {
    const identity = { regionId: region.regionId, side: region.side, ...(region.view ? { view: region.view } : {}) };
    positions.set(regionKey(identity), identity);
  }
  return [...positions.values()];
}
/** Positive observations only: no interpolation, inferred recovery, or legacy view assignment. */
export function trendRows(entries: readonly SorenessEntry[], key: string, days: TrendDays, today = new Date()) {
  const { firstDay, lastDay } = trendRange(days, today);
  return entries.filter(entry => validHistoryDate(entry.date) && entry.date >= firstDay && entry.date <= lastDay)
    .flatMap(entry => entry.regions.filter(region => regionKey(region) === key && Number.isInteger(region.severity) && region.severity > 0 && region.severity <= 10).map(region => ({ entry, region })))
    .sort((a, b) => a.entry.date.localeCompare(b.entry.date) || a.entry.createdAt.localeCompare(b.entry.createdAt));
}
/** Calendar-day distance, independent of daylight-saving or local UTC offset. */
export function historyDayOffset(date: string, firstDay: string): number {
  return (Date.parse(`${date}T12:00:00Z`) - Date.parse(`${firstDay}T12:00:00Z`)) / 86400000;
}
