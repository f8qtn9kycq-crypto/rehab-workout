import { getEnglishExerciseContent } from '../data/exerciseTranslations';
import type { AppLanguage } from '../services/i18n';
import type { Exercise, TrainingLogEntry } from '../types/rehab';
import { getExerciseById } from './exerciseModel';

const hanCharacterPattern = /[\u3400-\u9fff]/;
const latinLetterPattern = /[A-Za-z]/;

export function getLocalizedExercise(exercise: Exercise, language: AppLanguage): Exercise {
  if (language !== 'en') return exercise;

  return {
    ...exercise,
    ...getEnglishExerciseContent(exercise),
  };
}

function titleMatchesLanguage(title: string, language: AppLanguage): boolean {
  const hasHanCharacters = hanCharacterPattern.test(title);
  const hasLatinLetters = latinLetterPattern.test(title);

  if (language === 'en') return !hasHanCharacters;
  return hasHanCharacters || !hasLatinLetters;
}

export function getLocalizedTrainingLogTitle(
  log: Pick<TrainingLogEntry, 'exerciseId' | 'title' | 'exerciseTitle'>,
  language: AppLanguage,
  fallbackTitle: string,
): string {
  const exercise = getExerciseById(log.exerciseId);
  if (exercise) return getLocalizedExercise(exercise, language).title;

  const storedTitle = String(log.title || log.exerciseTitle || '').trim();
  if (!storedTitle) return fallbackTitle;

  return titleMatchesLanguage(storedTitle, language) ? storedTitle : fallbackTitle;
}
