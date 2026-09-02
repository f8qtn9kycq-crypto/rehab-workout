import BodyAreaIcon from './BodyAreaIcon';
import { useI18n } from '../services/i18n';
import { BODY_AREAS, type BodyArea } from '../types/rehab';

export default function BodyAreaSelector({
  selected,
  onChange,
  compact = false,
  ariaLabel,
}: {
  selected: BodyArea | 'all';
  onChange: (value: BodyArea) => void;
  compact?: boolean;
  ariaLabel?: string;
}) {
  const { t } = useI18n();

  return (
    <div role="group" aria-label={ariaLabel} className={`grid ${compact ? 'grid-cols-2 gap-2 sm:grid-cols-3' : 'grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'}`}>
      {BODY_AREAS.map((area) => (
        <button
          key={area}
          type="button"
          onClick={() => onChange(area)}
          aria-pressed={selected === area}
          className={`focus-ring rounded-lg border px-3 text-left ${compact ? 'min-h-[72px] py-2' : 'min-h-[82px]'} ${
            selected === area
              ? 'border-calm-500 bg-calm-100 text-calm-700'
              : 'border-slate-200 bg-white text-slate-700'
          }`}
        >
          <span className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
            <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-calm-100 text-calm-700 ${compact ? 'size-9' : 'size-11'}`} aria-hidden="true">
              <BodyAreaIcon area={area} />
            </span>
            <span className={`block font-bold ${compact ? 'text-base leading-5' : 'text-xl'}`}>{t(`bodyAreas.${area}.label`)}</span>
          </span>
          {compact ? null : <span className="mt-1 block text-sm">{t(`bodyAreas.${area}.hint`)}</span>}
        </button>
      ))}
    </div>
  );
}
