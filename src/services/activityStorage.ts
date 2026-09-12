import { safeSetItem } from './localStorageService';

export const ACTIVITY_KEY = 'rehab.activities.v1';
export const FOCUSES = ['lower', 'push', 'pull', 'mixed'] as const;
export const RESPONSES = ['same', 'better', 'worse', 'red_flag'] as const;
export type Response = typeof RESPONSES[number];
interface ActivityBase {
  id: string;
  date: string;
  completed: boolean;
  actualMinutes: number;
  symptomResponse: Response;
  nextDayResponse?: Response;
}
export interface ResistanceSession extends ActivityBase {
  kind: 'resistance';
  primaryFocus: typeof FOCUSES[number];
  exerciseLogIds: string[];
}
export interface CyclingActivity extends ActivityBase { kind: 'cycling' }
export type Activity = ResistanceSession | CyclingActivity;

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
function validActivity(value: unknown): value is Activity {
  if (!value || typeof value !== 'object') return false;
  const a = value as Activity;
  if (typeof a.id !== 'string' || !a.id || typeof a.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) return false;
  const date = new Date(`${a.date}T12:00:00`);
  if (!Number.isFinite(date.getTime()) || localDate(date) !== a.date) return false;
  if (typeof a.completed !== 'boolean' || !Number.isFinite(a.actualMinutes) || a.actualMinutes < 0 || a.actualMinutes > 1440 || (a.completed && a.actualMinutes === 0)) return false;
  if (!RESPONSES.includes(a.symptomResponse) || (a.nextDayResponse !== undefined && !RESPONSES.includes(a.nextDayResponse))) return false;
  return a.kind === 'cycling' || (a.kind === 'resistance' && FOCUSES.includes(a.primaryFocus) && Array.isArray(a.exerciseLogIds) && a.exerciseLogIds.every(id => typeof id === 'string') && new Set(a.exerciseLogIds).size === a.exerciseLogIds.length);
}
export function readActivities(): { activities: Activity[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(ACTIVITY_KEY);
    if (raw === null) return { activities: [], error: false };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(validActivity)) return { activities: [], error: true };
    const ids = parsed.map(a => a.id);
    const links = parsed.flatMap(a => a.kind === 'resistance' ? a.exerciseLogIds : []);
    if (new Set(ids).size !== ids.length || new Set(links).size !== links.length) return { activities: [], error: true };
    return { activities: parsed, error: false };
  } catch { return { activities: [], error: true }; }
}
export function saveActivity(activity: Activity): boolean {
  const state = readActivities();
  if (state.error || !validActivity(activity) || activity.date > localDate()) return false;
  if (activity.nextDayResponse !== undefined && activity.date >= localDate()) return false;
  const others = state.activities.filter(a => a.id !== activity.id);
  if (activity.kind === 'resistance' && others.some(a => a.kind === 'resistance' && a.exerciseLogIds.some(id => activity.exerciseLogIds.includes(id)))) return false;
  return safeSetItem(ACTIVITY_KEY, JSON.stringify([activity, ...others]));
}
export function activityId(): string {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
export function weeklyActivities(activities: Activity[], today = new Date()) {
  const monday = new Date(today);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  const start = localDate(monday);
  const previous = new Date(monday);
  previous.setDate(previous.getDate() - 7);
  const current = activities.filter(a => a.date >= start && a.date <= localDate(today));
  const prior = activities.filter(a => a.date >= localDate(previous) && a.date < start);
  const resistance = current.filter(a => a.kind === 'resistance' && a.completed).length;
  const cycling = current.filter(a => a.kind === 'cycling' && a.completed).length;
  const minutes = (rows: Activity[], kind: Activity['kind']) => rows.filter(a => a.kind === kind).reduce((sum, a) => sum + a.actualMinutes, 0);
  // Safety warnings override the consistency-first progression sequence.
  let recommendation = 'consistency';
  if (current.some(a => a.symptomResponse === 'red_flag' || a.nextDayResponse === 'red_flag')) recommendation = 'stop';
  else if (current.some(a => a.symptomResponse === 'worse' || a.nextDayResponse === 'worse')) recommendation = 'reduce';
  else if (resistance >= 3 && cycling >= 4) {
    if (current.some(a => !a.nextDayResponse)) recommendation = 'missing';
    else if (['resistance', 'cycling'].some(kind => minutes(prior, kind as Activity['kind']) === 0)) recommendation = 'baseline';
    else if (['resistance', 'cycling'].some(kind => minutes(current, kind as Activity['kind']) > minutes(prior, kind as Activity['kind']))) recommendation = 'volume';
    else recommendation = 'small';
  }
  return { resistance, cycling, cyclingMinutes: minutes(current, 'cycling'), recommendation, start, current };
}

export const PLAN_KEY = 'rehab.weeklyActivityPlan.v1';
export const DEFAULT_DAYS = [0, 2, 5, 0, 1, 3, 4];
export function readActivityPlan(): { days: number[]; error: boolean } {
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    if (raw === null) return { days: [...DEFAULT_DAYS], error: false };
    const days: unknown = JSON.parse(raw);
    if (!Array.isArray(days) || days.length !== 7 || !days.every(day => Number.isInteger(day) && day >= 0 && day <= 6)) return { days: [...DEFAULT_DAYS], error: true };
    return { days, error: false };
  } catch { return { days: [...DEFAULT_DAYS], error: true }; }
}
export function saveActivityPlan(days: number[]): boolean {
  return !readActivityPlan().error && days.length === 7 && days.every(day => Number.isInteger(day) && day >= 0 && day <= 6) && safeSetItem(PLAN_KEY, JSON.stringify(days));
}
