import assert from 'node:assert/strict';
import { build } from 'vite';

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  clear() {
    this.#values.clear();
  }
}

const localStorage = new MemoryStorage();
globalThis.window = { localStorage };

async function loadService(entry) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: { entry, formats: ['es'] },
      minify: false,
      rollupOptions: { output: { inlineDynamicImports: true } },
      write: false,
    },
  });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const code = output.find((item) => item.type === 'chunk').code;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const service = await loadService('src/services/activityStorage.ts');
const { ACTIVITY_KEY, saveActivity, readActivities, weeklyActivities, localDate, readActivityPlan, saveActivityPlan } = service;
const today = new Date('2026-09-13T12:00:00');
const base = { id: 'session', kind: 'resistance', primaryFocus: 'mixed', exerciseLogIds: ['a', 'b', 'c'], date: '2026-09-08', completed: true, actualMinutes: 60, symptomResponse: 'same' };
localStorage.setItem('rehab.trainingLogs.v2', 'original bytes');
assert.equal(saveActivity(base), true);
assert.equal(weeklyActivities(readActivities().activities, today).resistance, 1);
assert.equal(localStorage.getItem('rehab.trainingLogs.v2'), 'original bytes');
assert.equal(saveActivity({ ...base, id: 'duplicate' }), false);
assert.equal(saveActivity(base), true);
assert.equal(readActivities().activities.length, 1);
for (let i = 0; i < 4; i++) assert.equal(saveActivity({ id: `ride${i}`, kind: 'cycling', date: '2026-09-08', completed: true, actualMinutes: 15, symptomResponse: 'same' }), true);
let summary = weeklyActivities(readActivities().activities, today);
assert.equal(summary.cycling, 4);
assert.equal(summary.cyclingMinutes, 60);
assert.equal(saveActivity({ ...base, id: 'unfinished', exerciseLogIds: [], completed: false, actualMinutes: 0 }), true);
assert.equal(weeklyActivities(readActivities().activities, today).resistance, 1);
assert.equal(saveActivity({ ...base, actualMinutes: Infinity }), false);
assert.equal(saveActivity({ ...base, date: '2026-02-30' }), false);
assert.equal(saveActivity({ ...base, date: '2999-01-01' }), false);
assert.equal(saveActivity({ ...base, date: localDate(), nextDayResponse: 'same' }), false);
assert.equal(saveActivity({ ...base, actualMinutes: 0 }), false);
const full = [...Array.from({ length: 3 }, (_, i) => ({ ...base, id: `r${i}`, exerciseLogIds: [] })), ...Array.from({ length: 4 }, (_, i) => ({ ...base, id: `c${i}`, kind: 'cycling', actualMinutes: 15 }))];
assert.equal(weeklyActivities(full, today).recommendation, 'missing');
const recovered = full.map(a => ({ ...a, nextDayResponse: 'same' }));
assert.equal(weeklyActivities(recovered, today).recommendation, 'baseline');
const prior = recovered.map(a => ({ ...a, id: `prior-${a.id}`, date: '2026-09-01' }));
assert.equal(weeklyActivities([...recovered, ...prior], today).recommendation, 'small');
assert.equal(weeklyActivities([...recovered.map(a => ({ ...a, actualMinutes: a.actualMinutes + 1 })), ...prior], today).recommendation, 'volume');
assert.equal(weeklyActivities([{ ...base, symptomResponse: 'worse' }], today).recommendation, 'reduce');
assert.equal(weeklyActivities([{ ...base, nextDayResponse: 'red_flag' }], today).recommendation, 'stop');
assert.equal(weeklyActivities([{ ...base, date: '2026-09-14' }, { ...base, date: '2026-09-06' }], today).resistance, 0);
localStorage.setItem(ACTIVITY_KEY, '{bad');
assert.equal(readActivities().error, true);
assert.equal(saveActivity(base), false);
assert.equal(localStorage.getItem(ACTIVITY_KEY), '{bad');
localStorage.setItem(ACTIVITY_KEY, JSON.stringify([base, base]));
assert.equal(readActivities().error, true);
localStorage.clear();
assert.deepEqual(readActivityPlan().days, [0, 2, 5, 0, 1, 3, 4]);
assert.equal(saveActivityPlan([6, 6, 6, 0, 0, 0, 0]), true);
assert.equal(readActivityPlan().days[0], 6);
assert.equal(saveActivityPlan([7]), false);
const { clearRehabLocalData } = await loadService('src/services/localStorageService.ts');
localStorage.setItem(ACTIVITY_KEY, JSON.stringify([base]));
clearRehabLocalData();
assert.equal(localStorage.getItem(ACTIVITY_KEY), null);
assert.equal(localStorage.getItem(service.PLAN_KEY), null);
window.localStorage = { getItem() { throw new Error('blocked'); } };
assert.equal(readActivities().error, true);
assert.equal(saveActivity(base), false);
window.localStorage = { getItem() { return null; }, setItem() { throw new Error('quota'); } };
assert.equal(saveActivity(base), false);
console.log('Activity regression passed: aggregates, same-day rides, duplicates, dates, feedback, recommendations, legacy preservation, corrupt/blocked storage and clear-data integration.');
const { default: en } = await import('../src/locales/en.js');
const { default: zh } = await import('../src/locales/zh-TW.js');
function leafKeys(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? leafKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`]).sort();
}
assert.deepEqual(leafKeys(en.activities), leafKeys(zh.activities));
for (const key of ['consistency', 'stop', 'reduce', 'missing', 'baseline', 'volume', 'small']) {
  assert.equal(typeof en.activities.recommendations[key], 'string');
  assert.equal(typeof zh.activities.recommendations[key], 'string');
}
console.log('Activity locale keys and dynamic recommendation coverage passed.');
