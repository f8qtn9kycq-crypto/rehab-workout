import { useEffect, useRef } from 'react';
import { sorenessPositionLabel } from '../utils/sorenessSelection';
import { sorenessTone } from '../utils/sorenessPresentation';
import { useI18n } from '../services/i18n';
import { MAX_NOTE, symptoms, type NewSorenessRegion } from '../services/sorenessStorage';
export type DraftRegion = Omit<NewSorenessRegion, 'severity'> & { severity?: number };
export default function SorenessRegionEditor({ region, onChange, onRemove }: { region: DraftRegion; onChange: (r: DraftRegion) => void; onRemove: () => void }) {
  const { t } = useI18n();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, [region.regionId, region.side, region.view]);
  return <section className="card space-y-4 p-4" aria-labelledby="region-editor-heading">
    <h2 ref={heading} tabIndex={-1} id="region-editor-heading" className="text-xl font-black">{sorenessPositionLabel(region, t)}</h2>
    <fieldset><legend className="font-bold">{t('soreness.severity')}</legend><p className={`my-2 inline-block rounded-md border px-3 py-2 font-bold ${sorenessTone(region.severity).classes}`}>{region.severity === undefined ? t('soreness.unknown') : `${region.severity}/10`}</p><div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">{Array.from({ length: 11 }, (_, value) => <button type="button" key={value} aria-pressed={region.severity === value} onClick={() => onChange({ ...region, severity: value })} className={`focus-ring rounded-md border ${sorenessTone(value).classes} ${region.severity === value ? 'ring-2 ring-ink ring-offset-2 font-black' : ''}`}>{value}</button>)}</div></fieldset>
    <div className="space-y-2">{symptoms.map(s => <label key={s} className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={region.symptoms.includes(s)} onChange={e => onChange({ ...region, symptoms: e.target.checked ? [...region.symptoms, s] : region.symptoms.filter(v => v !== s) })} />{t(`soreness.symptoms.${s}`)}</label>)}</div>
    <label className="block font-bold">{t('soreness.note')}<textarea maxLength={MAX_NOTE} value={region.note ?? ''} onChange={e => onChange({ ...region, note: e.target.value })} className="focus-ring mt-2 block w-full rounded-md border p-2 font-normal" /></label>
    <p className="text-sm">{t('soreness.maxNote', { count: MAX_NOTE })} · {(region.note ?? '').length}/{MAX_NOTE}</p>
    <button type="button" onClick={onRemove} className="focus-ring rounded-md border px-4 text-red-800">{t('soreness.removeRegion')}</button>
  </section>;
}
