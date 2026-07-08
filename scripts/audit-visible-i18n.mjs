#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const rootDir = process.cwd();
const visibleSourceDirs = ['src/components', 'src/pages'];
const visibleExtensions = new Set(['.js', '.jsx', '.ts', '.tsx']);
const supportedLanguages = ['en', 'zh-TW'];
const bodyAreas = ['shoulder', 'hip', 'shoulder_neck', 'knee', 'ankle'];
const trendKeys = ['improving', 'steady', 'declining', 'not_enough_data'];
const outcomeScores = ['1', '2', '3', '4', '5'];
const hanCharacterPattern = /[\u3400-\u9fff]/;
const seededEnglishLog = {
  id: 'audit-log-1',
  date: '2026-07-03T09:00:00.000Z',
  completedAt: '2026-07-03T09:00:00.000Z',
  exerciseId: 'shoulder-flexion',
  title: '肩關節前彎運動',
  exerciseTitle: '肩關節前彎運動',
  bodyArea: 'shoulder',
  type: 'mobility',
  level: 'beginner',
  plannedSets: 3,
  plannedReps: 10,
  setsCompleted: 2,
  repsCompleted: 8,
  painBefore: 2,
  painAfter: 1,
  difficultyRating: 3,
  stoppedEarly: false,
  stopReason: '',
  notes: '',
};
const seededEnglishEarlyStopLog = {
  ...seededEnglishLog,
  id: 'audit-log-early-stop',
  stoppedEarly: true,
  stopReason: 'early_stop',
};
const seededLegacyZhEarlyStopLog = {
  ...seededEnglishLog,
  id: 'audit-log-legacy-zh-early-stop',
  stoppedEarly: true,
  stopReason: '訓練中感到不適或想先停止。',
};
const seededUserTextStopLog = {
  ...seededEnglishLog,
  id: 'audit-log-user-text-stop',
  stoppedEarly: true,
  stopReason: 'Stopped because the right side felt tight.',
};
const seededEnglishOutcome = {
  id: 'audit-outcome-1',
  date: '2026-07-03T12:00:00.000Z',
  bodyArea: 'shoulder',
  questionId: 'function-shoulder',
  score: 4,
  note: '',
};

function listFiles(relativeDir) {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];

  return fs.readdirSync(absoluteDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listFiles(relativePath);
    return visibleExtensions.has(path.extname(entry.name)) && !relativePath.endsWith('.d.ts')
      ? [relativePath]
      : [];
  });
}

function mergeResource(base, extension) {
  if (!extension || typeof extension !== 'object') return base;

  return Object.entries(extension).reduce((resource, [key, value]) => {
    const current = resource[key];

    return {
      ...resource,
      [key]: value && typeof value === 'object' && !Array.isArray(value)
        ? mergeResource(current && typeof current === 'object' ? current : {}, value)
        : value,
    };
  }, base);
}

function resolvePath(resource, key) {
  return key.split('.').reduce((value, part) => (value && value[part] !== undefined ? value[part] : undefined), resource);
}

function interpolate(value, params = {}) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ''));
}

function lineForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}

function extractLiteralKeys(filePath) {
  const source = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
  const keyPattern = /\bt\(\s*(['"])([A-Za-z0-9_.-]+)\1/g;
  const keys = [];

  for (const match of source.matchAll(keyPattern)) {
    keys.push({
      filePath,
      key: match[2],
      line: lineForIndex(source, match.index ?? 0),
    });
  }

  return keys;
}

async function loadLocale(relativePath) {
  const url = pathToFileURL(path.join(rootDir, relativePath));
  url.search = `?audit=${Date.now()}`;
  return (await import(url.href)).default;
}

const [en, zhTW, cleanupLocales, localDataLocales] = await Promise.all([
  loadLocale('src/locales/en.js'),
  loadLocale('src/locales/zh-TW.js'),
  loadLocale('src/locales/cleanup.js'),
  loadLocale('src/locales/localData.js'),
]);

const resources = {
  en: mergeResource(mergeResource(en, cleanupLocales.en), localDataLocales.en),
  'zh-TW': mergeResource(mergeResource(zhTW, cleanupLocales['zh-TW']), localDataLocales['zh-TW']),
};

function createTranslator(language) {
  const resource = resources[language];
  const fallback = resources['zh-TW'];

  return function translate(key, params) {
    const localized = resolvePath(resource, key);
    const fallbackValue = resolvePath(fallback, key);
    return interpolate(localized ?? fallbackValue ?? key, params);
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractEnglishExerciseTitle(exerciseId) {
  const source = fs.readFileSync(path.join(rootDir, 'src/data/exerciseTranslations.ts'), 'utf8');
  const exercisePattern = new RegExp(`['"]${escapeRegExp(exerciseId)}['"]\\s*:\\s*\\{([\\s\\S]*?)\\n\\s*\\}`, 'm');
  const exerciseMatch = source.match(exercisePattern);
  const titleMatch = exerciseMatch?.[1].match(/\btitle:\s*(['"])(.*?)\1/);
  return titleMatch?.[2] ?? exerciseId.replace(/-/g, ' ');
}

function titleMatchesLanguage(title, language) {
  const hasHanCharacters = hanCharacterPattern.test(title);
  const hasLatinLetters = /[A-Za-z]/.test(title);

  if (language === 'en') return !hasHanCharacters;
  return hasHanCharacters || !hasLatinLetters;
}

function getLocalizedTrainingLogTitle(log, language, fallbackTitle) {
  if (language === 'en' && log.exerciseId) return extractEnglishExerciseTitle(log.exerciseId);

  const storedTitle = String(log.title || log.exerciseTitle || '').trim();
  if (!storedTitle) return fallbackTitle;
  return titleMatchesLanguage(storedTitle, language) ? storedTitle : fallbackTitle;
}

function getStopReasonLabel(log, t) {
  if (log.stopReason === 'user_exit') return t('session.exitWithoutSaving');
  if (
    log.stopReason === 'early_stop' ||
    log.stopReason === 'Felt discomfort or chose to stop early.' ||
    log.stopReason === '訓練中感到不適或想先停止。'
  ) {
    return t('session.earlyStopDefault');
  }

  return log.stopReason || log.notes || null;
}

function formatDate(date, language) {
  return new Date(date).toLocaleDateString(language);
}

function renderSeededEnglishRecordsState() {
  const language = 'en';
  const t = createTranslator(language);
  const fallbackTitle = t('logs.savedExerciseFallback');
  const localizedTrainingTitle = getLocalizedTrainingLogTitle(seededEnglishLog, language, fallbackTitle);
  const bodyAreaLabel = t(`bodyAreas.${seededEnglishOutcome.bodyArea}.label`);
  const logDate = formatDate(seededEnglishLog.date, language);
  const outcomeDate = formatDate(seededEnglishOutcome.date, language);

  return [
    { surface: 'records.latest.trainingLabel', text: t('records.latest.trainingLabel') },
    { surface: 'records.latest.trainingTitle', text: localizedTrainingTitle },
    {
      surface: 'records.latest.trainingMeta',
      text: t('records.latest.trainingMeta', {
        date: logDate,
        painBefore: seededEnglishLog.painBefore,
        painAfter: seededEnglishLog.painAfter,
      }),
    },
    { surface: 'records.latest.outcomeLabel', text: t('records.latest.outcomeLabel') },
    {
      surface: 'records.latest.outcomeValue',
      text: t('records.latest.outcomeValue', {
        area: bodyAreaLabel,
        score: seededEnglishOutcome.score,
      }),
    },
    { surface: 'records.latest.outcomeMeta', text: t('records.latest.outcomeMeta', { date: outcomeDate }) },
    { surface: 'records.history.trainingTitle', text: localizedTrainingTitle },
    { surface: 'records.history.bodyArea', text: t(`bodyAreas.${seededEnglishLog.bodyArea}.label`) },
    { surface: 'records.history.type', text: t(`typeLabels.${seededEnglishLog.type}`) },
    { surface: 'records.history.level', text: t(`levelLabels.${seededEnglishLog.level}`) },
    {
      surface: 'records.history.pain',
      text: t('logs.pain', {
        before: seededEnglishLog.painBefore,
        after: seededEnglishLog.painAfter,
      }),
    },
    {
      surface: 'records.history.volume',
      text: t('logs.volume', {
        sets: seededEnglishLog.setsCompleted,
        plannedSets: seededEnglishLog.plannedSets,
        reps: seededEnglishLog.repsCompleted,
        plannedReps: seededEnglishLog.plannedReps,
      }),
    },
    { surface: 'records.history.effort', text: t('logs.effort', { value: seededEnglishLog.difficultyRating }) },
    { surface: 'records.history.earlyStopReason', text: getStopReasonLabel(seededEnglishEarlyStopLog, t) },
    { surface: 'records.history.legacyZhEarlyStopReason', text: getStopReasonLabel(seededLegacyZhEarlyStopLog, t) },
    { surface: 'records.history.userTextStopReason', text: getStopReasonLabel(seededUserTextStopLog, t) },
    { surface: 'records.outcomes.title', text: t('outcomes.title') },
    { surface: 'records.outcomes.bodyAreaLabel', text: t('outcomes.bodyAreaLabel') },
    { surface: 'records.outcomes.selectedAreaTitle', text: t('outcomes.selectedAreaTitle', { area: bodyAreaLabel }) },
    { surface: 'records.outcomes.question', text: t(`outcomes.questions.${seededEnglishOutcome.bodyArea}`) },
    {
      surface: 'records.outcomes.latestForArea',
      text: t('outcomes.latestForArea', {
        score: seededEnglishOutcome.score,
        date: outcomeDate,
      }),
    },
    { surface: 'records.outcomes.scoreLabel', text: t('outcomes.scoreLabel') },
    { surface: 'records.outcomes.scoreHelper', text: t('outcomes.scoreHelper') },
    ...outcomeScores.map((score) => ({
      surface: `records.outcomes.scoreLabels.${score}`,
      text: t(`outcomes.scoreLabels.${score}`),
    })),
    { surface: 'records.outcomes.notePlaceholder', text: t('outcomes.notePlaceholder') },
    { surface: 'progress.trainedAreas', text: t('progress.trainedAreas', { areas: bodyAreaLabel }) },
    {
      surface: 'progress.latestOutcomeValue',
      text: t('progress.latestOutcomeValue', {
        score: seededEnglishOutcome.score,
        date: outcomeDate,
      }),
    },
  ];
}

function assertLeakageDetectorCatchesSeededChineseText() {
  const negativeFixture = 'Training history: 肩關節前彎運動';
  if (!hanCharacterPattern.test(negativeFixture)) {
    throw new Error('Rendered i18n audit self-check failed: Han leakage detector did not catch the negative fixture.');
  }
}

const literalKeyFindings = visibleSourceDirs
  .flatMap(listFiles)
  .flatMap(extractLiteralKeys);

const dynamicKeyFindings = [
  ...bodyAreas.flatMap((bodyArea) => [
    `bodyAreas.${bodyArea}.label`,
    `outcomes.questions.${bodyArea}`,
  ]),
  ...trendKeys.map((trend) => `progress.trends.${trend}`),
  ...outcomeScores.map((score) => `outcomes.scoreLabels.${score}`),
].map((key) => ({
  filePath: 'dynamic i18n coverage',
  key,
  line: 1,
}));

const findings = [...literalKeyFindings, ...dynamicKeyFindings].flatMap(({ filePath, key, line }) => {
  return supportedLanguages.flatMap((language) => {
    const value = resolvePath(resources[language], key);
    if (typeof value === 'string' && value.trim() !== '') return [];
    if (Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim() !== '')) return [];

    return [{
      filePath,
      key,
      language,
      line,
      valueType: value === undefined ? 'missing' : typeof value,
    }];
  });
});

assertLeakageDetectorCatchesSeededChineseText();

const renderedStateFindings = renderSeededEnglishRecordsState().flatMap(({ surface, text }) => {
  if (!hanCharacterPattern.test(text)) return [];

  return [{
    filePath: 'seeded English Records render',
    key: surface,
    language: 'en',
    line: 1,
    valueType: `Traditional Chinese leakage in ${JSON.stringify(text)}`,
  }];
});

findings.push(...renderedStateFindings);

if (findings.length > 0) {
  console.error(`Visible i18n audit failed with ${findings.length} missing/non-string key or rendered leakage finding(s):`);
  for (const finding of findings) {
    console.error(
      `- ${finding.filePath}:${finding.line} ${finding.language} ${finding.key} (${finding.valueType})`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(
    `Visible i18n audit passed: ${literalKeyFindings.length} literal UI keys plus dynamic Records keys resolve in en and zh-TW; seeded English Records output has no Traditional Chinese leakage.`,
  );
}
