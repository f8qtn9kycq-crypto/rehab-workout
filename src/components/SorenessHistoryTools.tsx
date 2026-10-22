import { useState } from 'react';
import { anatomicalRegions } from '../data/anatomicalRegions';
import { useI18n } from '../services/i18n';
import { localSorenessDate, readSorenessEntries, restoreSorenessBackup, type SorenessEntry } from '../services/sorenessStorage';
import { downloadHistory, historyCsv, historyRows, nativeBackup, trendRows } from '../utils/sorenessHistory';

export default function SorenessHistoryTools({ entries, disabled, onRestore }: { entries: SorenessEntry[]; disabled: boolean; onRestore: () => void }) {
  const { t } = useI18n();
  const [key, setKey] = useState('jKnee.right');
  const [days, setDays] = useState(7);
  const [start, setStart] = useState(''); const [end, setEnd] = useState('');
  const [badStart, setBadStart] = useState(false); const [badEnd, setBadEnd] = useState(false);
  const [notes, setNotes] = useState(false); const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const today = new Date();
  const first = new Date(today); first.setDate(first.getDate() - days + 1);
  const firstDay = localSorenessDate(first); const lastDay = localSorenessDate(today);
  const points = trendRows(entries, key, days, today);
  let rows: ReturnType<typeof historyRows> = []; let invalid = badStart || badEnd;
  try { rows = historyRows(entries, start, end); } catch { invalid = true; }
  function exportFile(kind: 'share' | 'full' | 'json') {
    try {
      const current = readSorenessEntries();
      if (current.error) { setMessage(t(`soreness.errors.${current.error}`)); return; }
      if (kind === 'share' && invalid) { setMessage(t('soreness.insights.invalidRange')); return; }
      if (!(kind === 'share' ? historyRows(current.entries, start, end).length : current.entries.length)) { setMessage(t('soreness.insights.empty')); return; }
      downloadHistory(kind === 'json' ? nativeBackup(current.entries) : historyCsv(current.entries, t, { full: kind === 'full', notes, start, end }), `soreness-${kind}.${kind === 'json' ? 'json' : 'csv'}`, kind === 'json' ? 'application/json' : 'text/csv;charset=utf-8');
      setMessage('');
    } catch { setMessage(t('soreness.insights.downloadFailed')); }
  }
  async function restore(file?: File) {
    if (!file || busy) return;
    setBusy(true);
    try {
      // Bound memory use while permitting a full 200-entry native backup with Unicode notes.
      if (file.size > 32 * 1024 * 1024) throw new Error('size');
      const result = restoreSorenessBackup(JSON.parse(await file.text()));
      if (!result.ok) { setMessage(t(`soreness.errors.${result.error}`)); return; }
      onRestore(); setMessage(t('soreness.insights.imported'));
    } catch { setMessage(t('soreness.insights.importFailed')); }
    finally { setBusy(false); }
  }
  const inputClass = 'focus-ring block min-h-11 w-full rounded-md border bg-white p-2';
  const buttonClass = 'focus-ring min-h-11 rounded-md border px-4 disabled:opacity-50';
  return <section className="card space-y-4 p-4" aria-labelledby="soreness-history-tools">
    <h2 id="soreness-history-tools" className="text-xl font-black">{t('soreness.insights.title')}</h2>
    <p>{t('soreness.insights.trendNote')}</p>
    <label className="block">{t('soreness.insights.region')}<select className={`${inputClass} h-11 appearance-none`} value={key} onChange={e => setKey(e.target.value)}>{anatomicalRegions.flatMap(r => (['left', 'right'] as const).map(side => <option key={`${r.id}.${side}`} value={`${r.id}.${side}`}>{t(`soreness.${side}`)} · {t(`soreness.regions.${r.id}`)}</option>))}</select></label>
    <label className="block">{t('soreness.insights.range')}<select className={`${inputClass} h-11 appearance-none`} value={days} onChange={e => setDays(Number(e.target.value))}>{[7, 30, 90].map(n => <option key={n} value={n}>{t('soreness.insights.days', { count: n })}</option>)}</select></label>
    {!points.length ? <p>{t('soreness.insights.trendEmpty')}</p> : <>
      <svg viewBox="0 0 320 180" role="img" aria-label={`${t('soreness.insights.title')} · ${t(`soreness.regions.${key.split('.')[0]}`)}`} className="w-full">
        {[1, 5, 10].map(n => <g key={n}><text x="0" y={160 - n * 14}>{n}</text><path d={`M25 ${156 - n * 14}H310`} stroke="#ddd" /></g>)}
        {points.map(({ entry, region }, i) => {
          const age = Math.round((Date.parse(`${entry.date}T12:00:00Z`) - Date.parse(`${firstDay}T12:00:00Z`)) / 86400000);
          return <circle key={`${entry.id}.${i}`} cx={30 + age / Math.max(1, days - 1) * 270} cy={156 - region.severity * 14} r="5" fill="#3d6660"><title>{entry.date} · {region.severity}/10</title></circle>;
        })}
        <text x="25" y="178" fontSize="10">{firstDay}</text><text x="310" y="178" textAnchor="end" fontSize="10">{lastDay}</text>
      </svg>
      <ul className="space-y-1">{points.map(({ entry, region }) => <li key={entry.id}>{entry.date} · {region.severity}/10</li>)}</ul>
    </>}
    <p>{t('soreness.insights.privacy')}</p>
    <div className="grid gap-3 sm:grid-cols-2">{(['start', 'end'] as const).map(field => <label key={field}>{t(`soreness.insights.${field}`)}<input type="date" className={inputClass} value={field === 'start' ? start : end} onChange={e => { (field === 'start' ? setStart : setEnd)(e.target.value); (field === 'start' ? setBadStart : setBadEnd)(e.target.validity.badInput); }} /></label>)}</div>
    <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={notes} onChange={e => setNotes(e.target.checked)} />{t('soreness.insights.includeNotes')}</label>
    <p role="status">{invalid ? t('soreness.insights.invalidRange') : t('soreness.insights.preview', { entries: new Set(rows.map(r => r.entry.id)).size, rows: rows.length })}</p>
    <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={disabled || invalid || !rows.length} onClick={() => exportFile('share')}>{t('soreness.insights.share')}</button><button className={buttonClass} disabled={disabled} onClick={() => exportFile('full')}>{t('soreness.insights.fullCsv')}</button><button className={buttonClass} disabled={disabled} onClick={() => exportFile('json')}>{t('soreness.insights.backup')}</button></div>
    <label className="block">{t('soreness.insights.restore')}<input type="file" accept=".json,application/json" disabled={disabled || busy} className={`${inputClass} overflow-hidden`} onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; void restore(file); }} /></label>
    {message && <p role="status" className="break-words rounded-md bg-amber-50 p-3">{message}</p>}
  </section>;
}
