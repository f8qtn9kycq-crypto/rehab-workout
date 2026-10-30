import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const temp = mkdtempSync(join(process.cwd(), '.exercise-taxonomy-'));
const originalWindow = globalThis.window;
try {
  const entry = join(temp, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ExercisesPage from '../src/pages/ExercisesPage';
export { exercises } from '../src/data/exercises';
export * from '../src/data/exercisePurposes';
export * from '../src/utils/exerciseTaxonomy';
export * from '../src/utils/exerciseDiscovery';
export const library = url => renderToStaticMarkup(<MemoryRouter initialEntries={[url]}><I18nProvider><ExercisesPage /></I18nProvider></MemoryRouter>);
`);
  const result = await build({ configFile: false, logLevel: 'silent', esbuild: { jsx: 'automatic' }, build: { ssr: entry, write: false } });
  const chunks = Array.isArray(result) ? result[0].output : result.output;
  const output = join(temp, 'entry.mjs'); writeFileSync(output, chunks.find(item => item.type === 'chunk').code);
  const api = await import(pathToFileURL(output));
  const { exercises, exercisePurposes, EMPTY_TAXONOMY, STRENGTH_GROUPS, LEG_PATTERNS, REHAB_FUNCTIONS, parseExerciseTaxonomy, matchesExerciseTaxonomy, matchesExerciseDiscovery } = api;
  const legacy = Object.keys(exercisePurposes).sort().map(id => { const info = exercisePurposes[id]; return [id, info.primaryPurpose, info.secondaryPurposes?.[0] ?? null, info.rehabGroup ?? null]; });
  assert.equal(legacy.length, 47);
  // b3e719a 的既有 primary／secondary／rehabGroup 契約，新增標籤不能重分類 C1。
  assert.equal(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'), 'bb9bac8c44ac5900dbdee75dfccbf103006bb32330510fb411a1219123ce9902');
  const ids = (purpose, filters = {}, query = '') => exercises.filter(exercise => matchesExerciseDiscovery(exercise, purpose, query) && matchesExerciseTaxonomy(exercise.id, purpose, { ...EMPTY_TAXONOMY, ...filters })).map(exercise => exercise.id);
  for (const exercise of exercises) {
    const info = exercisePurposes[exercise.id];
    for (const [key, allowed] of [['strengthGroups', STRENGTH_GROUPS], ['legPatterns', LEG_PATTERNS], ['rehabFunctions', REHAB_FUNCTIONS]]) {
      const labels = info[key] ?? []; assert.equal(new Set(labels).size, labels.length, exercise.id);
      assert(labels.every(label => allowed.includes(label)), `${exercise.id}/${key}`);
    }
    if (api.matchesExercisePurpose(exercise.id, 'strength')) assert(info.strengthGroups?.length, exercise.id);
    if (api.matchesExercisePurpose(exercise.id, 'rehab')) assert(info.rehabFunctions?.length, exercise.id);
    if (info.strengthGroups?.includes('legs')) assert(info.legPatterns?.length, exercise.id);
  }
  assert.equal(ids('all').length, 47); assert.equal(ids('rehab').length, 37); assert.equal(ids('strength').length, 27);
  assert.deepEqual(ids('strength', { strengthGroup: 'push' }).sort(), ['catalog-bench-press','catalog-shoulder-press','catalog-dip','shoulder-neck-serratus-wall-push'].sort());
  assert.deepEqual(ids('strength', { strengthGroup: 'core' }), ['glute-bridge']);
  assert.equal(ids('strength', { strengthGroup: 'legs' }).length, 15);
  assert.deepEqual(ids('strength', { strengthGroup: 'legs', legPattern: 'squat' }).sort(), ['hip-sit-to-stand','knee-wall-squat','catalog-side-squat','catalog-squat'].sort());
  assert.deepEqual(ids('strength', { strengthGroup: 'legs', legPattern: 'lunge' }), ['catalog-rear-foot-elevated-split-squat']);
  assert.deepEqual(ids('strength', { strengthGroup: 'legs', legPattern: 'hinge' }), [], '不把臀橋或分腿蹲硬塞為髖鉸鏈');
  assert.deepEqual(ids('rehab', { rehabFunction: 'care' }).sort(), ['neck-heat-relax','knee-rice-care'].sort());
  assert.deepEqual(ids('rehab', { rehabFunction: 'balance' }).sort(), ['ankle-single-leg-stand','ankle-single-leg-reach'].sort());
  assert(ids('rehab', { rehabFunction: 'strength' }).includes('neck-isometric'));
  assert(!ids('strength').includes('neck-isometric'), '復健肌力功能不擴張已確認的 Strength 用途');
  assert(ids('strength', { strengthGroup: 'other' }).includes('shoulder-external-rotation-band'));
  assert.equal(ids('strength', { strengthGroup: 'legs' }, 'external rotation').length, 0);
  assert.equal(ids('strength', { strengthGroup: 'legs' }, 'ＳＱＵＡＴ').length, 4);
  assert.deepEqual(parseExerciseTaxonomy(new URLSearchParams('group=legs&pattern=squat&function=care'), 'all'), EMPTY_TAXONOMY);
  assert.deepEqual(parseExerciseTaxonomy(new URLSearchParams('group=push&pattern=hinge&function=care'), 'strength'), { ...EMPTY_TAXONOMY, strengthGroup: 'push' });
  assert.deepEqual(parseExerciseTaxonomy(new URLSearchParams('group=__proto__&pattern=constructor&function=toString'), 'strength'), EMPTY_TAXONOMY);
  assert.equal(matchesExerciseTaxonomy('missing', 'rehab', { ...EMPTY_TAXONOMY, rehabFunction: 'other' }), true, '缺標籤有其他入口');
  assert.equal(matchesExerciseTaxonomy('constructor', 'strength', { ...EMPTY_TAXONOMY, strengthGroup: 'other' }), true);
  const snapshot = JSON.stringify({ exercises, exercisePurposes });
  let values;
  function seed(language, favorites = []) {
    values = new Map([['rehab.language.v1', language], ['rehab.trainingLogs.v2', '[]'], ['rehab.favoriteExercises.v1', JSON.stringify(favorites)]]);
    globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: () => { throw Error('分類 render 不寫入'); }, removeItem: () => { throw Error('分類 render 不移除'); } } };
  }
  for (const language of ['zh-TW', 'en']) {
    seed(language);
    const base = '/exercises?mode=all&bodyArea=all';
    for (const [params, count] of [['purpose=strength&group=push',4], ['purpose=strength&group=pull',5], ['purpose=strength&group=legs&pattern=squat',4], ['purpose=strength&group=core',1], ['purpose=rehab&function=balance',2], ['purpose=rehab&function=care',2], ['purpose=strength&group=legs&pattern=hinge',0], ['purpose=all&group=push&function=care',47]]) {
      const html = api.library(base + '&' + params);
      assert.equal((html.match(/<article\b/g) ?? []).length, count, `${language}/${params}`);
      if (count === 0) assert(html.includes(language === 'en' ? 'Clear purpose and search' : '清除用途與搜尋'));
      if (params.includes('purpose=rehab')) assert(html.includes(language === 'en' ? 'Rehab: function' : '復健：依功能找'));
    }
    const before = JSON.stringify([...values]);
    const intersection = api.library('/exercises?mode=all&purpose=rehab&bodyArea=ankle&function=balance&q=single');
    assert.equal((intersection.match(/<article\b/g) ?? []).length, 2);
    assert.equal(JSON.stringify([...values]), before, 'SSR不改storage bytes');
    seed(language, ['catalog-squat']);
    const favorites = api.library(base + '&purpose=strength&group=legs&pattern=squat&favorites=1');
    assert.equal((favorites.match(/<article\b/g) ?? []).length, 1);
    assert(favorites.includes('catalog-squat'));
  }
  assert.equal(JSON.stringify({ exercises, exercisePurposes }), snapshot, '分類操作不改 catalog／用途資料');
  console.log('Exercise taxonomy Pass: 47-ID legacy contract unchanged, explicit overlapping facets, same-source Library intersections, bilingual SSR, favorites/search/unknown and honest empty hinge.');
} finally { globalThis.window = originalWindow; rmSync(temp, { recursive: true, force: true }); }
