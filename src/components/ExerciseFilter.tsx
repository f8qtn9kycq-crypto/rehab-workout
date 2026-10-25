import ExercisePurposeSelector from './ExercisePurposeSelector';
import type { ExercisePurposeFilter } from '../data/exercisePurposes';
import {
  BODY_AREAS,
  type BodyArea,
  type ExerciseFilterMode,
  type ExerciseFilters,
} from '../types/rehab';
import BodyMapSelector from './BodyMapSelector';
import { useI18n } from '../services/i18n';

export interface FilterAvailability {
  bodyArea: Record<BodyArea, number>;
}

export default function ExerciseFilter({
  filters,
  availability,
  onChange,
  purpose, query, onDiscoveryChange, onClear,
}: {
  filters: ExerciseFilters;
  availability: FilterAvailability;
  onChange: (filters: ExerciseFilters) => void;
  purpose: ExercisePurposeFilter;
  query: string;
  onDiscoveryChange: (purpose: ExercisePurposeFilter, query: string) => void;
  onClear: () => void;
}) {
  const { t } = useI18n();

  const hasActiveFilters = filters.mode !== 'recommended' || filters.bodyArea !== 'all' || purpose !== 'all' || Boolean(query);
  const summaryChips = [
    t(`discovery.purposes.${purpose}`),
    query || null,
    filters.mode === 'recommended' ? t('exercises.recommendedSummary') : t('exercises.allSummary'),
    filters.bodyArea !== 'all' ? t(`discovery.bodyAreas.${filters.bodyArea}`) : null,
  ].filter(Boolean) as string[];

  return (
    <section className="card space-y-3 p-3">
      <div>
        <h2 className="text-lg font-bold text-ink">{t('exercises.filterTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('exercises.filterHint')}</p>
      </div>

      <ExercisePurposeSelector value={purpose} onChange={value => onDiscoveryChange(value, query)} />
      <label className="block text-sm font-semibold text-slate-700">{t('discovery.search')}
        <input type="search" maxLength={100} value={query} onChange={event => onDiscoveryChange(purpose, event.target.value)} className="focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base" />
      </label>
      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('discovery.scope')}</span>
        <div className="grid grid-cols-2 gap-2">
          {(['recommended', 'all'] as ExerciseFilterMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ ...filters, mode })}
              aria-pressed={filters.mode === mode}
              className={`focus-ring min-h-11 rounded-md px-3 text-sm font-bold ${
                filters.mode === mode ? 'border-2 border-calm-900 bg-calm-700 text-white' : 'border border-slate-200 bg-slate-100 text-slate-700'
              }`}
            >
              {mode === 'recommended' ? t('exercises.recommendedMode') : t('exercises.allMode')}
            </button>
          ))}
        </div>
        {filters.mode === 'recommended' ? (
          <p className="mt-2 text-sm leading-5 text-slate-600">{t('exercises.recommendedHelper')}</p>
        ) : null}
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.bodyArea')}</span>
        <button type="button" aria-pressed={filters.bodyArea === 'all'} onClick={() => onChange({ ...filters, bodyArea: 'all' })} className={`focus-ring mb-3 min-h-11 rounded-md border px-3 text-sm font-bold ${filters.bodyArea === 'all' ? 'border-calm-900 bg-calm-700 text-white' : 'border-slate-200 bg-white text-slate-700'}`}>{t('discovery.allBodyAreas')}</button>
        <BodyMapSelector
          selected={filters.bodyArea}
          availability={availability.bodyArea}
          labels={Object.fromEntries(BODY_AREAS.map(area => [area, t(`discovery.bodyAreas.${area}`)]))}
          ariaLabel={t('exercises.bodyArea')}
          onChange={(bodyArea) => onChange({ ...filters, bodyArea })}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">{t('exercises.activeFilters')}</span>
        {summaryChips.map((chip) => (
          <span key={chip} className="rounded-md bg-calm-50 px-2 py-1 text-sm font-semibold text-calm-700">{chip}</span>
        ))}
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="focus-ring min-h-11 rounded-md px-3 text-sm font-bold text-calm-700"
        >
          {t('actions.clearFilters')}
        </button>
      ) : null}
    </section>
  );
}
