import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import BodyAreaSelector from '../components/BodyAreaSelector';
import PainScale from '../components/PainScale';
import { EQUIPMENT_OPTIONS } from '../data/equipmentOptions';
import { saveAssessment } from '../services/assessmentStorage';
import { useI18n } from '../services/i18n';
import type { BodyArea, Equipment } from '../types/rehab';
import { isBodyArea } from '../utils/exerciseModel';

export default function AssessmentPage() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const bodyAreaParam = searchParams.get('bodyArea');
  const hasPreselectedBodyArea = isBodyArea(bodyAreaParam);
  const [bodyArea, setBodyArea] = useState<BodyArea>(() => {
    return isBodyArea(bodyAreaParam) ? bodyAreaParam : 'shoulder';
  });
  const [showBodyAreaPicker, setShowBodyAreaPicker] = useState(!hasPreselectedBodyArea);
  const [step, setStep] = useState<'condition' | 'settings'>('condition');
  const [pain, setPain] = useState(0);
  const [confidence, setConfidence] = useState(3);
  const [functionalBaseline, setFunctionalBaseline] = useState(5);
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
    saveAssessment({ bodyArea, pain, confidence, functionalBaseline, equipment, sessionLength, mode, completedAt: new Date().toISOString() });
  }

  return (
    <div className="page space-y-5">
      <section className="card space-y-5 p-4">
        <div>
          <p className="text-sm font-bold text-calm-700">
            {t('assessment.stepLabel', { current: step === 'condition' ? 1 : 2, total: 2 })}
          </p>
          <h1 className="text-2xl font-bold text-ink">{t('assessment.title')}</h1>
          <p className="mt-2 text-slate-600">{t('assessment.subtitle')}</p>
        </div>

        {step === 'condition' ? (
          <>
            {showBodyAreaPicker ? (
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-800">{t('assessment.bodyAreaLabel')}</h2>
                <BodyAreaSelector selected={bodyArea} onChange={setBodyArea} ariaLabel={t('assessment.bodyAreaLabel')} />
                {hasPreselectedBodyArea ? (
                  <button type="button" onClick={() => setShowBodyAreaPicker(false)} className="focus-ring min-h-11 w-full rounded-md border border-slate-300 px-4 py-2 font-bold text-slate-700">
                    {t('assessment.keepSelectedArea', { bodyArea: t(`bodyAreas.${bodyArea}.label`) })}
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-calm-200 bg-calm-50 p-4">
                <div className="flex items-center gap-3">
                  <MapPin className="shrink-0 text-calm-700" size={22} aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-slate-600">{t('assessment.selectedAreaLabel')}</p>
                    <p className="font-bold text-calm-800">{t(`bodyAreas.${bodyArea}.label`)}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowBodyAreaPicker(true)} className="focus-ring min-h-11 rounded-md px-3 font-bold text-calm-700 underline underline-offset-4">
                  {t('assessment.changeArea')}
                </button>
              </div>
            )}

            <div className="space-y-5" aria-labelledby="assessment-condition-title">
              <h2 id="assessment-condition-title" className="text-lg font-bold text-slate-800">{t('assessment.conditionTitle')}</h2>
              <PainScale label={t('assessment.painLabel')} value={pain} onChange={setPain} />
              <PainScale label={t('assessment.confidenceLabel')} value={confidence} onChange={setConfidence} levelDescriptions={Object.fromEntries(Array.from({ length: 11 }, (_, value) => [value, t(`assessment.confidenceLevels.${value}`)]))} />
              <PainScale label={t('assessment.functionalLabel')} value={functionalBaseline} onChange={setFunctionalBaseline} levelDescriptions={Object.fromEntries(Array.from({ length: 11 }, (_, value) => [value, t(`outcomes.scoreLabels.${value}`)]))} />
            </div>

            <button type="button" onClick={() => setStep('settings')} className="focus-ring flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-calm-700 px-4 font-bold text-white">
              {t('assessment.continueToSettings')}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('assessment.settingsTitle')}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t('assessment.settingsSummary', {
                  bodyArea: t(`bodyAreas.${bodyArea}.label`),
                  pain,
                })}
              </p>
            </div>
            <div>
              <span className="mb-2 block font-semibold text-slate-800">{t('assessment.equipmentLabel')}</span>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {EQUIPMENT_OPTIONS.map((item) => (
                  <button key={item.id} type="button" aria-pressed={equipment.includes(item.id)} onClick={() => toggle(item.id)} className={`focus-ring min-h-11 rounded-md px-3 py-2 font-semibold ${equipment.includes(item.id) ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {t(`equipmentLabels.${item.id}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="mb-2 block font-semibold text-slate-800">{t('assessment.timeLabel')}</span>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((length) => (
                  <button key={length} type="button" aria-pressed={sessionLength === length} onClick={() => setSessionLength(length)} className={`focus-ring min-h-11 rounded-md px-3 py-2 font-bold ${sessionLength === length ? 'bg-calm-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {t('assessment.minutes', { count: length })}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-calm-100 p-4 text-calm-700">
              {t('assessment.recommendation', { mode: modeLabel })}
            </div>
            <p id="assessment-save-notice" className="text-sm leading-6 text-slate-600">{t('assessment.saveNotice')}</p>
            <div className="space-y-3">
              <Link aria-describedby="assessment-save-notice" onClick={save} to={`/exercises?mode=recommended&bodyArea=${bodyArea}`} className="focus-ring flex min-h-12 items-center justify-center rounded-md bg-calm-700 px-4 font-bold text-white">
                {t('assessment.saveAndChoose')}
              </Link>
              <button type="button" onClick={() => setStep('condition')} className="focus-ring flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-bold text-slate-700">
                <ArrowLeft size={18} aria-hidden="true" />
                {t('assessment.backToCondition')}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
