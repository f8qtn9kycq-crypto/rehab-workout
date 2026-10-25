import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const temporary = mkdtempSync(join(process.cwd(), '.exercise-discovery-'));
const originalWindow = globalThis.window;
try {
  const entry = join(temporary, 'entry.tsx');
  writeFileSync(entry, `
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../src/services/i18n';
import ExercisesPage from '../src/pages/ExercisesPage';
export { exercises } from '../src/data/exercises';
export { exercisePurposes } from '../src/data/exercisePurposes';
export * from '../src/utils/exerciseDiscovery';
export { getRecommendedExercises } from '../src/utils/recommendationEngine';
export function library(url) { return renderToStaticMarkup(<MemoryRouter initialEntries={[url]}><I18nProvider><ExercisesPage /></I18nProvider></MemoryRouter>); }
`);
  const result = await build({ configFile: false, logLevel: 'silent', esbuild: { jsx: 'automatic' }, build: { ssr: entry, write: false } });
  const chunks = Array.isArray(result) ? result[0].output : result.output;
  const compiled = join(temporary, 'entry.mjs');
  writeFileSync(compiled, chunks.find(item => item.type === 'chunk').code);
  const api = await import(pathToFileURL(compiled));
  const { exercises, exercisePurposes, matchesExerciseDiscovery, matchesExercisePurpose, getExercisePurposeInfo, parseExercisePurpose } = api;
  assert.deepEqual(Object.keys(exercisePurposes).sort(), exercises.map(item => item.id).sort(), 'every canonical ID has exactly one curated mapping');
  for (const [id, info] of Object.entries(exercisePurposes)) {
    assert(['rehab', 'strength'].includes(info.primaryPurpose), id);
    assert.equal(new Set([info.primaryPurpose, ...(info.secondaryPurposes ?? [])]).size, 1 + (info.secondaryPurposes?.length ?? 0), id);
  }
  assert.equal(getExercisePurposeInfo('missing-id'), undefined);
  assert.equal(getExercisePurposeInfo('__proto__'), undefined);
  assert.equal(matchesExercisePurpose('custom-private', 'rehab'), false, 'legacy kind is not a purpose');
  for (const value of [null, '', 'mobility', 'invalid']) assert.equal(parseExercisePurpose(value), 'all');
  assert.equal(parseExercisePurpose('strength'), 'strength');
  assert.equal(getExercisePurposeInfo('shoulder-external-rotation-band').primaryPurpose, 'rehab', 'movement type strength is not purpose');
  assert(matchesExercisePurpose('catalog-prone-ytw', 'rehab') && matchesExercisePurpose('catalog-prone-ytw', 'strength'));
  assert.equal(getExercisePurposeInfo('catalog-worlds-greatest-stretch').rehabGroup, 'mobility');
  assert.deepEqual(Object.entries(exercisePurposes).filter(([, value]) => value.rehabGroup === 'care').map(([id]) => id).sort(), ['knee-rice-care', 'neck-heat-relax']);
  const snapshot = JSON.stringify(exercises);
  const ids = (purpose, query = '') => exercises.filter(item => matchesExerciseDiscovery(item, purpose, query)).map(item => item.id);
  assert.equal(ids('all').length, 47);
  assert.equal(ids('rehab').length, 37);
  assert.equal(ids('strength').length, 27);
  assert(ids('rehab', 'external rotation').includes('shoulder-external-rotation-band'));
  assert(ids('rehab', '肩關節外旋').includes('shoulder-external-rotation-band'));
  assert(ids('strength', 'ＳＱＵＡＴ').includes('catalog-squat'), 'NFKC search');
  assert.equal(ids('rehab', 'bench press').length, 0, 'purpose and name intersect');
  assert.equal(JSON.stringify(exercises), snapshot, 'discovery never mutates canonical content');

  let values;
  function seed(language, assessment = null, favorites = []) {
    values = new Map([['rehab.language.v1', language], ['rehab.trainingLogs.v2', '[]'], ['rehab.favoriteExercises.v1', JSON.stringify(favorites)]]);
    if (assessment) values.set('rehab.assessment.v1', JSON.stringify(assessment));
    globalThis.window = { localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: () => { throw Error('discovery must not write storage'); },
      removeItem: () => { throw Error('discovery must not remove storage'); },
    } };
  }
  function renderedIds(url) {
    const before = JSON.stringify([...values]);
    const html = api.library(url);
    assert.equal(JSON.stringify([...values]), before);
    const links = [...html.matchAll(/href="\/exercise\/([^?/#"]+)/g)].map(match => match[1]);
    const unique = [...new Set(links)];
    for (const id of unique) assert.equal(links.filter(value => value === id).length, 2, `one card with two detail/record links: ${id}`);
    return { html, ids: unique };
  }
  for (const language of ['zh-TW', 'en']) {
    seed(language);
    assert.deepEqual(renderedIds('/exercises?mode=all').ids.sort(), ids('all').sort());
    const rehab = renderedIds('/exercises?mode=all&purpose=rehab');
    assert.deepEqual(rehab.ids.sort(), ids('rehab').sort());
    assert(rehab.html.includes(language === 'en' ? 'Care and relaxation' : '照護與放鬆'));
    assert(rehab.html.includes('aria-pressed="true"'));
    assert.deepEqual(renderedIds('/exercises?mode=all&purpose=strength&q=squat').ids.sort(), ids('strength', 'squat').sort());
    const empty = renderedIds('/exercises?mode=all&purpose=rehab&q=bench%20press');
    assert.equal(empty.ids.length, 0);
    assert(empty.html.includes(language === 'en' ? 'Clear purpose and search' : '清除用途與搜尋'));
    const invalid = renderedIds('/exercises?mode=all&purpose=invalid');
    assert.equal(invalid.ids.length, 47);
    seed(language, null, ['catalog-prone-ytw', 'catalog-bench-press']);
    assert.deepEqual(renderedIds('/exercises?mode=all&purpose=rehab&favorites=1').ids, ['catalog-prone-ytw']);

    const assessment = { bodyArea: 'shoulder', mode: 'beginner', pain: 1, equipment: ['bodyweight'] };
    seed(language, assessment);
    assert.equal(renderedIds('/exercises?mode=all&bodyArea=all').ids.length, 47, 'explicit all areas overrides browsing default without changing assessment');
    const filters = { mode: 'recommended', bodyArea: 'shoulder', type: 'all', level: 'all', equipment: [], noEquipmentOnly: false, duration: 'all', painSensitive: false };
    const recommended = api.getRecommendedExercises(exercises, filters, { assessment, assessmentEquipment: ['bodyweight'], logs: [] });
    const recommendedAllAreas = renderedIds('/exercises?bodyArea=all');
    assert.deepEqual(recommendedAllAreas.ids, recommended.map(item => item.id), 'all areas in recommended scope still uses the assessment area');
    assert(!recommendedAllAreas.html.includes(language === 'en' ? '>All body areas</button>' : '>全部部位</button>'), 'recommended scope must not offer an ineffective all-body control');
    const recommendedStrength = renderedIds('/exercises?purpose=strength').ids;
    assert.deepEqual(recommendedStrength, recommended.filter(item => matchesExerciseDiscovery(item, 'strength', '')).map(item => item.id), 'purpose only narrows the original recommendation order');
    assert(recommendedStrength.every(id => !exercises.find(item => item.id === id).catalogOnly), 'catalog-only cannot leak through purpose');
    seed(language, { ...assessment, pain: 6 });
    assert.equal(renderedIds('/exercises?purpose=strength').ids.length, 0);
  }
  console.log('Exercise discovery Pass: 47 curated IDs, dual-purpose overlap, care/mobility, bilingual name search, actual Library SSR intersections, deduplication, unchanged recommendation order/eligibility, pain stop and storage bytes.');
} finally {
  globalThis.window = originalWindow;
  rmSync(temporary, { recursive: true, force: true });
}
