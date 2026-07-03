import { useState } from 'react';
import { Clock, MapPin, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { exercises } from '../data/exercises';
import { useI18n } from '../services/i18n';
import type { Exercise } from '../types/rehab';
import { getLocalizedExercise } from '../utils/localizedExercise';

type RoutineKey = 'recovery5' | 'bodyArea10' | 'starter3Day';

type RoutineDay = {
  dayKey: string;
  exerciseIds: string[];
};

const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));

const weeklyRoutines: Record<RoutineKey, { titleKey: string; helperKey: string; days: RoutineDay[] }> = {
  recovery5: {
    titleKey: 'weeklyRoutine.recovery5',
    helperKey: 'weeklyRoutine.recovery5Helper',
    days: [
      { dayKey: 'weeklyRoutine.today', exerciseIds: ['neck-heat-relax', 'knee-rice-care', 'ankle-circles'] },
    ],
  },
  bodyArea10: {
    titleKey: 'weeklyRoutine.bodyArea10',
    helperKey: 'weeklyRoutine.bodyArea10Helper',
    days: [
      { dayKey: 'weeklyRoutine.shoulderDay', exerciseIds: ['shoulder-scapular-squeeze', 'shoulder-flexion'] },
      { dayKey: 'weeklyRoutine.hipDay', exerciseIds: ['hip-flexion-seated', 'hip-abduction'] },
      { dayKey: 'weeklyRoutine.kneeDay', exerciseIds: ['knee-straight-leg-raise', 'knee-calf-raise'] },
      { dayKey: 'weeklyRoutine.ankleDay', exerciseIds: ['ankle-circles', 'ankle-alphabet'] },
      { dayKey: 'weeklyRoutine.neckDay', exerciseIds: ['shoulder-neck-chin-tuck', 'neck-isometric'] },
    ],
  },
  starter3Day: {
    titleKey: 'weeklyRoutine.starter3Day',
    helperKey: 'weeklyRoutine.starter3DayHelper',
    days: [
      { dayKey: 'weeklyRoutine.monday', exerciseIds: ['ankle-circles', 'shoulder-scapular-squeeze', 'hip-flexion-seated'] },
      { dayKey: 'weeklyRoutine.wednesday', exerciseIds: ['knee-straight-leg-raise', 'neck-isometric', 'ankle-alphabet'] },
      { dayKey: 'weeklyRoutine.friday', exerciseIds: ['hip-abduction', 'shoulder-flexion', 'ankle-band-inversion-eversion'] },
    ],
  },
};

function getRoutineExercises(ids: string[]): Exercise[] {
  return ids
    .map((id) => exercisesById.get(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));
}

export default function WeeklyRoutineBuilder() {
  const [routine, setRoutine] = useState<RoutineKey>('recovery5');
  const { language, t } = useI18n();
  const selected = weeklyRoutines[routine];

  return (
    <section className="card p-4">
      <div>
        <h2 className="text-xl font-bold text-ink">{t('weeklyRoutine.title')}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{t('weeklyRoutine.subtitle')}</p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {(Object.keys(weeklyRoutines) as RoutineKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setRoutine(key)}
            aria-pressed={routine === key}
            className={`focus-ring min-h-11 rounded-md px-3 py-2 text-sm font-bold ${
              routine === key ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {t(weeklyRoutines[key].titleKey)}
          </button>
        ))}
      </div>

      <p className="mt-3 rounded-md bg-calm-50 p-3 text-sm font-semibold leading-6 text-calm-800">
        {t(selected.helperKey)}
      </p>

      <div className="mt-4 grid gap-3">
        {selected.days.map((day) => (
          <div key={day.dayKey} className="rounded-lg bg-slate-50 p-3">
            <h3 className="font-bold text-slate-900">{t(day.dayKey)}</h3>
            <div className="mt-2 space-y-2">
              {getRoutineExercises(day.exerciseIds).map((exercise, index) => {
                const displayExercise = getLocalizedExercise(exercise, language);

                return (
                  <article key={exercise.id} className="rounded-md bg-white p-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-calm-100 text-sm font-bold text-calm-800">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-ink">{displayExercise.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{displayExercise.description}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="inline-flex items-center gap-1 rounded-md bg-calm-100 px-2 py-1 text-calm-700">
                            <MapPin size={13} />
                            {t(`bodyAreas.${exercise.bodyArea}.label`)}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                            {t(`levelLabels.${exercise.level}`)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-700">
                            <Clock size={13} />
                            {displayExercise.durationText}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/session/${exercise.id}`}
                      className="focus-ring mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 text-sm font-bold text-white sm:w-auto"
                    >
                      <PlayCircle size={18} />
                      {t('weeklyRoutine.startExercise')}
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{t('weeklyRoutine.sessionGuardHint')}</p>
    </section>
  );
}
