import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ExerciseCard from '../components/ExerciseCard';
import ExerciseFilter, { type FilterAvailability } from '../components/ExerciseFilter';
import { EQUIPMENT_OPTIONS } from '../data/equipmentOptions';
import { exercises } from '../data/exercises';
import { assessmentStorageKey } from '../data/safety';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { BODY_AREAS, type BodyArea, type DurationFilter, type Equipment, type ExerciseFilterMode, type ExerciseFilters, type ExerciseLevel, type ExerciseType, type SavedAssessment } from '../types/rehab';
import {
  filterExercises,
  getExerciseEquipment,
  isBodyArea,
  isDurationFilter,
  isEquipment,
  isExerciseFilterMode,
  isExerciseLevel,
  isExerciseType,
} from '../utils/exerciseModel';
import { shouldStopForPain, shouldUseRecoveryMode } from '../utils/painRules';
import { getRecommendedExercises } from '../utils/recommendationEngine';

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
  const logs = useMemo(() => getLogs(), []);
  const [filters, setFilters] = useState<ExerciseFilters>(() => buildInitialFilters(searchParams, assessment));
  const assessmentEquipment = useMemo(() => assessment?.equipment?.filter((item) => validEquipment.includes(item)) ?? [], [assessment]);
  const coveredEquipment = useMemo(() => new Set(validEquipment.filter((equipment) => {
    return exercises.some((exercise) => getExerciseEquipment(exercise).includes(equipment));
  })), []);
  const showHighPainWarning = shouldStopForPain(assessment?.pain ?? null);
  const isRecoveryRecommendation =
    filters.mode === 'recommended' &&
    (assessment?.mode === 'recovery' || shouldUseRecoveryMode(assessment?.pain ?? null) || filters.painSensitive);

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

  function getFilteredExercises(nextFilters: ExerciseFilters) {
    if (nextFilters.mode === 'recommended' && !assessment && nextFilters.bodyArea === 'all') {
      return [];
    }
    if (nextFilters.equipment.some((equipment) => !coveredEquipment.has(equipment))) {
      return [];
    }

    if (nextFilters.mode === 'recommended') {
      return getRecommendedExercises(exercises, nextFilters, {
        assessment,
        assessmentEquipment,
        logs,
      });
    }

    return filterExercises(exercises, nextFilters, {
      hasAssessment: Boolean(assessment),
      assessmentEquipment,
    });
  }

  const filtered = useMemo(() => {
    return getFilteredExercises(filters);
  }, [assessment, filters, logs]);

  const availability = useMemo<FilterAvailability>(() => {
    function countFor(nextFilters: ExerciseFilters): number {
      return getFilteredExercises(nextFilters).length;
    }

    const bodyArea = Object.fromEntries(BODY_AREAS.map((bodyAreaOption) => [
      bodyAreaOption,
      countFor({ ...filters, bodyArea: bodyAreaOption }),
    ])) as FilterAvailability['bodyArea'];

    return { bodyArea };
  }, [assessment, assessmentEquipment, filters, logs]);

  function clearExerciseFilters(): void {
    handleFilterChange({
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

  function tryBodyweightExercises(): void {
    handleFilterChange({
      ...filters,
      mode: assessment ? filters.mode : 'all',
      bodyArea: filters.bodyArea !== 'all' ? filters.bodyArea : (assessment?.bodyArea ?? 'all'),
      level: 'beginner',
      equipment: [],
      noEquipmentOnly: true,
    });
  }

  function backToRecommended(): void {
    handleFilterChange({
      mode: 'recommended',
      bodyArea: assessment?.bodyArea ?? 'all',
      type: 'all',
      level: 'all',
      equipment: [],
      noEquipmentOnly: false,
      duration: 'all',
      painSensitive: false,
    });
  }

  const emptyMessage = (() => {
    if (showHighPainWarning) return t('exercises.painStopEmpty');
    if (filters.mode === 'recommended' && !assessment && filters.bodyArea === 'all') {
      return t('exercises.chooseBodyArea');
    }
    if ((filters.equipment.length > 0 || filters.noEquipmentOnly) && filtered.length === 0) {
      return t('exercises.equipmentTooNarrowEmpty');
    }
    if (isRecoveryRecommendation && filtered.length === 0) {
      return t('exercises.recoveryNoMatchEmpty');
    }
    return t('exercises.empty');
  })();

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('exercises.title')}</h1>
        <p className="mt-2 text-slate-600">{t('exercises.subtitle')}</p>
      </div>
      {showHighPainWarning ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900" role="alert">
          {t('exercises.painStopEmpty')}
        </div>
      ) : null}
      <ExerciseFilter filters={filters} availability={availability} onChange={handleFilterChange} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
      {filtered.length === 0 && !showHighPainWarning && !(filters.mode === 'recommended' && !assessment && filters.bodyArea === 'all') ? (
        <div className="card space-y-4 p-5 text-slate-700">
          <div>
            <h2 className="text-lg font-bold text-ink">{t('exercises.emptyTitle')}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('exercises.emptyMessage')}</p>
            {isRecoveryRecommendation ? (
              <p className="mt-2 text-sm leading-6 text-amber-800">{t('exercises.recoveryNoMatchEmpty')}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={clearExerciseFilters}
              className="focus-ring min-h-11 rounded-md bg-calm-700 px-4 text-sm font-bold text-white"
            >
              {t('exercises.emptyClearAction')}
            </button>
            <button
              type="button"
              onClick={tryBodyweightExercises}
              className="focus-ring min-h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800"
            >
              {t('exercises.emptyBodyweightAction')}
            </button>
            <button
              type="button"
              onClick={backToRecommended}
              className="focus-ring min-h-11 rounded-md px-4 text-sm font-bold text-calm-700"
            >
              {t('exercises.emptyRecommendedAction')}
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-5 text-slate-600">{emptyMessage}</div>
      ) : null}
    </div>
  );
}
