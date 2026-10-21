import SorenessHistoryTools from '../components/SorenessHistoryTools';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnatomicalBodyMap, { regionKey, type RegionSelection } from '../components/AnatomicalBodyMap';
import SorenessRegionEditor, { type DraftRegion } from '../components/SorenessRegionEditor';
import { useI18n } from '../services/i18n';
import { deleteSorenessEntry, localSorenessDate, readSorenessEntries, saveSorenessEntry, sorenessId, type SorenessEntry, type StorageError } from '../services/sorenessStorage';
import { sorenessTone } from '../utils/sorenessPresentation';
import { sorenessGuidance } from '../utils/sorenessGuidance';
export default function SorenessMapPage() {
  const { t } = useI18n();
  const [stored, setStored] = useState(readSorenessEntries);
  const [regions, setRegions] = useState<DraftRegion[]>([]);
  const [active, setActive] = useState<string>();
  const [date, setDate] = useState(localSorenessDate);
  const [error, setError] = useState<StorageError>();
  const [saved, setSaved] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const submitLock = useRef(false);
  const entryId = useRef<string | undefined>(undefined);
  const createdAt = useRef<string | undefined>(undefined);
  const mapSection = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const current = regions.find(r => regionKey(r) === active);
  function select(selection: RegionSelection) {
    const key = regionKey(selection);
    if (!regions.some(r => regionKey(r) === key)) setRegions(previous => [...previous, { ...selection, symptoms: [] }]);
    setActive(key);
  }
  function showError(value: StorageError) {
    setError(value);
    requestAnimationFrame(() => errorRef.current?.focus());
  }
  function save() {
    if (submitLock.current) return;
    const incomplete = regions.find(r => r.severity === undefined || r.severity < 1);
    if (incomplete) { setActive(regionKey(incomplete)); showError('invalid'); return; }
    submitLock.current = true;
    try {
      entryId.current ??= sorenessId();
      createdAt.current ??= new Date().toISOString();
      const entry = { id: entryId.current, createdAt: createdAt.current, date, regions } as SorenessEntry;
      const result = saveSorenessEntry(entry);
      if (!result.ok) { showError(result.error); submitLock.current = false; return; }
      setStored(readSorenessEntries()); setError(undefined); setSaved(true); setActive(undefined);
    } catch { submitLock.current = false; showError('write-failed'); }
  }
  function remove(id: string) {
    if (!window.confirm(t('soreness.deleteConfirm'))) return;
    const result = deleteSorenessEntry(id);
    if (!result.ok) { showError(result.error); return; }
    setError(undefined); setStored(readSorenessEntries());
  }
  const guidance = sorenessGuidance(regions);
  const storageError = error ?? stored.error;
  return <div className="page space-y-6">
    <Link to="/logs" className="focus-ring inline-flex min-h-11 items-center font-bold text-calm-800 underline">{t('soreness.backToRecords')}</Link>
    <h1 className="text-3xl font-black text-ink">{t('soreness.title')}</h1>
    <p className="leading-7">{t('soreness.intro')}</p>
    <p className="rounded-md border border-amber-300 bg-amber-50 p-4 leading-7">{t('soreness.redFlags')}</p>
    {storageError && <p ref={errorRef} tabIndex={-1} role="alert" className="rounded-md border border-red-300 bg-red-50 p-4">{t(`soreness.errors.${storageError}`)}</p>}
    {saved ? <section className="card space-y-3 p-4"><h2 role="status" className="text-xl font-bold">{t('soreness.saved')}</h2><button type="button" className="focus-ring rounded-md bg-calm-700 px-4 text-white" onClick={() => { setRegions([]); setActive(undefined); setDate(localSorenessDate()); setSaved(false); submitLock.current = false; entryId.current = undefined; createdAt.current = undefined; }}>{t('soreness.newEntry')}</button></section> : <>
      <label className="block font-bold">{t('soreness.date')}<input type="date" value={date} max={localSorenessDate()} onChange={e => setDate(e.target.value)} className="focus-ring mt-2 block min-h-11 max-w-full rounded-md border bg-white p-2" /></label>
      <div ref={mapSection} tabIndex={-1} className="card p-4"><AnatomicalBodyMap selected={regions} activeKey={active} onSelect={select} /></div>
      <div className="flex flex-wrap gap-2" aria-label={t('soreness.selected')}>{regions.map(r => <button key={regionKey(r)} type="button" aria-pressed={active === regionKey(r)} className={`focus-ring min-h-11 rounded-md border p-2 ${sorenessTone(r.severity).classes} ${active === regionKey(r) ? 'ring-2 ring-ink ring-offset-2' : ''}`} onClick={() => setActive(regionKey(r))}>{t(`soreness.${r.side}`)} · {t(`soreness.regions.${r.regionId}`)} · {r.severity ?? t('soreness.unknown')}</button>)}</div>
      {current && <SorenessRegionEditor region={current} onChange={next => setRegions(previous => previous.map(r => regionKey(r) === regionKey(next) ? next : r))} onRemove={() => { setRegions(previous => previous.filter(r => regionKey(r) !== active)); setActive(undefined); mapSection.current?.focus(); }} />}
      <p role={guidance === 'stop' ? 'alert' : 'status'} className={`rounded-md border p-4 leading-7 ${guidance === 'stop' ? 'border-red-300 bg-red-50 font-bold' : 'border-amber-200 bg-amber-50'}`}>{t(`soreness.guidance.${guidance}`)}</p>
      <button type="button" disabled={!regions.length || Boolean(stored.error)} onClick={save} className="focus-ring min-h-12 w-full rounded-md bg-calm-700 px-4 font-bold text-white">{t('soreness.save')}</button>
    </>}
    <p>{t('soreness.insights.positionNote')}</p>
    <SorenessHistoryTools entries={stored.entries} disabled={Boolean(stored.error)} onRestore={() => setStored(readSorenessEntries())} />
    <section className="space-y-3" aria-labelledby="soreness-recent"><h2 id="soreness-recent" className="text-xl font-black">{t('soreness.recent')}</h2>
      {!stored.entries.length && !stored.error && <p>{t('soreness.empty')}</p>}
      {stored.entries.slice(0, visibleCount).map(entry => <article key={entry.id} className="card space-y-3 p-4"><h3 className="font-bold">{entry.date}</h3><ul className="space-y-3">{entry.regions.map(r => <li key={regionKey(r)} className="break-words"><p>{t(`soreness.${r.side}`)} · {t(`soreness.regions.${r.regionId}`)} · <span className={`inline-block rounded-md border px-2 py-1 font-bold ${sorenessTone(r.severity).classes}`}>{r.severity}/10</span></p><p>{r.symptoms.map(s => t(`soreness.symptoms.${s}`)).join(' · ')}</p>{r.note && <p className="whitespace-pre-wrap">{r.note}</p>}</li>)}</ul><p className="rounded-md bg-amber-50 p-3">{t(`soreness.guidance.${sorenessGuidance(entry.regions)}`)}</p><button type="button" className="focus-ring rounded-md border px-4 text-red-800" onClick={() => remove(entry.id)} aria-label={`${t('soreness.delete')} · ${entry.date}`}>{t('soreness.delete')}</button></article>)}
      {stored.entries.length > visibleCount && <button type="button" className="focus-ring rounded-md border px-4" onClick={() => setVisibleCount(n => n + 10)}>{t('soreness.showMore')}</button>}
    </section>
  </div>;
}
