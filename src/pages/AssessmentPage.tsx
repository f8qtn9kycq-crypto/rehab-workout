import { useState } from 'react';
import { Link } from 'react-router-dom';
import BodyAreaSelector from '../components/BodyAreaSelector';
import PainScale from '../components/PainScale';
import { EQUIPMENT_OPTIONS } from '../data/equipmentOptions';
import { saveAssessment } from '../services/assessmentStorage';
import { useI18n } from '../services/i18n';
import type { BodyArea, Equipment } from '../types/rehab';

export default function AssessmentPage() {
  const { t } = useI18n();
  const [bodyArea, setBodyArea] = useState<BodyArea>('shoulder');
  const [pain, setPain] = useState(0);
  const [confidence, setConfidence] = useState(3);
  const [sessionLength, setSessionLength] = useState(10);
  const [equipment, setEquipment] = useState<Equipment[]>(['bodyweight']);

  const mode = pain > 3 ? 'recovery' : confidence <= 2 ? 'beginner' : 'standard';
  const modeLabel = mode === 'recovery'
    ? t('assessment.recoveryMode')
    : mode === 'beginner'
      ? t('assessment.beginnerPlan')
      : t('assessment.standardPlan');

  function toggle(item: Equipment): void {
    setEquipment(equipment.includes(item) ? equipment.filter((value) => value !== item) : [...equipment, item]);
  }

  function save(): void {
    saveAssessment({ bodyArea, pain, confidence, equipment, sessionLength, mode, completedAt: new Date().toISOString() });
  }

  return (
    <div className="page space-y-5">
      <section className="card space-y-5 p-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('assessment.title')}</h1>
          <p className="mt-2 text-slate-600">{t('assessment.subtitle')}</p>
        </div>
        <BodyAreaSelector selected={bodyArea} onChange={setBodyArea} />
        <PainScale label={t('assessment.painLabel')} value={pain} onChange={setPain} />
        <PainScale label={t('assessment.confidenceLabel')} value={confidence} onChange={setConfidence} />
        <div>
          <span className="mb-2 block font-semibold text-slate-800">{t('assessment.equipmentLabel')}</span>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {EQUIPMENT_OPTIONS.map((item) => (
              <button key={item.id} onClick={() => toggle(item.id)} className={`focus-ring min-h-11 rounded-md px-3 py-2 font-semibold ${equipment.includes(item.id) ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {t(`equipmentLabels.${item.id}`)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-2 block font-semibold text-slate-800">{t('assessment.timeLabel')}</span>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15].map((length) => (
              <button key={length} onClick={() => setSessionLength(length)} className={`focus-ring min-h-11 rounded-md px-3 py-2 font-bold ${sessionLength === length ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {t('assessment.minutes', { count: length })}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-calm-100 p-4 text-calm-700">
          {t('assessment.recommendation', { mode: modeLabel })}
        </div>
        <Link onClick={save} to={`/exercises?mode=recommended&bodyArea=${bodyArea}`} className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">
          {t('assessment.saveAndChoose')}
        </Link>
      </section>
    </div>
  );
}
