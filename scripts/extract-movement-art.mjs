import { mkdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

if (process.platform !== 'darwin') {
  throw new Error('Movement-art extraction requires macOS sips; generated assets are committed for other environments.');
}

const manifest = JSON.parse(readFileSync('src/data/movementArtManifest.json', 'utf8'));
const sourceDirectory = 'scripts/assets/movement-art-sources';
const outputDirectory = 'public/exercise-visuals/movements';
mkdirSync(outputDirectory, { recursive: true });

const sourceSizes = {
  'manual-workout-quick-line-art-v2.png': { width: 1774, height: 887 },
  'manual-workout-library-line-art-v2.png': { width: 1483, height: 1061 },
};

for (const entry of manifest) {
  const size = sourceSizes[entry.sheet];
  if (!size) throw new Error(`Unknown source sheet: ${entry.sheet}`);
  const x0 = Math.round(entry.column * size.width / entry.columns);
  const x1 = Math.round((entry.column + 1) * size.width / entry.columns);
  const y0 = Math.round(entry.row * size.height / entry.rows);
  const y1 = Math.round((entry.row + 1) * size.height / entry.rows);
  const offset = value => value === 0 ? '0.001' : String(value);
  const result = spawnSync('sips', [
    '--cropOffset', offset(y0), offset(x0),
    '--cropToHeightWidth', String(y1 - y0), String(x1 - x0),
    `${sourceDirectory}/${entry.sheet}`,
    '--out', `${outputDirectory}/${entry.id}.png`,
  ], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || `Failed to extract ${entry.id}`);

  if (entry.group === 'quick') {
    const output = `${outputDirectory}/${entry.id}.png`;
    const resize = spawnSync('sips', ['--resampleHeightWidthMax', '320', output, '--out', output], { encoding: 'utf8' });
    if (resize.status !== 0) throw new Error(resize.stderr || resize.stdout || `Failed to resize ${entry.id}`);
  }
}

console.log(`Generated ${manifest.length} movement images in ${outputDirectory}`);
