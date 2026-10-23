import { useState } from 'react';
import { useI18n } from '../services/i18n';
import type { SorenessEntry } from '../services/sorenessStorage';
import { historyDayOffset, observedPositions, trendDays, trendRange, trendRows, type TrendDays } from '../utils/sorenessHistory';
import { regionKey, sorenessPositionLabel } from '../utils/sorenessSelection';
import { sorenessTone } from '../utils/sorenessPresentation';

export default function SorenessTrends({ entries }: { entries: SorenessEntry[] }) {
  const { t } = useI18n();
  const [key, setKey] = useState('');
  const [days, setDays] = useState<TrendDays>(7);
  const positions = observedPositions(entries);
  const selected = positions.find(position => regionKey(position) === key) ?? positions[0];
  const today = new Date();
  const { firstDay, lastDay } = trendRange(days, today);
  const points = trendRows(entries, selected ? regionKey(selected) : '', days, today);
  const selectedLabel = selected ? sorenessPositionLabel(selected, t) : '';
  const control = 'focus-ring mt-1 block h-12 w-full appearance-none rounded-md border bg-white p-2';
  return <section className="card space-y-4 p-4" aria-labelledby="soreness-trend-title">
    <h2 id="soreness-trend-title" className="text-xl font-black">{t('soreness.trends.title')}</h2>
    <p>{t('soreness.trends.note')}</p>
    {!positions.length ? <p>{t('soreness.trends.noRecords')}</p> : <>
      <label className="block">{t('soreness.trends.position')}<select className={control} value={selected ? regionKey(selected) : ''} onChange={event => setKey(event.target.value)}>{positions.map(position => <option key={regionKey(position)} value={regionKey(position)}>{sorenessPositionLabel(position, t)}</option>)}</select></label>
      <label className="block">{t('soreness.trends.range')}<select className={control} value={days} onChange={event => setDays(Number(event.target.value) as TrendDays)}>{trendDays.map(value => <option key={value} value={value}>{t('soreness.trends.days', { count: value })}</option>)}</select></label>
      {!points.length ? <p role="status">{t('soreness.trends.empty')}</p> : <>
        <svg viewBox="0 0 320 180" role="img" aria-label={`${t('soreness.trends.title')} · ${selectedLabel}`} className="w-full">
          {[1, 5, 10].map(value => <g key={value}><text x="0" y={160 - value * 14}>{value}</text><path d={`M25 ${156 - value * 14}H310`} stroke="#ddd" /></g>)}
          {points.map(({ entry, region }) => <circle key={entry.id} cx={30 + historyDayOffset(entry.date, firstDay) / (days - 1) * 270} cy={156 - region.severity * 14} r="5" fill={sorenessTone(region.severity).fill} stroke="#334155"><title>{entry.date} · {region.severity}/10</title></circle>)}
          <text x="25" y="178" fontSize="10">{firstDay}</text><text x="310" y="178" textAnchor="end" fontSize="10">{lastDay}</text>
        </svg>
        <ul className="space-y-1" aria-label={t('soreness.trends.values')}>{points.map(({ entry, region }) => <li key={entry.id}>{entry.date} · {region.severity}/10</li>)}</ul>
      </>}
    </>}
  </section>;
}
