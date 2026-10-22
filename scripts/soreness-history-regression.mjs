import assert from 'node:assert/strict';
import { build } from 'vite';
async function load(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: { lib: { entry, formats: ['es'] }, minify: false, rollupOptions: { output: { inlineDynamicImports: true } }, write: false } });
  const out = Array.isArray(result) ? result[0].output : result.output;
  return import(`data:text/javascript;base64,${Buffer.from(out.find(x => x.type === 'chunk').code).toString('base64')}`);
}
const h = await load('src/utils/sorenessHistory.ts'); const s = await load('src/services/sorenessStorage.ts');
const data = new Map([['rehab.trainingLogs.v2', 'unchanged']]); let fail = false;
globalThis.window = { localStorage: { getItem: key => data.get(key) ?? null, setItem: (key, value) => { if (fail) throw Error('quota'); data.set(key, value); } } };
const make = (date, severity = 3, side = 'right') => ({ id: crypto.randomUUID(), date, createdAt: '2026-10-19T00:00:00.000Z', regions: [{ regionId: 'jKnee', tissue: 'joint', side, severity, symptoms: ['sore'], note: '=SUM(1,2)\n"private"' }] });
const entries = [make('2026-10-13'), make('2026-10-19', 6), make('2026-10-12'), make('2026-10-20'), make('2026-10-18', 0), make('2026-10-17', 4, 'left')];
assert.equal(h.trendRows(entries, 'jKnee.right', 7, new Date(2026, 9, 19, 1)).length, 2);
assert.equal(h.trendRows(entries, 'traps.right', 90, new Date(2026, 9, 19)).length, 0);
for (const n of [7, 30, 90]) { const day = new Date(2026, 9, 19); day.setDate(day.getDate() - n + 1); assert.equal(h.trendRows([make(s.localSorenessDate(day))], 'jKnee.right', n, new Date(2026, 9, 19)).length, 1); day.setDate(day.getDate() - 1); assert.equal(h.trendRows([make(s.localSorenessDate(day))], 'jKnee.right', n, new Date(2026, 9, 19)).length, 0); }
console.log('1. Local calendar 7/30/90 boundaries, sides, missing and legacy zero: PASS');
for (const [a,b] of [['2026-02-30',''], ['2026-1-01',''], ['2026-10-20','2026-10-19']]) assert.throws(() => h.historyRows(entries,a,b));
assert.equal(h.historyRows(entries,'2026-10-19','2026-10-19').length,1);
assert(h.validHistoryDate('2024-02-29')); assert(!h.validHistoryDate('2025-02-29'));
console.log('2. Inclusive ranges, leap dates and invalid ranges: PASS');
const csv = h.historyCsv(entries, x => x);
assert(csv.startsWith('\uFEFF')); assert(!csv.includes('private')); assert(!csv.includes('"note"')); assert(csv.includes('jKnee')); assert(!csv.includes('"0"'));
console.log('3. Private CSV omits notes and legacy zero, preserves stable IDs: PASS');
const shared = h.historyCsv(entries, x => x, { notes:true });
assert(shared.includes("'=SUM(1,2)")); assert(shared.includes('""private""'));
for (const value of ['=1',' +1','@x','-1','\tfoo','\nfoo','\uFEFF=2']) assert(h.csvCell(value).startsWith('"\''));
console.log('4. Opt-in notes and CSV quoting/formula protection: PASS');
const backup = JSON.parse(h.nativeBackup(entries)); assert.deepEqual(backup.entries, entries); assert(h.historyCsv(entries,x=>x,{full:true}).includes('"0"'));
assert(s.restoreSorenessBackup(backup).ok); assert.deepEqual(s.readSorenessEntries().entries, entries);
assert(s.restoreSorenessBackup(backup).ok); assert.equal(s.readSorenessEntries().entries.length,entries.length);
console.log('5. Lossless native JSON roundtrip and additive duplicate restore: PASS');
const before = data.get(s.SORENESS_KEY);
for (const entries of [[make('2026-02-30')], [{...make('2026-10-19'), id:'bad'}], [make('2026-10-19'), { invalid:true }]]) { assert.equal(s.restoreSorenessBackup({...backup,entries}).ok,false); assert.equal(data.get(s.SORENESS_KEY),before); }
assert.equal(s.restoreSorenessBackup({...backup,entries:[entries[0],entries[0]]}).ok,false);
console.log('6. Entire invalid or duplicate-ID batch rejected without mutation: PASS');
fail = true; const incoming = {...backup,entries:[make('2026-10-19')]}; assert.equal(s.restoreSorenessBackup(incoming).error,'write-failed'); assert.equal(data.get(s.SORENESS_KEY),before); fail=false; assert(s.restoreSorenessBackup(incoming).ok);
console.log('7. Quota failure preserves bytes and retry succeeds: PASS');
data.set(s.SORENESS_KEY,'broken'); assert.equal(s.restoreSorenessBackup(backup).error,'corrupt'); assert.equal(data.get(s.SORENESS_KEY),'broken'); data.set(s.SORENESS_KEY, before);
console.log('8. Corrupt current storage remains protected: PASS');
const full=Array.from({length:200},()=>make('2026-10-19')); data.set(s.SORENESS_KEY,JSON.stringify(full)); assert.equal(s.restoreSorenessBackup(incoming).error,'capacity'); assert.equal(s.readSorenessEntries().entries.length,200);
console.log('9. Capacity refuses additions without eviction: PASS');
assert.equal(data.get('rehab.trainingLogs.v2'),'unchanged'); assert.equal(s.SORENESS_KEY,'rehab.sorenessEntries.v1');
console.log('10. Existing training key and native storage contract preserved: PASS');
