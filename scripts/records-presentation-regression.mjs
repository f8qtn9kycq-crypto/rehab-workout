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

const { buildRecordsPresentation, recordCategories } = await loadModule('src/utils/recordsPresentation.ts');
const today = new Date('2026-09-20T23:00:00');
const log = {
  id: 'log-1', date: '2026-09-19T10:00:00Z', completedAt: '2026-09-19T10:00:00Z',
  exerciseId: 'hip-sit-to-stand', exerciseTitle: 'Sit to stand', title: 'Sit to stand',
  bodyArea: 'hip', type: 'strength', level: 'beginner', plannedSets: 2, plannedReps: 8,
  setsCompleted: 2, repsCompleted: 8, painBefore: 1, painAfter: 1, difficultyRating: 4,
  stoppedEarly: false, recoveryMode: false, completionStatus: 'completed', notes: '', stopReason: '', painDelta: 0,
};
const resistance = { id: 'activity-1', kind: 'resistance', date: '2026-09-19', completed: true, actualMinutes: 20, symptomResponse: 'same', primaryFocus: 'lower', exerciseLogIds: [] };
const cycling = { id: 'ride-1', kind: 'cycling', date: '2026-09-18', completed: true, actualMinutes: 15, symptomResponse: 'same' };
const outcome = { id: 'outcome-1', date: '2026-09-19T08:00:00Z', bodyArea: 'hip', questionId: 'hip', score: 7, note: '' };

assert.deepEqual(buildRecordsPresentation([], [resistance], [], today).recentActivities.map(item => item.source), ['activity'], 'legacy activity-only history is visible');
assert.deepEqual(buildRecordsPresentation([log], [], [], today).recentActivities.map(item => item.source), ['training'], 'guided session-only history is visible');
assert.equal(buildRecordsPresentation([log], [resistance, cycling], [], today).recentActivities.length, 3, 'independent training and activities are unified');
assert.deepEqual(buildRecordsPresentation([log], [{ ...resistance, exerciseLogIds: [log.id], segments: [{ phase: 'main', exerciseLogIds: [log.id] }] }], [], today).recentActivities.map(item => item.id), [`activity:${resistance.id}`], 'linked resistance aggregate represents the session once');
const secondLog = { ...log, id: 'log-2', date: '2026-09-19T10:05:00Z', completedAt: '2026-09-19T10:05:00Z' };
const linkedSession = { ...resistance, exerciseLogIds: [log.id, secondLog.id], segments: [{ phase: 'main', exerciseLogIds: [log.id, secondLog.id] }] };
const linkedResult = buildRecordsPresentation([log, secondLog], [linkedSession], [], today);
assert.deepEqual(linkedResult.recentActivities.map(item => item.id), [`activity:${resistance.id}`], 'multiple linked exercise logs do not inflate one resistance session');
assert.equal(linkedResult.weeklyActivityCount, 1, 'one linked resistance session counts once for the week');
assert.equal(buildRecordsPresentation([], [], [outcome], today).recentActivities.length, 0, 'assessment-only state has no fake activity');
assert.equal(buildRecordsPresentation([], [], [outcome], today).validOutcomes.length, 1, 'assessment-only recovery data remains available');
assert.deepEqual(buildRecordsPresentation([], [], [], today), { recentActivities: [], days: [], weeklyActivityCount: 0, weeklyActiveDays: 0, weeklyCategoryDays: {rehab:0,strength:0,cardio:0,unknown:0}, hasActivityHistory: false, validOutcomes: [] }, 'truly empty state remains empty');
assert.equal(buildRecordsPresentation([{ ...log, id: 'bad', date: 'bad' }, { ...log, id: 'future', date: '2999-01-01T00:00:00Z' }], [{ ...resistance, id: 'bad-date', date: '2026-02-30' }, { ...cycling, id: 'future-activity', date: '2999-01-01' }], [{ ...outcome, date: 'bad' }, { ...outcome, id: 'future-outcome', date: '2999-01-01T00:00:00Z' }], today).recentActivities.length, 0, 'invalid and future activity dates are excluded');

for (const hour of ['00:01', '09:00', '23:59']) {
  const morning = new Date(`2026-09-21T${hour}:00`);
  const result = buildRecordsPresentation([], [
    { ...cycling, date: '2026-09-21' },
    { ...cycling, id: 'tomorrow', date: '2026-09-22' },
  ], [], morning);
  assert.equal(result.recentActivities.length, 1, 'today is visible before noon; tomorrow stays excluded');
  assert.equal(result.weeklyActivityCount, 1, 'Monday morning activity counts in the new week');
}
console.log('Records presentation regression passed: activity-only, guided-only, both, assessment-only, empty, date boundaries, and linked dedupe.');

const manual = {id:'manual-1', date:'2026-09-19', createdAt:'2026-09-19T10:00:00Z', exercises:[{name:'Bench',equipment:'',exerciseId:'catalog-bench-press',sets:[{reps:8}]}]};
const mixed = {...manual, id:'mixed', cyclingMinutes:10, exercises:[...manual.exercises,{name:'Mobility',equipment:'',kind:'mobility',sets:[{reps:1}]},{name:'Old name',equipment:'',sets:[{reps:4}]}]};
assert.deepEqual(recordCategories({source:'manual',workout:manual}),['strength']);
assert.deepEqual(recordCategories({source:'manual',workout:mixed}),['rehab','strength','cardio','unknown']);
assert.deepEqual(recordCategories({source:'manual',workout:{...manual,exercises:[{...manual.exercises[0],exerciseId:'missing-id'}]}}),['unknown']);
assert.deepEqual(recordCategories({source:'manual',workout:{...manual,exercises:[{...manual.exercises[0],exerciseId:'ankle-circles'}]}}),['rehab']);
assert.deepEqual(recordCategories({source:'activity',activity:linkedSession},[log,secondLog]),['rehab','strength']);
const snapshot=JSON.stringify([log,linkedSession,cycling,mixed]);
const all=buildRecordsPresentation([log,secondLog],[linkedSession,cycling,{...cycling,id:'ride-2'}],[],today,[mixed]);
assert.equal(all.weeklyActivityCount,4,'two rides stay separate, linked logs dedupe, mixed stays one record');
assert.equal(all.weeklyActiveDays,2,'same-day mixed sources do not invent sessions');
assert.deepEqual(all.weeklyCategoryDays,{rehab:1,strength:1,cardio:2,unknown:1});
assert.equal(JSON.stringify([log,linkedSession,cycling,mixed]),snapshot,'read model cannot mutate storage inputs');
const monday=buildRecordsPresentation([],[],[],new Date('2026-09-21T00:01:00'),[{...mixed,date:'2026-09-20'},{...mixed,id:'today',date:'2026-09-21'},{...mixed,id:'future',date:'2026-09-22'}]);
assert.equal(monday.weeklyActivityCount,1);assert.equal(monday.weeklyActiveDays,1);assert.deepEqual(monday.weeklyCategoryDays,{rehab:1,strength:1,cardio:1,unknown:1});
console.log('Category regression passed: canonical IDs, unknown legacy, mixed categories, record/day distinction, rides, local-week boundaries, future exclusion and immutable inputs.');
