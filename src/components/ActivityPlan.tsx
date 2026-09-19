import { useState } from 'react';
import { useI18n } from '../services/i18n';
import { readActivityPlan, saveActivityPlan } from '../services/activityStorage';

export default function ActivityPlan() {
  const { t } = useI18n();
  const [plan, setPlan] = useState(readActivityPlan);
  const [failed, setFailed] = useState(false);
  const names = ['lower', 'push', 'pull', 'cycling', 'cycling', 'cycling', 'cycling'];
  return <details>
    <summary className="min-h-11 cursor-pointer py-3 font-bold">{t('activities.plan')}</summary>
    <p className="text-sm">{t('activities.planHint')}</p>
    <ul className="my-3 space-y-2">{Array.from({ length: 7 }, (_, day) => <li key={day}><strong>{t(`activities.days.${day}`)}</strong>: {plan.days.flatMap((value, index) => value === day ? [t(`activities.planNames.${names[index]}`)] : []).join(' · ') || t('activities.rest')}</li>)}</ul>
    <details><summary className="min-h-11 cursor-pointer py-3">{t('activities.editPlan')}</summary>
      {plan.days.map((day, index) => <label key={index} className="my-3 block">{t(`activities.planNames.${names[index]}`)} {index < 3 ? '' : index - 2}
        <select disabled={plan.error} className="focus-ring min-h-11 w-full rounded-md border border-slate-300 bg-white p-3" value={day} onChange={event => {
          const days = plan.days.map((value, i) => i === index ? Number(event.target.value) : value);
          const ok = saveActivityPlan(days); setFailed(!ok); if (ok) setPlan({ days, error: false });
        }}>{Array.from({ length: 7 }, (_, i) => <option key={i} value={i}>{t(`activities.days.${i}`)}</option>)}</select>
      </label>)}
    </details>
    {(failed || plan.error) && <p role="alert">{t('activities.error')}</p>}
  </details>;
}
