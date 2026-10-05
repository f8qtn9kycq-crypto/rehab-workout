import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolveMovementArtSource } from './movement-art-source.mjs';

const allEntries = JSON.parse(readFileSync('src/data/movementArtManifest.json', 'utf8'));
const idsIndex = process.argv.indexOf('--ids');
const requestedIds = idsIndex < 0 ? null : process.argv[idsIndex + 1]?.split(',');
if (idsIndex >= 0 && !requestedIds?.length) throw new Error('--ids requires comma-separated asset IDs');
if (requestedIds?.some(id => !allEntries.some(entry => entry.id === id))) throw new Error('Unknown movement-art ID');
const manifest = requestedIds ? allEntries.filter(entry => requestedIds.includes(entry.id)) : allEntries;
const outputDirectory = 'public/exercise-visuals/movements';
if (process.argv.includes('--list-sources')) {
  console.log(JSON.stringify(manifest.map(resolveMovementArtSource), null, 2));
  process.exit(0);
}
mkdirSync(outputDirectory, { recursive: true });

function normalizeOverride(entry) {
  const result = spawnSync('python3', ['scripts/normalize-movement-override.py',
    resolveMovementArtSource(entry).path, `${outputDirectory}/${entry.id}.png`], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || 'Override normalization requires Python 3 and Pillow');
}

// Targeted generated overrides work on Linux/macOS without re-encoding any
// unchanged sheet assets. Existing sheet extraction retains its native backend.
if (manifest.every(entry => resolveMovementArtSource(entry).backend === 'python')) {
  manifest.forEach(normalizeOverride);
  console.log(`Normalized ${manifest.length} targeted overrides`);
  process.exit(0);
}
if (process.platform !== 'darwin') {
  throw new Error('Sheet extraction requires macOS; use --ids for targeted generated overrides.');
}

const cropTool = join(tmpdir(), `rehab-crop-movement-art-${process.pid}`);
const compile = spawnSync('swiftc', ['scripts/crop-movement-art.swift', '-o', cropTool], { encoding: 'utf8' });
if (compile.status !== 0) throw new Error(compile.stderr || compile.stdout || 'Failed to compile movement-art crop tool');

const sourceSizes = {
  'manual-workout-quick-line-art-v2.png': { width: 1774, height: 887 },
  'manual-workout-library-line-art-v2.png': { width: 1060, height: 1484 },
};

const libraryGridGuides = {
  x: [12, 222, 428, 630, 841, 1046],
  y: [10, 213, 404, 594, 783, 978, 1183, 1405],
};

try {
for (const entry of manifest) {
  const source = resolveMovementArtSource(entry);
  if (source.backend === 'python') { normalizeOverride(entry); continue; }
  const output = `${outputDirectory}/${entry.id}.png`;
  if (source.kind === 'override') {
    const result = spawnSync(cropTool, [
      source.path, output, '0', '0', String(source.width), String(source.height), '296', '160', '320', '184',
    ], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Failed to extract ${entry.id}`);
    continue;
  }

  const size = sourceSizes[entry.sheet];
  if (!size) throw new Error(`Unknown source sheet: ${entry.sheet}`);
  const guideInset = 4;
  const x0 = entry.group === 'library'
    ? libraryGridGuides.x[entry.column] + guideInset
    : Math.round(entry.column * size.width / entry.columns);
  const x1 = entry.group === 'library'
    ? libraryGridGuides.x[entry.column + 1] - guideInset
    : Math.round((entry.column + 1) * size.width / entry.columns);
  const y0 = entry.group === 'library'
    ? libraryGridGuides.y[entry.row] + guideInset
    : Math.round(entry.row * size.height / entry.rows);
  const y1 = entry.group === 'library'
    ? libraryGridGuides.y[entry.row + 1] - guideInset
    : Math.round((entry.row + 1) * size.height / entry.rows);
  const result = spawnSync(cropTool, [
    source.path,
    output,
    String(x0), String(y0), String(x1 - x0), String(y1 - y0),
    '296', '160', '320', '184',
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Failed to extract ${entry.id}`);
}
} finally {
  rmSync(cropTool, { force: true });
}

console.log(`Generated ${manifest.length} movement images in ${outputDirectory}`);
