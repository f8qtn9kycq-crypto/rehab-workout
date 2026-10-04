import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

const regionPaths: Record<BodyArea, string> = {
  shoulder_neck: 'M126 79 L126 91 C117 92 109 98 104 108 L117 114 C124 103 131 99 140 99 C149 99 156 103 163 114 L176 108 C171 98 163 92 154 91 L154 79 Z',
  shoulder: 'M107 96 C89 97 78 108 74 127 C79 133 86 137 94 139 C96 124 101 114 112 111 L121 102 Z M159 102 L168 111 C179 114 184 124 186 139 C194 137 201 133 206 127 C202 108 191 97 173 96 Z',
  hip: 'M96 215 C103 223 112 229 123 232 L119 255 C107 253 97 246 90 236 Z M157 232 C168 229 177 223 184 215 L190 236 C183 246 173 253 161 255 Z',
  knee: 'M103 286 C111 282 123 282 131 287 L130 316 C123 321 111 321 104 316 Z M149 287 C157 282 169 282 177 286 L176 316 C169 321 157 321 150 316 Z',
  ankle: 'M104 358 C111 355 121 355 127 359 L126 386 C120 390 108 390 101 386 Z M153 359 C159 355 169 355 176 358 L179 386 C172 390 160 390 154 386 Z',
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
