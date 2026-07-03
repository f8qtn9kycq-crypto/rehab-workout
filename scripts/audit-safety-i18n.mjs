#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const rootDir = process.cwd();

const runtimeCopyFiles = [
  'src/locales/en.js',
  'src/locales/zh-TW.js',
  'src/data/exercises.ts',
  'src/data/exerciseTranslations.ts',
];

const englishVisibleFiles = [
  'src/locales/en.js',
  ...listFiles('src/components', ['.tsx', '.ts', '.jsx', '.js']),
  ...listFiles('src/pages', ['.tsx', '.ts', '.jsx', '.js']),
].filter((filePath) => !filePath.endsWith('.d.ts'));

const exerciseSafetyFields = ['cautions', 'stopRules', 'regressions', 'progressions'];

const unsafeClaimPatterns = [
  { label: 'guaranteed result', pattern: /\bguarantee(?:d|s)?\b[^\n.]{0,60}\b(result|recovery|safe|pain|improvement|treatment)\b/i },
  { label: 'cure claim', pattern: /\b(?:cure|cures|cured)\b(?! product\b)(?! claims?\b)/i },
  { label: 'fixes pain claim', pattern: /\bfix(?:es)?\s+(?:your\s+)?pain\b/i },
  { label: 'safe for everyone claim', pattern: /\bsafe\s+for\s+everyone\b/i },
  { label: 'fully recovered claim', pattern: /\b(?:fully recovered|complete recovery|recovery complete)\b/i },
  { label: 'Chinese guaranteed claim', pattern: /保證[^\n。]{0,30}(有效|改善|安全|恢復|治療|治癒|不痛)/ },
  { label: 'Chinese cure claim', pattern: /(根治|完全治癒|治癒疼痛|完全康復|一定會好)/ },
  { label: 'Chinese universally safe claim', pattern: /(所有人都安全|人人適合|絕對安全)/ },
];

function listFiles(relativeDir, extensions) {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];

  const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) return listFiles(relativePath, extensions);
    return extensions.includes(path.extname(entry.name)) ? [relativePath] : [];
  });
}

function readSource(filePath) {
  return fs.readFileSync(path.join(rootDir, filePath), 'utf8');
}

function lineForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}

function compactSnippet(source, index, length) {
  return source.slice(Math.max(0, index - 40), index + length + 40).replace(/\s+/g, ' ').trim();
}

function extractExercises(source) {
  const match = source.match(/export const exercises: Exercise\[\] = \[([\s\S]*?)\n\];/);
  if (!match) {
    throw new Error('Could not find exercises array in src/data/exercises.ts');
  }

  return vm.runInNewContext(`[${match[1]}]`, Object.freeze({}), { timeout: 1000 });
}

function isAllowedUnsafeClaimContext(snippet) {
  return /not (?:a )?diagnosis or cure/i.test(snippet) ||
    /does not diagnose, treat, or claim to cure/i.test(snippet) ||
    /claim to cure/i.test(snippet) ||
    /no diagnosis or cure claims/i.test(snippet);
}

function auditUnsafeClaims() {
  return runtimeCopyFiles.flatMap((filePath) => {
    const source = readSource(filePath);
    return unsafeClaimPatterns.flatMap(({ label, pattern }) => {
      const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
      const findings = [];
      for (const match of source.matchAll(new RegExp(pattern, flags))) {
        const snippet = compactSnippet(source, match.index ?? 0, match[0].length);
        if (isAllowedUnsafeClaimContext(snippet)) continue;
        findings.push({
          check: 'unsafe-claim',
          filePath,
          line: lineForIndex(source, match.index ?? 0),
          detail: `${label}: ${snippet}`,
        });
      }
      return findings;
    });
  });
}

function auditEnglishChineseLeakage() {
  const hanPattern = /[\u3400-\u9fff]/g;

  return englishVisibleFiles.flatMap((filePath) => {
    const source = readSource(filePath);
    const findings = [];
    for (const match of source.matchAll(hanPattern)) {
      findings.push({
        check: 'english-chinese-leakage',
        filePath,
        line: lineForIndex(source, match.index ?? 0),
        detail: compactSnippet(source, match.index ?? 0, match[0].length),
      });
    }
    return findings;
  });
}

function auditExerciseSafetyFields() {
  const exercises = extractExercises(readSource('src/data/exercises.ts'));

  return exercises.flatMap((exercise) => {
    return exerciseSafetyFields
      .filter((field) => !Array.isArray(exercise[field]) || exercise[field].length === 0)
      .map((field) => ({
        check: 'exercise-safety-field',
        filePath: 'src/data/exercises.ts',
        line: 1,
        detail: `${exercise.id} is missing ${field}`,
      }));
  });
}

const findings = [
  ...auditUnsafeClaims(),
  ...auditEnglishChineseLeakage(),
  ...auditExerciseSafetyFields(),
];

if (findings.length > 0) {
  console.error(`Safety/i18n guardrail audit failed with ${findings.length} finding(s):`);
  for (const finding of findings) {
    console.error(`- [${finding.check}] ${finding.filePath}:${finding.line} ${finding.detail}`);
  }
  process.exitCode = 1;
} else {
  console.log('Safety/i18n guardrail audit passed: no unsafe claim phrases, English Chinese leakage, or missing exercise safety fields found.');
}
