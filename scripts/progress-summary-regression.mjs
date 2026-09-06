import assert from 'node:assert/strict';
import { build } from 'vite';

const result = await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    lib: { entry: 'src/utils/progressSummary.ts', formats: ['es'] },
    write: false,
    minify: false,
  },
});
const output = Array.isArray(result) ? result[0].output : result.output;
const code = output.find((item) => item.type === 'chunk').code;
const { buildWeeklyProgressSummary } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
);

const today = new Date('2026-09-03T12:00:00Z');
const log = (date, bodyArea, painAfter, painBefore = painAfter) => ({
  date, completedAt: date, bodyArea, painBefore, painAfter,
});
const outcome = (date, bodyArea, score) => ({ date, bodyArea, score });
const daysAgo = (days) => new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const future = new Date(today.getTime() + 1).toISOString();

const logs = [
  log(daysAgo(0), 'knee', 2, 3),
  log(daysAgo(2), 'knee', 4, 4),
  log(daysAgo(1), 'shoulder', 9, 9),
  log(future, 'ankle', 10, 10),
  log('bad-date', 'hip', 10, 10),
];
const outcomes = [
  outcome(daysAgo(0), 'knee', 7),
  outcome(daysAgo(3), 'knee', 5),
  outcome(daysAgo(1), 'shoulder', 1),
  outcome(future, 'ankle', 10),
  outcome('bad-date', 'hip', 10),
];
const before = JSON.stringify({ logs, outcomes });
const summary = buildWeeklyProgressSummary(logs, outcomes, today);

assert.equal(summary.focusBodyArea, 'knee', 'latest valid log selects focus area');
assert.equal(summary.painTrend, 'lower', 'pain trend uses only focused body area');
assert.equal(summary.functionTrend, 'improved', 'function trend uses only focused body area');
assert.equal(summary.averagePainBefore, 3.5, 'focused weekly pain before average');
assert.equal(summary.averagePainAfter, 3, 'focused weekly pain after average');
assert.equal(summary.latestOutcomeByArea.ankle, undefined, 'future outcomes are excluded');
assert.equal(summary.latestOutcomeByArea.hip, undefined, 'invalid outcomes are excluded');
assert.equal(summary.sessionsThisWeek, 3, 'future and invalid logs are excluded from weekly count');
assert.equal(JSON.stringify({ logs, outcomes }), before, 'summary does not mutate inputs');

const insufficient = buildWeeklyProgressSummary(
  [log(daysAgo(0), 'shoulder', 2)],
  [outcome(daysAgo(0), 'shoulder', 6)],
  today,
);
assert.equal(insufficient.painTrend, 'not_enough_data');
assert.equal(insufficient.functionTrend, 'not_enough_data');

const futureOnly = buildWeeklyProgressSummary(
  [log(future, 'ankle', 4)],
  [outcome(future, 'ankle', 4)],
  today,
);
assert.equal(futureOnly.focusBodyArea, null);
assert.equal(futureOnly.sessionsThisWeek, 0);

console.log('Progress summary regression passed: body-area isolation, future-date rejection, insufficient data, and immutable inputs.');
