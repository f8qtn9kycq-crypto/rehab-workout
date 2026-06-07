import TrainingLog from '../components/TrainingLog';
import { useI18n } from '../services/i18n';
import { getLogs } from '../services/logService';

export default function LogsPage() {
  const { t } = useI18n();
  const logs = getLogs();

  return (
    <div className="page space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-ink">{t('logs.title')}</h1>
        <p className="mt-2 text-slate-600">{t('logs.subtitle')}</p>
      </div>
      <TrainingLog logs={logs} />
    </div>
  );
}
