import { LEG_PATTERNS, REHAB_FUNCTIONS, STRENGTH_GROUPS, type ExercisePurposeFilter } from '../data/exercisePurposes';
import { BODY_AREAS, type BodyArea } from '../types/rehab';
import type { ExerciseTaxonomyFilters } from '../utils/exerciseTaxonomy';
import { useI18n } from '../services/i18n';

export default function ExerciseTaxonomySelector({ purpose, value, onChange, area, onAreaChange }: {
  purpose: ExercisePurposeFilter;
  value: ExerciseTaxonomyFilters;
  onChange: (value: ExerciseTaxonomyFilters) => void;
  area?: BodyArea | 'all';
  onAreaChange?: (area: BodyArea | 'all') => void;
}) {
  const { t } = useI18n();
  const button = (selected: boolean) => `focus-ring min-h-11 rounded-md border px-3 py-2 text-sm font-bold ${selected ? 'border-calm-900 bg-calm-700 text-white' : 'border-slate-300 bg-white text-calm-800'}`;
  if (purpose === 'all') return null;
  return <div className="space-y-3">
    {purpose === 'strength' ? <>
      <fieldset><legend className="mb-2 font-bold text-ink">{t('taxonomy.strengthTitle')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(['all', ...STRENGTH_GROUPS] as const).map(group => <button key={group} type="button" aria-pressed={value.strengthGroup === group} className={button(value.strengthGroup === group)} onClick={() => onChange({ ...value, strengthGroup: group, legPattern: 'all' })}>{t(`taxonomy.groups.${group}`)}</button>)}</div>
      </fieldset>
      {value.strengthGroup === 'legs' && <fieldset><legend className="mb-2 font-bold text-ink">{t('taxonomy.legsTitle')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(['all', ...LEG_PATTERNS] as const).map(pattern => <button key={pattern} type="button" aria-pressed={value.legPattern === pattern} className={button(value.legPattern === pattern)} onClick={() => onChange({ ...value, legPattern: pattern })}>{t(`taxonomy.patterns.${pattern}`)}</button>)}</div>
      </fieldset>}
    </> : <>
      {area !== undefined && onAreaChange && <fieldset><legend className="mb-2 font-bold text-ink">{t('taxonomy.areaTitle')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(['all', ...BODY_AREAS] as const).map(option => <button key={option} type="button" aria-pressed={area === option} className={button(area === option)} onClick={() => onAreaChange(option)}>{t(option === 'all' ? 'discovery.allBodyAreas' : `discovery.bodyAreas.${option}`)}</button>)}</div>
      </fieldset>}
      <fieldset><legend className="mb-2 font-bold text-ink">{t('taxonomy.rehabTitle')}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{(['all', ...REHAB_FUNCTIONS] as const).map(goal => <button key={goal} type="button" aria-pressed={value.rehabFunction === goal} className={button(value.rehabFunction === goal)} onClick={() => onChange({ ...value, rehabFunction: goal })}>{t(`taxonomy.functions.${goal}`)}</button>)}</div>
      </fieldset>
    </>}
    <p className="text-sm leading-6 text-slate-600">{t('taxonomy.hint')}</p>
  </div>;
}
