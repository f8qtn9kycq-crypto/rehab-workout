import { useMemo, useState } from 'react';
import FunctionalOutcomeCheckIn from '../components/FunctionalOutcomeCheckIn';
import ProgressSummary from '../components/ProgressSummary';
import TrainingLog from '../components/TrainingLog';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';
import { createOutcomeEntry, getOutcomeEntries, saveOutcomeEntry } from '../services/outcomeStorage';
import type { BodyArea, OutcomeScore } from '../types/rehab';
import { buildWeeklyProgressSummary } from '../utils/progressSummary';

export default function LogsPage() {
  const { t } = useI18n();
  const [logs] = useState(() => getLogs());
  const [outcomes, setOutcomes] = useState(() => getOutcomeEntries());
  const summary = useMemo(() => buildWeeklyProgressSummary(logs, outcomes), [logs, outcomes]);

  function saveOutcome(bodyArea: BodyArea, score: OutcomeScore, note: string): void {
    const entry = createOutcomeEntry({ bodyArea, score, note });
    setOutcomes(saveOutcomeEntry(entry));
  }

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('logs.title')}</h1>
        <p className="mt-2 text-slate-600">{t('logs.subtitle')}</p>
      </div>
      <ProgressSummary summary={summary} />
      <FunctionalOutcomeCheckIn outcomes={outcomes} onSave={saveOutcome} />
      <TrainingLog logs={logs} />
    </div>
  );
}
