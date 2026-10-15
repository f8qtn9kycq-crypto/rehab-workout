import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

const regionPaths: Record<BodyArea, string> = {
  shoulder_neck: 'M124 71 L124 87 C115 89 108 95 103 104 L115 111 C122 101 130 97 140 97 C150 97 158 101 165 111 L177 104 C172 95 165 89 156 87 L156 71 C148 78 132 78 124 71 Z',
  shoulder: 'M111 93 C94 94 83 103 79 120 C82 128 88 134 97 137 C99 120 105 109 116 105 L123 99 Z M157 99 L164 105 C175 109 181 120 183 137 C192 134 198 128 201 120 C197 103 186 94 169 93 Z',
  hip: 'M98 198 C106 207 116 213 128 215 L126 250 C116 254 104 251 96 244 Z M152 215 C164 213 174 207 182 198 L184 244 C176 251 164 254 154 250 Z',
  knee: 'M99 270 C108 266 122 267 130 273 L130 307 C122 313 108 313 100 307 Z M150 273 C158 267 172 266 181 270 L180 307 C172 313 158 313 150 307 Z',
  ankle: 'M99 337 C108 333 121 334 128 340 L127 371 C120 376 106 375 98 369 Z M152 340 C159 334 172 333 181 337 L182 369 C174 375 160 376 153 371 Z',
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
