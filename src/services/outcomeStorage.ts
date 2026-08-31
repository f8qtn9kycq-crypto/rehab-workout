import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type OutcomeScore } from '../types/rehab';
import { safeGetItem, safeReadJson, safeSetItem } from './localStorageService';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const LEGACY_OUTCOME_KEY = 'rehab.functionalOutcomes.v1';
const OUTCOME_KEY = 'rehab.functionalOutcomes.v2';
const MAX_OUTCOMES = 200;
const OUTCOME_SCORES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export const OUTCOME_QUESTION_IDS: Record<BodyArea, string> = {
  shoulder: 'function-shoulder',
  hip: 'function-hip',
  shoulder_neck: 'function-shoulder-neck',
  knee: 'function-knee',
  ankle: 'function-ankle',
};

function isBodyArea(value: unknown): value is BodyArea {
  return typeof value === 'string' && BODY_AREAS.includes(value as BodyArea);
}

function normalizeScore(value: unknown): OutcomeScore | null {
  const score = Number(value);
  return OUTCOME_SCORES.includes(score as OutcomeScore) ? (score as OutcomeScore) : null;
}

function normalizeOutcome(rawOutcome: Partial<FunctionalOutcomeEntry>, legacyFivePoint = false): FunctionalOutcomeEntry | null {
  if (!rawOutcome || typeof rawOutcome !== 'object') return null;
  if (!rawOutcome.id || !isBodyArea(rawOutcome.bodyArea)) return null;

  const rawScore = Number(rawOutcome.score);
  const score = normalizeScore(legacyFivePoint && rawScore >= 1 && rawScore <= 5 ? rawScore * 2 : rawScore);
  const date = String(rawOutcome.date ?? '');

  if (score === null || Number.isNaN(Date.parse(date))) return null;

  return {
    id: String(rawOutcome.id),
    date,
    bodyArea: rawOutcome.bodyArea,
    questionId: String(rawOutcome.questionId ?? OUTCOME_QUESTION_IDS[rawOutcome.bodyArea]),
    score,
    note: rawOutcome.note ? String(rawOutcome.note) : '',
  };
}

export function getOutcomeEntries(): FunctionalOutcomeEntry[] {
  const hasV2Data = safeGetItem(OUTCOME_KEY) !== null;
  const parsed = safeReadJson<unknown>(hasV2Data ? OUTCOME_KEY : LEGACY_OUTCOME_KEY, []);
  if (!Array.isArray(parsed)) return [];
  const outcomes = parsed
    .map((entry) => normalizeOutcome(entry, !hasV2Data))
    .filter((entry): entry is FunctionalOutcomeEntry => Boolean(entry));
  if (!hasV2Data) safeSetItem(OUTCOME_KEY, JSON.stringify(outcomes));
  return outcomes;
}

export function createOutcomeEntry(input: {
  bodyArea: BodyArea;
  score: OutcomeScore;
  note?: string;
}): FunctionalOutcomeEntry {
  return {
    id: generateId(),
    date: new Date().toISOString(),
    bodyArea: input.bodyArea,
    questionId: OUTCOME_QUESTION_IDS[input.bodyArea],
    score: input.score,
    note: input.note?.trim() ?? '',
  };
}

export function saveOutcomeEntry(entry: FunctionalOutcomeEntry): FunctionalOutcomeEntry[] {
  const outcomes = [entry, ...getOutcomeEntries()].slice(0, MAX_OUTCOMES);
  safeSetItem(OUTCOME_KEY, JSON.stringify(outcomes));
  return outcomes;
}
