import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'vite';

async function loadModule(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: {
    lib: { entry, formats: ['es'] }, minify: false,
    rollupOptions: { output: { inlineDynamicImports: true } }, write: false,
  } });
  const output = Array.isArray(result) ? result[0].output : result.output;
  return import(`data:text/javascript;base64,${Buffer.from(output.find(item => item.type === 'chunk').code).toString('base64')}`);
}

const { recordedBodyArea, matchingManualExercises, recordMatchesBodyArea, filterRecordsDays } = await loadModule('src/utils/recordsBodyArea.ts');
const { buildRecordsPresentation } = await loadModule('src/utils/recordsPresentation.ts');
assert.equal(recordedBodyArea({ bodyArea: 'knee', exerciseId: 'shoulder-flexion' }), 'knee', 'snapshot wins over current catalog');
assert.equal(recordedBodyArea({ exerciseId: 'shoulder-flexion' }), 'shoulder', 'legacy canonical ID resolves a missing snapshot');
assert.equal(recordedBodyArea({ bodyArea: null, exerciseId: 'shoulder-flexion' }), 'shoulder');
assert.equal(recordedBodyArea({ bodyArea: 'invalid', exerciseId: 'shoulder-flexion' }), undefined, 'invalid explicit snapshot cannot be replaced');
for (const record of [{}, { exerciseId: 'missing' }, { exerciseId: 'custom-knee', name: 'Knee exercise' }, { name: 'shoulder-flexion' }]) {
  assert.equal(recordedBodyArea(record), undefined, 'unknown IDs and names never guess a region');
}
const log = { id: 'linked', date: '2026-09-19T10:00:00', completedAt: '2026-09-19T10:00:00', bodyArea: 'hip', exerciseId: 'shoulder-flexion' };
const manual = { id: 'manual', source: 'manual', date: '2026-09-18T12:00:00', workout: {
  id: 'manual', date: '2026-09-18', createdAt: '2026-09-18T12:00:00', exercises: [
    { name: 'Historical hip name', bodyArea: 'hip', exerciseId: 'shoulder-flexion', equipment: '', sets: [{ reps: 5 }] },
    { name: 'Historical shoulder name', exerciseId: 'shoulder-flexion', equipment: '', sets: [{ reps: 8 }] },
    { name: 'Knee name alone', equipment: '', sets: [{ reps: 2 }] },
  ],
} };
assert.deepEqual(matchingManualExercises(manual, 'hip').map(exercise => exercise.name), ['Historical hip name']);
assert.equal(recordMatchesBodyArea(manual, 'shoulder', []), true);
assert.equal(recordMatchesBodyArea(manual, 'knee', []), false);
const resistance = { id: 'resistance', source: 'activity', date: '2026-09-19T12:00:00', activity: {
  id: 'resistance', date: '2026-09-19', kind: 'resistance', primaryFocus: 'lower', exerciseLogIds: ['stale', 'linked'],
} };
assert.equal(recordMatchesBodyArea(resistance, 'hip', [log]), true);
assert.equal(recordMatchesBodyArea(resistance, 'knee', [log]), false, 'focus does not infer region');
assert.equal(recordMatchesBodyArea(resistance, 'hip', []), false, 'stale links cannot match');
const cycling = { ...resistance, id: 'cycling', activity: { id: 'cycling', date: '2026-09-19', kind: 'cycling' } };
assert.equal(recordMatchesBodyArea(cycling, 'hip', [log]), false);
const training = { id: 'training', source: 'training', date: log.date, log };
assert.equal(recordMatchesBodyArea(training, 'hip', []), true);

const unknown = { ...training, id: 'unknown', log: { ...log, bodyArea: undefined, exerciseId: 'missing' } };
const days = Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-${20 - index}`, items: [index < 5 ? cycling : manual] }));
const snapshot = JSON.stringify({ days, log, manual, resistance });
assert.equal(filterRecordsDays(days, 'all', [log]), days, 'All retains cycling and unknown records');
assert.equal(filterRecordsDays([{ date: '2026-09-19', items: [unknown, cycling] }], 'all', [log])[0].items.length, 2);
const filtered = filterRecordsDays(days, 'hip', [log]).slice(0, 5);
assert.equal(filtered.length, 2, 'filter before limiting to five days finds older matching dates');
assert.equal(filtered[0].items[0], manual, 'mixed workout remains whole, with original snapshots');
assert.equal(filtered[0].items[0].workout.exercises.length, 3);
assert.equal(filterRecordsDays(days, 'ankle', [log]).length, 0);
assert.equal(JSON.stringify({ days, log, manual, resistance }), snapshot, 'no stored input mutations');
const presentation = buildRecordsPresentation([log], [resistance.activity, cycling.activity], [], new Date('2026-09-20T23:00:00'), [manual.workout]);
const presentationSnapshot = JSON.stringify(presentation);
filterRecordsDays(presentation.days, 'hip', [log]);
assert.equal(JSON.stringify(presentation), presentationSnapshot, 'weekly counts and recovery presentation remain unchanged');
const page = readFileSync('src/pages/LogsPage.tsx', 'utf8');
assert.match(page, /filterRecordsDiscoveryDays\(presentation.days, bodyArea, purpose, logs\)/);
assert.match(page, /recentDays = filteredDays\.slice\(0, 5\)/);
assert.match(page, /useState<BodyArea \| 'all'>\('all'\)/);
assert.match(page, /presentation.weeklyActivityCount/);
assert.match(page, /<ProgressSummary summary=\{summary\}/);
assert.match(page, /<TrainingLog logs=\{\[item.log\]\}/);
assert.match(page, /matchingRecordsDiscoveryEntries\(item, bodyArea, purpose, logs\)/);
console.log('Records body-area regression passed: snapshots, missing IDs, mixed workouts, linked logs, cycling/unknown, older dates and immutable statistics.');
