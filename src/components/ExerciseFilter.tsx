import { useState } from 'react';
import { ADVANCED_EQUIPMENT_IDS, PRIMARY_EQUIPMENT_IDS } from '../data/equipmentOptions';
import { useI18n } from '../services/i18n';
import {
  BODY_AREAS,
  EXERCISE_LEVELS,
  EXERCISE_TYPES,
  type BodyArea,
  type Equipment,
  type ExerciseFilterMode,
  type ExerciseFilters,
  type ExerciseLevel,
} from '../types/rehab';

const primaryEquipment: Equipment[] = [...PRIMARY_EQUIPMENT_IDS];
const advancedEquipment: Equipment[] = [...ADVANCED_EQUIPMENT_IDS];
const supportEquipment = new Set<Equipment>(['chair', 'wall']);

export interface FilterAvailability {
  bodyArea: Record<BodyArea, number>;
  level: Record<ExerciseLevel | 'all', number>;
  equipment: Record<Equipment, number>;
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

  function getCountLabel(count: number): string {
    return t('exercises.countBadge', { count });
  }

  function getDisabledLabel(label: string): string {
    return t('exercises.unavailableFilter', { label });
  }

  function getBodyAreaDisabled(bodyArea: BodyArea): boolean {
    return filters.bodyArea !== bodyArea && availability.bodyArea[bodyArea] === 0;
  }

  function getLevelDisabled(level: ExerciseLevel | 'all'): boolean {
    return filters.level !== level && availability.level[level] === 0;
  }

  function getEquipmentDisabled(equipment: Equipment): boolean {
    if (equipment === 'bodyweight') return !filters.noEquipmentOnly && availability.equipment[equipment] === 0;
    if (filters.equipment.includes(equipment)) return false;
    if (supportEquipment.has(equipment)) return false;
    return availability.equipment[equipment] === 0;
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
        {filters.mode === 'recommended' ? (
          <p className="mt-2 text-sm leading-5 text-slate-600">{t('exercises.recommendedHelper')}</p>
        ) : null}
      </div>

      <div>
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.bodyArea')}</span>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {BODY_AREAS.map((bodyArea) => {
            const count = availability.bodyArea[bodyArea];
            const disabled = getBodyAreaDisabled(bodyArea);
            const label = t(`bodyAreas.${bodyArea}.label`);

            return (
              <button
                key={bodyArea}
                type="button"
                disabled={disabled}
                aria-label={disabled ? getDisabledLabel(label) : `${label} ${getCountLabel(count)}`}
                title={disabled ? getDisabledLabel(label) : undefined}
                onClick={() => onChange({ ...filters, bodyArea })}
                className={`focus-ring min-h-11 shrink-0 rounded-md px-3 text-sm font-semibold ${
                  filters.bodyArea === bodyArea
                    ? 'bg-calm-700 text-white'
                    : disabled
                      ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span>{label}</span>
                <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${filters.bodyArea === bodyArea ? 'bg-white/20' : 'bg-white/70'}`}>
                  {getCountLabel(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.equipmentBasics')}</span>
        <div className="grid grid-cols-3 gap-2">
          {primaryEquipment.map((equipment) => {
            const count = availability.equipment[equipment];
            const disabled = getEquipmentDisabled(equipment);
            const selected = equipment === 'bodyweight' ? filters.noEquipmentOnly : filters.equipment.includes(equipment);
            const label = t(`equipmentLabels.${equipment}`);

            return (
              <button
                key={equipment}
                type="button"
                disabled={disabled}
                aria-label={disabled ? getDisabledLabel(label) : `${label} ${getCountLabel(count)}`}
                title={disabled ? getDisabledLabel(label) : undefined}
                onClick={() => (
                  equipment === 'bodyweight'
                    ? onChange({ ...filters, equipment: [], noEquipmentOnly: !filters.noEquipmentOnly })
                    : toggleEquipment(equipment)
                )}
                className={`focus-ring min-h-11 rounded-md px-2 text-sm font-semibold ${
                  selected
                    ? 'bg-calm-700 text-white'
                    : disabled
                      ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                      : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span>{label}</span>
                <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${selected ? 'bg-white/20' : 'bg-white/70'}`}>
                  {getCountLabel(count)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">{t('exercises.activeFilters')}</span>
        {summaryChips.length > 0 ? (
          summaryChips.map((chip) => (
            <span key={chip} className="rounded-md bg-calm-50 px-2 py-1 text-sm font-semibold text-calm-700">{chip}</span>
          ))
        ) : (
          <span className="rounded-md bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-600">{t('exercises.noActiveFilters')}</span>
        )}
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
            <div>
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.level')}</span>
              <div className="grid grid-cols-2 gap-2">
                {(['all', ...EXERCISE_LEVELS] as Array<ExerciseLevel | 'all'>).map((level) => {
                  const count = availability.level[level];
                  const disabled = getLevelDisabled(level);
                  const label = level === 'all' ? t('exercises.allLevels') : t(`levelLabels.${level}`);

                  return (
                    <button
                      key={level}
                      type="button"
                      disabled={disabled}
                      aria-label={disabled ? getDisabledLabel(label) : `${label} ${getCountLabel(count)}`}
                      title={disabled ? getDisabledLabel(label) : undefined}
                      onClick={() => onChange({ ...filters, level })}
                      className={`focus-ring min-h-11 rounded-md px-3 text-sm font-semibold ${
                        filters.level === level
                          ? 'bg-calm-700 text-white'
                          : disabled
                            ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                            : 'bg-white text-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${filters.level === level ? 'bg-white/20' : 'bg-slate-50'}`}>
                        {getCountLabel(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.type')}</span>
              <select
                value={filters.type}
                onChange={(event) => onChange({ ...filters, type: event.target.value as ExerciseFilters['type'] })}
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
                onChange={(event) => onChange({ ...filters, duration: event.target.value as ExerciseFilters['duration'] })}
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
            <span className="mb-2 block text-sm font-semibold text-slate-700">{t('exercises.equipment')}</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[...primaryEquipment, ...advancedEquipment].map((equipment) => {
                const count = availability.equipment[equipment];
                const disabled = getEquipmentDisabled(equipment);
                const selected = equipment === 'bodyweight' ? filters.noEquipmentOnly : filters.equipment.includes(equipment);
                const label = t(`equipmentLabels.${equipment}`);

                return (
                  <button
                    key={equipment}
                    type="button"
                    disabled={disabled}
                    aria-label={disabled ? getDisabledLabel(label) : `${label} ${getCountLabel(count)}`}
                    title={disabled ? getDisabledLabel(label) : undefined}
                    onClick={() => (
                      equipment === 'bodyweight'
                        ? onChange({ ...filters, equipment: [], noEquipmentOnly: !filters.noEquipmentOnly })
                        : toggleEquipment(equipment)
                    )}
                    className={`focus-ring min-h-11 rounded-md px-3 text-sm font-semibold ${
                      selected
                        ? 'bg-calm-700 text-white'
                        : disabled
                          ? 'cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-400'
                          : 'bg-white text-slate-700'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${selected ? 'bg-white/20' : 'bg-slate-50'}`}>
                      {getCountLabel(count)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
