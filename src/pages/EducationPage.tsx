import { BookOpen } from 'lucide-react';
import EducationCard from '../components/EducationCard';
import { anklePillars, educationCards } from '../data/education';
import { useI18n } from '../services/i18n';

export default function EducationPage() {
  const { t } = useI18n();

  return (
    <div className="page space-y-5">
      <div>
        <div className="inline-flex min-h-11 items-center gap-2 rounded-md bg-calm-100 px-3 text-sm font-bold text-calm-700"><BookOpen size={18} aria-hidden="true" />{t('education.badge')}</div>
        <h1 className="mt-3 text-3xl font-bold text-ink">{t('education.title')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600">{t('education.subtitle')}</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {educationCards.map((card) => (
          <EducationCard key={card.id} title={t(card.titleKey)} summary={t(card.summaryKey)} icon={card.icon as 'shield'} recommended={card.recommended} categoryLabel={t(`education.categories.${card.category}`)} recommendedLabel={t('education.recommended')} />
        ))}
      </section>
      <section className="card p-4" aria-labelledby="ankle-pillars-title">
        <h2 id="ankle-pillars-title" className="text-xl font-bold text-ink">{t('education.anklePillarsTitle')}</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {anklePillars.map((pillar) => (
            <div key={pillar.id} className="rounded-lg bg-slate-50 p-3">
              <h3 className="font-bold text-slate-900">{t(pillar.titleKey)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(pillar.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
