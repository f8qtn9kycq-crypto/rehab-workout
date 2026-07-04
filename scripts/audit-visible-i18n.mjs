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

const [en, zhTW, cleanupLocales] = await Promise.all([
  loadLocale('src/locales/en.js'),
  loadLocale('src/locales/zh-TW.js'),
  loadLocale('src/locales/cleanup.js'),
]);

const resources = {
  en: mergeResource(en, cleanupLocales.en),
  'zh-TW': mergeResource(zhTW, cleanupLocales['zh-TW']),
};

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

if (findings.length > 0) {
  console.error(`Visible i18n audit failed with ${findings.length} missing or non-string key(s):`);
  for (const finding of findings) {
    console.error(
      `- ${finding.filePath}:${finding.line} ${finding.language} ${finding.key} (${finding.valueType})`,
    );
  }
  process.exitCode = 1;
} else {
  console.log(
    `Visible i18n audit passed: ${literalKeyFindings.length} literal UI keys plus dynamic Records keys resolve in en and zh-TW.`,
  );
}
