import { getEnglishExerciseContent } from '../data/exerciseTranslations';
import type { AppLanguage } from '../services/i18n';
import type { Exercise } from '../types/rehab';

export function getLocalizedExercise(exercise: Exercise, language: AppLanguage): Exercise {
  if (language !== 'en') return exercise;

  return {
    ...exercise,
    ...getEnglishExerciseContent(exercise),
  };
}
