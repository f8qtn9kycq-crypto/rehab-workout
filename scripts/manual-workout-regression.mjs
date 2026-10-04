import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { build } from 'vite';
import en from '../src/locales/en.js';
import zhTW from '../src/locales/zh-TW.js';

const pickerSource = readFileSync('src/pages/ManualWorkoutPage.tsx', 'utf8');
const optionsSource = readFileSync('src/data/manualWorkoutOptions.ts', 'utf8');
const libraryArtSource = readFileSync('src/components/LibraryMovementArt.tsx', 'utf8');
const sharedArtSource = readFileSync('src/components/WorkoutMovementArt.tsx', 'utf8');
const registrySource = readFileSync('src/data/movementArtRegistry.ts', 'utf8');
const artManifest = JSON.parse(readFileSync('src/data/movementArtManifest.json', 'utf8'));
const manualCardSource = readFileSync('src/components/ManualWorkoutCard.tsx', 'utf8');
const exerciseCardSource = readFileSync('src/components/ExerciseCard.tsx', 'utf8');
const extractorSource = readFileSync('scripts/extract-movement-art.mjs', 'utf8');
const cropToolSource = readFileSync('scripts/crop-movement-art.swift', 'utf8');
assert.match(pickerSource, /<WorkoutMovementArt id=\{id\} loading="eager"/, 'quick canonical choices use approved reference art');
assert.match(pickerSource, /hasWorkoutMovementArt\(selectedIds\[index\]\).*<WorkoutMovementArt id=\{selectedIds\[index\]\}/s, 'selected quick or library exercise keeps the same art in the form');
assert.doesNotMatch(pickerSource, /<QuickMovementIcon id=\{id\}/, 'quick choices do not render stick figures');
assert.match(pickerSource, /<LibraryMovementArt id=\{item\.id\}/, 'library choices use exercise-specific movement art');
assert.doesNotMatch(pickerSource, /moreExerciseCatalog\.map[\s\S]*?<BodyAreaIcon/, 'library choices do not fall back to generic body-area glyphs');
assert.match(libraryArtSource, /<WorkoutMovementArt id=\{id\}/, 'library choices use the shared movement-art component');
assert.match(pickerSource, /moreExerciseCatalog\.map\(item => <button[\s\S]*?min-h-44[\s\S]*?p-2 text-center text-base font-bold/, 'library choices use the same enlarged card geometry as quick choices');
assert.match(pickerSource, /<details className="mt-3 rounded-lg border border-slate-200 py-3"><summary className="focus-ring cursor-pointer px-3/, 'library art avoids duplicate horizontal padding so it matches quick-art width');
assert.equal((pickerSource.match(/grid grid-cols-1 gap-3/g) ?? []).length, 2, 'quick and library choices use one enlarged movement per row');
const quickChoiceList = optionsSource.match(/quickExerciseIds = \[([\s\S]*?)\] as const/);
assert.ok(quickChoiceList, 'quick choice list exists');
const quickIds = [...quickChoiceList[1].matchAll(/'([^']+)'/g)].map(([, id]) => id);
assert.equal(quickIds.length, 8, 'all eight approved choices remain available');
assert.ok(quickIds.includes('catalog-leg-extension'), 'canonical leg extension is a quick movement');
assert.match(optionsSource, /id: 'push'.*'catalog-bench-press'.*'catalog-shoulder-press'.*'catalog-dip'/s, 'push group contains the three pushing movements');
assert.match(optionsSource, /id: 'pull'.*'catalog-pull-up'.*'catalog-lat-pulldown'.*'catalog-seated-row'/s, 'pull group contains the three pulling movements');
assert.match(optionsSource, /id: 'leg'.*'catalog-squat'.*'catalog-leg-extension'/s, 'leg group contains the two lower-body movements');
assert.match(pickerSource, /quickExerciseGroups\.map\(group => <section/, 'quick strength choices render in semantic groups');
assert.ok(en.manualWorkout.strengthGroups.push && en.manualWorkout.strengthGroups.pull && en.manualWorkout.strengthGroups.leg, 'English strength group labels resolve');
assert.ok(zhTW.manualWorkout.strengthGroups.push && zhTW.manualWorkout.strengthGroups.pull && zhTW.manualWorkout.strengthGroups.leg, 'Traditional Chinese strength group labels resolve');
assert.match(optionsSource, /new Set\(quickExerciseIds\)/, 'quick exercise catalog exclusions reuse the canonical id list');
assert.match(pickerSource, /const moreExerciseCatalog = catalog\.filter\(exercise => !quickExerciseCatalogIds\.has\(exercise\.id\)\)/, 'more exercises exclude quick-choice equivalents');
assert.match(pickerSource, /moreExerciseCatalog\.map\(item =>/, 'more exercises render the filtered catalog');
const libraryArtIds = artManifest.filter(entry => entry.group === 'library').map(entry => entry.id);
const quickArtIds = artManifest.filter(entry => entry.group === 'quick').map(entry => entry.id);
const additionalCatalogIds = quickIds;
assert.equal(libraryArtIds.length, 35, 'all 35 additional library choices have movement art');
assert.equal(new Set(libraryArtIds).size, libraryArtIds.length, 'library movement-art ids are unique');
assert.ok(additionalCatalogIds.every(id => !libraryArtIds.includes(id)), 'excluded quick-equivalent catalog ids are not assigned duplicate library art');
assert.deepEqual(artManifest.map(entry => entry.aliases?.[0]).filter(Boolean).slice(0, 8), quickIds, 'quick art aliases and canonical choices stay in the same approved order');
const allArtIds = artManifest.flatMap(entry => [entry.id, ...(entry.aliases ?? [])]);
assert.equal(new Set(allArtIds).size, allArtIds.length, 'canonical ids and aliases are globally unique');
assert.deepEqual(artManifest.find(entry => entry.id === 'pullUp').aliases, ['catalog-pull-up'], 'exact pull-up catalog equivalent reuses the approved art');
assert.deepEqual(artManifest.find(entry => entry.id === 'dip').aliases, ['catalog-dip'], 'exact dip catalog equivalent reuses the approved art');
assert.ok(quickIds.every(id => allArtIds.includes(id)), 'every quick canonical exercise resolves to existing movement art');
assert.match(sharedArtSource, /getMovementArt\(id\)/, 'shared movement art resolves one canonical registry');
assert.match(sharedArtSource, /loading=\{loading\}/, 'shared movement art supports native lazy loading');
assert.match(sharedArtSource, /decoding="async"/, 'shared movement art decodes asynchronously');
assert.match(sharedArtSource, /aspect-\[40\/23\]/, 'runtime frame uses the same 320:184 aspect ratio as generated assets');
assert.match(sharedArtSource, /object-contain/, 'individual art keeps its source aspect without pose distortion');
assert.doesNotMatch(sharedArtSource, /manual-workout-(?:quick|library)-line-art-v2/, 'runtime component does not reference a full sprite');
assert.match(registrySource, /Duplicate movement-art id or alias/, 'registry rejects conflicting canonical ids and aliases');
assert.match(manualCardSource, /hasWorkoutMovementArt\(exercise\.exerciseId\).*<WorkoutMovementArt id=\{exercise\.exerciseId\}/s, 'saved manual workout records reuse stable-id movement art');
assert.match(exerciseCardSource, /hasWorkoutMovementArt\(exercise\.id\).*<WorkoutMovementArt id=\{exercise\.id\}/s, 'exercise-library cards reuse stable-id movement art');
assert.doesNotMatch(pickerSource, /selectedIds\[index\] === 'custom'/, 'picker cannot create new name-only exercises');
assert.doesNotMatch(pickerSource, /manualWorkout\.quickExercises/, 'picker names come from canonical exercise localization');
const equipmentIds = [...pickerSource.match(/const equipmentChoices = \[([\s\S]*?)\];/)?.[1].matchAll(/id: '([^']+)'/g) ?? []].map(match => match[1]);
assert.ok(equipmentIds.includes('cable') && equipmentIds.includes('smith_machine'), 'gym equipment choices are available');
const quickSprite = readFileSync('scripts/assets/movement-art-sources/manual-workout-quick-line-art-v2.png');
assert.equal(quickSprite.toString('hex', 0, 8), '89504e470d0a1a0a', 'quick movement sprite is PNG');
assert.deepEqual([quickSprite.readUInt32BE(16), quickSprite.readUInt32BE(20)], [1774, 887], 'quick movement sprite keeps the reviewed 4x2 geometry');
const librarySprite = readFileSync('scripts/assets/movement-art-sources/manual-workout-library-line-art-v2.png');
assert.equal(librarySprite.toString('hex', 0, 8), '89504e470d0a1a0a', 'library movement sprite is PNG');
assert.deepEqual([librarySprite.readUInt32BE(16), librarySprite.readUInt32BE(20)], [1060, 1484], 'library movement sprite keeps square 5x7 cells for consistent proportions');
assert.match(extractorSource, /libraryGridGuides/, 'library cells use reviewed guide coordinates instead of approximate equal slicing');
assert.match(extractorSource, /fullBodyHeadRatio: '1:7'/, 'full-body movement art keeps the reviewed adult 1:7 anatomy contract');
assert.match(extractorSource, /neckCrop: 'crown-to-waist'/, 'neck-focused movement art uses the shared upper-torso crop instead of a close-up');
assert.match(extractorSource, /'296', '160', '320', '184'/, 'every movement uses the shared wide canvas that matches the runtime frame');
assert.match(extractorSource, /'glute-bridge'.*overrides\/glute-bridge\.png/, 'the approved complete-arm glute bridge remains an explicit source override');
assert.match(extractorSource, /'glute-bridge'.*width: 1293, height: 650/, 'the glute bridge source is tightly framed so its rendered scale matches the shared movement art');
assert.match(extractorSource, /'neck-rotation-stretch'.*overrides\/neck-rotation-stretch\.png/, 'neck rotation keeps the reviewed crown-to-waist scale instead of a close-up');
assert.match(cropToolSource, /NSColor\.white\.setFill\(\)/, 'the crop tool removes outer-edge artifacts with a white canvas');
assert.match(cropToolSource, /func horizontalInkCenter/, 'movement-art generation measures each phase instead of applying a fixed offset');
assert.match(cropToolSource, /Double\(canvasWidth\) \/ 4 - horizontalInkCenter\(leftCrop\)/, 'the left phase center aligns with the left-half centerline');
assert.match(cropToolSource, /Double\(canvasWidth\) \* 3 \/ 4 - horizontalInkCenter\(rightCrop\)/, 'the right phase center aligns with the right-half centerline');
for (const entry of artManifest) {
  const image = readFileSync(`public/exercise-visuals/movements/${entry.id}.png`);
  assert.equal(image.toString('hex', 0, 8), '89504e470d0a1a0a', `${entry.id} individual movement art is PNG`);
  assert.equal(image.readUInt32BE(16), 320, `${entry.id} uses the shared 320px canvas width`);
  assert.equal(image.readUInt32BE(20), 184, `${entry.id} uses the shared 184px canvas height`);
  assert.ok(statSync(`public/exercise-visuals/movements/${entry.id}.png`).size < statSync(`scripts/assets/movement-art-sources/${entry.sheet}`).size, `${entry.id} is smaller than its full source sprite`);
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
const workout = { id: 'manual-1', date, createdAt: today.toISOString(), cyclingMinutes: 15, exercises: [
  { name: 'Barbell squat', equipment: 'barbell', exerciseId: 'catalog-squat', equipmentId: 'barbell', sets: [{ weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }, { weightKg: 72, reps: 5 }] },
  { name: 'Shoulder press', equipment: 'dumbbells', sets: [{ weightKg: 20, reps: 10 }] },
] };

assert.equal(storage.saveManualWorkout(workout), 'ok');
assert.equal(storage.readManualWorkouts().workouts.length, 1, 'one workout holds multiple exercises');
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].sets[2].weightKg, 72);
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].exerciseId, 'catalog-squat', 'stable exercise id survives readback');
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
