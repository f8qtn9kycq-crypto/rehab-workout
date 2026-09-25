import { useState } from 'react';
import { useI18n } from '../services/i18n';

export type MuscleGroup = 'chest' | 'shoulders' | 'back' | 'legs';
const frontPaths: Partial<Record<MuscleGroup, string>> = {
  chest: 'M105 104 Q122 95 138 108 L138 145 Q119 150 105 133 Z M142 108 Q158 95 175 104 L175 133 Q160 150 142 145 Z',
  shoulders: 'M100 88 Q78 88 76 120 L99 128 L106 101 Z M180 88 Q202 88 204 120 L181 128 L174 101 Z',
  legs: 'M101 205 Q140 220 179 205 L182 242 Q162 255 140 255 Q118 255 98 242 Z M103 237 L135 245 L129 312 L124 377 L110 377 L106 305 Z M145 245 L177 237 L174 305 L170 377 L156 377 L151 312 Z',
};
const backPaths: Partial<Record<MuscleGroup, string>> = {
  back: 'M105 95 L135 86 L140 98 L145 86 L175 95 L174 151 L158 195 L122 195 L106 151 Z',
  legs: frontPaths.legs,
};

export default function MuscleMapSelector({ selected, onChange }: {
  selected: MuscleGroup | null; onChange: (group: MuscleGroup) => void;
}) {
  const { t } = useI18n();
  const [back, setBack] = useState(false);
  const paths = back ? backPaths : frontPaths;
  const groups = Object.keys(paths) as MuscleGroup[];
  return <div className="space-y-3">
    <div className="grid grid-cols-2 gap-2">
      {[false, true].map(value => <button key={String(value)} type="button" aria-pressed={back === value}
        onClick={() => setBack(value)} className={`focus-ring min-h-11 rounded-md border font-bold ${back === value ? 'bg-calm-700 text-white' : 'bg-white text-calm-800'}`}>
        {t(value ? 'bodyEntry.back' : 'bodyEntry.front')}
      </button>)}
    </div>
    <svg viewBox="0 0 280 420" className="mx-auto max-h-[420px] w-full max-w-[280px] rounded-xl bg-slate-50" role="group" aria-label={t('muscleEntry.map')}>
      <g fill="#e2e8f0" stroke="#64748b" strokeWidth="2" aria-hidden="true">
        <circle cx="140" cy="38" r="24" />
        <path d="M128 62 L128 78 L96 90 L76 112 L53 205 Q51 219 64 220 L79 211 L100 146 L106 209 L98 240 L104 299 L108 380 L96 400 L126 400 L138 274 L142 274 L154 400 L184 400 L172 380 L176 299 L182 240 L174 209 L180 146 L201 211 L216 220 Q229 219 227 205 L204 112 L184 90 L152 78 L152 62 Z" />
      </g>
      {groups.map(group => <path key={group} d={paths[group]} fill={selected === group ? '#17695d' : '#a7d4c8'} stroke={selected === group ? '#102f2a' : '#39796c'} strokeWidth={selected === group ? 4 : 2}
        role="button" tabIndex={0} aria-label={t(`muscleEntry.${group}`)} aria-pressed={selected === group}
        className="cursor-pointer focus:outline focus:outline-4 focus:outline-calm-700"
        onClick={() => onChange(group)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onChange(group); } }} />)}
    </svg>
    <div className="grid grid-cols-2 gap-2">
      {groups.map(group => <button key={group} type="button" aria-pressed={selected === group} onClick={() => onChange(group)}
        className={`focus-ring min-h-11 rounded-md border px-3 font-bold ${selected === group ? 'bg-calm-700 text-white' : 'bg-white text-calm-800'}`}>
        {selected === group ? '✓ ' : ''}{t(`muscleEntry.${group}`)}
      </button>)}
    </div>
    <p role="status" className="font-semibold text-calm-800">{selected ? t('bodyEntry.selected', { area: t(`muscleEntry.${selected}`) }) : t('muscleEntry.choose')}</p>
    {selected && <p className="text-sm text-slate-600">{t(`muscleEntry.${selected}Hint`)}</p>}
  </div>;
}
