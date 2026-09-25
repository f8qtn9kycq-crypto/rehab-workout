import type { Activity } from '../services/activityStorage';
import type { FunctionalOutcomeEntry, TrainingLogEntry } from '../types/rehab';

export type RecordsActivityItem =
  | { id: string; source: 'training'; date: string; log: TrainingLogEntry }
  | { id: string; source: 'activity'; date: string; activity: Activity };

export interface RecordsPresentation {
  recentActivities: RecordsActivityItem[];
  weeklyActivityCount: number;
  hasActivityHistory: boolean;
  validOutcomes: FunctionalOutcomeEntry[];
}

function validDate(value: string, today: Date): Date | null {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date <= today ? date : null;
}

function activityDate(value: string, today: Date): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  if (!Number.isFinite(date.getTime())) return null;
  const normalized = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return normalized === value && value <= todayKey ? date : null;
}

function startOfWeek(today: Date): Date {
  const start = new Date(today);
  const distanceFromMonday = start.getDay() === 0 ? 6 : start.getDay() - 1;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - distanceFromMonday);
  return start;
}

export function buildRecordsPresentation(
  logs: TrainingLogEntry[],
  activities: Activity[],
  outcomes: FunctionalOutcomeEntry[],
  today = new Date(),
): RecordsPresentation {
  const validLogs = logs.filter(log => validDate(log.date ?? log.completedAt, today));
  const validActivities = activities.filter(activity => activityDate(activity.date, today));
  const linkedLogIds = new Set(validActivities.flatMap(activity => activity.kind === 'resistance' ? activity.exerciseLogIds : []));

  const trainingItems: RecordsActivityItem[] = validLogs
    .filter(log => !linkedLogIds.has(log.id))
    .map(log => ({
      id: `training:${log.id}`,
      source: 'training',
      date: log.date ?? log.completedAt,
      log,
    }));

  const activityItems: RecordsActivityItem[] = validActivities.map(activity => ({
      id: `activity:${activity.id}`,
      source: 'activity',
      date: `${activity.date}T12:00:00`,
      activity,
    }));

  const recentActivities = [...trainingItems, ...activityItems]
    .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date)));
  const weekStart = startOfWeek(today);

  return {
    recentActivities,
    weeklyActivityCount: recentActivities.filter(item => new Date(item.date) >= weekStart).length,
    hasActivityHistory: recentActivities.length > 0,
    validOutcomes: outcomes
      .filter(outcome => validDate(outcome.date, today))
      .sort((a, b) => Number(new Date(b.date)) - Number(new Date(a.date))),
  };
}
