import { useRef, useState } from 'react';
import { useI18n } from '../services/i18n';
import { readSorenessEntries, restoreSorenessBackup, type SorenessEntry } from '../services/sorenessStorage';
import { downloadSoreness, MAX_BACKUP_BYTES, parseSorenessBackup, shareEntries, sorenessBackup, sorenessCsv } from '../utils/sorenessTransfer';

export default function SorenessTransferTools({ entries, onRestored }: { entries: SorenessEntry[]; onRestored: () => void }) {
  const { t } = useI18n();
  const [notes, setNotes] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [dateValid, setDateValid] = useState({ start: true, end: true });
  const [pending, setPending] = useState<ReturnType<typeof parseSorenessBackup>>();
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ added: number; skipped: number }>();
  const dateInputs = useRef<Record<'start' | 'end', HTMLInputElement | null>>({ start: null, end: null });
  const fileInput = useRef<HTMLInputElement>(null);
  const fileGeneration = useRef(0);
  const restoreLock = useRef(false);
  const control = 'focus-ring min-h-11 rounded-md border bg-white px-3 py-2 text-left font-bold';
  let count = 0, validRange = dateValid.start && dateValid.end;
  try { count = shareEntries(entries, start, end).length; } catch { validRange = false; }
  function updateDateValidity(key: 'start' | 'end', input: HTMLInputElement) {
    const valid = input.validity.valid;
    setDateValid(current => ({ ...current, [key]: valid }));
  }
  function exportFile(kind: 'share' | 'csv' | 'json') {
    setError(''); setResult(undefined);
    if (kind === 'share' && (!validRange || Object.values(dateInputs.current).some(input => !input?.validity.valid))) { setError('soreness.transfer.invalidRange'); return; }
    const current = readSorenessEntries();
    if (current.error) { setError(`soreness.errors.${current.error}`); return; }
    try {
      const json = kind === 'json';
      const content = json ? sorenessBackup(current.entries) : sorenessCsv(current.entries, t, kind === 'csv' ? { full: true } : { notes, start, end });
      downloadSoreness(content, `soreness-${kind === 'share' ? 'share' : 'backup'}.${json ? 'json' : 'csv'}`, json ? 'application/json;charset=utf-8' : 'text/csv;charset=utf-8');
    } catch { setError('soreness.transfer.exportError'); }
  }
  async function selectFile(file?: File) {
    const generation = ++fileGeneration.current;
    setPending(undefined); setError(''); setResult(undefined); setReading(Boolean(file));
    if (!file) return;
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('too-large');
      const backup = parseSorenessBackup(await file.text());
      if (generation === fileGeneration.current) setPending(backup);
    } catch { if (generation === fileGeneration.current) setError('soreness.transfer.fileError'); }
    finally { if (generation === fileGeneration.current) setReading(false); }
  }
  function restore() {
    if (!pending || restoreLock.current) return;
    restoreLock.current = true;
    try {
      const restored = restoreSorenessBackup(pending);
      if (!restored.ok) { setError(`soreness.errors.${restored.error}`); return; }
      setError(''); setResult(restored); setPending(undefined);
      if (fileInput.current) fileInput.current.value = '';
      onRestored();
    } finally { restoreLock.current = false; }
  }
  return <section className="card space-y-4 p-4" aria-labelledby="soreness-transfer-title">
    <h2 id="soreness-transfer-title" className="text-xl font-black">{t('soreness.transfer.title')}</h2>
    <details className="space-y-3"><summary className="focus-ring min-h-11 cursor-pointer py-2 font-bold">{t('soreness.transfer.share')}</summary>
      <p>{t('soreness.transfer.shareHint')}</p>
      <div className="grid gap-3 sm:grid-cols-2">{(['start', 'end'] as const).map(key => <label key={key} className="block min-w-0 font-bold">{t(`soreness.transfer.${key}`)}<input type="date" ref={input => { dateInputs.current[key] = input; }} onKeyUp={event => updateDateValidity(key, event.currentTarget)} onBlur={event => updateDateValidity(key, event.currentTarget)} className="focus-ring mt-1 block h-11 w-full min-w-0 appearance-none rounded-md border bg-white p-2" value={key === 'start' ? start : end} onInput={event => updateDateValidity(key, event.currentTarget)} onChange={event => key === 'start' ? setStart(event.target.value) : setEnd(event.target.value)} /></label>)}</div>
      <label className="flex min-h-11 items-center gap-3"><input type="checkbox" className="focus-ring h-5 w-5 shrink-0" checked={notes} onChange={event => setNotes(event.target.checked)} />{t('soreness.transfer.includeNotes')}</label>
      <p role="status">{validRange ? t(notes ? 'soreness.transfer.previewWithNotes' : 'soreness.transfer.previewPrivate', { count }) : t('soreness.transfer.invalidRange')}</p>
      <button type="button" className={control} disabled={!validRange || !count} onClick={() => exportFile('share')}>{t('soreness.transfer.downloadShare')}</button>
    </details>
    <details className="space-y-3"><summary className="focus-ring min-h-11 cursor-pointer py-2 font-bold">{t('soreness.transfer.backup')}</summary>
      <p>{t('soreness.transfer.backupHint')}</p>
      <div className="flex flex-wrap gap-3"><button type="button" className={control} onClick={() => exportFile('csv')}>{t('soreness.transfer.fullCsv')}</button><button type="button" className={control} onClick={() => exportFile('json')}>{t('soreness.transfer.json')}</button></div>
      <p>{t('soreness.transfer.restoreHint')}</p>
      <label className="block font-bold">{t('soreness.transfer.file')}<input ref={fileInput} type="file" accept=".json,application/json" className="focus-ring mt-2 block min-h-11 w-full min-w-0 max-w-full text-sm" onChange={event => void selectFile(event.target.files?.[0])} /></label>
      {reading && <p role="status">{t('soreness.transfer.reading')}</p>}
      {pending && <div className="space-y-3"><p role="status">{t('soreness.transfer.restorePreview', { count: pending.entries.length })}</p><div className="flex flex-wrap gap-3"><button type="button" className={control} onClick={restore}>{t('soreness.transfer.restore')}</button><button type="button" className={control} onClick={() => { ++fileGeneration.current; setPending(undefined); setError(''); if (fileInput.current) fileInput.current.value = ''; }}>{t('soreness.transfer.cancel')}</button></div></div>}
    </details>
    {error && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3">{t(error)}</p>}
    {result && <p role="status">{t('soreness.transfer.restored', result)}</p>}
  </section>;
}
