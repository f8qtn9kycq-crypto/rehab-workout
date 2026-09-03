import assert from 'node:assert/strict';
import { build } from 'vite';
import en from '../src/locales/en.js';
import zh from '../src/locales/zh-TW.js';

const result = await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    lib: { entry: 'src/utils/homeNextAction.ts', formats: ['es'] },
    write: false,
    minify: false,
  },
});
const output = Array.isArray(result) ? result[0].output : result.output;
const code = output.find(item => item.type === 'chunk').code;
const { getNextAction, hasRecentOutcome } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);
let cases = 0;
for (const safetyReady of [false, true]) {
  for (const hasAssessment of [false, true]) {
    for (const hasLog of [false, true]) {
      for (const hasRecentOutcomeEntry of [false, true]) {
        const input = {
          safetyReady, hasAssessment, hasRecentOutcomeEntry,
          latestLog: hasLog ? { exerciseId: 'ankle-circles' } : undefined,
        };
        const before = JSON.stringify(input);
        const action = getNextAction(input);
        const expected = !safetyReady ? '/safety' : !hasAssessment ? '/assessment'
          : hasLog && !hasRecentOutcomeEntry ? '/logs'
          : hasLog ? '/session/ankle-circles' : '/exercises';
        assert.equal(action.href, expected);
        assert.equal(action.variant, 'primary');
        assert.equal(JSON.stringify(input), before, 'decision does not mutate input');
        for (const locale of [en, zh]) {
          for (const key of [action.titleKey, action.bodyKey, action.ctaKey]) {
            assert.equal(typeof key.split('.').reduce((value, part) => value?.[part], locale), 'string', key);
          }
        }
        cases++;
      }
    }
  }
}
const today = new Date('2026-09-03T12:00:00Z');
assert.equal(hasRecentOutcome([], today), false);
assert.equal(hasRecentOutcome([{ date: 'bad-date' }], today), false);
assert.equal(hasRecentOutcome([{ date: today.toISOString() }], today), true);
const boundary = today.getTime() - 14 * 24 * 60 * 60 * 1000;
assert.equal(hasRecentOutcome([{ date: new Date(boundary).toISOString() }], today), true);
assert.equal(hasRecentOutcome([{ date: new Date(boundary - 1).toISOString() }], today), false);
console.log(`Home entry regression passed: ${cases} state combinations, locale coverage, immutable inputs and outcome date boundaries.`);
