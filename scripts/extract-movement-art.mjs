import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

if (process.platform !== 'darwin') {
  throw new Error('Movement-art extraction requires macOS sips; generated assets are committed for other environments.');
}

const manifest = JSON.parse(readFileSync('src/data/movementArtManifest.json', 'utf8'));
const sourceDirectory = 'scripts/assets/movement-art-sources';
const outputDirectory = 'public/exercise-visuals/movements';
mkdirSync(outputDirectory, { recursive: true });

const cropTool = join(tmpdir(), `rehab-crop-movement-art-${process.pid}`);
const compile = spawnSync('swiftc', ['scripts/crop-movement-art.swift', '-o', cropTool], { encoding: 'utf8' });
if (compile.status !== 0) throw new Error(compile.stderr || compile.stdout || 'Failed to compile movement-art crop tool');

const sourceSizes = {
  'manual-workout-quick-line-art-v2.png': { width: 1774, height: 887 },
  'manual-workout-library-line-art-v2.png': { width: 1060, height: 1484 },
};

// Reviewed illustration contract: complete standing figures use an adult 1:7
// head-to-body ratio; neck-focused movements use a consistent crown-to-waist
// crop without enlarging the head relative to that implied full-body template.
const reviewedAnatomy = {
  fullBodyHeadRatio: '1:7',
  neckCrop: 'crown-to-waist',
};

const libraryGridGuides = {
  x: [12, 222, 428, 630, 841, 1046],
  y: [10, 213, 404, 594, 783, 978, 1183, 1405],
};

const movementOverrides = {
  'glute-bridge': { path: `${sourceDirectory}/overrides/glute-bridge.png`, width: 1254, height: 1254 },
  'neck-rotation-stretch': { path: `${sourceDirectory}/overrides/neck-rotation-stretch.png`, width: 1254, height: 1254 },
};

try {
for (const entry of manifest) {
  const override = movementOverrides[entry.id];
  const output = `${outputDirectory}/${entry.id}.png`;
  if (override) {
    const result = spawnSync(cropTool, [
      override.path, output, '0', '0', String(override.width), String(override.height), '296', '320',
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
    `${sourceDirectory}/${entry.sheet}`,
    output,
    String(x0), String(y0), String(x1 - x0), String(y1 - y0),
    '296', '320',
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Failed to extract ${entry.id}`);
}
} finally {
  rmSync(cropTool, { force: true });
}

console.log(`Generated ${manifest.length} movement images in ${outputDirectory}`);
