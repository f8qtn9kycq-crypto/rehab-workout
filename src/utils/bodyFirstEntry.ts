import type { BodyArea } from '../types/rehab';

export type TrainingIntent = 'train' | 'discomfort';

export type BodyFirstDestination = {
  pathname: '/assessment' | '/safety';
  search?: string;
  state?: { from: string };
};

export function getBodyFirstDestination(
  bodyArea: BodyArea,
  intent: TrainingIntent,
  safetyReady: boolean,
): BodyFirstDestination {
  const assessmentPath = `/assessment?bodyArea=${encodeURIComponent(bodyArea)}`;

  if (intent === 'train' && safetyReady) {
    return { pathname: '/assessment', search: `?bodyArea=${encodeURIComponent(bodyArea)}` };
  }

  return {
    pathname: '/safety',
    state: { from: assessmentPath },
  };
}
