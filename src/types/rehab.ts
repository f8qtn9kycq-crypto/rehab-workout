export const BODY_AREAS = ['shoulder', 'hip', 'shoulder_neck', 'knee', 'ankle'] as const;

export type BodyArea = (typeof BODY_AREAS)[number];

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

export interface AssessmentState {
  redFlags: string[];
  painByArea: Record<string, number>;
  bodyAreas: string[];
  completedAt: string;
}
