import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseFilter from '../components/ExerciseFilter';
import { EQUIPMENT_OPTIONS } from '../data/equipmentOptions';
import { exercises } from '../data/exercises';
import { assessmentStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import type { BodyArea, DurationFilter, Equipment, ExerciseFilterMode, ExerciseFilters, ExerciseLevel, ExerciseType, SavedAssessment } from '../types/rehab';
import {
  filterExercises,
  isBodyArea,
  isDurationFilter,
  isEquipment,
  isExerciseFilterMode,
  isExerciseLevel,
  isExerciseType,
} from '../utils/exerciseModel';

const validEquipment = EQUIPMENT_OPTIONS.map((item) => item.id);

function readAssessment(): SavedAssessment | null {
  try {
    const raw = window.localStorage.getItem(assessmentStorageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getBodyAreaParam(value: string | null): BodyArea | 'all' {
  return isBodyArea(value) ? value : 'all';
}

function getTypeParam(value: string | null): ExerciseType | 'all' {
  return isExerciseType(value) ? value : 'all';
}

function getLevelParam(value: string | null): ExerciseLevel | 'all' {
  return isExerciseLevel(value) ? value : 'all';
}

function getModeParam(value: string | null): ExerciseFilterMode {
  return isExerciseFilterMode(value) ? value : 'recommended';
}

function getDurationParam(value: string | null): DurationFilter {
  return isDurationFilter(value) ? value : 'all';
}

function getEquipmentParams(searchParams: URLSearchParams): Equipment[] {
  return searchParams
    .getAll('equipment')
    .filter((value): value is Equipment => isEquipment(value, validEquipment));
}

function buildInitialFilters(searchParams: URLSearchParams, assessment: SavedAssessment | null): ExerciseFilters {
  const queryBodyArea = getBodyAreaParam(searchParams.get('bodyArea'));
  const queryEquipment = getEquipmentParams(searchParams);

  return {
    mode: getModeParam(searchParams.get('mode')),
    bodyArea: queryBodyArea !== 'all' ? queryBodyArea : assessment?.bodyArea ?? 'all',
    type: getTypeParam(searchParams.get('type')),
    level: getLevelParam(searchParams.get('level')),
    equipment: queryEquipment.length > 0 ? queryEquipment : [],
    noEquipmentOnly: searchParams.get('noEquipment') === 'true',
    duration: getDurationParam(searchParams.get('duration')),
    painSensitive: searchParams.get('painSensitive') === 'true',
  };
}

export default function ExercisesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useI18n();
  const assessment = useMemo(() => readAssessment(), []);
  const [filters, setFilters] = useState<ExerciseFilters>(() => buildInitialFilters(searchParams, assessment));

  useEffect(() => {
    const nextFilters = buildInitialFilters(searchParams, assessment);

    setFilters((current) => {
      const equipmentMatches =
        current.equipment.length === nextFilters.equipment.length &&
        current.equipment.every((item) => nextFilters.equipment.includes(item));

      return current.mode === nextFilters.mode &&
        current.bodyArea === nextFilters.bodyArea &&
        current.type === nextFilters.type &&
        current.level === nextFilters.level &&
        equipmentMatches &&
        current.noEquipmentOnly === nextFilters.noEquipmentOnly &&
        current.duration === nextFilters.duration &&
        current.painSensitive === nextFilters.painSensitive
        ? current
        : nextFilters;
    });
  }, [assessment, searchParams]);

  function handleFilterChange(nextFilters: ExerciseFilters): void {
    setFilters(nextFilters);
    const nextSearchParams = new URLSearchParams();

    if (nextFilters.mode !== 'recommended') nextSearchParams.set('mode', nextFilters.mode);
    if (nextFilters.bodyArea !== 'all') nextSearchParams.set('bodyArea', nextFilters.bodyArea);
    if (nextFilters.type !== 'all') nextSearchParams.set('type', nextFilters.type);
    if (nextFilters.level !== 'all') nextSearchParams.set('level', nextFilters.level);
    if (nextFilters.duration !== 'all') nextSearchParams.set('duration', nextFilters.duration);
    if (nextFilters.painSensitive) nextSearchParams.set('painSensitive', 'true');
    if (nextFilters.noEquipmentOnly) nextSearchParams.set('noEquipment', 'true');
    nextFilters.equipment.forEach((equipment) => nextSearchParams.append('equipment', equipment));

    setSearchParams(nextSearchParams, { replace: true });
  }

  const filtered = useMemo(() => {
    const assessmentEquipment = assessment?.equipment?.filter((item) => validEquipment.includes(item)) ?? [];
    return filterExercises(exercises, filters, {
      hasAssessment: Boolean(assessment),
      assessmentEquipment,
    });
  }, [assessment, filters]);

  const emptyMessage = filters.mode === 'recommended' && !assessment && filters.bodyArea === 'all'
    ? t('exercises.chooseBodyArea')
    : t('exercises.empty');

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('exercises.title')}</h1>
        <p className="mt-2 text-slate-600">{t('exercises.subtitle')}</p>
      </div>
      <ExerciseFilter filters={filters} onChange={handleFilterChange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="card p-5 text-slate-600">{emptyMessage}</div>
      ) : null}
    </div>
  );
}
