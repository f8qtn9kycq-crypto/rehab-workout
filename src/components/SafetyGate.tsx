import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSafetyGate } from '../hooks/useSafetyGate';
import { useI18n } from '../services/i18n';
import RedFlagChecklist from './RedFlagChecklist';

export default function SafetyGate() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { completeSafetyGate, isCurrentForToday, status } = useSafetyGate();
  const [selected, setSelected] = useState<string[]>(() => status.redFlags);
  const [noneSelected, setNoneSelected] = useState(() => isCurrentForToday && status.redFlags.length === 0);
  const blocked = selected.length > 0;
  const hasSafetyChoice = noneSelected || blocked;

  function submit(): void {
    if (!hasSafetyChoice) return;

    const nextStatus = completeSafetyGate(selected);
    const from = location.state && typeof location.state === 'object' && 'from' in location.state
      ? String(location.state.from)
      : '/assessment';
    if (!nextStatus.blocked) navigate(from);
  }

  return (
    <section className="card space-y-5 p-4">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('safety.title')}</h1>
        <p className="mt-2 text-slate-600">{t('safety.subtitle')}</p>
      </div>
      <RedFlagChecklist
        selected={selected}
        noneSelected={noneSelected}
        onChange={setSelected}
        onNoneChange={setNoneSelected}
      />
      {blocked ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {t('safety.blocked')}
        </div>
      ) : !noneSelected ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-700">
          {t('safety.selectRequired')}
        </div>
      ) : (
        <div className="rounded-lg border border-calm-100 bg-calm-50 p-4 text-calm-700">
          {t('safety.ready')}
        </div>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={!hasSafetyChoice}
        className="focus-ring w-full rounded-md bg-calm-700 px-4 py-3 font-bold text-white disabled:bg-slate-300"
      >
        {blocked ? t('safety.blockedAction') : t('safety.readyAction')}
      </button>
    </section>
  );
}
