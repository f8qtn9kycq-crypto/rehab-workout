import assert from 'node:assert/strict';
import { build } from 'vite';

class MemoryStorage {
  #values = new Map();
  getItem(key) { return this.#values.has(key) ? this.#values.get(key) : null; }
  setItem(key, value) { this.#values.set(key, String(value)); }
  removeItem(key) { this.#values.delete(key); }
}

const localStorage = new MemoryStorage();
globalThis.window = { localStorage };

async function loadService(entry) {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: { lib: { entry, formats: ['es'] }, minify: false, rollupOptions: { output: { inlineDynamicImports: true } }, write: false },
  });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const code = output.find(item => item.type === 'chunk').code;
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
}

try {
  const { createTrainingLog, createRetrospectiveLog, getLogs, saveLog, updateTrainingLogSets } = await loadService('src/services/logService.ts');
  const { appendCopiedTrainingSet } = await loadService('src/utils/trainingSets.ts');
  const exercise = { id: 'loaded-squat', title: 'Loaded squat', bodyArea: 'hip', type: 'strength', level: 'beginner', sets: 3, reps: 8 };
  const baseInput = { exercise, setsCompleted: 2, repsCompleted: 8, painBefore: 1, painAfter: 1, difficultyRating: 5, stoppedEarly: false, recoveryMode: false, notes: '', stopReason: '' };

  const legacy = createTrainingLog(baseInput);
  saveLog(legacy);
  assert.equal(getLogs()[0].sets, undefined, 'legacy aggregate-only logs remain readable');

  const detailed = createTrainingLog({ ...baseInput, sets: [
    { weightKg: 12.5, reps: 8, completed: true },
    { weightKg: 12.5, reps: 5, completed: false },
  ] });
  saveLog(detailed);
  assert.deepEqual(getLogs()[0].sets, detailed.sets, 'multiple and partial sets survive save and reload');

  const manual = createRetrospectiveLog({ date: '2026-09-19', title: ' Squat ', bodyArea: 'hip', type: 'strength',
    sets: [{ weightKg: 40, reps: 6, completed: true, warmup: true }, { weightKg: 72, reps: 5, completed: true }],
    painBefore: 0, painAfter: 2, difficultyRating: 8, stoppedEarly: false });
  assert.equal(manual?.title, 'Squat', 'manual title is trimmed');
  assert.equal(manual?.painBefore, 0, 'an explicit zero pain score survives');
  assert.equal(manual?.setsCompleted, 2, 'aggregate set count follows completed rows');
  assert.ok(saveLog(manual), 'valid retrospective log saves');
  assert.equal(getLogs()[0].sets[0].warmup, true, 'warm-up status survives reload');
  assert.equal(createRetrospectiveLog({ date: '2999-01-01', title: 'Future', bodyArea: 'hip', type: 'strength', sets: [{ reps: 5, completed: true }], painBefore: 0, painAfter: 0, difficultyRating: 5, stoppedEarly: false }), null, 'future retrospective date is rejected');

  const edited = updateTrainingLogSets(detailed.id, [
    { weightKg: 15, reps: 8, completed: true },
    { reps: 6, completed: false },
    { weightKg: 10, reps: 10, completed: true },
  ]);
  assert.equal(edited?.find(row => row.id === detailed.id)?.sets?.length, 3, 'sets can be added and edited on the existing log');
  assert.deepEqual(getLogs().find(row => row.id === detailed.id)?.sets, edited?.find(row => row.id === detailed.id)?.sets, 'edited set details survive reload');

  const copied = appendCopiedTrainingSet([{ weightKg: 12.5, reps: 8, completed: true }], 10);
  assert.deepEqual(copied[1], { weightKg: 12.5, reps: 8, completed: false }, 'new set copies prior load and reps but starts incomplete');
  const twenty = Array.from({ length: 20 }, () => ({ weightKg: 5, reps: 8, completed: true }));
  assert.equal(appendCopiedTrainingSet(twenty, 8), twenty, '20-set limit is a stable no-op');

  assert.ok(updateTrainingLogSets(detailed.id, []), 'all set details can be removed');
  assert.equal(getLogs().find(row => row.id === detailed.id)?.sets, undefined, 'removing all set details preserves the aggregate log');

  const rawLogs = JSON.parse(localStorage.getItem('rehab.trainingLogs.v2'));
  rawLogs[0].sets = [{ weightKg: -1, reps: 'bad', completed: 'yes' }];
  localStorage.setItem('rehab.trainingLogs.v2', JSON.stringify(rawLogs));
  assert.equal(getLogs()[0].sets, undefined, 'malformed optional set details are ignored without dropping the log');

  const beforeInvalidUpdate = localStorage.getItem('rehab.trainingLogs.v2');
  assert.equal(updateTrainingLogSets(detailed.id, [{ weightKg: -1, reps: 8, completed: true }]), null, 'invalid set edits are rejected');
  assert.equal(localStorage.getItem('rehab.trainingLogs.v2'), beforeInvalidUpdate, 'invalid edits do not overwrite stored logs');

  localStorage.setItem('rehab.trainingLogs.v2', '{malformed');
  assert.equal(saveLog(legacy), false, 'corrupt existing storage rejects a new log');
  assert.equal(updateTrainingLogSets(detailed.id, [{ reps: 8, completed: true }]), null, 'corrupt storage cannot be updated without a matching log');
  assert.equal(localStorage.getItem('rehab.trainingLogs.v2'), '{malformed', 'corrupt storage bytes are preserved');

  console.log('Set-level weight and reps regression passed: legacy, multiple/partial sets, reload, edit/remove, malformed optional detail, and corrupt storage preservation.');
} finally {
  delete globalThis.window;
}
