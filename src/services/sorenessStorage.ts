import { anatomicalRegions, type AnatomicalRegionId } from '../data/anatomicalRegions';

export const SORENESS_KEY = 'rehab.sorenessEntries.v1';
export const MAX_ENTRIES = 200;
export const MAX_NOTE = 500;
export const symptoms = ['sore', 'pain', 'tight', 'sharp', 'numb'] as const;
export type SorenessSymptom = typeof symptoms[number];
export interface SorenessRegion {
  regionId: AnatomicalRegionId;
  side: 'left' | 'right';
  tissue: 'muscle' | 'joint';
  severity: number;
  symptoms: SorenessSymptom[];
  note?: string;
}
export interface SorenessEntry { id: string; date: string; createdAt: string; regions: SorenessRegion[] }
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
export function validSorenessEntry(value: unknown, today = localSorenessDate()): value is SorenessEntry {
  if (!value || typeof value !== 'object') return false;
  const e = value as SorenessEntry;
  if (typeof e.id !== 'string' || !uuid.test(e.id) || typeof e.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(e.date) || e.date > today) return false;
  const date = new Date(`${e.date}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || localSorenessDate(date) !== e.date) return false;
  if (typeof e.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(e.createdAt) || !Number.isFinite(Date.parse(e.createdAt)) || new Date(e.createdAt).toISOString() !== e.createdAt) return false;
  if (!Array.isArray(e.regions) || !e.regions.length || e.regions.length > anatomicalRegions.length * 2) return false;
  const keys = new Set<string>();
  for (const r of e.regions) {
    if (!r || typeof r !== 'object' || !anatomicalRegions.some(a => a.id === r.regionId && a.tissue === r.tissue) || !['left', 'right'].includes(r.side)) return false;
    const key = `${r.regionId}.${r.side}`;
    if (keys.has(key)) return false;
    keys.add(key);
    if (!Number.isInteger(r.severity) || r.severity < 0 || r.severity > 10 || !Array.isArray(r.symptoms) || r.symptoms.some(s => !symptoms.includes(s)) || new Set(r.symptoms).size !== r.symptoms.length || (r.note !== undefined && (typeof r.note !== 'string' || r.note.length > MAX_NOTE))) return false;
  }
  return true;
}
export function readSorenessEntries(): { entries: SorenessEntry[]; error?: StorageError } {
  let raw: string | null;
  try { raw = window.localStorage.getItem(SORENESS_KEY); } catch { return { entries: [], error: 'read-failed' }; }
  if (raw === null) return { entries: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > MAX_ENTRIES || !parsed.every(e => validSorenessEntry(e)) || new Set(parsed.map(e => e.id)).size !== parsed.length) return { entries: [], error: 'corrupt' };
    return { entries: parsed };
  } catch { return { entries: [], error: 'corrupt' }; }
}
function write(entries: SorenessEntry[]): WriteResult {
  try { window.localStorage.setItem(SORENESS_KEY, JSON.stringify(entries)); return { ok: true }; }
  catch { return { ok: false, error: 'write-failed' }; }
}
export function saveSorenessEntry(entry: SorenessEntry): WriteResult {
  const state = readSorenessEntries();
  if (state.error) return { ok: false, error: state.error };
  if (!validSorenessEntry(entry) || state.entries.some(e => e.id === entry.id)) return { ok: false, error: 'invalid' };
  if (state.entries.length >= MAX_ENTRIES) return { ok: false, error: 'capacity' };
  return write([entry, ...state.entries]);
}
export function deleteSorenessEntry(id: string): WriteResult {
  const state = readSorenessEntries();
  if (state.error) return { ok: false, error: state.error };
  if (!state.entries.some(e => e.id === id)) return { ok: false, error: 'invalid' };
  return write(state.entries.filter(e => e.id !== id));
}
