import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

const regionPaths: Record<BodyArea, string> = {
  shoulder_neck: 'M128 65 L128 78 L112 84 L121 102 Q140 112 159 102 L168 84 L152 78 L152 65 Z',
  shoulder: 'M111 84 L96 90 Q79 94 75 116 L98 127 L108 105 L121 101 Z M159 101 L172 105 L182 127 L205 116 Q201 94 184 90 L169 84 Z',
  hip: 'M101 210 Q140 226 179 210 L182 240 Q162 254 140 254 Q118 254 98 240 Z',
  knee: 'M104 292 Q118 286 132 294 L130 320 Q117 326 105 318 Z M148 294 Q162 286 176 292 L175 318 Q163 326 150 320 Z',
  ankle: 'M107 365 L126 365 L125 392 L99 392 Z M154 365 L173 365 L181 392 L155 392 Z',
};

export default function BodyMapSelector({ selected, onChange, ariaLabel, availability }: {
  selected: BodyArea | 'all';
  onChange: (area: BodyArea) => void;
  ariaLabel?: string;
  availability?: Record<BodyArea, number>;
}) {
  const { t } = useI18n();

  function areaMeta(area: BodyArea) {
    const count = availability?.[area];
    const disabled = count === 0 && selected !== area;
    const label = t(`bodyAreas.${area}.label`);
    const accessibleLabel = count === undefined
      ? label
      : disabled
        ? t('exercises.unavailableFilter', { label })
        : `${label} ${t('exercises.countBadge', { count })}`;

    return { accessibleLabel, count, disabled, label };
  }

  function selectArea(area: BodyArea, disabled: boolean): void {
    if (!disabled) onChange(area);
  }

  return <div className="space-y-3" role="group" aria-label={ariaLabel}>
    <svg viewBox="0 0 280 420" className="mx-auto max-h-[420px] w-full max-w-[280px] rounded-xl bg-slate-50">
        <g fill="#e2e8f0" stroke="#64748b" strokeWidth="2" aria-hidden="true">
          <circle cx="140" cy="38" r="24" />
          <path d="M128 62 L128 78 L96 90 L76 112 L53 205 Q51 219 64 220 L79 211 L100 146 L106 209 L98 240 L104 299 L108 380 L96 400 L126 400 L138 274 L142 274 L154 400 L184 400 L172 380 L176 299 L182 240 L174 209 L180 146 L201 211 L216 220 Q229 219 227 205 L204 112 L184 90 L152 78 L152 62 Z" />
          <path d="M114 112 Q140 122 166 112 M140 126 V210" fill="none" />
        </g>
        {BODY_AREAS.map(area => {
          const { accessibleLabel, disabled } = areaMeta(area);
          const active = selected === area;
          return <path key={area} d={regionPaths[area]}
            fill={active ? '#17695d' : disabled ? '#d7dee5' : '#a7d4c8'}
            stroke={active ? 'none' : disabled ? '#94a3b8' : '#39796c'}
            strokeWidth={active ? 0 : 3}
            role="button" tabIndex={disabled ? -1 : 0} aria-disabled={disabled} aria-label={accessibleLabel} aria-pressed={active}
            className={disabled ? 'cursor-not-allowed' : 'cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-calm-700'}
            onClick={() => selectArea(area, disabled)}
            onKeyDown={event => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onChange(area); } }} />;
        })}
    </svg>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {BODY_AREAS.map(area => {
        const { accessibleLabel, count, disabled, label } = areaMeta(area);
        const active = selected === area;
        return <button key={area} type="button" disabled={disabled} aria-pressed={active} aria-label={accessibleLabel}
          title={disabled ? accessibleLabel : undefined} onClick={() => selectArea(area, disabled)}
          className={`focus-ring min-h-11 rounded-md border px-2 py-2 text-sm font-semibold ${active ? 'border-calm-900 bg-calm-700 text-white' : disabled ? 'cursor-not-allowed border-slate-100 bg-slate-50 text-slate-400' : 'border-slate-200 bg-white text-calm-900'}`}>
          <span className="flex items-center justify-center gap-2">
            <span className={`size-3 shrink-0 rounded-full border ${active ? 'border-white bg-white' : disabled ? 'border-slate-300 bg-slate-200' : 'border-calm-700 bg-calm-200'}`} aria-hidden="true" />
            <span>{active ? '✓ ' : ''}{label}{count === undefined ? '' : ` · ${count}`}</span>
          </span>
        </button>;
      })}
    </div>
    <p role="status" className="text-sm font-semibold text-calm-800">{selected === 'all' ? t('bodyEntry.choose') : t('bodyEntry.selected', { area: t(`bodyAreas.${selected}.label`) })}</p>
  </div>;
}
