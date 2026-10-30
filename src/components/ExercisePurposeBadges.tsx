import { useI18n } from '../services/i18n';
import { getExercisePurposeInfo } from '../utils/exerciseDiscovery';

export default function ExercisePurposeBadges({ exerciseId }: { exerciseId: string }) {
  const { t } = useI18n();
  const info = getExercisePurposeInfo(exerciseId);
  if (!info) return null;
  return <div role="group" className="flex flex-wrap items-center gap-2 text-sm font-semibold" aria-label={t('discovery.labels')}>
    <span className="text-slate-600">{t('discovery.purposeLabel')}</span>
    {[info.primaryPurpose, ...(info.secondaryPurposes ?? [])].map(purpose => <span key={purpose} className="rounded-md bg-calm-100 px-2 py-1 text-calm-800">{t(`discovery.purposes.${purpose}`)}</span>)}
    {info.strengthGroups?.length ? <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t('taxonomy.strengthType')}: {info.strengthGroups.map(group => t(`taxonomy.groups.${group}`)).join(t('progress.areaSeparator'))}</span> : null}
    {info.rehabFunctions?.length ? <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t('taxonomy.rehabType')}: {info.rehabFunctions.map(goal => t(`taxonomy.functions.${goal}`)).join(t('progress.areaSeparator'))}</span> : null}
    {(info.rehabGroup === 'care' || info.rehabGroup === 'mobility') && <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">{t(`discovery.groups.${info.rehabGroup}`)}</span>}
  </div>;
}
