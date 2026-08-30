import { Accessibility, Activity, Footprints, PersonStanding, ScanFace } from 'lucide-react';
import type { BodyArea } from '../types/rehab';

const bodyAreaIcons = {
  shoulder: PersonStanding,
  hip: Accessibility,
  shoulder_neck: ScanFace,
  knee: Activity,
  ankle: Footprints,
} as const;

export default function BodyAreaIcon({ area, size = 24 }: { area: BodyArea; size?: number }) {
  const Icon = bodyAreaIcons[area];
  return <Icon size={size} aria-hidden="true" />;
}
