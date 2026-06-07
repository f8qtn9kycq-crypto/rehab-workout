import { useState } from 'react';
import { useI18n } from '../services/i18n';

type RoutineKey = 'beginner' | 'standard' | 'recovery';

const weeklyRoutines: Record<RoutineKey, { titleKey: string; days: Array<{ dayKey: string; itemKeys: string[] }> }> = {
  beginner: {
    titleKey: 'weeklyRoutine.beginner',
    days: [
      { dayKey: 'weeklyRoutine.monday', itemKeys: ['ankleCircles', 'ankleAlphabet', 'chinTuck'] },
      { dayKey: 'weeklyRoutine.wednesday', itemKeys: ['ankleBand', 'scapularSqueeze'] },
      { dayKey: 'weeklyRoutine.friday', itemKeys: ['singleLegStand', 'hipFlexion'] },
    ],
  },
  standard: {
    titleKey: 'weeklyRoutine.standard',
    days: [
      { dayKey: 'weeklyRoutine.monday', itemKeys: ['calfRaise', 'straightLegRaise', 'pecStretch'] },
      { dayKey: 'weeklyRoutine.wednesday', itemKeys: ['wallSquat', 'hipAbduction', 'neckIsometric'] },
      { dayKey: 'weeklyRoutine.friday', itemKeys: ['gluteBridge', 'singleLegStand', 'shoulderExternalRotation'] },
    ],
  },
  recovery: {
    titleKey: 'weeklyRoutine.recovery',
    days: [
      { dayKey: 'weeklyRoutine.today', itemKeys: ['neckHeatRelax', 'kneeRice', 'ankleCircles'] },
    ],
  },
};

export default function WeeklyRoutineBuilder() {
  const [routine, setRoutine] = useState<RoutineKey>('beginner');
  const { t } = useI18n();
  const selected = weeklyRoutines[routine];

  return (
    <section className="card p-4">
      <h2 className="text-xl font-bold text-ink">{t('weeklyRoutine.title')}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {(Object.keys(weeklyRoutines) as RoutineKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setRoutine(key)}
            className={`focus-ring rounded-md px-2 py-2 text-sm font-bold ${
              routine === key ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {t(weeklyRoutines[key].titleKey)}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {selected.days.map((day) => (
          <div key={day.dayKey} className="rounded-lg bg-slate-50 p-3">
            <h3 className="font-bold text-slate-900">{t(day.dayKey)}</h3>
            <ul className="mt-2 space-y-2 text-slate-700">
              {day.itemKeys.map((itemKey) => (
                <li key={itemKey}>- {t(`weeklyRoutine.items.${itemKey}`)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
