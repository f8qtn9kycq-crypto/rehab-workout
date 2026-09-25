import { useState } from 'react';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

const regions: Record<BodyArea, { top: string; left: string; width: string }> = {
  shoulder_neck: { top: '15%', left: '39%', width: '22%' },
  shoulder: { top: '27%', left: '20%', width: '60%' },
  hip: { top: '49%', left: '32%', width: '36%' },
  knee: { top: '70%', left: '32%', width: '36%' },
  ankle: { top: '88%', left: '30%', width: '40%' },
};

export default function BodyMapSelector({ selected, onChange, ariaLabel, availability }: {
  selected: BodyArea | 'all';
  onChange: (area: BodyArea) => void;
  ariaLabel?: string;
  availability?: Record<BodyArea, number>;
}) {
  const { t } = useI18n();
  const [back, setBack] = useState(false);
  return <div className="space-y-3" role="group" aria-label={ariaLabel}>
    <div className="grid grid-cols-2 gap-2">
      {[false, true].map(value => <button key={String(value)} type="button" aria-pressed={back === value}
        onClick={() => setBack(value)} className={`focus-ring min-h-11 rounded-md border px-3 font-bold ${back === value ? 'bg-calm-700 text-white' : 'bg-white text-calm-800'}`}>
        {t(value ? 'bodyEntry.back' : 'bodyEntry.front')}
      </button>)}
    </div>
    <div className="relative mx-auto h-[420px] w-full max-w-[280px] rounded-xl bg-slate-50">
      <svg viewBox="0 0 280 420" className="h-full w-full" aria-hidden="true">
        <g fill="#e2e8f0" stroke="#64748b" strokeWidth="2">
          <circle cx="140" cy="38" r="24" />
          <path d="M128 62 L128 78 L96 90 L76 112 L53 205 Q51 219 64 220 L79 211 L100 146 L106 209 L98 240 L104 299 L108 380 L96 400 L126 400 L138 274 L142 274 L154 400 L184 400 L172 380 L176 299 L182 240 L174 209 L180 146 L201 211 L216 220 Q229 219 227 205 L204 112 L184 90 L152 78 L152 62 Z" />
          {back ? <path d="M140 85 V229 M114 108 L133 137 M166 108 L147 137" fill="none" /> : <path d="M114 112 Q140 122 166 112 M140 126 V210" fill="none" />}
        </g>
      </svg>
      {BODY_AREAS.map(area => {
        const count = availability?.[area];
        const disabled = count === 0 && selected !== area;
        const label = t(`bodyAreas.${area}.label`);
        const accessibleLabel = count === undefined
          ? label
          : disabled
            ? t('exercises.unavailableFilter', { label })
            : `${label} ${t('exercises.countBadge', { count })}`;

        return <button key={area} type="button" disabled={disabled} aria-pressed={selected === area}
        aria-label={accessibleLabel} title={disabled ? accessibleLabel : undefined} onClick={() => onChange(area)}
        style={{ ...regions[area], transform: 'translateY(-50%)' }}
        className={`focus-ring absolute min-h-11 rounded-lg border-2 px-1 text-xs font-bold ${selected === area ? 'border-calm-900 bg-calm-700 text-white' : disabled ? 'cursor-not-allowed border-slate-200 bg-slate-100/90 text-slate-400' : 'border-calm-600 bg-white/90 text-calm-900'}`}>
        {selected === area ? '✓ ' : ''}{label}{count === undefined ? '' : ` · ${count}`}
      </button>;
      })}
    </div>
    <p role="status" className="text-sm font-semibold text-calm-800">{selected === 'all' ? t('bodyEntry.choose') : t('bodyEntry.selected', { area: t(`bodyAreas.${selected}.label`) })}</p>
  </div>;
}
