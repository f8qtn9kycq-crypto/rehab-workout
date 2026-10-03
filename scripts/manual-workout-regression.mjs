import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'vite';
import en from '../src/locales/en.js';
import zhTW from '../src/locales/zh-TW.js';

const pickerSource = readFileSync('src/pages/ManualWorkoutPage.tsx', 'utf8');
const optionsSource = readFileSync('src/data/manualWorkoutOptions.ts', 'utf8');
const artSource = readFileSync('src/components/ReferenceMovementArt.tsx', 'utf8');
assert.match(pickerSource, /<ReferenceMovementArt id=\{id\}/, 'quick choices use approved reference art');
assert.doesNotMatch(pickerSource, /<QuickMovementIcon id=\{id\}/, 'quick choices do not render stick figures');
const quickChoiceList = optionsSource.match(/const quickExerciseIds: QuickMovementId\[\] = \[([^\]]+)\]/);
assert.ok(quickChoiceList, 'quick choice list exists');
const quickIds = [...quickChoiceList[1].matchAll(/'([^']+)'/g)].map(([, id]) => id);
assert.equal(quickIds.length, 8, 'all eight approved choices remain available');
assert.ok(quickIds.includes('legExtension'), 'leg extension is a quick movement');
const quickCatalogList = optionsSource.match(/quickExerciseCatalogIds[^=]*= new Set\(\[([^\]]+)\]\)/);
assert.ok(quickCatalogList, 'quick exercise catalog exclusions exist');
const quickCatalogIds = [...quickCatalogList[1].matchAll(/'([^']+)'/g)].map(([, id]) => id);
assert.deepEqual(quickCatalogIds, ['catalog-bench-press', 'catalog-shoulder-press', 'catalog-squat', 'catalog-pull-up', 'catalog-dip', 'catalog-lat-pulldown', 'catalog-seated-row'], 'equivalent catalog exercises are excluded by stable id');
assert.match(pickerSource, /const moreExerciseCatalog = catalog\.filter\(exercise => !quickExerciseCatalogIds\.has\(exercise\.id\)\)/, 'more exercises exclude quick-choice equivalents');
assert.match(pickerSource, /moreExerciseCatalog\.map\(item =>/, 'more exercises render the filtered catalog');
for (const id of quickIds) {
  assert.match(artSource, new RegExp(`^  ${id}: \\{ left:`, 'm'), `${id} has a reference crop`);
  assert.ok(en.manualWorkout.quickExercises[id] && zhTW.manualWorkout.quickExercises[id], `${id} is localized`);
}
const equipmentIds = [...pickerSource.match(/const equipmentChoices = \[([\s\S]*?)\];/)?.[1].matchAll(/id: '([^']+)'/g) ?? []].map(match => match[1]);
assert.ok(equipmentIds.includes('cable') && equipmentIds.includes('smith_machine'), 'gym equipment choices are available');
assert.match(artSource, /manual-workout-reference-all-seven\.png/);
assert.match(artSource, /id === 'pullUp'\) return '\/exercise-visuals\/manual-workout-reference-pullup-airborne\.png'/);
assert.match(artSource, /const poseCorrected: QuickMovementId\[\] = \['benchPress', 'seatedRow'\]/);
assert.match(artSource, /poseCorrected\.includes\(id\)\) return '\/exercise-visuals\/manual-workout-reference-pose-corrected\.png'/);
for (const sheet of ['all-seven', 'pose-corrected', 'pullup-airborne']) {
  const png = readFileSync(`public/exercise-visuals/manual-workout-reference-${sheet}.png`);
  assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a', `${sheet} is PNG`);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [793, 1981], `${sheet} keeps crop geometry`);
}

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
const { manualWorkoutPainNotice } = await loadModule('src/utils/manualWorkoutPain.ts');
const { buildRecordsPresentation } = await loadModule('src/utils/recordsPresentation.ts');
const { clearRehabLocalData } = await loadModule('src/services/localStorageService.ts');
const today = new Date();
const date = storage.localDate ? storage.localDate(today) : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
for (const id of equipmentIds) {
  assert.ok(en.manualWorkout.equipmentChoices[id] && zhTW.manualWorkout.equipmentChoices[id], `${id} equipment is localized`);
}
const sheets = [...new Set([...artSource.matchAll(/\/exercise-visuals\/(manual-workout-reference-[\w-]+\.png)/g)].map(match => match[1]))];
assert.equal(sheets.length, 4, 'all exercise art sheets are checked');
for (const sheet of sheets) {
  const png = readFileSync(`public/exercise-visuals/${sheet}`);
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${sheet} is PNG`);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [793, 1981], `${sheet} keeps the shared crop geometry`);
}
const workout = { id: 'manual-1', date, createdAt: today.toISOString(), cyclingMinutes: 15, exercises: [
  { name: 'Barbell squat', equipment: 'barbell', exerciseId: 'squat', equipmentId: 'barbell', sets: [{ weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }] },
  { name: 'Shoulder press', equipment: 'dumbbells', sets: [{ weightKg: 20, reps: 10 }] },
] };

assert.equal(storage.saveManualWorkout(workout), 'ok');
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'one workout holds multiple exercises');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].sets[2].weightKg, 72);
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].exerciseId, 'squat', 'stable exercise id survives readback');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].equipmentId, 'barbell', 'stable equipment id survives readback');
assert.equal(storage.validManualWorkout({ ...workout, exercises: [{ ...workout.exercises[0], exerciseId: undefined, equipmentId: undefined }] }), true, 'legacy records without ids remain readable');
assert.equal(storage.validManualWorkout({ ...workout, exercises: [{ ...workout.exercises[0], exerciseId: { invalid: true } }] }), false, 'invalid id does not enter storage');
assert.equal(storage.readManualWorkouts().workouts[0].cyclingMinutes, 15, 'same workout can record cycling minutes without another activity');
const detailed = { ...workout, id: 'manual-detailed', cyclingMinutes: undefined, exercises: [
  { name: 'Squat', equipment: 'barbell', kind: 'strength', bodyArea: 'hip', painBefore: 0, painAfter: 2, effort: 8, sets: [{ weightKg: 40, reps: 6, warmup: true }, { weightKg: 72, reps: 5, warmup: false }] },
  { name: 'YWT', equipment: '', kind: 'mobility', bodyArea: 'shoulder', painBefore: 0, painAfter: 0, effort: 3, sets: [{ reps: 16 }] },
] };
assert.equal(storage.saveManualWorkout(detailed), 'ok');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].sets[0].warmup, true, 'warm-up and work sets survive readback');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[1].painAfter, 0, 'explicit zero pain survives readback');
const gymEquipment = { ...workout, id: 'gym-equipment', cyclingMinutes: undefined, exercises: [
  { name: zhTW.manualWorkout.quickExercises.legExtension, equipment: zhTW.manualWorkout.equipmentChoices.machine, sets: [{ weightKg: 41, reps: 10 }] },
  { name: zhTW.manualWorkout.quickExercises.latPulldown, equipment: zhTW.manualWorkout.equipmentChoices.cable, sets: [{ weightKg: 40, reps: 10 }] },
  { name: zhTW.manualWorkout.quickExercises.benchPress, equipment: zhTW.manualWorkout.equipmentChoices.smith_machine, sets: [{ weightKg: 66, reps: 10 }] },
] };
assert.equal(storage.saveManualWorkout(gymEquipment), 'ok');
assert.deepEqual(storage.readManualWorkouts().workouts[0].exercises, gymEquipment.exercises, 'new movement and equipment survive readback');
assert.equal(buildRecordsPresentation([], [], [], today, [gymEquipment]).days[0].items.length, 1, 'one saved gym workout stays one Records item');
assert.equal(manualWorkoutPainNotice(6, 0), 'stop', 'pain before 6 still shows stop warning');
assert.equal(manualWorkoutPainNotice(0, 6), 'stop', 'pain after 6 shows stop warning');
assert.equal(manualWorkoutPainNotice(0, 3), 'warning', 'pain increase above 2 shows warning');
assert.equal(manualWorkoutPainNotice(0, 2), null, 'low pain without significant increase shows no warning');
assert.equal(storage.saveManualWorkout({ ...detailed, id: 'partial-pain', exercises: [{ ...detailed.exercises[0], painAfter: undefined }] }), 'invalid', 'partial pain pair is not silently recorded');
assert.equal(storage.saveManualWorkout(workout), 'invalid', 'same id cannot create a duplicate');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).recentActivities.length, 1, 'Records shows one workout');
const rides = [1, 2].map(number => ({ id: `ride-${number}`, kind: 'cycling', date, completed: true, actualMinutes: 15, symptomResponse: 'same' }));
const day = buildRecordsPresentation([], rides, [], today, [detailed]);
assert.equal(day.days.length, 1, 'workout and rides share one day heading');
assert.equal(day.days[0].items.length, 3, 'two rides stay separate from one workout');
assert.equal(buildRecordsPresentation([], [], [], today, [workout]).weeklyActivityCount, 1, 'weekly summary counts one workout');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'future', date: '2999-01-01' }), 'invalid');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-set', exercises: [{ ...workout.exercises[0], sets: [{ weightKg: 72, reps: 0 }] }] }), 'invalid');
assert.equal(storage.saveManualWorkout({ ...workout, id: 'bad-cycling', cyclingMinutes: 0 }), 'invalid');
assert.equal(storage.readManualWorkouts().workouts.length, 3, 'invalid saves preserve existing data');
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
console.log('Manual workout regression passed: quick-picker art and locales, gym equipment readback, sets, dedupe, dates, corrupt/write-failed storage, Records count, and cleanup.');
