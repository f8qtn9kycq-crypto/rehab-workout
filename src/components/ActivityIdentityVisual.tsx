import { Bike, Dumbbell } from 'lucide-react';
import type { Activity as ActivityRecord } from '../services/activityStorage';
import { useI18n } from '../services/i18n';

export default function ActivityIdentityVisual({ activity }: { activity: ActivityRecord }) {
  const { t } = useI18n();
  const isCycling = activity.kind === 'cycling';
  const Icon = isCycling ? Bike : Dumbbell;
  return <div className="flex min-w-0 items-center gap-3 rounded-lg border border-calm-100 bg-calm-50/70 p-3">
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white text-calm-700" role="img" aria-label={t(isCycling ? 'activityVisual.cyclingAlt' : 'activityVisual.resistanceAlt')}><Icon size={38} strokeWidth={2.25} aria-hidden="true" /></div>
    <div className="min-w-0"><p className="break-words text-lg font-black leading-tight text-ink">{t(`activities.${activity.kind}`)}</p><p className="mt-1 text-sm text-slate-600">{t(isCycling ? 'activityVisual.cyclingHelper' : 'activityVisual.resistanceHelper')}</p></div>
  </div>;
}
