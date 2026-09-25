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

const bodyFirstResult = await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    lib: { entry: 'src/utils/bodyFirstEntry.ts', formats: ['es'] },
    write: false,
    minify: false,
  },
});
const bodyFirstOutput = Array.isArray(bodyFirstResult) ? bodyFirstResult[0].output : bodyFirstResult.output;
const bodyFirstCode = bodyFirstOutput.find(item => item.type === 'chunk').code;
const { getBodyFirstDestination } = await import(
  `data:text/javascript;base64,${Buffer.from(bodyFirstCode).toString('base64')}`
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
const outcome = (date, bodyArea = 'knee') => ({ date, bodyArea });

assert.equal(hasRecentOutcome([], 'knee', today), false);
assert.equal(hasRecentOutcome([outcome('bad-date')], 'knee', today), false);
assert.equal(hasRecentOutcome([outcome(today.toISOString())], 'knee', today), true);
assert.equal(hasRecentOutcome([outcome(today.toISOString(), 'shoulder')], 'knee', today), false);
assert.equal(hasRecentOutcome([outcome(new Date(today.getTime() + 1).toISOString())], 'knee', today), false);
assert.equal(hasRecentOutcome([outcome(today.toISOString())], undefined, today), false);
const boundary = today.getTime() - 14 * 24 * 60 * 60 * 1000;
assert.equal(hasRecentOutcome([outcome(new Date(boundary).toISOString())], 'knee', today), true);
assert.equal(hasRecentOutcome([outcome(new Date(boundary - 1).toISOString())], 'knee', today), false);

const expectedAssessment = '/assessment?bodyArea=knee';
assert.deepEqual(
  getBodyFirstDestination('knee', 'train', true),
  { pathname: '/assessment', search: '?bodyArea=knee' },
  'training with a current clear safety check continues to the existing assessment',
);
for (const [intent, safetyReady] of [['train', false], ['discomfort', false], ['discomfort', true]]) {
  assert.deepEqual(
    getBodyFirstDestination('knee', intent, safetyReady),
    { pathname: '/safety', state: { from: expectedAssessment } },
    `${intent} with safetyReady=${safetyReady} must enter the existing safety flow`,
  );
}
for (const locale of [en, zh]) {
  for (const key of ['homeTitle', 'homeBody', 'homeCta', 'title', 'subtitle', 'areaLegend', 'intentLegend', 'continue', 'safetyNote']) {
    assert.equal(typeof locale.bodyFirst[key], 'string', `bodyFirst.${key}`);
  }
  for (const intent of ['train', 'discomfort']) {
    assert.equal(typeof locale.bodyFirst.intents[intent].label, 'string', `bodyFirst.intents.${intent}.label`);
    assert.equal(typeof locale.bodyFirst.intents[intent].hint, 'string', `bodyFirst.intents.${intent}.hint`);
  }
}

console.log(`Home entry regression passed: ${cases} legacy state combinations, body-first routing, locale coverage, immutable inputs and outcome date boundaries.`);
