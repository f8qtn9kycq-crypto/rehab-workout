import {
  BODY_AREAS,
  type BodyArea,
  type ExerciseFilterMode,
  type ExerciseFilters,
} from '../types/rehab';
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

  function getCountLabel(count: number): string {
    return t('exercises.countBadge', { count });
  }

  function getDisabledLabel(label: string): string {
    return t('exercises.unavailableFilter', { label });
  }

  function getBodyAreaDisabled(bodyArea: BodyArea): boolean {
    return filters.bodyArea !== bodyArea && availability.bodyArea[bodyArea] === 0;
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BODY_AREAS.map((bodyArea) => {
            const count = availability.bodyArea[bodyArea];
            const disabled = getBodyAreaDisabled(bodyArea);
            const label = t(`bodyAreas.${bodyArea}.label`);

            return (
              <button
                key={bodyArea}
                type="button"
                disabled={disabled}
                aria-pressed={filters.bodyArea === bodyArea}
                aria-label={disabled ? getDisabledLabel(label) : `${label} ${getCountLabel(count)}`}
                title={disabled ? getDisabledLabel(label) : undefined}
                onClick={() => onChange({ ...filters, bodyArea })}
                className={`focus-ring min-h-11 rounded-md px-2 py-2 text-sm font-semibold ${
                  filters.bodyArea === bodyArea
                    ? 'border-2 border-calm-900 bg-calm-700 text-white'
                    : disabled
                      ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                      : 'border border-slate-200 bg-slate-100 text-slate-700'
                }`}
              >
                <span className="block leading-5">{label}</span>
                <span className={`mt-1 inline-flex rounded px-1.5 py-0.5 text-xs ${filters.bodyArea === bodyArea ? 'bg-white/20' : 'bg-white/70'}`}>
                  {getCountLabel(count)}
                </span>
              </button>
            );
          })}
        </div>
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
