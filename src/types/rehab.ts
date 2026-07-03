export const BODY_AREAS = ['shoulder', 'hip', 'shoulder_neck', 'knee', 'ankle'] as const;

export type BodyArea = (typeof BODY_AREAS)[number];

export type OutcomeScore = 1 | 2 | 3 | 4 | 5;

export type Joint = BodyArea;

export const EQUIPMENT_IDS = {
  BODYWEIGHT: 'bodyweight',
  DUMBBELL: 'dumbbell',
  KETTLEBELL: 'kettlebell',
  CHAIR: 'chair',
  WALL: 'wall',
  RESISTANCE_BAND: 'resistance_band',
  FOAM_ROLLER: 'foam_roller',
} as const;

export type Equipment = (typeof EQUIPMENT_IDS)[keyof typeof EQUIPMENT_IDS];

export const EXERCISE_TYPES = ['mobility', 'strength', 'stretch', 'relaxation', 'balance', 'proprioception'] as const;

export type ExerciseType = (typeof EXERCISE_TYPES)[number];

export const EXERCISE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export type ExerciseLevel = (typeof EXERCISE_LEVELS)[number];

export const EXERCISE_FILTER_MODES = ['recommended', 'all'] as const;

export type ExerciseFilterMode = (typeof EXERCISE_FILTER_MODES)[number];

export const DURATION_FILTERS = ['all', 'short', 'medium'] as const;

export type DurationFilter = (typeof DURATION_FILTERS)[number];

export type AssessmentMode = 'recovery' | 'beginner' | 'standard';

export type SafetyTag =
  | 'high_impact'
  | 'deep_knee_flexion'
  | 'aggressive_overhead_loading'
  | 'unsupported_balance'
  | 'loaded_progression'
  | 'pain_sensitive';

export type RecommendationSafetyLevel = 'gentle' | 'standard' | 'caution' | 'advanced_only';

export interface Exercise {
  id: string;
  title: string;
  joint: Joint;
  bodyArea: BodyArea;
  condition: string;
  type: ExerciseType;
  level: ExerciseLevel;
  description: string;
  detail: string;
  steps: string[];
  sets: number;
  reps: number;
  holdSeconds: number;
  restSeconds: number;
  durationText: string;
  benefits: string;
  cautions: string[];
  stopRules: string[];
  regressions: string[];
  progressions: string[];
  equipment: Equipment[];
  requiredEquipment?: Equipment[];
  optionalEquipment?: Equipment[];
  progressionEquipment?: Equipment[];
  safetyTags?: SafetyTag[];
  recommendationSafetyLevel?: RecommendationSafetyLevel;
  supportRequired?: boolean;
  avoidIfPainHigh?: boolean;
  youtubeEmbedUrl: string;
  youtubeSearchUrl: string;
  sourceRef: string;
}

export interface SessionLog {
  id: string;
  exerciseId: string;
  exerciseTitle: string;
  completedAt: string;
  setsCompleted: number;
  repsCompleted: number;
  painBefore: number;
  painAfter: number;
  notes: string;
}

export type SessionCompletionStatus = 'completed' | 'stopped_early';

export interface TrainingLogEntry extends SessionLog {
  date: string;
  title: string;
  bodyArea: BodyArea;
  type: ExerciseType;
  level: ExerciseLevel;
  plannedSets: number;
  plannedReps: number;
  difficultyRating: number;
  stoppedEarly: boolean;
  recoveryMode: boolean;
  completionStatus: SessionCompletionStatus;
  stopReason: string;
  painDelta: number;
}

export interface FunctionalOutcomeEntry {
  id: string;
  date: string;
  bodyArea: BodyArea;
  questionId: string;
  score: OutcomeScore;
  note: string;
}

export interface AssessmentState {
  redFlags: string[];
  painByArea: Record<string, number>;
  bodyAreas: string[];
  completedAt: string;
}

export interface SavedAssessment {
  bodyArea?: BodyArea;
  equipment?: Equipment[];
  mode?: AssessmentMode;
  pain?: number;
}

export interface ExerciseFilters {
  mode: ExerciseFilterMode;
  bodyArea: BodyArea | 'all';
  type: ExerciseType | 'all';
  level: ExerciseLevel | 'all';
  equipment: Equipment[];
  noEquipmentOnly: boolean;
  duration: DurationFilter;
  painSensitive: boolean;
}
