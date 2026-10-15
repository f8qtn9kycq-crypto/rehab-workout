import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { build } from 'vite';
import { execFileSync } from 'node:child_process';
import { auditMovementArt } from './audit-movement-art.mjs';
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
assert.match(pickerSource, /moreExerciseCatalog\.map\(item => <div[^>]*><button[\s\S]*?min-h-44[\s\S]*?p-2 text-center text-base font-bold/, 'library choices use the same enlarged card geometry as quick choices');
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
const retainedCatalogArtIds = ['catalog-bench-press', 'catalog-shoulder-press', 'catalog-squat', 'catalog-lat-pulldown', 'catalog-seated-row', 'catalog-leg-extension'];
const allArtIds = artManifest.flatMap(entry => [entry.id, ...(entry.aliases ?? [])]);
assert.equal(new Set(allArtIds).size, allArtIds.length, 'canonical ids and aliases are globally unique');
assert.deepEqual(artManifest.find(entry => entry.id === 'pullUp').aliases, ['catalog-pull-up'], 'exact pull-up catalog equivalent reuses the approved art');
assert.deepEqual(artManifest.find(entry => entry.id === 'dip').aliases, ['catalog-dip'], 'exact dip catalog equivalent reuses the approved art');
assert.ok(quickIds.every(id => allArtIds.includes(id)), 'all eight quick choices retain their requested original illustrations');
assert.ok(quickArtIds.every(id => allArtIds.includes(id)), 'legacy strength asset IDs remain readable without canonical mis-aliasing');
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
const effectiveSources = JSON.parse(execFileSync(process.execPath, ['scripts/extract-movement-art.mjs', '--list-sources'], { encoding: 'utf8' }));
for (const entry of artManifest.filter(entry => entry.overrideSource)) {
  const actual = effectiveSources.find(source => source.id === entry.id);
  assert.equal(actual?.path, `scripts/assets/movement-art-sources/${entry.overrideSource}`, `${entry.id} uses its active manifest source`);
  assert.equal(actual?.backend, 'python');
}
const frozenStyle = JSON.parse(readFileSync('docs/visual-qa/approved-style-baseline.json'));
auditMovementArt(artManifest, frozenStyle);
assert.throws(() => auditMovementArt(artManifest.map(entry => entry.id === 'benchPress' ? { ...entry, aliases: [] } : entry), frozenStyle), /missing its original image mapping/, 'removing an image alias must fail QA');
assert.throws(() => auditMovementArt(artManifest, frozenStyle, path => path === frozenStyle.assets[0].path ? Buffer.from('changed image') : readFileSync(path)), /differs from the frozen/, 'changing an approved reference must fail QA');
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

const { exercises: canonicalExercises } = await loadModule('src/data/exercises.ts');
const { isCompatibleWithEquipment } = await loadModule('src/utils/exerciseModel.ts');
const { getRecommendedExercises } = await loadModule('src/utils/recommendationEngine.ts');
const shoulderPressExercise = canonicalExercises.find(exercise => exercise.id === 'catalog-shoulder-press');
assert.equal(isCompatibleWithEquipment(shoulderPressExercise, ['barbell']), true, 'barbell satisfies the revised press requirement');
assert.equal(isCompatibleWithEquipment(shoulderPressExercise, ['dumbbell', 'chair']), false, 'dumbbell equipment cannot satisfy a barbell press');
for (const pain of [0, 3, 4, 6]) {
  const result = getRecommendedExercises([shoulderPressExercise], {
    bodyArea: 'shoulder', type: 'all', level: 'all', duration: 'all',
    equipment: ['barbell'], noEquipmentOnly: false, painSensitive: false,
  }, { assessment: { pain }, assessmentEquipment: ['barbell'], logs: [] });
  assert.deepEqual(result, [], 'the revised catalog press cannot enter conservative or fallback recommendations');
}
const shoulderReference = frozenStyle.assets.find(asset => asset.id === 'shoulderPress');
assert.throws(() => auditMovementArt(artManifest, frozenStyle, path => path === shoulderReference.path ? Buffer.from('changed archive') : readFileSync(path)), /differs from the frozen/, 'the authorized runtime correction cannot weaken the archived shoulder reference hash');

const values = new Map();
const { getMovementArt } = await loadModule('src/data/movementArtRegistry.ts');
for (const id of retainedCatalogArtIds) {
  const legacy = artManifest.find(entry => entry.aliases?.includes(id));
  assert.ok(legacy, `${id} retains its original illustration mapping`);
  assert.equal(getMovementArt(id)?.src, `/exercise-visuals/movements/${legacy.id}.png`);
}
for (const id of quickArtIds) {
  assert.equal(getMovementArt(id)?.src, `/exercise-visuals/movements/${id}.png`, `${id} legacy art remains stable`);
}
assert.equal(getMovementArt('catalog-pull-up')?.src, getMovementArt('pullUp')?.src);
assert.equal(getMovementArt('catalog-dip')?.src, getMovementArt('dip')?.src);
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

const dose = {...workout,id:'duration-only',cyclingMinutes:undefined,exercises:[{name:'Ankle mobility',exerciseId:'ankle-circles',equipment:'',sets:[{durationSeconds:60}]}]};
assert.equal(storage.saveManualWorkout(dose),'ok','duration-only dose saves without fake reps');
assert.deepEqual(storage.readManualWorkouts().workouts[0].exercises[0].sets,[{durationSeconds:60}]);
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].painBefore,undefined,'unknown pain stays unknown');
assert.equal(storage.saveManualWorkout({...dose,id:'hold-only',exercises:[{...dose.exercises[0],sets:[{holdSeconds:30}]}]}),'ok');
assert.equal(storage.saveManualWorkout({...dose,id:'combined',exercises:[{...dose.exercises[0],sets:[{reps:3,holdSeconds:30,durationSeconds:90}]}]}),'ok','optional combined dose remains readable');
for(const invalid of [{},{durationSeconds:0},{holdSeconds:-1},{durationSeconds:1.5},{holdSeconds:86401},{durationSeconds:null},{reps:0,holdSeconds:30},{durationSeconds:'30'}]) {
 const before=values.get(storage.MANUAL_WORKOUT_KEY);
 assert.equal(storage.saveManualWorkout({...dose,id:'invalid-dose',exercises:[{...dose.exercises[0],sets:[invalid]}]}),'invalid',JSON.stringify(invalid));
 assert.equal(values.get(storage.MANUAL_WORKOUT_KEY),before,'invalid dose cannot overwrite records');
}
assert.equal(storage.saveManualWorkout(dose),'invalid','duration duplicate ID blocked');
const rawDose=values.get(storage.MANUAL_WORKOUT_KEY);
window.localStorage.setItem=()=>{throw Error('quota')};
assert.equal(storage.saveManualWorkout({...dose,id:'dose-write-failure'}),'write-failed');
assert.equal(values.get(storage.MANUAL_WORKOUT_KEY),rawDose);
window.localStorage.setItem=originalSetItem;
for(const locale of [en,zhTW]) for(const key of ['doseMode','durationSeconds','holdSeconds','repsValue','durationValue','holdValue']) assert.equal(typeof locale.manualWorkout[key],'string',key);
console.log('Actual dose regression passed: duration/hold/combined, bounds, no fake reps/pain, duplicate and write-failure preservation.');

const custom = await loadModule('src/services/customExerciseStorage.ts');
const { getExerciseById } = await loadModule('src/utils/exerciseModel.ts');
const personal={id:'custom-test',name:'Personal movement',kind:'mobility',equipmentId:'chair',recordOnly:true};
assert.equal(custom.saveCustomExercise(personal),'ok');
assert.deepEqual(custom.readCustomExercises().exercises,[personal]);
assert.equal(custom.saveCustomExercise({...personal,id:'custom-second',name:'  PERSONAL MOVEMENT  '}),'duplicate');
assert.equal(custom.saveCustomExercise({...personal,name:'Other'}),'duplicate','stable IDs cannot be reused');
for(const invalid of [{...personal,id:'official-id'},{...personal,recordOnly:false},{...personal,name:' '},{...personal,kind:'cycling'},{...personal,equipmentId:'unknown'}]) assert.equal(custom.saveCustomExercise(invalid),'invalid');
assert.equal(custom.validCustomExercise({...personal,name:'x'.repeat(101)}),false);
const personalRecord={...dose,id:'custom-history',exercises:[{...dose.exercises[0],name:personal.name,exerciseId:personal.id,kind:personal.kind,recordOnly:true}]};
assert.equal(storage.saveManualWorkout(personalRecord),'ok');
assert.equal(storage.saveManualWorkout({...personalRecord,id:'without-marker',exercises:[{...personalRecord.exercises[0],recordOnly:undefined}]}),'invalid','new custom saves require record-only marker');
values.delete(custom.CUSTOM_EXERCISE_KEY);
assert.equal(storage.readManualWorkouts().workouts[0].exercises[0].name,personal.name,'history survives missing definition');
assert.equal(getExerciseById(personal.id),undefined,'guided resolver cannot resolve private exercises');
assert.ok(!canonicalExercises.some(exercise=>exercise.id===personal.id),'private definition never enters canonical catalog');
assert.ok(!readFileSync('src/utils/recommendationEngine.ts','utf8').includes('customExerciseStorage'),'recommendation does not consume private definitions');
assert.ok(!readFileSync('src/components/WeeklyRoutineBuilder.tsx','utf8').includes('customExerciseStorage'),'routine does not consume private definitions');
for(const pain of [0,3,4,6]) {
 const recommended=getRecommendedExercises(canonicalExercises,{bodyArea:'all',type:'all',level:'all',duration:'all',equipment:['bodyweight','chair','wall','dumbbell'],noEquipmentOnly:false,painSensitive:false},{assessment:{pain},assessmentEquipment:['bodyweight','chair','wall','dumbbell'],logs:[]});
 assert.ok(recommended.every(exercise=>!exercise.catalogOnly&&!exercise.id.startsWith('custom-')),'no private/catalog-only recommendation leakage');
}
const customRaw=JSON.stringify([personal]);values.set(custom.CUSTOM_EXERCISE_KEY,customRaw);
window.localStorage.setItem=()=>{throw Error('quota')};
assert.equal(custom.saveCustomExercise({...personal,id:'custom-new',name:'New'}),'write-failed');
assert.equal(values.get(custom.CUSTOM_EXERCISE_KEY),customRaw);window.localStorage.setItem=originalSetItem;
for(const raw of ['{bad',JSON.stringify([personal,personal]),JSON.stringify([{...personal,recordOnly:false}])]) {
 values.set(custom.CUSTOM_EXERCISE_KEY,raw);assert.equal(custom.readCustomExercises().error,true);assert.equal(custom.saveCustomExercise({...personal,id:'custom-new'}),'corrupt');assert.equal(values.get(custom.CUSTOM_EXERCISE_KEY),raw);
}
values.set(custom.CUSTOM_EXERCISE_KEY,customRaw);
assert.ok(clearRehabLocalData().clearedKeys.includes(custom.CUSTOM_EXERCISE_KEY));
assert.equal(values.has(custom.CUSTOM_EXERCISE_KEY),false);
for(const locale of [en,zhTW]) for(const key of ['customTitle','addCustom','customName','saveCustom','customDuplicate','customStorageError','recordOnly']) assert.equal(typeof locale.manualWorkout[key],'string',key);
console.log('Record-only custom regression passed: IDs, normalized duplicates, limits, corrupt/quota preservation, history snapshots, guided/routine/recommendation isolation and cleanup.');
console.log('Manual workout regression passed: quick-picker art and locales, gym equipment readback, sets, dedupe, dates, corrupt/write-failed storage, Records count, and cleanup.');
