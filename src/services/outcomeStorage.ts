import { BODY_AREAS, type BodyArea, type FunctionalOutcomeEntry, type OutcomeScore } from '../types/rehab';

const OUTCOME_KEY = 'rehab.functionalOutcomes.v1';
const MAX_OUTCOMES = 200;
const OUTCOME_SCORES = [1, 2, 3, 4, 5] as const;

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

function normalizeOutcome(rawOutcome: Partial<FunctionalOutcomeEntry>): FunctionalOutcomeEntry | null {
  if (!rawOutcome.id || !isBodyArea(rawOutcome.bodyArea)) return null;

  const score = normalizeScore(rawOutcome.score);
  const date = String(rawOutcome.date ?? '');

  if (!score || Number.isNaN(Date.parse(date))) return null;

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
  try {
    const raw = window.localStorage.getItem(OUTCOME_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => normalizeOutcome(entry))
      .filter((entry): entry is FunctionalOutcomeEntry => Boolean(entry));
  } catch {
    return [];
  }
}

export function createOutcomeEntry(input: {
  bodyArea: BodyArea;
  score: OutcomeScore;
  note?: string;
}): FunctionalOutcomeEntry {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    bodyArea: input.bodyArea,
    questionId: OUTCOME_QUESTION_IDS[input.bodyArea],
    score: input.score,
    note: input.note?.trim() ?? '',
  };
}

export function saveOutcomeEntry(entry: FunctionalOutcomeEntry): FunctionalOutcomeEntry[] {
  const outcomes = [entry, ...getOutcomeEntries()].slice(0, MAX_OUTCOMES);
  window.localStorage.setItem(OUTCOME_KEY, JSON.stringify(outcomes));
  return outcomes;
}
