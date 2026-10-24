import assert from 'node:assert/strict';
import { build } from 'vite';
async function load(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: { lib: { entry, formats: ['es'] }, minify: false, rollupOptions: { output: { inlineDynamicImports: true } }, write: false } });
  const output = Array.isArray(result) ? result[0].output : result.output;
  return import(`data:text/javascript;base64,${Buffer.from(output.find(item => item.type === 'chunk').code).toString('base64')}`);
}
const s = await load('src/services/sorenessStorage.ts');
const { sorenessRegions } = await load('src/data/sorenessRegions.ts');
const { anatomicalRegions } = await load('src/data/anatomicalRegions.ts');
const { clearRehabLocalData, getAppStorageKeys } = await load('src/services/localStorageService.ts');
const unrelated = [['rehab.trainingLogs.v2', '[{"unchanged":true}]'], ['rehab.manualWorkouts.v1', 'original'], ['rehab.activities.v1', 'activity'], ['other-app', 'leave-me']];
const data = new Map();
let readFailureKey, failWrite = false, writes = [];
globalThis.window = { localStorage: {
  getItem: key => { if (readFailureKey === key) throw Error('read'); return data.get(key) ?? null; },
  setItem: (key, value) => { if (failWrite) throw Error('quota'); writes.push(key); data.set(key, value); },
  removeItem: key => data.delete(key),
} };
const region = { regionId: 'traps', view: 'F', side: 'left', tissue: 'muscle', severity: 0, symptoms: [] };
const entry = (regions = [{ ...region }]) => ({ id: s.sorenessId(), date: s.localSorenessDate(), createdAt: new Date().toISOString(), regions });
const legacyEntry = () => { const e = entry(); delete e.regions[0].view; return e; };
const envelope = (entries = [], deletedLegacyIds = []) => ({ schemaVersion: 2, entries, deletedLegacyIds });
function reset(legacy, v2) {
  data.clear(); for (const [key, value] of unrelated) data.set(key, value);
  if (legacy !== undefined) data.set(s.SORENESS_KEY, typeof legacy === 'string' ? legacy : JSON.stringify(legacy));
  if (v2 !== undefined) data.set(s.SORENESS_V2_KEY, typeof v2 === 'string' ? v2 : JSON.stringify(v2));
  failWrite = false; readFailureKey = undefined; writes = [];
}
function bytes() { return [...data]; }
function expectBlocked(error, candidate = entry(), deleteId = s.sorenessId()) {
  const before = bytes();
  assert.equal(s.saveSorenessEntry(candidate).error, error);
  assert.equal(s.deleteSorenessEntry(deleteId).error, error);
  assert.deepEqual(bytes(), before, 'failed operations preserve every stored byte');
  assert.deepEqual(writes, [], 'failed operations do not write');
}
function assertOtherKeys() { for (const [key, value] of unrelated) assert.equal(data.get(key), value); }

// v1 remains readable exactly as saved, with no guessed front/back information.
const legacy = [legacyEntry(), legacyEntry()];
const legacyRaw = JSON.stringify(legacy, null, 2);
reset(legacyRaw);
assert.deepEqual(s.readSorenessEntries(), { entries: legacy });
assert.equal('view' in s.readSorenessEntries().entries[0].regions[0], false);
assert.equal(s.saveSorenessEntry(legacyEntry()).error, 'invalid');
const newRecord = entry();
assert.equal(s.saveSorenessEntry(newRecord).ok, true);
assert.deepEqual(s.readSorenessEntries().entries, [newRecord, ...legacy]);
assert.equal(data.get(s.SORENESS_KEY), legacyRaw);
assert.deepEqual(writes, [s.SORENESS_V2_KEY]);
assertOtherKeys();
assert.equal(s.saveSorenessEntry(newRecord).error, 'invalid');
assert.equal(s.saveSorenessEntry({ ...entry(), id: legacy[0].id }).error, 'invalid');

reset(undefined, envelope([newRecord]));
assert.deepEqual(s.readSorenessEntries().entries, [newRecord]);
assert.equal(s.deleteSorenessEntry(newRecord.id).ok, true);
assert.deepEqual(JSON.parse(data.get(s.SORENESS_V2_KEY)), envelope());
assert.equal(data.has(s.SORENESS_KEY), false);

// A legacy delete is persisted independently of the untouched legacy array.
reset(legacyRaw, envelope([newRecord]));
assert.equal(s.deleteSorenessEntry(legacy[0].id).ok, true);
assert.deepEqual(s.readSorenessEntries().entries, [newRecord, legacy[1]]);
assert.deepEqual(JSON.parse(data.get(s.SORENESS_V2_KEY)).deletedLegacyIds, [legacy[0].id]);
assert.equal(data.get(s.SORENESS_KEY), legacyRaw);
assert.equal(s.deleteSorenessEntry(legacy[0].id).error, 'invalid');
assert.equal(s.saveSorenessEntry({ ...entry(), id: legacy[0].id }).error, 'invalid', 'deleted legacy IDs cannot collide with new entries');
const afterDelete = bytes();
reset(afterDelete.find(([key]) => key === s.SORENESS_KEY)[1], afterDelete.find(([key]) => key === s.SORENESS_V2_KEY)[1]);
assert.deepEqual(s.readSorenessEntries().entries, [newRecord, legacy[1]], 'tombstone survives reload');
assert.equal(s.deleteSorenessEntry(newRecord.id).ok, true);
assert.deepEqual(s.readSorenessEntries().entries, [legacy[1]]);
assertOtherKeys();

// View is part of identity, and every catalog path is accepted with its exact side.
assert.equal(s.validNewSorenessEntry(entry([region, { ...region, view: 'B', severity: 10 }])), true);
assert.equal(s.validNewSorenessEntry(entry([region, { ...region }])), false);
const paths = sorenessRegions.flatMap(r => Object.entries(r.paths).flatMap(([view, sides]) => Object.keys(sides).map(side => ({ ...region, regionId: r.id, tissue: r.tissue, view, side }))));
assert.equal(paths.length, 95);
assert.equal(s.validNewSorenessEntry(entry(paths)), true);
assert.equal(s.validNewSorenessEntry(entry([...paths, region])), false);
for (const r of sorenessRegions) for (const view of ['F', 'B']) for (const side of ['left', 'right', 'center']) {
  const expected = Boolean(r.paths[view]?.[side]);
  assert.equal(s.validNewSorenessEntry(entry([{ ...region, regionId: r.id, tissue: r.tissue, view, side }])), expected, `${r.id}/${view}/${side}`);
}
for (const regionId of ['jNeck', 'jThoracic', 'jLumbar']) {
  assert.equal(s.validNewSorenessEntry(entry([{ ...region, regionId, tissue: 'joint', view: 'B', side: 'center' }])), true);
  assert.equal(s.validNewSorenessEntry(entry([{ ...region, regionId, tissue: 'joint', view: 'F', side: 'center' }])), false);
}
for (const patch of [{ view: undefined }, { view: null }, { view: 'FB' }, { side: 'center' }, { side: 'unknown' }, { severity: undefined }, { severity: null }, { severity: -1 }, { severity: 11 }, { severity: 0.5 }, { tissue: 'joint' }, { symptoms: ['weak'] }, { symptoms: ['sore', 'sore'] }, { note: 'a'.repeat(501) }]) assert.equal(s.validNewSorenessEntry(entry([{ ...region, ...patch }])), false, JSON.stringify(patch));
assert.equal(s.validNewSorenessEntry(entry([{ ...region, severity: 0, note: 'a'.repeat(500) }])), true);
assert.equal(s.validNewSorenessEntry(entry([{ ...region, severity: 10 }])), true);
assert.equal(s.validNewSorenessEntry(entry([region, legacyEntry().regions[0]])), false);
assert.equal(s.validNewSorenessEntry(entry([])), false);
const allLegacyRegions = anatomicalRegions.flatMap(r => ['left', 'right'].map(side => ({ regionId: r.id, tissue: r.tissue, side, severity: 0, symptoms: [] })));
assert.equal(allLegacyRegions.length, 74);
assert.equal(s.validSorenessEntry(entry(allLegacyRegions)), true);
assert.equal(s.validSorenessEntry(entry([...allLegacyRegions, allLegacyRegions[0]])), false);

// Both keys are validated before any write. Corruption never silently becomes an empty log.
for (const corrupt of ['bad', '{}', 'null', JSON.stringify([legacy[0], legacy[0]]), JSON.stringify([newRecord]), JSON.stringify([{ ...legacy[0], regions: [{ ...legacy[0].regions[0], severity: null }] }]), JSON.stringify(Array.from({ length: 201 }, legacyEntry))]) {
  reset(corrupt, envelope([newRecord])); expectBlocked('corrupt');
}
for (const corrupt of ['bad', '[]', 'null', envelope([legacy[0]]), { ...envelope(), schemaVersion: 1 }, { schemaVersion: 2, entries: [] }, envelope([newRecord, newRecord]), envelope([], ['bad']), envelope([], [legacy[0].id, legacy[0].id]), envelope([], Array.from({ length: 201 }, () => s.sorenessId())), envelope(Array.from({ length: 201 }, () => entry()))]) {
  reset(legacy, corrupt); expectBlocked('corrupt');
}
reset(legacy, envelope([{ ...newRecord, id: legacy[0].id }], [legacy[0].id])); expectBlocked('corrupt');
reset(legacy, envelope(Array.from({ length: 199 }, () => entry()))); expectBlocked('corrupt');
for (const key of [s.SORENESS_KEY, s.SORENESS_V2_KEY]) {
  reset(legacy, envelope([newRecord])); readFailureKey = key; expectBlocked('read-failed', entry(), newRecord.id);
}
readFailureKey = undefined;
const readRetry = entry();
assert.equal(s.saveSorenessEntry(readRetry).ok, true, 'transient read failure can be retried');
assert.deepEqual(s.readSorenessEntries().entries, [readRetry, newRecord, ...legacy]);
reset(legacyRaw, envelope([newRecord])); failWrite = true;
const failedDeleteBytes = bytes();
assert.equal(s.deleteSorenessEntry(newRecord.id).error, 'write-failed');
assert.deepEqual(bytes(), failedDeleteBytes);
 expectBlocked('write-failed', entry(), legacy[0].id);
failWrite = false;
const retry = entry();
assert.equal(s.saveSorenessEntry(retry).ok, true, 'quota failure can be retried without data loss');
assert.deepEqual(s.readSorenessEntries().entries, [retry, newRecord, ...legacy]);
assert.equal(data.get(s.SORENESS_KEY), legacyRaw);
assertOtherKeys();

// Capacity counts active entries across both keys and never drops oldest records.
const fullNew = Array.from({ length: 200 }, () => entry());
reset(undefined, envelope(fullNew));
const fullNewBytes = bytes();
assert.equal(s.saveSorenessEntry(entry()).error, 'capacity');
assert.deepEqual(bytes(), fullNewBytes);
assert.equal(s.deleteSorenessEntry(fullNew[0].id).ok, true);
assert.equal(s.saveSorenessEntry(entry()).ok, true);
assert.equal(s.readSorenessEntries().entries.length, 200);
const fullLegacy = Array.from({ length: 200 }, legacyEntry);
reset(fullLegacy);
const fullBytes = bytes();
assert.equal(s.saveSorenessEntry(entry()).error, 'capacity');
assert.deepEqual(bytes(), fullBytes);
assert.equal(s.deleteSorenessEntry(fullLegacy[0].id).ok, true);
const replacement = entry();
assert.equal(s.saveSorenessEntry(replacement).ok, true);
assert.equal(s.readSorenessEntries().entries.length, 200);
assert.deepEqual(s.readSorenessEntries().entries, [replacement, ...fullLegacy.slice(1)]);
const staleTombstones = Array.from({ length: 200 }, () => s.sorenessId());
reset(legacy, envelope([], staleTombstones));
const tombstoneCapacityBytes = bytes();
assert.deepEqual(s.deleteSorenessEntry(legacy[0].id), { ok: false, error: 'capacity' });
assert.deepEqual(bytes(), tombstoneCapacityBytes, 'preserve authoritative tombstones instead of pruning for capacity');

// Save/delete re-read current state, including externally added records.
reset(legacy);
s.readSorenessEntries();
data.set(s.SORENESS_V2_KEY, JSON.stringify(envelope([newRecord])));
const latest = entry();
assert.equal(s.saveSorenessEntry(latest).ok, true);
assert.deepEqual(s.readSorenessEntries().entries, [latest, newRecord, ...legacy]);
const externalLegacy = legacyEntry();
data.set(s.SORENESS_KEY, JSON.stringify([...legacy, externalLegacy]));
assert.equal(s.deleteSorenessEntry(latest.id).ok, true);
assert.deepEqual(s.readSorenessEntries().entries, [newRecord, ...legacy, externalLegacy]);

// Existing dates survive travel/clock rollback; only newly entered future dates fail.
reset(legacyRaw, envelope([newRecord]));
const OriginalDate = Date;
const earlier = new OriginalDate(); earlier.setDate(earlier.getDate() - 1);
globalThis.Date = class extends OriginalDate {
  constructor(...args) { if (args.length) super(...args); else super(earlier.getTime()); }
  static now() { return earlier.getTime(); }
};
try {
  assert.deepEqual(s.readSorenessEntries().entries, [newRecord, ...legacy]);
  const before = bytes();
  assert.equal(s.saveSorenessEntry({ ...entry(), date: newRecord.date }).error, 'invalid');
  assert.deepEqual(bytes(), before);
  const today = entry(); assert.equal(s.saveSorenessEntry(today).ok, true);
  assert.deepEqual(s.readSorenessEntries().entries, [today, newRecord, ...legacy]);
  assert.equal(s.deleteSorenessEntry(legacy[0].id).ok, true);
  assert.equal(s.deleteSorenessEntry(newRecord.id).ok, true);
  assert.deepEqual(s.readSorenessEntries().entries, [today, legacy[1]]);
  assert.equal(data.get(s.SORENESS_KEY), legacyRaw);
} finally { globalThis.Date = OriginalDate; }
assertOtherKeys();

assert.ok(getAppStorageKeys().includes(s.SORENESS_KEY));
assert.ok(getAppStorageKeys().includes(s.SORENESS_V2_KEY));
const cleared = clearRehabLocalData();
assert.deepEqual(cleared.failedKeys, []);
assert.equal(data.has(s.SORENESS_KEY), false);
assert.equal(data.has(s.SORENESS_V2_KEY), false);
assert.equal(data.get('other-app'), 'leave-me');
console.log('PASS: soreness v2 compatibility, 95 paths, tombstones, capacity, atomic failure preservation, retry, clock rollback and clear-data');
