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

try {
  const { getOutcomeEntries } = await loadService('src/services/outcomeStorage.ts');
  const { getLogs } = await loadService('src/services/logService.ts');
  const date = '2026-08-30T12:00:00.000Z';

  localStorage.setItem('rehab.functionalOutcomes.v1', JSON.stringify([{
    id: 'legacy-outcome',
    date,
    bodyArea: 'shoulder',
    questionId: 'function-shoulder',
    score: 3,
    note: '',
  }]));

  assert.equal(getOutcomeEntries()[0].score, 6, 'legacy outcome 3/5 migrates to 6/10');
  assert.equal(getOutcomeEntries()[0].score, 6, 'outcome migration is idempotent on repeated reads');

  localStorage.setItem('rehab.functionalOutcomes.v2', JSON.stringify([{
    id: 'zero-outcome',
    date,
    bodyArea: 'shoulder',
    questionId: 'function-shoulder',
    score: 0,
    note: '',
  }]));
  assert.equal(getOutcomeEntries()[0].score, 0, 'v2 outcome score 0 remains valid');

  localStorage.removeItem('rehab.functionalOutcomes.v2');
  localStorage.setItem('rehab.functionalOutcomes.v1', '{malformed');
  assert.deepEqual(getOutcomeEntries(), [], 'malformed legacy outcomes fail soft');

  localStorage.clear();
  localStorage.setItem('rehab.trainingLogs.v1', JSON.stringify([{
    id: 'legacy-log',
    date,
    completedAt: date,
    exerciseId: 'exercise-1',
    title: 'Exercise',
    exerciseTitle: 'Exercise',
    bodyArea: 'shoulder',
    type: 'strength',
    level: 'beginner',
    plannedSets: 2,
    plannedReps: 8,
    setsCompleted: 2,
    repsCompleted: 8,
    painBefore: 1,
    painAfter: 1,
    difficultyRating: 3,
    stoppedEarly: false,
    recoveryMode: false,
    completionStatus: 'completed',
    notes: '',
    stopReason: '',
    painDelta: 0,
  }]));

  assert.equal(getLogs()[0].difficultyRating, 6, 'legacy effort 3/5 migrates to 6/10');
  assert.equal(getLogs()[0].difficultyRating, 6, 'training-log migration is idempotent on repeated reads');

  localStorage.removeItem('rehab.trainingLogs.v2');
  localStorage.setItem('rehab.trainingLogs.v1', '{malformed');
  assert.deepEqual(getLogs(), [], 'malformed legacy training logs fail soft');

  console.log('LocalStorage migration regression checks passed.');
} finally {
  delete globalThis.window;
}
