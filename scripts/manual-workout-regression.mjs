import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'vite';

const pickerSource = readFileSync('src/pages/ManualWorkoutPage.tsx', 'utf8');
const artSource = readFileSync('src/components/ReferenceMovementArt.tsx', 'utf8');
const referencePng = readFileSync('public/exercise-visuals/manual-workout-reference-all-seven.png');
assert.match(pickerSource, /<ReferenceMovementArt id=\{id\}/, 'quick choices use approved reference art');
assert.doesNotMatch(pickerSource, /<QuickMovementIcon id=\{id\}/, 'quick choices do not render stick figures');
const quickChoiceList = pickerSource.match(/const quickExerciseIds: QuickMovementId\[\] = \[([^\]]+)\]/);
assert.ok(quickChoiceList, 'quick choice list exists');
const quickIds = [...quickChoiceList[1].matchAll(/'([^']+)'/g)].map(([, id]) => id);
assert.equal(quickIds.length, 7, 'all seven approved choices remain available');
for (const id of quickIds) assert.match(artSource, new RegExp(`^  ${id}: \\{ left:`, 'm'), `${id} has a reference crop`);
assert.match(artSource, /manual-workout-reference-all-seven\.png/);
assert.equal(referencePng.toString('hex', 0, 8), '89504e470d0a1a0a', 'reference asset is PNG');
assert.equal(referencePng.readUInt32BE(16), 793, 'reference art width is unchanged');
assert.equal(referencePng.readUInt32BE(20), 1981, 'reference art height is unchanged');

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

assert.equal(storage.saveManualWorkout(workout), 'ok');
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'one workout holds multiple exercises');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].sets[2].weightKg, 72);
assert.equal(storage.readManualWorkouts().workouts[0].cyclingMinutes, 15, 'same workout can record cycling minutes without another activity');
assert.equal(storage.saveManualWorkout(workout), 'invalid', 'same id cannot create a duplicate');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).recentActivities.length, 1, 'Records shows one workout');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).weeklyActivityCount, 1, 'weekly summary counts one workout');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'future', date: '2999-01-01' }), 'invalid');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-set', exercises: [{ ...workout.exercises[0], sets: [{ weightKg: 72, reps: 0 }] }] }), 'invalid');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-cycling', cyclingMinutes: 0 }), 'invalid');
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'invalid saves preserve existing data');
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
const tomorrowDate = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
const futureRecord = { ...workout, id: 'clock-shifted', date: tomorrowDate };
values.set(storage.MANUAL_WORKOUT_KEY, JSON.stringify([futureRecord, workout]));
assert.equal(storage.readManualWorkouts().error, false, 'clock shifts do not make existing records unreadable');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'after-clock-shift' }), 'ok', 'new valid records can still save');
assert.equal(buildRecordsPresentation([], [], [], today, [futureRecord]).weeklyActivityCount, 0, 'future records do not count this week');
const beforeWriteFailure = values.get(storage.MANUAL_WORKOUT_KEY);
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = () => { throw new Error('storage unavailable'); };
assert.equal(storage.saveManualWorkout({ ...workout, id: 'write-failed' }), 'write-failed');
assert.equal(values.get(storage.MANUAL_WORKOUT_KEY), beforeWriteFailure, 'failed writes preserve existing raw storage');
window.localStorage.setItem = originalSetItem;
values.set(storage.MANUAL_WORKOUT_KEY, '{broken');
assert.equal(storage.readManualWorkouts().error, true);
assert.equal(storage.saveManualWorkout({ ...workout, id: 'manual-2' }), 'corrupt', 'corrupt data is never overwritten');
assert.equal(values.get(storage.MANUAL_WORKOUT_KEY), '{broken');
assert.ok(clearRehabLocalData().clearedKeys.includes(storage.MANUAL_WORKOUT_KEY));
assert.equal(values.has(storage.MANUAL_WORKOUT_KEY), false);
console.log('Manual workout regression passed: one workout, sets, dedupe, date and clock shifts, invalid/corrupt/write-failed storage, Records count, and cleanup.');
