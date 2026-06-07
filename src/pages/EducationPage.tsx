import EducationCard from '../components/EducationCard';
import WeeklyRoutineBuilder from '../components/WeeklyRoutineBuilder';
import { anklePillars, educationCards } from '../data/education';

export default function EducationPage() {
  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">復健學習</h1>
        <p className="mt-2 text-slate-600">用簡單方式理解安全、膝痛舒緩、踝關節支柱與肩頸肩髖訓練節奏。</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {educationCards.map((card) => (
          <EducationCard key={card.id} title={card.title} summary={card.summary} />
        ))}
      </section>
      <section className="card p-4">
        <h2 className="text-xl font-bold text-ink">踝關節穩定四支柱</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          {anklePillars.map((pillar) => (
            <div key={pillar.id} className="rounded-lg bg-slate-50 p-3">
              <h3 className="font-bold text-slate-900">{pillar.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>
      <WeeklyRoutineBuilder />
    </div>
  );
}
