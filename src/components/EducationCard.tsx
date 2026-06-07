export default function EducationCard({ title, summary }: { title: string; summary: string }) {
  return (
    <article className="card p-4">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="mt-2 text-slate-700">{summary}</p>
    </article>
  );
}
