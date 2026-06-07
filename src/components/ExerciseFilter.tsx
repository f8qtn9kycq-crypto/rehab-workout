import { useState } from 'react';
import { EQUIPMENT_OPTIONS, PRIMARY_EQUIPMENT_IDS } from '../data/equipmentOptions';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, EXERCISE_LEVELS, EXERCISE_TYPES, type BodyArea, type Equipment, type ExerciseLevel, type ExerciseType } from '../types/rehab';

const primaryEquipment: Equipment[] = [...PRIMARY_EQUIPMENT_IDS];
const supportEquipment = EQUIPMENT_OPTIONS
  .map((item) => item.id)
  .filter((id) => !primaryEquipment.includes(id));

export type ExerciseFilterMode = 'recommended' | 'all';
export type DurationFilter = 'all' | 'short' | 'medium';

export interface ExerciseFilters {
  mode: ExerciseFilterMode;
  bodyArea: BodyArea | 'all';
  type: ExerciseType | 'all';
  level: ExerciseLevel | 'all';
  equipment: Equipment[];
  noEquipmentOnly: boolean;
  duration: DurationFilter;
  painSensitive: boolean;
}

export default function ExerciseFilter({
  filters,
  onChange,
}: {
  filters: ExerciseFilters;
  onChange: (filters: ExerciseFilters) => void;
}) {
  const { t } = useI18n();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const hasActiveFilters =
    filters.mode !== 'recommended' ||
    filters.bodyArea !== 'all' ||
    filters.type !== 'all' ||
    filters.level !== 'all' ||
    filters.equipment.length > 0 ||
    filters.noEquipmentOnly ||
    filters.duration !== 'all' ||
    filters.painSensitive;

  function toggleEquipment(equipment: Equipment): void {
    const selected = filters.equipment.includes(equipment)
      ? filters.equipment.filter((item) => item !== equipment)
      : [...filters.equipment, equipment];

    onChange({ ...filters, equipment: selected, noEquipmentOnly: false });
  }

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

  const summaryChips = [
    filters.mode === 'recommended' ? t('exercises.recommendedSummary') : t('exercises.allSummary'),
    filters.bodyArea !== 'all' ? t(`bodyAreas.${filters.bodyArea}.label`) : null,
    filters.noEquipmentOnly ? t('exercises.bodyweightOnly') : null,
    ...filters.equipment.map((equipment) => t(`equipmentLabels.${equipment}`)),
    filters.level !== 'all' ? t(`levelLabels.${filters.level}`) : null,
    filters.type !== 'all' ? t(`typeLabels.${filters.type}`) : null,
    filters.duration !== 'all' ? t(`exercises.${filters.duration}Duration`) : null,
    filters.painSensitive ? t('exercises.painSensitiveMode') : null,
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
              className={`focus-ring min-h-11 rounded-md px-3 text-sm font-bold ${
                filters.mode === mode ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {mode === 'recommended' ? t('exercises.recommendedMode') : t('exercises.allMode')}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.bodyArea')}</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {BODY_AREAS.map((bodyArea) => (
            <button
              key={bodyArea}
              type="button"
              onClick={() => onChange({ ...filters, bodyArea })}
              className={`focus-ring min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold ${
                filters.bodyArea === bodyArea ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {t(`bodyAreas.${bodyArea}.label`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.equipment')}</span>
        <div className="grid grid-cols-3 gap-2">
          {primaryEquipment.map((equipment) => (
            <button
              key={equipment}
              type="button"
              onClick={() => (
                equipment === 'bodyweight'
                  ? onChange({ ...filters, equipment: [], noEquipmentOnly: !filters.noEquipmentOnly })
                  : toggleEquipment(equipment)
              )}
              className={`focus-ring min-h-11 rounded-md px-2 text-sm font-semibold ${
                (equipment === 'bodyweight' ? filters.noEquipmentOnly : filters.equipment.includes(equipment))
                  ? 'bg-calm-700 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {t(`equipmentLabels.${equipment}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">{t('exercises.activeFilters')}</span>
        {summaryChips.map((chip) => (
          <span key={chip} className="rounded-md bg-calm-50 px-2 py-1 text-sm font-semibold text-calm-700">{chip}</span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          className="focus-ring min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800"
        >
          {advancedOpen ? t('actions.hideFilters') : t('actions.moreFilters')}
        </button>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="focus-ring min-h-11 rounded-md px-3 text-sm font-bold text-calm-700"
          >
            {t('actions.clearFilters')}
          </button>
        ) : null}
      </div>

      {advancedOpen ? (
        <div className="space-y-3 rounded-lg bg-slate-50 p-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.level')}</span>
              <select
                value={filters.level}
                onChange={(event) => onChange({ ...filters, level: event.target.value as ExerciseLevel | 'all' })}
                className="focus-ring min-h-11 w-full rounded-md border border-slate-200 bg-white px-3"
              >
                <option value="all">{t('exercises.allLevels')}</option>
                {EXERCISE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {t(`levelLabels.${level}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.type')}</span>
              <select
                value={filters.type}
                onChange={(event) => onChange({ ...filters, type: event.target.value as ExerciseType | 'all' })}
                className="focus-ring min-h-11 w-full rounded-md border border-slate-200 bg-white px-3"
              >
                <option value="all">{t('exercises.allTypes')}</option>
                {EXERCISE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(`typeLabels.${type}`)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.duration')}</span>
              <select
                value={filters.duration}
                onChange={(event) => onChange({ ...filters, duration: event.target.value as DurationFilter })}
                className="focus-ring min-h-11 w-full rounded-md border border-slate-200 bg-white px-3"
              >
                <option value="all">{t('exercises.anyDuration')}</option>
                <option value="short">{t('exercises.shortDuration')}</option>
                <option value="medium">{t('exercises.mediumDuration')}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => onChange({ ...filters, painSensitive: !filters.painSensitive })}
              className={`focus-ring min-h-11 self-end rounded-md px-3 text-sm font-semibold ${
                filters.painSensitive ? 'bg-calm-700 text-white' : 'bg-white text-slate-700'
              }`}
            >
              {t('exercises.painSensitiveMode')}
            </button>
          </div>

          <div>
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.supportEquipment')}</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {supportEquipment.map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  onClick={() => toggleEquipment(equipment)}
                  className={`focus-ring min-h-11 rounded-md px-3 text-sm font-semibold ${
                    filters.equipment.includes(equipment) ? 'bg-calm-700 text-white' : 'bg-white text-slate-700'
                  }`}
                >
                  {t(`equipmentLabels.${equipment}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
