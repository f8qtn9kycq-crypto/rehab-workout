import { useEffect, useId, useRef, useState } from 'react';
import geometry from '../data/bodyMapGeometry.json';
import { sorenessBackLine, sorenessRegions, sorenessZooms, type SorenessSide, type SorenessView } from '../data/sorenessRegions';
import { sorenessBand, sorenessBands, sorenessTone, sorenessTones } from '../utils/sorenessPresentation';
import { regionKey, sorenessPositionLabel, sorenessPositionName, type SorenessIdentity } from '../utils/sorenessSelection';
import { useI18n } from '../services/i18n';
import type { AnatomicalRegionId } from '../data/anatomicalRegions';
export { regionKey } from '../utils/sorenessSelection';
export type RegionSelection = { regionId: AnatomicalRegionId; side: SorenessSide; view: SorenessView; tissue: 'muscle' | 'joint' };
export default function AnatomicalBodyMap({ selected, activeKey, onSelect, disabled = false }: {
  selected: readonly (SorenessIdentity & { severity?: number })[];
  activeKey?: string; onSelect: (r: RegionSelection) => void; disabled?: boolean;
}) {
  const { t } = useI18n();
  const [view, setView] = useState<SorenessView>('F');
  const [tissue, setTissue] = useState<'muscle' | 'joint'>('muscle');
  const [zoom, setZoom] = useState<keyof typeof sorenessZooms>('full');
  const [layer, setLayer] = useState<'location' | 'reference'>('location');
  const [side, setSide] = useState<SorenessSide>('left');
  const [candidates, setCandidates] = useState<RegionSelection[]>([]);
  const uid = useId().replace(/:/g, '');
  const body = useRef<SVGPathElement>(null);
  const label = (r: SorenessIdentity) => sorenessPositionLabel(r, t);
  const observation = (r: SorenessIdentity) => selected.find(s => regionKey(s) === regionKey(r));
  useEffect(() => {
    if (!activeKey) return;
    const [nextView, idSide] = activeKey.split(':');
    if (nextView !== 'F' && nextView !== 'B') return;
    const [id, nextSide] = (idSide ?? '').split('.');
    const definition = sorenessRegions.find(r => r.id === id);
    if (!definition || !definition.paths[nextView]?.[nextSide as SorenessSide]) return;
    setView(nextView); setTissue(definition.tissue); setSide(nextSide as SorenessSide);
    setZoom(previous => previous === 'full' || previous === definition.zoom ? previous : 'full');
    if (!definition.deep) setLayer('location');
    setCandidates([]);
  }, [activeKey]);
  const visible = sorenessRegions.filter(r => r.tissue === tissue && r.paths[view] && (zoom === 'full' || r.zoom === zoom) && (layer === 'location' || r.deep));
  const selections = visible.flatMap(r => Object.entries(r.paths[view]!).map(([s, path]) => ({
    selection: { regionId: r.id, side: s as SorenessSide, view, tissue: r.tissue }, path: path!, definition: r,
  })));
  const ownSide = selections.some(r => r.selection.side === side) ? side : 'left';
  const options = selections.filter(r => r.selection.side === ownSide);
  const active = selections.find(r => regionKey(r.selection) === activeKey);
  const select = (r: RegionSelection) => { if (!disabled) { setSide(r.side); setCandidates([]); onSelect(r); } };
  const changeView = (v: SorenessView) => { setView(v); setCandidates([]); };
  return <section className="space-y-4" aria-label={t('soreness.chooseRegion')} data-testid="soreness-map">
    <p className="text-sm font-bold">{t('soreness.ownSide')}</p>
    <div className="grid grid-cols-2 gap-2">
      {(['F', 'B'] as const).map(v => <button type="button" data-view={v} disabled={disabled} key={v} aria-pressed={view === v} onClick={() => changeView(v)} className={`focus-ring min-h-11 rounded-md border px-3 ${view === v ? 'bg-calm-700 text-white' : 'bg-white'}`}>{t(`soreness.${v === 'F' ? 'front' : 'back'}`)}</button>)}
      {(['muscle', 'joint'] as const).map(v => <button type="button" data-tissue={v} disabled={disabled} key={v} aria-pressed={tissue === v} onClick={() => { setTissue(v); if (v === 'joint') setLayer('location'); setCandidates([]); }} className={`focus-ring min-h-11 rounded-md border p-2 ${tissue === v ? 'bg-calm-700 text-white' : 'bg-white'}`}>{t(`soreness.${v === 'muscle' ? 'muscleAreas' : 'jointAreas'}`)}</button>)}
    </div>
    <label className="block">{t('soreness.zoom')}<select data-testid="soreness-zoom" disabled={disabled} className="focus-ring mt-1 block h-12 w-full max-w-full appearance-none rounded-md border bg-white p-2" value={zoom} onChange={e => { setZoom(e.target.value as typeof zoom); setCandidates([]); }}>{Object.keys(sorenessZooms).map(z => <option key={z} value={z}>{t(`soreness.zooms.${z}`)}</option>)}</select></label>
    <label className="block">{t('soreness.layer')}<select data-testid="soreness-layer" disabled={disabled} className="focus-ring mt-1 block h-12 w-full max-w-full appearance-none rounded-md border bg-white p-2" value={layer} onChange={e => { const next = e.target.value as typeof layer; setLayer(next); if (next === 'reference') setTissue('muscle'); setCandidates([]); }}>{(['location', 'reference'] as const).map(v => <option key={v} value={v}>{t(`soreness.${v === 'location' ? 'locationLayer' : 'referenceLayer'}`)}</option>)}</select></label>
    <div role="group" className="flex flex-wrap gap-2 text-sm" aria-label={t('soreness.legend')}>
      {sorenessBands.map(band => <span key={band} className={`inline-flex items-center gap-2 rounded-md border px-2 py-1 ${sorenessTones[band].classes}`}><span aria-hidden="true" className="size-3 rounded-full border border-current" style={{ backgroundColor: sorenessTones[band].fill }} />{t(`soreness.bands.${band}`)}</span>)}
    </div>
    <p className="text-sm text-slate-600">{t('soreness.colorHint')}</p>
    {layer === 'reference' && <p className="text-sm text-slate-600">{t('soreness.referenceHint')}</p>}
    <svg viewBox={sorenessZooms[zoom]} className="mx-auto h-[420px] w-full max-w-[280px] bg-white" aria-label={`${t(`soreness.${view === 'F' ? 'front' : 'back'}`)} · ${t('soreness.choosePosition')}`} role="img" onClick={event => {
      if (disabled) return;
      const svg = event.currentTarget; const matrix = svg.getScreenCTM();
      if (!matrix || !body.current) return;
      const point = svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      if (!body.current.isPointInFill(local)) { setCandidates([]); return; }
      const keys = [...svg.querySelectorAll<SVGPathElement>('[data-region-key]')].filter(path => path.isPointInFill(local)).map(path => path.dataset.regionKey);
      const hits = selections.filter(r => keys.includes(regionKey(r.selection))).map(r => r.selection);
      if (hits.length === 1) select(hits[0]); else setCandidates(hits);
    }}>
      <defs><path id={`soreness-body-${uid}`} ref={body} d={geometry.silhouette} /><clipPath id={`soreness-clip-${uid}`}><use href={`#soreness-body-${uid}`} /></clipPath></defs>
      <use href={`#soreness-body-${uid}`} fill="white" />
      <g clipPath={`url(#soreness-clip-${uid})`} pointerEvents="none">
        {selections.map(({ selection, path }) => {
          const key = regionKey(selection), record = observation(selection), isActive = activeKey === key;
          return <path key={key} data-region-key={key} data-severity-band={sorenessBand(record?.severity)} data-editing={isActive} d={path} fill={record ? sorenessTone(record.severity).fill : 'transparent'} fillOpacity={0.65} stroke={isActive ? '#111827' : '#94a3b8'} strokeWidth={isActive ? 6 : 1.5} strokeDasharray={layer === 'reference' ? '9 6' : undefined} />;
        })}
      </g>
      {view === 'F' ? <path d={geometry.ink} fill="#1e293b" fillRule="evenodd" pointerEvents="none" /> : <g fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"><use href={`#soreness-body-${uid}`} /><path d={sorenessBackLine} /></g>}
    </svg>
    {candidates.length > 1 && <div className="space-y-2" role="group" aria-label={t('soreness.candidates')}><p role="status">{t('soreness.candidates')}</p>{candidates.map(r => <button key={regionKey(r)} type="button" disabled={disabled} className="focus-ring block min-h-11 w-full rounded-md border p-2 text-left" onClick={() => select(r)}>{label(r)}</button>)}</div>}
    <div className="grid grid-cols-3 gap-2">{(['left', 'center', 'right'] as const).map(s => <button data-side={s} key={s} type="button" disabled={disabled || !selections.some(r => r.selection.side === s)} aria-pressed={ownSide === s} onClick={() => { setSide(s); setCandidates([]); }} className={`focus-ring min-h-11 rounded-md border p-2 disabled:opacity-40 ${ownSide === s ? 'bg-calm-700 text-white' : 'bg-white'}`}>{t(`soreness.${s}`)}</button>)}</div>
    {!visible.length && <p role="status">{t('soreness.emptyPositions')}</p>}
    <label className="block">{t('soreness.choosePosition')}<select data-testid="soreness-position" disabled={disabled} className="focus-ring mt-1 block h-12 w-full max-w-full appearance-none rounded-md border bg-white p-2" value={active && active.selection.side === ownSide ? active.selection.regionId : ''} onChange={e => { const r = options.find(r => r.selection.regionId === e.target.value); if (r) select(r.selection); }}><option value="">{t('soreness.choosePosition')}</option>{options.map(({ selection, definition }) => <option value={selection.regionId} key={regionKey(selection)}>{sorenessPositionName(selection, t)} · {t(`soreness.kinds.${definition.kind}`)}</option>)}</select></label>
    <details><summary className="focus-ring min-h-11 py-2 text-calm-800">{t('soreness.positionList')}</summary><div className="grid gap-2">{options.map(({ selection }) => {
      const record = observation(selection), key = regionKey(selection);
      return <button type="button" data-position-key={key} disabled={disabled} key={key} aria-pressed={activeKey === key} aria-description={record?.severity === undefined ? t('soreness.unknown') : `${record.severity}/10`} onClick={() => select(selection)} className={`focus-ring min-h-11 rounded-md border p-2 text-left ${record ? sorenessTone(record.severity).classes : 'border-slate-200 bg-white text-slate-800'} ${activeKey === key ? 'ring-2 ring-ink ring-offset-2' : ''}`}>{label(selection)}{record && <span className="block">{record.severity === undefined ? t('soreness.unknown') : `${record.severity}/10`}</span>}</button>;
    })}</div></details>
    {active && <div role="status" className="space-y-1"><p className="font-bold">{label(active.selection)}</p><p className="text-sm text-slate-600">{t(`soreness.kinds.${active.definition.kind}`)} · {t(`soreness.references.${active.definition.id}`)}</p></div>}
    <p className="text-sm text-slate-600">{t('soreness.boundaryHint')}</p>
  </section>;
}
