import { useState } from 'react';
import { anatomicalRegions, bodyOutline, zoomViewBoxes, type AnatomicalRegionId } from '../data/anatomicalRegions';
import { useI18n } from '../services/i18n';
export type RegionSelection = { regionId: AnatomicalRegionId; side: 'left' | 'right'; tissue: 'muscle' | 'joint' };
export const regionKey = (r: Pick<RegionSelection, 'regionId' | 'side'>) => `${r.regionId}.${r.side}`;
export default function AnatomicalBodyMap({ selected, onSelect, disabled = false }: { selected: readonly Pick<RegionSelection, 'regionId' | 'side'>[]; onSelect: (r: RegionSelection) => void; disabled?: boolean }) {
  const { t } = useI18n();
  const [view, setView] = useState<'F' | 'B'>('F');
  const [tissue, setTissue] = useState<'muscle' | 'joint'>('muscle');
  const [zoom, setZoom] = useState<keyof typeof zoomViewBoxes>('full');
  const visible = anatomicalRegions.filter(r => r.tissue === tissue && r.shapes.some(s => s.view === view || s.view === 'FB') && (zoom === 'full' || r.zoom === zoom));
  const active = (r: RegionSelection) => selected.some(s => regionKey(s) === regionKey(r));
  return <section className="space-y-4" aria-label={t('soreness.chooseRegion')}>
    <p className="text-sm font-bold">{t('soreness.ownSide')}</p>
    <div className="flex flex-wrap gap-2">
      {(['F', 'B'] as const).map(v => <button type="button" key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`focus-ring rounded-md border px-4 ${view === v ? 'bg-calm-700 text-white' : 'bg-white'}`}>{t(`soreness.${v === 'F' ? 'front' : 'back'}`)}</button>)}
      {(['muscle', 'joint'] as const).map(v => <button type="button" key={v} aria-pressed={tissue === v} onClick={() => setTissue(v)} className={`focus-ring rounded-md border px-4 ${tissue === v ? 'bg-calm-700 text-white' : 'bg-white'}`}>{t(`soreness.${v}`)}</button>)}
    </div>
    <label className="block">{t('soreness.zoom')}<select className="focus-ring ml-2 h-12 min-h-11 max-w-full appearance-none rounded-md border p-2" value={zoom} onChange={e => setZoom(e.target.value as typeof zoom)}>{Object.keys(zoomViewBoxes).map(z => <option key={z} value={z}>{t(`soreness.zooms.${z}`)}</option>)}</select></label>
    <svg viewBox={zoomViewBoxes[zoom]} className="mx-auto h-[410px] w-full max-w-[320px]" aria-label={`${t(`soreness.${view === 'F' ? 'front' : 'back'}`)} · ${t(`soreness.${tissue}`)}`} role="group">
      <g fill="#f1f5f9" stroke="#64748b" strokeWidth="1" aria-hidden="true"><ellipse cx="100" cy="27" rx="17" ry="22" /><path d={`${bodyOutline}Z`} /><path d={`${bodyOutline}Z`} transform="translate(200 0) scale(-1 1)" /></g>
      {visible.flatMap(r => (['left', 'right'] as const).map(side => {
        const selection = { regionId: r.id, tissue: r.tissue, side };
        const isActive = active(selection);
        const mirrored = (view === 'F') === (side === 'right');
        return <g key={regionKey(selection)} transform={mirrored ? 'translate(200 0) scale(-1 1)' : undefined} role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-pressed={isActive} aria-label={`${t(`soreness.${side}`)} · ${t(`soreness.regions.${r.id}`)}`} onClick={() => !disabled && onSelect(selection)} onKeyDown={e => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onSelect(selection); } }} className="cursor-pointer focus:outline focus:outline-2 focus:outline-calm-900" fill={isActive ? '#17695d' : '#75b8aa'} fillOpacity={isActive ? 0.8 : 0.35} stroke="#17695d" strokeWidth="0.8">
          {r.shapes.filter(s => s.view === view || s.view === 'FB').map((s, i) => 'path' in s ? <path key={i} d={s.path} /> : 'ellipse' in s ? <ellipse key={i} cx={s.ellipse[0]} cy={s.ellipse[1]} rx={s.ellipse[2]} ry={s.ellipse[3]} /> : null)}
        </g>;
      }))}
    </svg>
    <div className="grid grid-cols-2 gap-2">{visible.flatMap(r => (['left', 'right'] as const).map(side => {
      const selection = { regionId: r.id, tissue: r.tissue, side };
      return <button type="button" disabled={disabled} key={regionKey(selection)} aria-pressed={active(selection)} onClick={() => onSelect(selection)} className={`focus-ring min-h-11 rounded-md border p-2 text-sm ${active(selection) ? 'bg-calm-700 text-white' : 'bg-white text-calm-900'}`}>{t(`soreness.${side}`)} · {t(`soreness.regions.${r.id}`)}</button>;
    }))}</div>
  </section>;
}
