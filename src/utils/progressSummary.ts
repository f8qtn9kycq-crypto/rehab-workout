import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type TrainingLogEntry } from '../types/rehab';

export type TrendDirection = 'not_enough_data' | 'lower' | 'higher' | 'steady' | 'improved' | 'declined';

export interface WeeklyProgressSummary {
  weekStart: string;
  sessionsThisWeek: number;
  trainedBodyAreas: BodyArea[];
  averagePainBefore: number | null;
  averagePainAfter: number | null;
  painTrend: TrendDirection;
  functionTrend: TrendDirection;
  latestOutcomeByArea: Partial<Record<BodyArea, FunctionalOutcomeEntry>>;
}

function getLogDate(log: TrainingLogEntry): Date | null {
  const date = new Date(log.date ?? log.completedAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getEntryDate(entry: FunctionalOutcomeEntry): Date | null {
  const date = new Date(entry.date);
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const distanceFromMonday = day === 0 ? 6 : day - 1;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - distanceFromMonday);
  return start;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return Math.round((total / values.length) * 10) / 10;
}

function getPainTrend(logs: TrainingLogEntry[]): TrendDirection {
  const orderedLogs = [...logs]
    .filter((log) => getLogDate(log))
    .sort((a, b) => Number(getLogDate(a)) - Number(getLogDate(b)));

  if (orderedLogs.length < 2) return 'not_enough_data';

  const firstPain = orderedLogs[0].painAfter;
  const latestPain = orderedLogs[orderedLogs.length - 1].painAfter;

  if (latestPain <= firstPain - 1) return 'lower';
  if (latestPain >= firstPain + 1) return 'higher';
  return 'steady';
}

function getLatestOutcomeByArea(outcomes: FunctionalOutcomeEntry[]): Partial<Record<BodyArea, FunctionalOutcomeEntry>> {
  return BODY_AREAS.reduce<Partial<Record<BodyArea, FunctionalOutcomeEntry>>>((latestEntries, bodyArea) => {
    const latest = outcomes
      .filter((entry) => entry.bodyArea === bodyArea && getEntryDate(entry))
      .sort((a, b) => Number(getEntryDate(b)) - Number(getEntryDate(a)))[0];

    if (latest) latestEntries[bodyArea] = latest;
    return latestEntries;
  }, {});
}

function getFunctionTrend(outcomes: FunctionalOutcomeEntry[]): TrendDirection {
  const latestComparableArea = BODY_AREAS.map((bodyArea) => {
    const entries = outcomes
      .filter((entry) => entry.bodyArea === bodyArea && getEntryDate(entry))
      .sort((a, b) => Number(getEntryDate(b)) - Number(getEntryDate(a)));

    return entries.length >= 2 ? entries : null;
  })
    .filter((entries): entries is FunctionalOutcomeEntry[] => Boolean(entries))
    .sort((a, b) => Number(getEntryDate(b[0])) - Number(getEntryDate(a[0])))[0];

  if (!latestComparableArea) return 'not_enough_data';

  const [latest, previous] = latestComparableArea;
  if (latest.score > previous.score) return 'improved';
  if (latest.score < previous.score) return 'declined';
  return 'steady';
}

export function buildWeeklyProgressSummary(
  logs: TrainingLogEntry[],
  outcomes: FunctionalOutcomeEntry[],
  today = new Date(),
): WeeklyProgressSummary {
  const weekStart = startOfWeek(today);
  const weeklyLogs = logs.filter((log) => {
    const logDate = getLogDate(log);
    return logDate ? logDate >= weekStart : false;
  });

  const trainedBodyAreas = BODY_AREAS.filter((bodyArea) => weeklyLogs.some((log) => log.bodyArea === bodyArea));

  return {
    weekStart: weekStart.toISOString(),
    sessionsThisWeek: weeklyLogs.length,
    trainedBodyAreas,
    averagePainBefore: average(weeklyLogs.map((log) => Number(log.painBefore)).filter(Number.isFinite)),
    averagePainAfter: average(weeklyLogs.map((log) => Number(log.painAfter)).filter(Number.isFinite)),
    painTrend: getPainTrend(logs),
    functionTrend: getFunctionTrend(outcomes),
    latestOutcomeByArea: getLatestOutcomeByArea(outcomes),
  };
}
