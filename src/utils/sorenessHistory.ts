import { localSorenessDate, type SorenessEntry } from '../services/sorenessStorage';
export function validHistoryDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && localSorenessDate(new Date(`${value}T12:00:00`)) === value;
}
export function historyRows(entries: SorenessEntry[], start = '', end = '') {
  if ((start && !validHistoryDate(start)) || (end && !validHistoryDate(end)) || (start && end && start > end)) throw new Error('invalid-range');
  return entries.filter(e => (!start || e.date >= start) && (!end || e.date <= end)).flatMap(entry => entry.regions.filter(r => r.severity > 0).map(region => ({ entry, region })));
}
export function trendRows(entries: SorenessEntry[], key: string, days: number, today = new Date()) {
  const first = new Date(today); first.setDate(first.getDate() - days + 1);
  return historyRows(entries, localSorenessDate(first), localSorenessDate(today)).filter(({ region }) => `${region.regionId}.${region.side}` === key).sort((a, b) => a.entry.date.localeCompare(b.entry.date));
}
export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function historyCsv(entries: SorenessEntry[], label: (key: string) => string, options: { full?: boolean; notes?: boolean; start?: string; end?: string } = {}) {
  const rows = options.full ? entries.flatMap(entry => entry.regions.map(region => ({ entry, region }))) : historyRows(entries, options.start, options.end);
  const headers = ['schema_version', 'entry_id', 'part_id', 'side', 'part_name', 'severity', 'types', 'date', ...(options.full ? ['created_at', 'tissue'] : []), ...(options.notes || options.full ? ['note'] : [])];
  const values = rows.map(({ entry, region: r }) => [1, entry.id, r.regionId, r.side, label(`soreness.regions.${r.regionId}`), r.severity, r.symptoms.map(s => label(`soreness.symptoms.${s}`)).join(' / '), entry.date, ...(options.full ? [entry.createdAt, r.tissue] : []), ...(options.notes || options.full ? [r.note ?? ''] : [])]);
  return '\uFEFF' + [headers, ...values].map(row => row.map(csvCell).join(',')).join('\r\n');
}
export function nativeBackup(entries: SorenessEntry[]) { return JSON.stringify({ format: 'rehab.sorenessEntries', schemaVersion: 1, entries }, null, 2); }
export function downloadHistory(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename;
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
