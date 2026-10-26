import { exercises } from '../data/exercises';
import type { ManualExercise } from '../services/manualWorkoutStorage';
import type { BodyArea, TrainingLogEntry } from '../types/rehab';
import { getExercisePurposeInfo } from './exerciseDiscovery';
import { getLocalizedExercise } from './localizedExercise';
import { recordedBodyArea } from './recordsBodyArea';
import type { RecordsActivityItem, RecordsPresentation } from './recordsPresentation';

export const RECORDS_PURPOSES = ['rehab', 'strength', 'cardio', 'unknown'] as const;
export type RecordsPurpose = typeof RECORDS_PURPOSES[number];
export type RecordsPurposeFilter = 'all' | RecordsPurpose;

export interface RecordsDiscoveryEntry {
  name?: string;
  exerciseId?: string;
  bodyArea?: BodyArea;
  purposes: RecordsPurpose[];
  source: 'manual' | 'training' | 'cycling' | 'legacy';
  manualIndex?: number;
  logId?: string;
}

// 與既有紀錄卡相同：缺少內容版本時，不把修訂前的名稱或器材當成目前動作。
export function isLegacyRevisedCatalogRecord(exercise: Pick<ManualExercise, 'exerciseId' | 'equipmentId' | 'name'>): boolean {
  const revisedEquipment: Record<string, string> = {
    'catalog-shoulder-press': 'barbell',
    'catalog-squat': 'barbell',
    'catalog-lat-pulldown': 'machine',
    'catalog-seated-row': 'machine',
    'catalog-leg-extension': 'machine',
  };
  const expected = revisedEquipment[exercise.exerciseId ?? ''];
  if (!expected) return false;
  if (exercise.equipmentId && exercise.equipmentId !== expected) return true;
  const current = exercises.find(item => item.id === exercise.exerciseId);
  return !current || ![current.title, getLocalizedExercise(current, 'en').title].includes(exercise.name.trim());
}

function recordedPurposes(record: Pick<ManualExercise, 'exerciseId' | 'equipmentId' | 'name' | 'recordOnly'>): RecordsPurpose[] {
  if (!record.exerciseId || record.recordOnly || record.exerciseId.startsWith('custom-') || isLegacyRevisedCatalogRecord(record)) return ['unknown'];
  const info = getExercisePurposeInfo(record.exerciseId);
  return info ? [...new Set([info.primaryPurpose, ...(info.secondaryPurposes ?? [])])] : ['unknown'];
}

function trainingEntry(log: TrainingLogEntry): RecordsDiscoveryEntry {
  const name = log.exerciseTitle || log.title;
  return { name, exerciseId: log.exerciseId, bodyArea: recordedBodyArea(log),
    purposes: recordedPurposes({ exerciseId: log.exerciseId, name }), source: 'training', logId: log.id };
}

/** 僅供歷史尋找；不以舊 kind、紀錄來源或名稱猜測用途，也不回寫歷史。 */
export function recordDiscoveryEntries(item: RecordsActivityItem, logs: TrainingLogEntry[] = []): RecordsDiscoveryEntry[] {
  if (item.source === 'training') return [trainingEntry(item.log)];
  if (item.source === 'manual') {
    const entries: RecordsDiscoveryEntry[] = item.workout.exercises.map((exercise, manualIndex) => ({
      name: exercise.name, exerciseId: exercise.exerciseId, bodyArea: recordedBodyArea(exercise),
      purposes: recordedPurposes(exercise), source: 'manual', manualIndex,
    }));
    if (item.workout.cyclingMinutes !== undefined) entries.push({ source: 'cycling', purposes: ['cardio'] });
    return entries;
  }
  if (item.activity.kind === 'cycling') return [{ source: 'cycling', purposes: ['cardio'] }];
  const linkedEntries: RecordsDiscoveryEntry[] = [...new Set(item.activity.exerciseLogIds)].map(id => {
    const log = logs.find(candidate => candidate.id === id);
    return log ? trainingEntry(log) : { source: 'legacy', purposes: ['unknown'], logId: id };
  });
  return linkedEntries.length ? linkedEntries : [{ source: 'legacy', purposes: ['unknown'] }];
}

/** 部位與用途必須由同一筆動作明細同時符合。 */
export function matchingRecordsDiscoveryEntries(item: RecordsActivityItem, area: BodyArea | 'all', purpose: RecordsPurposeFilter, logs: TrainingLogEntry[] = []): RecordsDiscoveryEntry[] {
  return recordDiscoveryEntries(item, logs).filter(entry => (area === 'all' || entry.bodyArea === area)
    && (purpose === 'all' || entry.purposes.includes(purpose)));
}

/** 先篩選所有日期，再由頁面限制天數；保留完整場次及既有 linked-log 去重。 */
export function filterRecordsDiscoveryDays(days: RecordsPresentation['days'], area: BodyArea | 'all', purpose: RecordsPurposeFilter, logs: TrainingLogEntry[]): RecordsPresentation['days'] {
  if (area === 'all' && purpose === 'all') return days;
  return days.map(day => ({ ...day, items: day.items.filter(item => matchingRecordsDiscoveryEntries(item, area, purpose, logs).length > 0) }))
    .filter(day => day.items.length > 0);
}
