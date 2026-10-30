import { LEG_PATTERNS, REHAB_FUNCTIONS, STRENGTH_GROUPS, type ExercisePurposeFilter, type LegPattern, type RehabFunction, type StrengthGroup } from '../data/exercisePurposes';
import { getExercisePurposeInfo } from './exerciseDiscovery';

export interface ExerciseTaxonomyFilters {
  strengthGroup: 'all' | StrengthGroup;
  legPattern: 'all' | LegPattern;
  rehabFunction: 'all' | RehabFunction;
}
export const EMPTY_TAXONOMY: ExerciseTaxonomyFilters = { strengthGroup: 'all', legPattern: 'all', rehabFunction: 'all' };

function option<T extends string>(value: string | null, allowed: readonly T[]): 'all' | T {
  return allowed.includes(value as T) ? value as T : 'all';
}

export function parseExerciseTaxonomy(params: URLSearchParams, purpose: ExercisePurposeFilter): ExerciseTaxonomyFilters {
  const strengthGroup = purpose === 'strength' ? option(params.get('group'), STRENGTH_GROUPS) : 'all';
  return {
    strengthGroup,
    legPattern: strengthGroup === 'legs' ? option(params.get('pattern'), LEG_PATTERNS) : 'all',
    rehabFunction: purpose === 'rehab' ? option(params.get('function'), REHAB_FUNCTIONS) : 'all',
  };
}

export function matchesExerciseTaxonomy(exerciseId: string, purpose: ExercisePurposeFilter, filters: ExerciseTaxonomyFilters): boolean {
  const info = getExercisePurposeInfo(exerciseId);
  if (purpose === 'strength') {
    const groups = info?.strengthGroups?.length ? info.strengthGroups : ['other'];
    const patterns = info?.legPatterns?.length ? info.legPatterns : ['other'];
    return (filters.strengthGroup === 'all' || groups.includes(filters.strengthGroup))
      && (filters.strengthGroup !== 'legs' || filters.legPattern === 'all' || patterns.includes(filters.legPattern));
  }
  if (purpose === 'rehab') {
    const functions = info?.rehabFunctions?.length ? info.rehabFunctions : ['other'];
    return filters.rehabFunction === 'all' || functions.includes(filters.rehabFunction);
  }
  return true;
}
