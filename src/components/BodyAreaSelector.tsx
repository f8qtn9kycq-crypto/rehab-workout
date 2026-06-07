import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

export default function BodyAreaSelector({
  selected,
  onChange,
}: {
  selected: BodyArea | 'all';
  onChange: (value: BodyArea) => void;
}) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {BODY_AREAS.map((area) => (
        <button
          key={area}
          type="button"
          onClick={() => onChange(area)}
          className={`focus-ring min-h-[82px] rounded-lg border px-3 text-left ${
            selected === area
              ? 'border-calm-500 bg-calm-100 text-calm-700'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <span className="block text-xl font-bold">{t(`bodyAreas.${area}.label`)}</span>
          <span className="mt-1 block text-sm">{t(`bodyAreas.${area}.hint`)}</span>
        </button>
      ))}
    </div>
  );
}
