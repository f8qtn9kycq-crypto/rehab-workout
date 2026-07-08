import { EQUIPMENT_OPTIONS } from '../data/equipmentOptions';
import { assessmentStorageKey } from '../data/safety';
import {
  BODY_AREAS,
  type AssessmentMode,
  type BodyArea,
  type Equipment,
  type SavedAssessment,
} from '../types/rehab';
import { safeReadJson, safeSetItem } from './localStorageService';

const ASSESSMENT_MODES: AssessmentMode[] = ['recovery', 'beginner', 'standard'];
const VALID_EQUIPMENT = EQUIPMENT_OPTIONS.map((item) => item.id);

interface SaveAssessmentInput extends SavedAssessment {
  confidence: number;
  sessionLength: number;
  completedAt: string;
}

function isBodyArea(value: unknown): value is BodyArea {
  return typeof value === 'string' && BODY_AREAS.includes(value as BodyArea);
}

function isEquipment(value: unknown): value is Equipment {
  return typeof value === 'string' && VALID_EQUIPMENT.includes(value as Equipment);
}

function isAssessmentMode(value: unknown): value is AssessmentMode {
  return typeof value === 'string' && ASSESSMENT_MODES.includes(value as AssessmentMode);
}

function normalizePain(value: unknown): number | undefined {
  const pain = Number(value);
  return Number.isFinite(pain) && pain >= 0 && pain <= 10 ? pain : undefined;
}

function normalizeAssessment(rawAssessment: Partial<SaveAssessmentInput>): SavedAssessment | null {
  if (!rawAssessment || typeof rawAssessment !== 'object') return null;

  const bodyArea = isBodyArea(rawAssessment.bodyArea) ? rawAssessment.bodyArea : undefined;
  const equipment = Array.isArray(rawAssessment.equipment)
    ? rawAssessment.equipment.filter(isEquipment)
    : undefined;
  const mode = isAssessmentMode(rawAssessment.mode) ? rawAssessment.mode : undefined;
  const pain = normalizePain(rawAssessment.pain);

  if (!bodyArea && !equipment?.length && !mode && pain === undefined) return null;

  return {
    bodyArea,
    equipment,
    mode,
    pain,
  };
}

export function getSavedAssessment(): SavedAssessment | null {
  const parsed = safeReadJson<Partial<SaveAssessmentInput> | null>(assessmentStorageKey, null);
  return parsed && typeof parsed === 'object' ? normalizeAssessment(parsed) : null;
}

export function hasSavedAssessment(): boolean {
  return Boolean(getSavedAssessment());
}

export function saveAssessment(input: SaveAssessmentInput): boolean {
  return safeSetItem(assessmentStorageKey, JSON.stringify(input));
}
