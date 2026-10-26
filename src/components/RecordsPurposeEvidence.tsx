import { useI18n } from '../services/i18n';
import type { RecordsDiscoveryEntry } from '../utils/recordsDiscovery';

export default function RecordsPurposeEvidence({ entry, matched = false }: { entry: RecordsDiscoveryEntry; matched?: boolean }) {
  const { t } = useI18n();
  const source = entry.purposes.includes('unknown') ? 'unknown' : entry.source === 'cycling' ? 'activity' : 'official';
  return <p className="flex flex-wrap gap-2 text-sm text-calm-800">
    {matched && <strong>{t('recordsDiscovery.matched')}</strong>}
    <span>{t(`recordsDiscovery.sources.${source}`)}</span>
    {entry.purposes.map(purpose => <span key={purpose} className="rounded-md bg-calm-100 px-2 py-1 font-semibold">{t(`recordsDiscovery.purposes.${purpose}`)}</span>)}
  </p>;
}
