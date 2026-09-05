import { useRef, useState } from 'react';
import OnboardingFlow from '../components/OnboardingFlow';
import { useI18n } from '../services/i18n';
import HomePage from './HomePage';

export default function EntryDemoPage() {
  const { t } = useI18n();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const labels = [t('entryDemo.first'), t('entryDemo.returning')];

  function select(index: number): void {
    setSelected(index);
    tabs.current[index]?.focus();
  }

  return (
    <div>
      <div className="page pb-0">
        <div className="mx-auto max-w-xl space-y-2">
          <p className="text-sm text-slate-600">{t('entryDemo.notice')}</p>
          <div role="tablist" aria-label={t('entryDemo.label')} className="grid grid-cols-2 gap-2">
            {labels.map((label, index) => (
              <button
                key={label}
                ref={(element) => { tabs.current[index] = element; }}
                type="button"
                role="tab"
                id={`entry-tab-${index}`}
                aria-selected={selected === index}
                aria-controls="entry-demo-panel"
                tabIndex={selected === index ? 0 : -1}
                onClick={() => setSelected(index)}
                onKeyDown={(event) => {
                  if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
                    event.preventDefault();
                    select(event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - selected);
                  }
                }}
                className={`focus-ring min-h-12 rounded-md px-4 py-3 font-bold ${selected === index ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div role="tabpanel" id="entry-demo-panel" aria-labelledby={`entry-tab-${selected}`}>
        {selected === 0 ? <div className="page"><OnboardingFlow demo /></div> : <HomePage demo />}
      </div>
    </div>
  );
}
