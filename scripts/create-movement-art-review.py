"""Create named QA contact sheets from final PNGs at measured CSS card sizes.

This composes evidence; it never changes runtime artwork or grants approval.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('--mobile-results', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
baseline = json.loads(Path('docs/visual-qa/approved-style-baseline.json').read_text())
manifest = json.loads(Path('src/data/movementArtManifest.json').read_text())
mobile = json.loads(Path(args.mobile_results).read_text())
output = Path(args.output)
output.mkdir(parents=True, exist_ok=True)
digest = lambda data: hashlib.sha256(data).hexdigest()
references = baseline['assets']
for asset in references:
    if digest(Path(asset['path']).read_bytes()) != asset['sha256']:
        raise ValueError(f"Frozen reference changed: {asset['id']}")
candidates = []
for entry in manifest:
    path = f"public/exercise-visuals/movements/{entry['id']}.png"
    before = subprocess.run(['git', 'show', f"{baseline['referenceCommit']}:{path}"], capture_output=True)
    current = Path(path).read_bytes()
    if before.returncode or current != before.stdout:
        candidates.append({'id': entry['id'], 'path': path, 'sha256': digest(current)})

def measured_width(asset, viewport):
    observations = [row for row in mobile['results'] if row['id'] == asset['id']
                    and row['viewport'] == viewport and row['surface'] in ('quick-picker', 'more-picker')]
    if len(observations) != 1:
        raise ValueError(f"Need one current picker measurement: {asset['id']} at {viewport}px")
    observation = observations[0]
    # Require evidence bound to the same actual runtime bytes.
    expected_sha = digest(Path(asset['runtimePath']).read_bytes()) if asset.get('runtimePath') else asset['sha256']
    if observation.get('sha256') != expected_sha:
        raise ValueError(f"Stale or unbound mobile evidence: {asset['id']}")
    return round(observation['width'])

def render(viewport=None):
    all_assets = references + candidates
    widths = [320 if viewport is None else measured_width(asset, viewport) for asset in all_assets]
    cell_width = max(widths) + 16
    cell_height = round(max(widths) * 23 / 40) + 50
    rows = math.ceil(len(references) / 4) + math.ceil(len(candidates) / 4)
    canvas = Image.new('RGB', (cell_width * 4, rows * cell_height + 72), 'white')
    draw = ImageDraw.Draw(canvas)
    offset = 0
    for title, assets in [('User-approved style references', references), ('Changed candidates: visual acceptance pending', candidates)]:
        draw.text((8, offset + 8), title, fill='black')
        offset += 32
        for index, asset in enumerate(assets):
            x, y = index % 4 * cell_width + 8, offset + index // 4 * cell_height
            draw.text((x, y), asset['id'], fill='black')
            width = 320 if viewport is None else measured_width(asset, viewport)
            with Image.open(asset['path']) as image:
                image = image.convert('RGB').resize((width, round(width * 23 / 40)), Image.Resampling.LANCZOS)
                canvas.paste(image, (x, y + 22))
        offset += math.ceil(len(assets) / 4) * cell_height
    filename = 'comparison-native.png' if viewport is None else f'comparison-mobile-{viewport}.png'
    canvas.save(output / filename)

render()
for viewport in (390, 375, 320):
    render(viewport)
(output / 'comparison-key.json').write_text(json.dumps({
    'referenceCommit': baseline['referenceCommit'], 'approvalScope': baseline['approvalScope'],
    'mobileMeasurements': args.mobile_results, 'mobileMeasurementsSha256': digest(Path(args.mobile_results).read_bytes()),
    'references': references, 'candidates': candidates,
    'status': 'Named comparison only; style NOT VERIFIED; not independent blind screening',
}, indent=2) + '\n')
print(f'Prepared 8 frozen references and {len(candidates)} candidates at native and measured 390/375/320px card sizes.')
