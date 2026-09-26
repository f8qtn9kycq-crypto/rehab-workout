import assert from 'node:assert/strict';
import { build } from 'vite';

async function loadModule(entry) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: { lib: { entry, formats: ['es'] }, minify: false, rollupOptions: { output: { inlineDynamicImports: true } }, write: false },
  });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const code = output.find(item => item.type === 'chunk').code;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

const values = new Map();
globalThis.window = { localStorage: {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key),
} };

const storage = await loadModule('src/services/manualWorkoutStorage.ts');
const { buildRecordsPresentation } = await loadModule('src/utils/recordsPresentation.ts');
const { clearRehabLocalData } = await loadModule('src/services/localStorageService.ts');
const today = new Date();
const date = storage.localDate ? storage.localDate(today) : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const workout = { id: 'manual-1', date, createdAt: today.toISOString(), cyclingMinutes: 15, exercises: [
  { name: 'Barbell squat', equipment: 'barbell', sets: [{ weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }] },
  { name: 'Shoulder press', equipment: 'dumbbells', sets: [{ weightKg: 20, reps: 10 }] },
] };

assert.equal(storage.saveManualWorkout(workout), true);
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'one workout holds multiple exercises');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].sets[2].weightKg, 72);
assert.equal(storage.readManualWorkouts().workouts[0].cyclingMinutes, 15, 'same workout can record cycling minutes without another activity');
assert.equal(storage.saveManualWorkout(workout), false, 'same id cannot create a duplicate');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).recentActivities.length, 1, 'Records shows one workout');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).weeklyActivityCount, 1, 'weekly summary counts one workout');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'future', date: '2999-01-01' }), false);
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-set', exercises: [{ ...workout.exercises[0], sets: [{ weightKg: 72, reps: 0 }] }] }), false);
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-cycling', cyclingMinutes: 0 }), false);
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'invalid saves preserve existing data');
values.set(storage.MANUAL_WORKOUT_KEY, '{broken');
assert.equal(storage.readManualWorkouts().error, true);
assert.equal(storage.saveManualWorkout({ ...workout, id: 'manual-2' }), false, 'corrupt data is never overwritten');
assert.equal(values.get(storage.MANUAL_WORKOUT_KEY), '{broken');
assert.ok(clearRehabLocalData().clearedKeys.includes(storage.MANUAL_WORKOUT_KEY));
assert.equal(values.has(storage.MANUAL_WORKOUT_KEY), false);
console.log('Manual workout regression passed: one workout, sets, dedupe, date, invalid/corrupt storage, Records count, and cleanup.');
