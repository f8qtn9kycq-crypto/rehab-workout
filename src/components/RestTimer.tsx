import { Pause, Play, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useI18n } from '../services/i18n';

export default function RestTimer({ seconds }: { seconds: number }) {
  const { t } = useI18n();
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(seconds);
    setRunning(false);
  }, [seconds]);

  useEffect(() => {
    if (!running || remaining <= 0) return undefined;
    const id = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, [remaining, running]);

  return (
    <div className="rounded-lg bg-amber-50 p-4">
      <div className="text-sm font-semibold text-amber-800">{t('restTimer.title')}</div>
      <div className="mt-1 text-4xl font-bold text-amber-900">{t('restTimer.seconds', { count: remaining })}</div>
      <div className="mt-3 flex gap-2">
        <button onClick={() => setRunning(!running)} className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-amber-600 px-3 font-semibold text-white">
          {running ? <Pause size={18} /> : <Play size={18} />}
          {running ? t('restTimer.pause') : t('restTimer.start')}
        </button>
        <button onClick={() => setRemaining(seconds)} className="focus-ring inline-flex min-h-11 min-w-11 items-center justify-center rounded-md bg-white text-amber-800" aria-label={t('restTimer.reset')}>
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}
