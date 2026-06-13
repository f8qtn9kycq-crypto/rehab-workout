import { EQUIPMENT_IDS, type Equipment } from '../types/rehab';

interface EquipmentOption {
  id: Equipment;
  icon: string;
  priority: number;
  role: 'base' | 'load' | 'support' | 'recovery';
}

export const EQUIPMENT_OPTIONS: EquipmentOption[] = [
  { id: EQUIPMENT_IDS.BODYWEIGHT, icon: 'body', priority: 1, role: 'base' },
  { id: EQUIPMENT_IDS.CHAIR, icon: 'chair', priority: 2, role: 'support' },
  { id: EQUIPMENT_IDS.WALL, icon: 'wall', priority: 3, role: 'support' },
  { id: EQUIPMENT_IDS.RESISTANCE_BAND, icon: 'band', priority: 4, role: 'recovery' },
  { id: EQUIPMENT_IDS.FOAM_ROLLER, icon: 'roller', priority: 5, role: 'recovery' },
  { id: EQUIPMENT_IDS.DUMBBELL, icon: 'dumbbell', priority: 6, role: 'load' },
  { id: EQUIPMENT_IDS.KETTLEBELL, icon: 'kettlebell', priority: 7, role: 'load' },
];

export const PRIMARY_EQUIPMENT_IDS = [
  EQUIPMENT_IDS.BODYWEIGHT,
  EQUIPMENT_IDS.CHAIR,
  EQUIPMENT_IDS.WALL,
  EQUIPMENT_IDS.RESISTANCE_BAND,
] as const satisfies readonly Equipment[];

export const ADVANCED_EQUIPMENT_IDS = [
  EQUIPMENT_IDS.FOAM_ROLLER,
  EQUIPMENT_IDS.DUMBBELL,
  EQUIPMENT_IDS.KETTLEBELL,
] as const satisfies readonly Equipment[];

export const SUPPORT_ONLY_EQUIPMENT_IDS = [
  EQUIPMENT_IDS.BODYWEIGHT,
  EQUIPMENT_IDS.CHAIR,
  EQUIPMENT_IDS.WALL,
] as const satisfies readonly Equipment[];

export function sortEquipmentByPriority(values: readonly Equipment[]): Equipment[] {
  const priorityById = new Map(EQUIPMENT_OPTIONS.map((item) => [item.id, item.priority]));

  return [...new Set(values)].sort((a, b) => {
    return (priorityById.get(a) ?? 99) - (priorityById.get(b) ?? 99);
  });
}
