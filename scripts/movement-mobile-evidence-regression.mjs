// 合成 fixture 僅測試證據檢查器，不是實際 mobile observations。
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { mobileSurfaces, mobileViewports, validateMobileEvidence } from './audit-movement-mobile-evidence.mjs';

const headSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const assets = JSON.parse(readFileSync('src/data/movementArtManifest.json')).map(({ id }) => ({ id,
  sha256: createHash('sha256').update(readFileSync(`public/exercise-visuals/movements/${id}.png`)).digest('hex'),
}));
assert.equal(assets.length, 43);
const fixture = { kind: 'browser-observations', headSha, capture: { tool: 'synthetic-regression-fixture', at: '2026-10-07T01:00:00+08:00' },
  results: assets.flatMap(asset => mobileSurfaces.flatMap(surface => mobileViewports.map(viewport => ({
    id: asset.id, sha256: asset.sha256, src: `/exercise-visuals/movements/${asset.id}.png`, surface, viewport,
    observedViewportWidth: viewport, dpr: 3, loaded: true, naturalWidth: 320, naturalHeight: 184,
    width: viewport - 48, height: (viewport - 48) * 23 / 40, horizontalOverflow: false, clipped: false,
  })))),
};
const options = { headSha, assets };
assert.deepEqual(validateMobileEvidence(fixture, options), { count: 516, assets: 43, dpr: 3 });
for (const [name, mutate, message] of [
  ['stale head', e => { e.headSha = '0'.repeat(40); }, /head SHA/],
  ['missing observation', e => e.results.pop(), /不完整/],
  ['duplicate observation', e => { e.results[1] = e.results[0]; }, /重複/],
  ['unknown ID', e => { e.results[0].id = 'unknown'; }, /非預期/],
  ['wrong surface', e => { e.results[0].surface = 'demo'; }, /非預期/],
  ['stale image', e => { e.results[0].sha256 = '0'.repeat(64); }, /hash/],
  ['wrong source', e => { e.results[0].src = '/old.png'; }, /canonical/],
  ['desktop width', e => { e.results[0].observedViewportWidth = 1280; }, /實際寬度/],
  ['DPR1', e => { e.results[0].dpr = 1; }, /DPR/],
  ['unloaded', e => { e.results[0].loaded = false; }, /未載入/],
  ['wrong natural size', e => { e.results[0].naturalHeight = 183; }, /尺寸/],
  ['overflow', e => { e.results[0].horizontalOverflow = true; }, /溢位/],
  ['unobserved clipping', e => { delete e.results[0].clipped; }, /裁切/],
  ['wrong ratio', e => { e.results[0].height = 100; }, /比例/],
  ['missing provenance', e => { delete e.capture; }, /工具與時間/],
]) {
  const invalid = structuredClone(fixture); mutate(invalid);
  assert.throws(() => validateMobileEvidence(invalid, options), message, name);
}
console.log('證據檢查器回歸通過：完整矩陣與15種失敗條件；合成fixture不授予實際手機Pass。');
