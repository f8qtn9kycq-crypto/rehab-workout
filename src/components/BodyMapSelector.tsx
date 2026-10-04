import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

const regionPaths: Record<BodyArea, string> = {
  shoulder_neck: 'M126 77 L126 88 C120 89 114 93 110 99 L120 105 C126 98 132 95 140 95 C148 95 154 98 160 105 L170 99 C166 93 160 89 154 88 L154 77 C147 82 133 82 126 77 Z',
  shoulder: 'M112 96 C96 97 86 105 82 119 C86 124 91 127 98 129 C100 116 105 108 115 105 L121 101 Z M159 101 L165 105 C175 108 180 116 182 129 C189 127 194 124 198 119 C194 105 184 97 168 96 Z',
  hip: 'M101 200 C108 207 116 211 126 213 L124 244 C116 247 106 244 99 239 Z M154 213 C164 211 172 207 179 200 L181 239 C174 244 164 247 156 244 Z',
  knee: 'M101 276 C109 273 121 273 128 278 L127 301 C120 305 109 305 102 301 Z M152 278 C159 273 171 273 179 276 L178 301 C171 305 160 305 153 301 Z',
  ankle: 'M100 344 C108 341 119 341 125 345 L124 366 C118 370 107 370 100 366 Z M155 345 C161 341 172 341 180 344 L180 366 C173 370 162 370 156 366 Z',
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
    <svg viewBox="0 0 280 420" className="mx-auto max-h-[420px] w-full max-w-[280px] bg-white">
        <image href="/exercise-visuals/body-map-line-art.png" x="0" y="0" width="280" height="420" preserveAspectRatio="xMidYMid meet" aria-hidden="true" />
        {BODY_AREAS.map(area => {
          const { accessibleLabel, disabled } = areaMeta(area);
          const active = selected === area;
          return <g key={area}>
            <path d={regionPaths[area]}
              fill={active ? '#17695d' : disabled ? '#cbd5e1' : '#75b8aa'}
              fillOpacity={active ? 0.42 : disabled ? 0.12 : 0.2}
              stroke="none" aria-hidden="true" className="pointer-events-none" />
            <path d={regionPaths[area]} fill="transparent" stroke="transparent" strokeWidth="14"
              vectorEffect="non-scaling-stroke" role="button" tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled} aria-label={accessibleLabel} aria-pressed={active}
              className={disabled
                ? 'cursor-not-allowed focus:outline-none'
                : 'cursor-pointer focus:outline-none focus-visible:stroke-calm-900 focus-visible:stroke-[3]'}
              onClick={() => selectArea(area, disabled)}
              onKeyDown={event => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onChange(area); } }} />
          </g>;
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
