import EducationCard from '../components/EducationCard';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { anklePillars, educationCards } from '../data/education';
import { useI18n } from '../services/i18n';

export default function EducationPage() {
  const { t } = useI18n();

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('education.title')}</h1>
        <p className="mt-2 text-slate-600">{t('education.subtitle')}</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {educationCards.map((card) => (
          <EducationCard key={card.id} title={t(card.titleKey)} summary={t(card.summaryKey)} />
        ))}
      </section>
      <section className="card p-4">
        <h2 className="text-xl font-bold text-ink">{t('education.anklePillarsTitle')}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {anklePillars.map((pillar) => (
            <div key={pillar.id} className="rounded-lg bg-slate-50 p-3">
              <h3 className="font-bold text-slate-900">{t(pillar.titleKey)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(pillar.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>
      <WeeklyRoutineBuilder />
    </div>
  );
}
