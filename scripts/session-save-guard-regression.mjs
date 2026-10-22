#!/usr/bin/env node
import assert from 'node:assert/strict';
import { build } from 'vite';

class MemoryStorage {
  values = new Map();
  failWrites = false;

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    if (this.failWrites && key === 'rehab.trainingLogs.v2') throw new Error('quota');
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

const localStorage = new MemoryStorage();
globalThis.window = { localStorage };

function makeLog(id, stoppedEarly = false) {
  const date = '2026-09-19T02:00:00.000Z';
  return {
    id,
    date,
    completedAt: date,
    exerciseId: 'shoulder-flexion',
    title: 'Shoulder flexion',
    exerciseTitle: 'Shoulder flexion',
    bodyArea: 'shoulder',
    type: 'mobility',
    level: 'beginner',
    plannedSets: 3,
    plannedReps: 10,
    setsCompleted: stoppedEarly ? 1 : 3,
    repsCompleted: 10,
    painBefore: 0,
    painAfter: 0,
    difficultyRating: 5,
    stoppedEarly,
    recoveryMode: false,
    completionStatus: stoppedEarly ? 'stopped_early' : 'completed',
    notes: '',
    stopReason: stoppedEarly ? 'user_exit' : '',
    painDelta: 0,
  };
}

try {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: { entry: 'scripts/session-save-behavior-entry.ts', formats: ['es'] },
      write: false,
      minify: false,
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  });
  const output = Array.isArray(result) ? result[0].output : result.output;
  const code = output.find((item) => item.type === 'chunk').code;
  const { getLogs, persistSessionLogOnce, saveLog } = await import(
    `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`
  );

  for (const [label, log] of [
    ['Save Log', makeLog('completed-session')],
    ['Save & Exit', makeLog('early-exit-session', true)],
  ]) {
    localStorage.clear();
    const lock = { current: false };
    assert.equal(persistSessionLogOnce(lock, log, saveLog), 'saved', `${label} first activation saves`);
    assert.equal(persistSessionLogOnce(lock, log, saveLog), 'duplicate', `${label} rapid second activation is blocked`);
    assert.equal(getLogs().length, 1, `${label} rapid double activation persists exactly one log`);
  }

  localStorage.clear();
  localStorage.failWrites = true;
  const retryLock = { current: false };
  const retryLog = makeLog('retry-session');
  assert.equal(persistSessionLogOnce(retryLock, retryLog, saveLog), 'failed', 'storage failure is reported');
  assert.equal(retryLock.current, false, 'storage failure releases the lock');
  assert.equal(getLogs().length, 0, 'storage failure does not create a false saved record');

  localStorage.failWrites = false;
  assert.equal(persistSessionLogOnce(retryLock, retryLog, saveLog), 'saved', 'retry succeeds after storage recovers');
  assert.equal(persistSessionLogOnce(retryLock, retryLog, saveLog), 'duplicate', 'rapid retry duplicate is blocked');
  assert.equal(getLogs().length, 1, 'successful retry persists exactly one record');

  console.log('Session save behavior passed: both rapid-double paths persist once; failure stays unsaved and retry persists once.');
} finally {
  delete globalThis.window;
}
