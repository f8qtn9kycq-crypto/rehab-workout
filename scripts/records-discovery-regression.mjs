import assert from 'node:assert/strict';
import { build } from 'vite';

async function loadModule(entry) {
  const result = await build({ configFile: false, logLevel: 'silent', build: {
    lib: { entry, formats: ['es'] }, minify: false,
    rollupOptions: { output: { inlineDynamicImports: true } }, write: false,
  } });
  const output = Array.isArray(result) ? result[0].output : result.output;
  return import(`data:text/javascript;base64,${Buffer.from(output.find(item => item.type === 'chunk').code).toString('base64')}`);
}

const { buildRecordsDiscoveryHistory, recordDiscoveryEntries, matchingRecordsDiscoveryEntries, filterRecordsDiscoveryDays, isLegacyRevisedCatalogRecord } = await loadModule('src/utils/recordsDiscovery.ts');
const { buildRecordsPresentation } = await loadModule('src/utils/recordsPresentation.ts');
const { exercises } = await loadModule('src/data/exercises.ts');
const { getLocalizedExercise } = await loadModule('src/utils/localizedExercise.ts');
const exercise = (exerciseId, extra = {}) => ({ name: exercises.find(item => item.id === exerciseId)?.title ?? '舊紀錄', exerciseId, equipment: '', sets: [{ reps: 5 }], ...extra });
const manual = (id, entries, extra = {}) => ({ id: `manual:${id}`, source: 'manual', date: '2026-09-19T12:00:00', workout: {
  id, date: '2026-09-19', createdAt: '2026-09-19T12:00:00', exercises: entries, ...extra,
} });
const purposeEntries = (entry, purpose, area = 'all', logs = []) => matchingRecordsDiscoveryEntries(entry, area, purpose, logs);
const cuff = manual('cuff', [exercise('shoulder-external-rotation-band', { kind: 'strength' })]);
assert.equal(purposeEntries(cuff, 'rehab').length, 1, '舊 kind strength 不覆蓋官方肩袖復健用途');
assert.equal(purposeEntries(cuff, 'strength').length, 1, '次要肌力用途同樣可找到');
const ytw = manual('ytw', [exercise('catalog-prone-ytw')]);
assert.equal(purposeEntries(ytw, 'rehab').length, 1);
assert.equal(purposeEntries(ytw, 'strength').length, 1);
assert.equal(recordDiscoveryEntries(ytw).length, 1, '雙用途仍只有一筆動作明細');
for (const entry of [exercise(undefined), exercise(undefined, { kind: 'strength' }), exercise('custom-private', { kind: 'mobility' }), exercise('shoulder-flexion', { recordOnly: true }), exercise('missing'), exercise('__proto__'), exercise('constructor'), exercise('toString'), exercise('catalog-shoulder-press', { name: '舊啞鈴肩推', equipmentId: 'dumbbell' }), exercise('catalog-squat', { name: '舊名稱', equipmentId: 'barbell' })]) {
  const item = manual('unknown', [entry]);
  assert.deepEqual(recordDiscoveryEntries(item)[0].purposes, ['unknown'], '缺 ID、私人、修訂歧義及未知 ID 不猜用途');
  assert.equal(purposeEntries(item, 'rehab').length, 0);
  assert.equal(purposeEntries(item, 'strength').length, 0);
}

// 原 helper 的名稱、器材與空值語意保持一致，包含英語名稱與修剪空白。
for (const [id, equipmentId] of [['catalog-shoulder-press', 'barbell'], ['catalog-squat', 'barbell'], ['catalog-lat-pulldown', 'machine'], ['catalog-seated-row', 'machine'], ['catalog-leg-extension', 'machine']]) {
  const current = exercises.find(item => item.id === id);
  for (const name of [current.title, ` ${getLocalizedExercise(current, 'en').title} `]) {
    assert.equal(isLegacyRevisedCatalogRecord(exercise(id, { name, equipmentId })), false);
    assert.equal(isLegacyRevisedCatalogRecord(exercise(id, { name })), false);
  }
  assert.equal(isLegacyRevisedCatalogRecord(exercise(id, { equipmentId: 'dumbbell' })), true);
  assert.equal(isLegacyRevisedCatalogRecord(exercise(id, { name: '修訂前的名稱', equipmentId })), true);
}
assert.equal(isLegacyRevisedCatalogRecord(exercise('shoulder-flexion', { name: '舊名稱' })), false);

const mixed = manual('mixed', [exercise('shoulder-flexion'), exercise('catalog-leg-extension', { bodyArea: 'knee', equipmentId: 'machine' })], { cyclingMinutes: 10 });
assert.equal(purposeEntries(mixed, 'strength', 'shoulder').length, 0, '不同動作的部位與用途不可交叉湊出命中');
assert.equal(purposeEntries(mixed, 'strength', 'knee').length, 1);
assert.equal(purposeEntries(mixed, 'cardio').length, 1);
assert.equal(purposeEntries(mixed, 'cardio', 'knee').length, 0, '騎車不繼承同場次的部位');
assert.equal(recordDiscoveryEntries(mixed)[1].manualIndex, 1);
assert.equal(recordDiscoveryEntries(manual('snapshot', [exercise('shoulder-flexion', { bodyArea: 'hip' })]))[0].bodyArea, 'hip');

const log = { id: 'linked-cuff', date: '2026-09-19T10:00:00', completedAt: '2026-09-19T10:00:00', exerciseId: 'shoulder-external-rotation-band', exerciseTitle: '歷史肩袖', title: '歷史肩袖', bodyArea: 'shoulder', type: 'strength' };
const log2 = { ...log, id: 'linked-ytw', exerciseId: 'catalog-prone-ytw' };
const activity = { id: 'resistance', date: '2026-09-19', kind: 'resistance', exerciseLogIds: [log.id, log2.id] };
const cycling = { id: 'cycling', date: '2026-09-18', kind: 'cycling' };
const presentation = buildRecordsPresentation([log, log2], [activity, cycling], [], new Date('2026-09-20T23:00:00'), [mixed.workout]);
assert.equal(presentation.recentActivities.length, 3);
const filtered = filterRecordsDiscoveryDays(presentation.days, 'shoulder', 'rehab', [log, log2]);
assert.deepEqual(filtered.flatMap(day => day.items.map(item => item.id)).sort(), ['activity:resistance', 'manual:mixed'], 'linked logs 維持既有整場去重');
assert.equal(filtered[0].items.find(item => item.source === 'manual').workout, mixed.workout, '命中時保留完整 mixed 場次');
assert.equal(purposeEntries(presentation.recentActivities.find(item => item.source === 'activity'), 'rehab', 'all', [log, log2]).length, 2);
assert.equal(purposeEntries({ source: 'activity', activity: { ...activity, exerciseLogIds: [] } }, 'strength').length, 0, 'resistance 來源不推斷肌力');
assert.equal(purposeEntries({ source: 'activity', activity: { ...activity, exerciseLogIds: ['missing'] } }, 'unknown').length, 1);
const partialLinks = { source: 'activity', activity: { ...activity, exerciseLogIds: [log.id, 'missing', log.id, 'missing'] } };
assert.equal(recordDiscoveryEntries(partialLinks, [log]).length, 2, '重複 linked ID 不增加動作明細');
assert.deepEqual(purposeEntries(partialLinks, 'unknown', 'all', [log]).map(entry => entry.logId), ['missing'], '部分遺失 linked log 仍可由 unknown 找到');
assert.equal(purposeEntries(partialLinks, 'unknown', 'shoulder', [log]).length, 0, '失效連結不繼承其他動作部位');
assert.equal(purposeEntries({ source: 'training', log: { ...log, exerciseId: 'missing' } }, 'unknown').length, 1, 'training 來源不推斷復健');
assert.equal(purposeEntries({ source: 'training', log: { ...log, exerciseId: 'catalog-squat', exerciseTitle: '修訂前名稱' } }, 'unknown').length, 1);
assert.equal(purposeEntries({ source: 'activity', activity: cycling }, 'cardio').length, 1);

const days = Array.from({ length: 7 }, (_, index) => ({ date: `2026-09-${20 - index}`, items: [index < 5 ? { source: 'activity', activity: cycling } : cuff] }));
const snapshot = JSON.stringify({ days, presentation, log, log2, mixed });
assert.equal(filterRecordsDiscoveryDays(days, 'all', 'all', [log]), days);
assert.equal(filterRecordsDiscoveryDays(days, 'shoulder', 'rehab', [log]).slice(0, 5).length, 2, '先篩選再取五日可找到較舊紀錄');
assert.equal(filterRecordsDiscoveryDays(days, 'ankle', 'rehab', [log]).length, 0);
filterRecordsDiscoveryDays(presentation.days, 'all', 'cardio', [log, log2]);
assert.equal(JSON.stringify({ days, presentation, log, log2, mixed }), snapshot, '輸入、完整場次及既有 weekly 統計不變');
const futureManual = { ...cuff.workout, id: 'future-manual', date: '2099-01-01' };
const futureLog = { ...log, id: 'future-log', date: '2099-01-01T12:00:00', completedAt: '2099-01-01T12:00:00' };
const futureActivity = { ...cycling, id: 'future-cycle', date: '2099-01-01' };
const full = buildRecordsDiscoveryHistory([log, futureLog], [cycling, futureActivity, activity], [futureManual]);
assert.equal(full.some(item => item.id === 'manual:future-manual'), true, '完整歷史不隱藏 reader 接受的未來日期補記');
assert.equal(full.some(item => item.id === 'training:future-log'), true, '完整歷史不隱藏未來日期舊訓練');
assert.equal(full.some(item => item.id === 'activity:future-cycle'), true, '完整歷史不隱藏未來日期活動');
assert.equal(full.some(item => item.id === `training:${log.id}`), false, '完整歷史 linked log 仍去重');
assert.equal(full.filter(item => matchingRecordsDiscoveryEntries(item, 'all', 'rehab', [log, futureLog]).length).some(item => item.id === 'manual:future-manual'), true);
assert.equal(buildRecordsPresentation([futureLog], [futureActivity], [], new Date('2026-10-26'), [futureManual]).recentActivities.length, 0, '近期與統計的原日期排除規則維持');
console.log('Records discovery regression passed: 官方與次要用途、舊資料未知、同動作交集、linked 去重、五日前篩選、修訂辨識及資料統計不變。');
