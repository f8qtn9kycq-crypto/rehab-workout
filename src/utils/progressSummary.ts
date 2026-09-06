import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type TrainingLogEntry } from '../types/rehab';

export type TrendDirection = 'not_enough_data' | 'lower' | 'higher' | 'steady' | 'improved' | 'declined';

export interface WeeklyProgressSummary {
  weekStart: string;
  focusBodyArea: BodyArea | null;
  sessionsThisWeek: number;
  trainedBodyAreas: BodyArea[];
  averagePainBefore: number | null;
  averagePainAfter: number | null;
  painTrend: TrendDirection;
  functionTrend: TrendDirection;
  latestOutcomeByArea: Partial<Record<BodyArea, FunctionalOutcomeEntry>>;
}

function getLogDate(log: TrainingLogEntry, today: Date): Date | null {
  const date = new Date(log.date ?? log.completedAt);
  return Number.isNaN(date.getTime()) || date > today ? null : date;
}

function getEntryDate(entry: FunctionalOutcomeEntry, today: Date): Date | null {
  const date = new Date(entry.date);
  return Number.isNaN(date.getTime()) || date > today ? null : date;
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

function getPainTrend(logs: TrainingLogEntry[], today: Date): TrendDirection {
  const orderedLogs = [...logs]
    .filter((log) => getLogDate(log, today))
    .sort((a, b) => Number(getLogDate(a, today)) - Number(getLogDate(b, today)));

  if (orderedLogs.length < 2) return 'not_enough_data';

  const firstPain = orderedLogs[0].painAfter;
  const latestPain = orderedLogs[orderedLogs.length - 1].painAfter;

  if (latestPain <= firstPain - 1) return 'lower';
  if (latestPain >= firstPain + 1) return 'higher';
  return 'steady';
}

function getLatestOutcomeByArea(outcomes: FunctionalOutcomeEntry[], today: Date): Partial<Record<BodyArea, FunctionalOutcomeEntry>> {
  return BODY_AREAS.reduce<Partial<Record<BodyArea, FunctionalOutcomeEntry>>>((latestEntries, bodyArea) => {
    const latest = outcomes
      .filter((entry) => entry.bodyArea === bodyArea && getEntryDate(entry, today))
      .sort((a, b) => Number(getEntryDate(b, today)) - Number(getEntryDate(a, today)))[0];

    if (latest) latestEntries[bodyArea] = latest;
    return latestEntries;
  }, {});
}

function getFunctionTrend(outcomes: FunctionalOutcomeEntry[], today: Date): TrendDirection {
  const orderedOutcomes = [...outcomes]
    .filter((entry) => getEntryDate(entry, today))
    .sort((a, b) => Number(getEntryDate(b, today)) - Number(getEntryDate(a, today)));

  if (orderedOutcomes.length < 2) return 'not_enough_data';

  const [latest, previous] = orderedOutcomes;
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
  const validLogs = logs.filter((log) => getLogDate(log, today));
  const latestLog = [...validLogs]
    .sort((a, b) => Number(getLogDate(b, today)) - Number(getLogDate(a, today)))[0];
  const focusBodyArea = latestLog?.bodyArea ?? null;
  const focusedLogs = focusBodyArea ? validLogs.filter((log) => log.bodyArea === focusBodyArea) : [];
  const focusedOutcomes = focusBodyArea
    ? outcomes.filter((entry) => entry.bodyArea === focusBodyArea && getEntryDate(entry, today))
    : [];
  const weeklyLogs = validLogs.filter((log) => {
    const logDate = getLogDate(log, today);
    return logDate ? logDate >= weekStart : false;
  });
  const focusedWeeklyLogs = focusBodyArea
    ? weeklyLogs.filter((log) => log.bodyArea === focusBodyArea)
    : [];

  const trainedBodyAreas = BODY_AREAS.filter((bodyArea) => weeklyLogs.some((log) => log.bodyArea === bodyArea));

  return {
    weekStart: weekStart.toISOString(),
    focusBodyArea,
    sessionsThisWeek: weeklyLogs.length,
    trainedBodyAreas,
    averagePainBefore: average(focusedWeeklyLogs.map((log) => Number(log.painBefore)).filter(Number.isFinite)),
    averagePainAfter: average(focusedWeeklyLogs.map((log) => Number(log.painAfter)).filter(Number.isFinite)),
    painTrend: getPainTrend(focusedLogs, today),
    functionTrend: getFunctionTrend(focusedOutcomes, today),
    latestOutcomeByArea: getLatestOutcomeByArea(outcomes, today),
  };
}
