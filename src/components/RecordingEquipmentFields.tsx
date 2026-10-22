import { equipmentChoiceIds } from '../data/manualWorkoutOptions';
import { useI18n } from '../services/i18n';
import type { ManualSet } from '../services/manualWorkoutStorage';

type Settings = Pick<ManualSet, 'equipmentId' | 'equipment' | 'grip'>;

/** The library setup and each recorded set use the same choices and clear semantics. */
export default function RecordingEquipmentFields({ value, onChange }: { value: Settings; onChange: (update: Settings) => void }) {
  const { t } = useI18n();
  const control = 'focus-ring mt-1 min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2';
  return <div className="space-y-3">
    <label className="mt-2 block text-sm font-bold">{t('manualWorkout.setEquipment')}
      <select className={`${control} h-11 appearance-none`} value={value.equipmentId ?? (value.equipment ? '__snapshot__' : '')} onChange={event => {
        const equipmentId = event.target.value;
        if (equipmentId === '__snapshot__') return;
        onChange({ equipmentId: equipmentId || undefined, equipment: equipmentId ? t(`manualWorkout.equipmentChoices.${equipmentId}`) : '' });
      }}>
        <option value="">{t('manualWorkout.unknown')}</option>
        {!value.equipmentId && value.equipment && <option value="__snapshot__">{t('manualWorkout.recordedEquipment', { name: value.equipment })}</option>}
        {value.equipmentId && !equipmentChoiceIds.some(id => id === value.equipmentId) && <option value={value.equipmentId}>{value.equipment || value.equipmentId}</option>}
        {equipmentChoiceIds.map(id => <option key={id} value={id}>{t(`manualWorkout.equipmentChoices.${id}`)}</option>)}
      </select>
    </label>
    <label className="mt-2 block text-sm font-bold">{t('manualWorkout.grip')}
      <input className={control} maxLength={100} value={value.grip ?? ''} onChange={event => onChange({ grip: event.target.value })} />
    </label>
  </div>;
}
