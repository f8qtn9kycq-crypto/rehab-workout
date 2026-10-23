import assert from 'node:assert/strict';
import { build } from 'vite';
import en from '../src/locales/en.js';
import zh from '../src/locales/zh-TW.js';
async function load(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: { lib: { entry, formats: ['es'] }, minify: false, rollupOptions: { output: { inlineDynamicImports: true } }, write: false } });
  return import(`data:text/javascript;base64,${Buffer.from((Array.isArray(result) ? result[0] : result).output.find(item => item.type === 'chunk').code).toString('base64')}`);
}
const s = await load('src/services/sorenessStorage.ts');
const t = await load('src/utils/sorenessTransfer.ts');
let data = new Map(), writes = [], failRead, failWrite = false;
globalThis.window = { localStorage: {
  getItem(key) { if (failRead === key) throw Error('read'); return data.get(key) ?? null; },
  setItem(key, value) { if (failWrite) throw Error('quota'); writes.push(key); data.set(key, value); },
} };
const uuid = () => crypto.randomUUID();
const reg = (view, side = 'left', severity = 0, note) => ({ regionId: 'traps', tissue: 'muscle', ...(view ? { view } : {}), side, severity, symptoms: ['sore', 'tight'], ...(note !== undefined ? { note } : {}) });
const entry = (...regions) => ({ id: uuid(), date: '2026-10-23', createdAt: '2026-10-23T08:15:02.123Z', regions: regions.length ? regions : [reg('F')] });
const legacy = entry(reg(undefined, 'right', 0, '=private\n"零分",備註'));
const modern = entry(reg('F', 'left', 0, ''), reg('B', 'right', 7, '+secret'), { ...reg('B', 'center', 4), regionId: 'jLumbar', tissue: 'joint' });
const env = (entries = [], deletedLegacyIds = [], importedLegacyEntries) => ({ schemaVersion: 2, entries, deletedLegacyIds, ...(importedLegacyEntries !== undefined ? { importedLegacyEntries } : {}) });
const backup = (entries = [legacy, modern], schemaVersion = 2) => ({ format: 'rehab.sorenessEntries', schemaVersion, entries });
function reset(v1, v2) {
  data = new Map([['other-app', 'other bytes'], ['rehab.trainingLogs.v2', '[{"leave":"me"}]'], ['rehab.manualWorkouts.v1', 'original'], ['rehab.activities.v1', 'activity']]);
  if (v1 !== undefined) data.set(s.SORENESS_KEY, typeof v1 === 'string' ? v1 : JSON.stringify(v1, null, 2));
  if (v2 !== undefined) data.set(s.SORENESS_V2_KEY, typeof v2 === 'string' ? v2 : JSON.stringify(v2));
  writes = []; failRead = undefined; failWrite = false;
}
const snapshot = () => [...data];
const byId = entries => [...entries].sort((a, b) => a.id.localeCompare(b.id));
function unchanged(before, previousWrites) { assert.deepEqual(snapshot(), before); assert.deepEqual(writes, previousWrites); }
function blocked(value, error) {
  const before = snapshot(), previousWrites = [...writes];
  assert.deepEqual(s.restoreSorenessBackup(value), { ok: false, error });
  unchanged(before, previousWrites);
}
function checkOthers() {
  for (const [key, value] of [['other-app', 'other bytes'], ['rehab.trainingLogs.v2', '[{"leave":"me"}]'], ['rehab.manualWorkouts.v1', 'original'], ['rehab.activities.v1', 'activity']]) assert.equal(data.get(key), value);
}

// Round-trip current v1 + v2 to fresh destination: preserve 0, absent/empty notes,
// IDs, date, createdAt, side, front/back/center and unspecified legacy view.
const legacyBytes = JSON.stringify([legacy], null, 4);
reset(legacyBytes, env([modern]));
const original = s.readSorenessEntries().entries;
const json = t.sorenessBackup(original);
assert.deepEqual(t.parseSorenessBackup(json), backup(original));
reset();
assert.deepEqual(s.restoreSorenessBackup(JSON.parse(json)), { ok: true, added: 2, skipped: 0 });
assert.deepEqual(byId(s.readSorenessEntries().entries), byId(original));
assert.equal(data.has(s.SORENESS_KEY), false, 'fresh restore never writes v1');
assert.deepEqual(writes, [s.SORENESS_V2_KEY]);
assert.deepEqual(JSON.parse(data.get(s.SORENESS_V2_KEY)), env([modern], [], [legacy]));
checkOthers();
const restoredBytes = snapshot();
assert.deepEqual(s.restoreSorenessBackup(JSON.parse(json)), { ok: true, added: 0, skipped: 2 });
unchanged(restoredBytes, [s.SORENESS_V2_KEY]);
// Original PR230 v1 native backup remains supported without assigned view.
reset();
assert.deepEqual(s.restoreSorenessBackup(backup([legacy], 1)), { ok: true, added: 1, skipped: 0 });
assert.deepEqual(s.readSorenessEntries().entries, [legacy]);
assert.equal('view' in s.readSorenessEntries().entries[0].regions[0], false);
blocked(backup([modern], 1), 'invalid');

// Existing data wins even if incoming version and contents differ.
reset(legacyBytes, env([modern]));
const conflictLegacy = { ...modern, id: legacy.id };
const conflictModern = { ...legacy, id: modern.id };
const beforeConflict = snapshot();
assert.deepEqual(s.restoreSorenessBackup(backup([conflictLegacy, conflictModern])), { ok: true, added: 0, skipped: 2 });
unchanged(beforeConflict, []);
assert.deepEqual(s.readSorenessEntries().entries, original);
// Re-read at commit time: changes since preview are preserved.
const external = entry(reg('F', 'right', 3));
data.set(s.SORENESS_V2_KEY, JSON.stringify(env([modern, external])));
assert.deepEqual(s.restoreSorenessBackup(backup([external, entry(reg(undefined))])), { ok: true, added: 1, skipped: 1 });
assert.ok(s.readSorenessEntries().entries.some(e => e.id === external.id));
assert.equal(data.get(s.SORENESS_KEY), legacyBytes); checkOthers();

// Source deletion metadata has no authority over destination entries.
reset(legacyBytes, env([modern]));
assert.deepEqual(s.restoreSorenessBackup({ ...backup([]), deletedLegacyIds: [legacy.id, modern.id] }), { ok: true, added: 0, skipped: 0 });
assert.deepEqual(s.readSorenessEntries().entries, original);
// Local tombstones win over same-ID legacy and new incoming entries.
reset(legacyBytes, env([modern], [legacy.id]));
assert.deepEqual(s.restoreSorenessBackup(backup([legacy])), { ok: true, added: 0, skipped: 1 });
assert.deepEqual(s.restoreSorenessBackup(backup([{ ...modern, id: legacy.id }])), { ok: true, added: 0, skipped: 1 });
assert.deepEqual(s.readSorenessEntries().entries, [modern]);
assert.equal(data.get(s.SORENESS_KEY), legacyBytes);
// Imported legacy deletion remains a real tombstone across save/restore/reload.
reset(); s.restoreSorenessBackup(backup([legacy]));
assert.deepEqual(s.deleteSorenessEntry(legacy.id), { ok: true });
assert.deepEqual(s.readSorenessEntries().entries, []);
assert.equal(s.saveSorenessEntry({ ...modern, id: legacy.id }).error, 'invalid');
const saved = { ...modern, date: s.localSorenessDate() };
assert.deepEqual(s.saveSorenessEntry(saved), { ok: true });
assert.deepEqual(s.restoreSorenessBackup(backup([legacy])), { ok: true, added: 0, skipped: 1 });
assert.deepEqual(JSON.parse(data.get(s.SORENESS_V2_KEY)).deletedLegacyIds, [legacy.id]);
assert.deepEqual(JSON.parse(t.sorenessBackup(s.readSorenessEntries().entries)).entries, [saved], 'visible snapshot excludes tombstoned entry');
// Unknown target tombstone is also honored during restore, including new IDs.
reset(undefined, env([], [legacy.id]));
s.restoreSorenessBackup(backup([legacy, modern]));
assert.deepEqual(s.readSorenessEntries().entries, [modern]);
assert.deepEqual(JSON.parse(data.get(s.SORENESS_V2_KEY)).deletedLegacyIds, [legacy.id]);

// Whole batch validation happens before dedupe: even invalid duplicate candidates reject.
const invalids = [null, [], {}, { ...backup(), format: 'bodymap.v1' }, { ...backup(), schemaVersion: 3 }, backup([legacy, legacy]), backup([modern, { ...legacy, date: '2026-02-30' }]), backup([modern, { ...legacy, createdAt: '2026-02-30T00:00:00.000Z' }]), backup([{ ...legacy, id: 'bad' }]), backup([{ ...modern, regions: [reg('F'), reg(undefined)] }]), backup([{ ...legacy, regions: [reg(undefined, 'center')] }]), backup([{ ...modern, regions: [reg('F', 'center')] }]), backup([{ ...modern, regions: [reg('F', 'left', 11)] }]), backup([{ ...modern, regions: [reg('F', 'left', 1, 'a'.repeat(501))] }]), backup(Array.from({ length: 201 }, () => entry()))];
reset(legacyBytes, env([modern]));
for (const invalid of invalids) { blocked(invalid, 'invalid'); assert.equal(s.validSorenessBackup(invalid), false); }
assert.throws(() => t.parseSorenessBackup('invalid-json'));
assert.throws(() => t.parseSorenessBackup(JSON.stringify(backup([modern], 1))));
// A future stored date survives clock rollback; restore is not a new observation.
const future = { ...entry(), date: '2099-01-01' };
assert.equal(s.restoreSorenessBackup(backup([future])).ok, true);

// Capacity rejects entire import; never evicts. Duplicates do not consume capacity.
const full = Array.from({ length: 200 }, () => entry());
reset(undefined, env(full)); blocked(backup([legacy, modern]), 'capacity');
assert.deepEqual(s.restoreSorenessBackup(backup([full[0]])), { ok: true, added: 0, skipped: 1 });
const hidden = Array.from({ length: 200 }, () => entry(reg(undefined)));
reset(undefined, env([], hidden.map(e => e.id), hidden));
blocked(backup([legacy]), 'capacity');
assert.deepEqual(s.readSorenessEntries().entries, []);
// 200 retained legacy deletions + another raw legacy entry: refuse deletion safely.
reset([legacy], env([], hidden.map(e => e.id), hidden));
const atTombstoneLimit = snapshot();
assert.deepEqual(s.deleteSorenessEntry(legacy.id), { ok: false, error: 'capacity' });
unchanged(atTombstoneLimit, []);
assert.deepEqual(s.readSorenessEntries().entries, [legacy]);

// Reader rejects malformed imported collections and all cross-collection ID collisions.
for (const invalid of [null, {}, [modern], [legacy, legacy], Array.from({ length: 201 }, () => entry(reg(undefined)))]) {
  reset(undefined, env([], [], invalid)); blocked(backup(), 'corrupt');
}
reset([legacy], env([], [], [legacy])); blocked(backup(), 'corrupt');
reset(undefined, env([{ ...modern, id: legacy.id }], [], [legacy])); blocked(backup(), 'corrupt');
for (const key of [s.SORENESS_KEY, s.SORENESS_V2_KEY]) {
  reset(legacyBytes, env([modern])); data.set(key, '{broken'); blocked(backup(), 'corrupt');
  reset(legacyBytes, env([modern])); failRead = key; blocked(backup(), 'read-failed');
  failRead = undefined; assert.equal(s.restoreSorenessBackup(backup([entry()])).ok, true);
}
reset(legacyBytes, env([modern])); failWrite = true;
const retryBackup = backup([entry(reg(undefined)), entry(reg('B'))]);
blocked(retryBackup, 'write-failed');
failWrite = false;
assert.deepEqual(s.restoreSorenessBackup(retryBackup), { ok: true, added: 2, skipped: 0 });
assert.equal(data.get(s.SORENESS_KEY), legacyBytes); assert.deepEqual(writes, [s.SORENESS_V2_KEY]); checkOthers();

// CSV remains stable across locales; share never includes notes unless explicitly opted in.
const label = locale => key => key.split('.').reduce((value, part) => value?.[part], locale) ?? key;
function parseCsv(content) {
  const rows = []; let row = [], cell = '', quoted = false;
  const text = content.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
    else if (c === '\r' && text[i + 1] === '\n' && !quoted) { row.push(cell); rows.push(row); row = []; cell = ''; i++; }
    else cell += c;
  }
  row.push(cell); rows.push(row);
  return rows.map((r, i) => i ? Object.fromEntries(rows[0].map((header, index) => [header, r[index]])) : r);
}
for (const locale of [en, zh]) {
  const shared = t.sorenessCsv(original, label(locale));
  const rows = parseCsv(shared);
  assert.equal(rows.length, 5); assert.equal(rows[0].includes('note'), false);
  assert.equal(shared.includes('private'), false); assert.equal(shared.includes('secret'), false);
  assert.deepEqual(rows.slice(1).map(r => r.view), ['F', 'B', 'B', '']);
  assert.deepEqual(rows.slice(1).map(r => r.side), ['left', 'right', 'center', 'right']);
  assert.deepEqual(rows.slice(1).map(r => r.severity), ['0', '7', '4', '0']);
  assert.equal(rows[1].symptom_ids, 'sore|tight');
  assert.ok(rows[4].position_label.includes(locale.soreness.legacyView));
  const fullCsv = parseCsv(t.sorenessCsv(original, label(locale), { full: true, start: '2099-01-01' }));
  assert.equal(fullCsv.length, 5, 'full backup ignores share date range');
  assert.equal(fullCsv[1].note_present, 'true'); assert.equal(fullCsv[1].note, '');
  assert.equal(fullCsv[3].note_present, 'false');
  assert.equal(fullCsv[4].note, "'" + legacy.regions[0].note);
  assert.equal(fullCsv[4].created_at, legacy.createdAt);
  assert.equal(parseCsv(t.sorenessCsv(original, label(locale), { notes: true }))[4].note, "'" + legacy.regions[0].note);
}
assert.equal(/[\u3400-\u9fff]/.test(t.sorenessCsv(original, label(en))), false);
for (const value of ['=SUM(A1)', '+1', '-1', '@user', ' \t=1', '\nplain', '\rplain', '\tplain', '\uFEFF=1']) assert.ok(t.csvCell(value).startsWith('"\''));
assert.equal(t.csvCell('hello,"world"'), '"hello,""world"""');
assert.equal(t.shareEntries(original, '2026-10-23', '2026-10-23').length, 2);
assert.equal(t.shareEntries(original, '2026-10-24').length, 0);
for (const [start, end] of [['2026-02-30', ''], ['2026-10-24', '2026-10-23'], ['', 'bad']]) assert.throws(() => t.shareEntries(original, start, end));
assert.deepEqual(JSON.parse(t.sorenessBackup(original)).entries, original);
console.log('PASS: v1/v2 backup round trips, current-wins restore, legacy tombstones and bounded capacity, atomic failure/retry, bilingual private/full CSV, formula escape and date filters.');
