import {
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
}: {
  filters: ExerciseFilters;
  availability: FilterAvailability;
  onChange: (filters: ExerciseFilters) => void;
}) {
  const { t } = useI18n();

  function clearFilters(): void {
    onChange({
      mode: 'recommended',
      bodyArea: 'all',
      type: 'all',
      level: 'all',
      equipment: [],
      noEquipmentOnly: false,
      duration: 'all',
      painSensitive: false,
    });
  }

  const hasActiveFilters = filters.mode !== 'recommended' || filters.bodyArea !== 'all';
  const summaryChips = [
    filters.mode === 'recommended' ? t('exercises.recommendedSummary') : t('exercises.allSummary'),
    filters.bodyArea !== 'all' ? t(`bodyAreas.${filters.bodyArea}.label`) : null,
  ].filter(Boolean) as string[];

  return (
    <section className="card space-y-3 p-3">
      <div>
        <h2 className="text-lg font-bold text-ink">{t('exercises.filterTitle')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('exercises.filterHint')}</p>
      </div>

      <div>
        <span className="sr-only">{t('exercises.mode')}</span>
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
        <BodyMapSelector
          selected={filters.bodyArea}
          availability={availability.bodyArea}
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
          onClick={clearFilters}
          className="focus-ring min-h-11 rounded-md px-3 text-sm font-bold text-calm-700"
        >
          {t('actions.clearFilters')}
        </button>
      ) : null}
    </section>
  );
}
