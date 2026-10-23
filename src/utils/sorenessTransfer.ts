import { validHistoryDate } from './sorenessHistory';
import { sorenessPositionLabel } from './sorenessSelection';
import { validSorenessBackup, type SorenessEntry } from '../services/sorenessStorage';

export const MAX_BACKUP_BYTES = 40 * 1024 * 1024;
export function shareEntries(entries: readonly SorenessEntry[], start = '', end = '') {
  if ((start && !validHistoryDate(start)) || (end && !validHistoryDate(end)) || (start && end && start > end)) throw new Error('invalid-range');
  return entries.filter(e => (!start || e.date >= start) && (!end || e.date <= end));
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  // Spreadsheet formula neutralization also covers whitespace-prefixed formulas.
  if (/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function sorenessCsv(entries: readonly SorenessEntry[], label: (key: string) => string, options: { full?: boolean; notes?: boolean; start?: string; end?: string } = {}) {
  const selected = options.full ? entries : shareEntries(entries, options.start, options.end);
  const headers = ['schema_version', 'entry_id', 'date', 'region_id', 'view', 'side', 'position_label', 'severity', 'symptom_ids', 'symptom_labels', ...(options.full ? ['created_at', 'tissue', 'note_present'] : []), ...(options.notes || options.full ? ['note'] : [])];
  const rows = selected.flatMap(entry => entry.regions.map(region => [2, entry.id, entry.date, region.regionId, region.view ?? '', region.side, sorenessPositionLabel(region, label), region.severity, region.symptoms.join('|'), region.symptoms.map(s => label(`soreness.symptoms.${s}`)).join(' / '), ...(options.full ? [entry.createdAt, region.tissue, region.note !== undefined] : []), ...(options.notes || options.full ? [region.note ?? ''] : [])]));
  return '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function sorenessBackup(entries: readonly SorenessEntry[]): string {
  const backup = { format: 'rehab.sorenessEntries', schemaVersion: 2, entries };
  if (!validSorenessBackup(backup)) throw new Error('invalid-backup');
  return JSON.stringify(backup, null, 2);
}
export function parseSorenessBackup(text: string) {
  const parsed: unknown = JSON.parse(text);
  if (!validSorenessBackup(parsed)) throw new Error('invalid-backup');
  return parsed;
}
export function downloadSoreness(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  try {
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
    document.body.append(anchor);
    try { anchor.click(); } finally { anchor.remove(); }
  } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
