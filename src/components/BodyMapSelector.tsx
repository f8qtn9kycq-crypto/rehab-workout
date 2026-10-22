import { useId } from 'react';
import geometry from '../data/bodyMapGeometry.json';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';


export default function BodyMapSelector({ selected, onChange, ariaLabel, availability }: {
  selected: BodyArea | 'all';
  onChange: (area: BodyArea) => void;
  ariaLabel?: string;
  availability?: Record<BodyArea, number>;
}) {
  const { t } = useI18n();
  const clipId = `body-map-${useId().replace(/:/g, '')}`;

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
    <svg viewBox="0 0 1024 1536" className="mx-auto max-h-[420px] w-full max-w-[280px] bg-white" aria-label={ariaLabel}>
      <defs><clipPath id={clipId}><path d={geometry.silhouette} /></clipPath></defs>
      <path d={geometry.silhouette} fill="white" aria-hidden="true" />
      <g clipPath={`url(#${clipId})`}>
        {BODY_AREAS.map(area => {
          const { accessibleLabel, disabled } = areaMeta(area);
          const active = selected === area;
          return <g key={area}>
            <path d={geometry.regions[area]}
              fill={active ? '#17695d' : disabled ? '#cbd5e1' : '#75b8aa'}
              fillOpacity={active ? 0.42 : disabled ? 0.12 : 0.2}
              aria-hidden="true" className="pointer-events-none" />
            <path d={geometry.regions[area]} fill="transparent" stroke="transparent"
              vectorEffect="non-scaling-stroke" role="button" tabIndex={disabled ? -1 : 0}
              aria-disabled={disabled} aria-label={accessibleLabel} aria-pressed={active}
              className={disabled
                ? 'cursor-not-allowed focus:outline-none'
                : 'cursor-pointer focus:outline-none focus-visible:stroke-calm-900 focus-visible:stroke-[3]'}
              onClick={() => selectArea(area, disabled)}
              onKeyDown={event => { if (!disabled && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onChange(area); } }} />
          </g>;
        })}
      </g>
      <path d={geometry.ink} fill="#1e293b" fillRule="evenodd" className="pointer-events-none" aria-hidden="true" />
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
