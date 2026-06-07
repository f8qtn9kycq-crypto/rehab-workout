import { EQUIPMENT_IDS, type Equipment } from '../types/rehab';

interface EquipmentOption {
  id: Equipment;
  icon: string;
  priority: number;
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: EQUIPMENT_IDS.BODYWEIGHT, icon: 'body', priority: 1 },
  { id: EQUIPMENT_IDS.DUMBBELL, icon: 'dumbbell', priority: 2 },
  { id: EQUIPMENT_IDS.KETTLEBELL, icon: 'kettlebell', priority: 3 },
  { id: EQUIPMENT_IDS.CHAIR, icon: 'chair', priority: 4 },
  { id: EQUIPMENT_IDS.WALL, icon: 'wall', priority: 5 },
  { id: EQUIPMENT_IDS.RESISTANCE_BAND, icon: 'band', priority: 6 },
  { id: EQUIPMENT_IDS.FOAM_ROLLER, icon: 'roller', priority: 7 },
];

export const PRIMARY_EQUIPMENT_IDS = [
  EQUIPMENT_IDS.BODYWEIGHT,
  EQUIPMENT_IDS.DUMBBELL,
  EQUIPMENT_IDS.KETTLEBELL,
] as const satisfies readonly Equipment[];

export const SUPPORT_ONLY_EQUIPMENT_IDS = [
  EQUIPMENT_IDS.BODYWEIGHT,
  EQUIPMENT_IDS.CHAIR,
  EQUIPMENT_IDS.WALL,
] as const satisfies readonly Equipment[];
