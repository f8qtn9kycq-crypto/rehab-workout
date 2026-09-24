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

const { buildRecordsPresentation } = await loadModule('src/utils/recordsPresentation.ts');
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
assert.deepEqual(buildRecordsPresentation([], [], [], today), { recentActivities: [], weeklyActivityCount: 0, hasActivityHistory: false, validOutcomes: [] }, 'truly empty state remains empty');
assert.equal(buildRecordsPresentation([{ ...log, id: 'bad', date: 'bad' }, { ...log, id: 'future', date: '2999-01-01T00:00:00Z' }], [{ ...resistance, id: 'bad-date', date: '2026-02-30' }, { ...cycling, id: 'future-activity', date: '2999-01-01' }], [{ ...outcome, date: 'bad' }, { ...outcome, id: 'future-outcome', date: '2999-01-01T00:00:00Z' }], today).recentActivities.length, 0, 'invalid and future activity dates are excluded');

console.log('Records presentation regression passed: activity-only, guided-only, both, assessment-only, empty, date boundaries, and linked dedupe.');
