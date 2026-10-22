import { anatomicalRegions, type AnatomicalRegionId } from '../data/anatomicalRegions';
import { sorenessRegions } from '../data/sorenessRegions';

export const SORENESS_KEY = 'rehab.sorenessEntries.v1';
export const SORENESS_V2_KEY = 'rehab.sorenessEntries.v2';
export const MAX_ENTRIES = 200;
export const MAX_NOTE = 500;
export const symptoms = ['sore', 'pain', 'tight', 'sharp', 'numb'] as const;
export type SorenessSymptom = typeof symptoms[number];
interface SorenessRegionFields {
  regionId: AnatomicalRegionId;
  tissue: 'muscle' | 'joint';
  severity: number;
  symptoms: SorenessSymptom[];
  note?: string;
}
/** 舊紀錄未記錄前後側；讀取時不推測或補上 view。 */
export interface LegacySorenessRegion extends SorenessRegionFields {
  view?: undefined;
  side: 'left' | 'right';
}
export interface NewSorenessRegion extends SorenessRegionFields {
  view: 'F' | 'B';
  side: 'left' | 'right' | 'center';
}
export type SorenessRegion = LegacySorenessRegion | NewSorenessRegion;
export interface SorenessEntry { id: string; date: string; createdAt: string; regions: SorenessRegion[] }
export interface NewSorenessEntry extends SorenessEntry { regions: NewSorenessRegion[] }
interface LegacySorenessEntry extends SorenessEntry { regions: LegacySorenessRegion[] }
interface SorenessV2Envelope { schemaVersion: 2; entries: NewSorenessEntry[]; deletedLegacyIds: string[] }
export type StorageError = 'invalid' | 'corrupt' | 'capacity' | 'read-failed' | 'write-failed';
export type WriteResult = { ok: true } | { ok: false; error: StorageError };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function localSorenessDate(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
export function sorenessId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
function validEntry(value: unknown, version: 1 | 2): value is SorenessEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as SorenessEntry;
  if (typeof e.id !== 'string' || !uuid.test(e.id) || typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return false;
  const date = new Date(`${e.date}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || localSorenessDate(date) !== e.date) return false;
  if (typeof e.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e.createdAt) || !Number.isFinite(Date.parse(e.createdAt)) || new Date(e.createdAt).toISOString() !== e.createdAt) return false;
  if (!Array.isArray(e.regions) || !e.regions.length || e.regions.length > (version === 1 ? 74 : 95)) return false;
  const keys = new Set<string>();
  for (const r of e.regions) {
    if (!r || typeof r !== 'object') return false;
    if (version === 1) {
      if (r.view !== undefined || !['left', 'right'].includes(r.side) || !anatomicalRegions.some(a => a.id === r.regionId && a.tissue === r.tissue)) return false;
    } else {
      if (r.view !== 'F' && r.view !== 'B') return false;
      if (!['left', 'right', 'center'].includes(r.side)) return false;
      if (r.side === 'center' && (r.view !== 'B' || !['jNeck', 'jThoracic', 'jLumbar'].includes(r.regionId))) return false;
      const region = sorenessRegions.find(a => a.id === r.regionId && a.tissue === r.tissue);
      const paths: Partial<Record<'F' | 'B', Partial<Record<NewSorenessRegion['side'], string>>>> | undefined = region?.paths;
      if (!paths?.[r.view]?.[r.side]) return false;
    }
    const key = `${r.view ?? 'legacy'}.${r.regionId}.${r.side}`;
    if (keys.has(key)) return false;
    keys.add(key);
    if (!Number.isInteger(r.severity) || r.severity < 0 || r.severity > 10 || !Array.isArray(r.symptoms) || r.symptoms.some(s => !symptoms.includes(s)) || new Set(r.symptoms).size !== r.symptoms.length || (r.note !== undefined && (typeof r.note !== 'string' || r.note.length > MAX_NOTE))) return false;
  }
  return true;
}
function validLegacySorenessEntry(value: unknown): value is LegacySorenessEntry { return validEntry(value, 1); }
export function validNewSorenessEntry(value: unknown): value is NewSorenessEntry { return validEntry(value, 2); }
export function validSorenessEntry(value: unknown): value is SorenessEntry {
  return validLegacySorenessEntry(value) || validNewSorenessEntry(value);
}
interface StorageState { legacy: LegacySorenessEntry[]; v2: SorenessV2Envelope; entries: SorenessEntry[] }
type ReadState = { ok: true; state: StorageState } | { ok: false; error: StorageError };
function readState(): ReadState {
  let legacyRaw: string | null, v2Raw: string | null;
  try {
    legacyRaw = window.localStorage.getItem(SORENESS_KEY);
    v2Raw = window.localStorage.getItem(SORENESS_V2_KEY);
  } catch { return { ok: false, error: 'read-failed' }; }
  try {
    const legacy: unknown = legacyRaw === null ? [] : JSON.parse(legacyRaw);
    const value: unknown = v2Raw === null ? { schemaVersion: 2, entries: [], deletedLegacyIds: [] } : JSON.parse(v2Raw);
    if (!Array.isArray(legacy) || legacy.length > MAX_ENTRIES || !legacy.every(validLegacySorenessEntry) || new Set(legacy.map(e => e.id)).size !== legacy.length) return { ok: false, error: 'corrupt' };
    if (!value || typeof value !== 'object') return { ok: false, error: 'corrupt' };
    const v2 = value as SorenessV2Envelope;
    if (v2.schemaVersion !== 2 || !Array.isArray(v2.entries) || v2.entries.length > MAX_ENTRIES || !v2.entries.every(validNewSorenessEntry) || new Set(v2.entries.map(e => e.id)).size !== v2.entries.length || !Array.isArray(v2.deletedLegacyIds) || v2.deletedLegacyIds.length > MAX_ENTRIES || v2.deletedLegacyIds.some(id => typeof id !== 'string' || !uuid.test(id)) || new Set(v2.deletedLegacyIds).size !== v2.deletedLegacyIds.length) return { ok: false, error: 'corrupt' };
    const legacyIds = new Set(legacy.map(e => e.id));
    // 跨鍵重複也可能代表資料衝突；不可用覆蓋或 tombstone 掩蓋。
    if (v2.entries.some(e => legacyIds.has(e.id))) return { ok: false, error: 'corrupt' };
    const deleted = new Set(v2.deletedLegacyIds);
    const entries = [...v2.entries, ...legacy.filter(e => !deleted.has(e.id))];
    if (entries.length > MAX_ENTRIES) return { ok: false, error: 'corrupt' };
    return { ok: true, state: { legacy, v2, entries } };
  } catch { return { ok: false, error: 'corrupt' }; }
}
export function readSorenessEntries(): { entries: SorenessEntry[]; error?: StorageError } {
  const result = readState();
  return result.ok ? { entries: result.state.entries } : { entries: [], error: result.error };
}
function write(state: StorageState, entries: NewSorenessEntry[], deletedLegacyIds = state.v2.deletedLegacyIds): WriteResult {
  const legacyIds = new Set(state.legacy.map(e => e.id));
  const envelope: SorenessV2Envelope = { schemaVersion: 2, entries, deletedLegacyIds: deletedLegacyIds.filter(id => legacyIds.has(id)) };
  // 只以一次寫入更新 v2；v1 原始 bytes 永不改寫。
  try { window.localStorage.setItem(SORENESS_V2_KEY, JSON.stringify(envelope)); return { ok: true }; }
  catch { return { ok: false, error: 'write-failed' }; }
}
export function saveSorenessEntry(entry: SorenessEntry): WriteResult {
  const result = readState();
  if (!result.ok) return { ok: false, error: result.error };
  const state = result.state;
  // 只有新增紀錄受到今天日期限制；既存紀錄可在時鐘倒退後讀取及刪除。
  if (!validNewSorenessEntry(entry) || entry.date > localSorenessDate() || state.legacy.some(e => e.id === entry.id) || state.v2.entries.some(e => e.id === entry.id)) return { ok: false, error: 'invalid' };
  if (state.entries.length >= MAX_ENTRIES) return { ok: false, error: 'capacity' };
  return write(state, [entry, ...state.v2.entries]);
}
export function deleteSorenessEntry(id: string): WriteResult {
  const result = readState();
  if (!result.ok) return { ok: false, error: result.error };
  const state = result.state;
  if (!state.entries.some(e => e.id === id)) return { ok: false, error: 'invalid' };
  if (state.legacy.some(e => e.id === id)) return write(state, state.v2.entries, [...state.v2.deletedLegacyIds, id]);
  return write(state, state.v2.entries.filter(e => e.id !== id));
}
