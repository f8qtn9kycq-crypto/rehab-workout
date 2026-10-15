import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolveMovementArtSource } from './movement-art-source.mjs';

export const sha256 = value => createHash('sha256').update(value).digest('hex');

export function auditMovementArt(manifest, baseline, read = path => readFileSync(path)) {
  const byId = new Map();
  for (const entry of manifest) for (const id of [entry.id, ...(entry.aliases ?? [])]) {
    assert(!byId.has(id), `Duplicate movement-art ID: ${id}`);
    byId.set(id, entry);
  }
  assert.equal(baseline.assets.length, 8, 'The approved style baseline must retain all eight references');
  assert.equal(sha256(read(baseline.sourceSheet)), baseline.sourceSheetSha256, 'The frozen style source sheet changed');
  for (const reference of baseline.assets) {
    assert.equal(byId.get(reference.catalogId)?.id, reference.id, `${reference.catalogId} is missing its original image mapping`);
    assert.equal(sha256(read(reference.path)), reference.sha256, `${reference.id} differs from the frozen approved style reference`);
  }
  for (const entry of manifest) {
    const image = read(`public/exercise-visuals/movements/${entry.id}.png`);
    assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${entry.id}: invalid PNG`);
    assert.equal(image.readUInt32BE(16), 320, `${entry.id}: wrong width`);
    assert.equal(image.readUInt32BE(20), 184, `${entry.id}: wrong height`);
    assert(read(resolveMovementArtSource(entry).path).length > 0, `${entry.id}: actual source is empty`);
  }
  return { references: baseline.assets.length, assets: manifest.length };
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  const manifest = JSON.parse(readFileSync('src/data/movementArtManifest.json'));
  const baseline = JSON.parse(readFileSync('docs/visual-qa/approved-style-baseline.json'));
  const result = auditMovementArt(manifest, baseline);
  console.log(`Movement-art integrity passed: ${result.references} frozen references; ${result.assets} images and sources. Style acceptance is NOT VERIFIED by this check.`);
}
