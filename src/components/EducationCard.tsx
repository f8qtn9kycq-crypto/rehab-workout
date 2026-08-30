import { Activity, BookOpen, CalendarDays, HeartPulse, Pause, ShieldCheck, TrendingUp, Footprints } from 'lucide-react';

const icons = { shield: ShieldCheck, activity: Activity, trendingUp: TrendingUp, heartPulse: HeartPulse, steps: Footprints, pause: Pause, calendar: CalendarDays, book: BookOpen };

export default function EducationCard({ title, summary, icon, recommended, categoryLabel, recommendedLabel }: { title: string; summary: string; icon: keyof typeof icons; recommended?: boolean; categoryLabel: string; recommendedLabel: string }) {
  const Icon = icons[icon];
  return (
    <article className={`card p-4 ${recommended ? 'border-calm-300 bg-calm-50/60' : ''}`}>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-calm-100 text-calm-700" aria-hidden="true"><Icon size={22} /></span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-calm-700">
            <span>{categoryLabel}</span>
            {recommended ? <span className="rounded-full bg-calm-700 px-2 py-1 text-white normal-case tracking-normal">{recommendedLabel}</span> : null}
          </div>
          <h2 className="mt-1 text-xl font-bold text-ink">{title}</h2>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{summary}</p>
    </article>
  );
}
