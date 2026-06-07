import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseFilter, { type DurationFilter, type ExerciseFilterMode, type ExerciseFilters } from '../components/ExerciseFilter';
import { EQUIPMENT_OPTIONS, SUPPORT_ONLY_EQUIPMENT_IDS } from '../data/equipmentOptions';
import { exercises } from '../data/exercises';
import { assessmentStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { EQUIPMENT_IDS, type BodyArea, type Equipment, type Exercise, type ExerciseLevel, type ExerciseType } from '../types/rehab';
import { isBodyArea, isEquipment, isExerciseLevel, isExerciseType } from '../utils/exerciseModel';

const validEquipment = EQUIPMENT_OPTIONS.map((item) => item.id);
const validModes: ExerciseFilterMode[] = ['recommended', 'all'];
const validDurations: DurationFilter[] = ['all', 'short', 'medium'];
const supportOnlyEquipment: readonly Equipment[] = SUPPORT_ONLY_EQUIPMENT_IDS;

interface SavedAssessment {
  bodyArea?: BodyArea;
  equipment?: Equipment[];
  mode?: 'recovery' | 'beginner' | 'standard';
  pain?: number;
}

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
  return validModes.includes(value as ExerciseFilterMode) ? (value as ExerciseFilterMode) : 'recommended';
}

function getDurationParam(value: string | null): DurationFilter {
  return validDurations.includes(value as DurationFilter) ? (value as DurationFilter) : 'all';
}

function getEquipmentParams(searchParams: URLSearchParams): Equipment[] {
  return searchParams
    .getAll('equipment')
    .filter((value): value is Equipment => isEquipment(value, validEquipment));
}

function isSupportOnlyExercise(exercise: Exercise): boolean {
  if (exercise.equipment.length === 0) return true;
  if (exercise.equipment.includes('bodyweight')) return true;
  return exercise.equipment.every((item) => supportOnlyEquipment.includes(item));
}

function isCompatibleWithEquipment(exercise: Exercise, availableEquipment: Equipment[]): boolean {
  if (exercise.equipment.length === 0) return true;

  return exercise.equipment.every((item) => {
    if (item === 'bodyweight') return true;
    if (availableEquipment.includes(item)) return true;
    return availableEquipment.includes('bodyweight') && supportOnlyEquipment.includes(item);
  });
}

function getDurationMinutes(exercise: Exercise): number {
  const match = exercise.durationText.match(/\d+/);
  return match ? Number(match[0]) : 99;
}

function matchesDuration(exercise: Exercise, duration: DurationFilter): boolean {
  if (duration === 'all') return true;
  const minutes = getDurationMinutes(exercise);
  return duration === 'short' ? minutes <= 5 : minutes <= 10;
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
    const availableEquipment = filters.noEquipmentOnly
      ? [EQUIPMENT_IDS.BODYWEIGHT]
      : filters.equipment.length > 0
        ? filters.equipment
        : assessmentEquipment.length > 0
          ? assessmentEquipment
          : [EQUIPMENT_IDS.BODYWEIGHT];

    if (filters.mode === 'recommended' && !assessment && filters.bodyArea === 'all') {
      return [];
    }

    return exercises.filter((exercise) => {
      const levelFilter = filters.mode === 'recommended' && filters.level === 'all' ? 'beginner' : filters.level;

      return (
        (filters.bodyArea === 'all' || exercise.bodyArea === filters.bodyArea) &&
        (filters.type === 'all' || exercise.type === filters.type) &&
        (levelFilter === 'all' || exercise.level === levelFilter) &&
        matchesDuration(exercise, filters.duration) &&
        (!filters.painSensitive || (exercise.level === 'beginner' && isSupportOnlyExercise(exercise))) &&
        (!filters.noEquipmentOnly || isSupportOnlyExercise(exercise)) &&
        (filters.mode === 'recommended'
          ? isCompatibleWithEquipment(exercise, availableEquipment)
          : filters.equipment.length === 0 || filters.equipment.some((equipment) => exercise.equipment.includes(equipment)))
      );
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
