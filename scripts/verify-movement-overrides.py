"""Regenerate the extractor's effective Python sources in a temporary directory."""
import json
import subprocess
import tempfile
import sys
from pathlib import Path
from PIL import Image
from importlib.util import module_from_spec, spec_from_file_location

sys.dont_write_bytecode = True

spec = spec_from_file_location('normalizer', Path(__file__).with_name('normalize-movement-override.py'))
normalizer = module_from_spec(spec)
spec.loader.exec_module(normalizer)
sources = json.loads(subprocess.check_output(['node', 'scripts/extract-movement-art.mjs', '--list-sources']))
count = 0
with tempfile.TemporaryDirectory(prefix='movement-art-verify-') as temporary:
    for source in sources:
        runtime = Path('public/exercise-visuals/movements') / (source['id'] + '.png')
        with Image.open(runtime) as image:
            image.load()
            assert image.size == (320, 184), f"Invalid dimensions: {source['id']}"
        if source['backend'] != 'python':
            continue
        candidate = Path(temporary) / runtime.name
        normalizer.normalize(source['path'], candidate)
        assert candidate.read_bytes() == runtime.read_bytes(), f"Effective source does not reproduce runtime: {source['id']}"
        count += 1
print(f'{count} effective overrides reproduce byte-for-byte; all PNGs decode. Anatomy/style acceptance is not inferred.')

# A malformed framing sidecar must fail instead of silently enlarging artwork.
with tempfile.TemporaryDirectory(prefix='movement-frame-negative-') as temporary:
    source = Path(temporary) / 'fixture.png'
    source.write_bytes(Path(next(row['path'] for row in sources if row['backend'] == 'python')).read_bytes())
    for value in (0, -1, 137, True, 'large'):
        source.with_suffix('.layout.json').write_text(json.dumps({'maxWidth': value}))
        try:
            normalizer.normalize(source, Path(temporary) / 'out.png')
        except ValueError:
            pass
        else:
            raise AssertionError(f'Invalid framing accepted: {value}')
print('Invalid per-source framing limits rejected.')

# Single held poses retain the left phase at the same scale, centered without a divider.
with tempfile.TemporaryDirectory(prefix='movement-single-pose-') as temporary:
    source = Path(temporary) / 'fixture.png'
    fixture = Image.new('RGB', (640, 368), 'white')
    from PIL import ImageDraw
    drawing = ImageDraw.Draw(fixture)
    drawing.rectangle((60, 40, 120, 280), fill='black')
    drawing.rectangle((380, 40, 440, 280), fill='red')
    fixture.save(source)
    source.with_suffix('.layout.json').write_text(json.dumps({'phaseCount': 1, 'maxWidth': 100, 'maxHeight': 120}))
    out = Path(temporary) / 'out.png'
    normalizer.normalize(source, out)
    image = Image.open(out).convert('RGB')
    ink = image.convert('L').point(lambda p: 255 if p < 184 else 0).getbbox()
    assert abs((ink[0] + ink[2]) / 2 - 160) <= 1 and ink[3] - ink[1] == 120
    assert image.getpixel((160, 12)) == (255, 255, 255), 'Single pose must not have a divider'
    assert not any(r > g + 30 for r, g, b in image.getdata()), 'Duplicate right phase must be removed'
    for value in (0, 3, True, '1', 1.0):
        source.with_suffix('.layout.json').write_text(json.dumps({'phaseCount': value}))
        try:
            normalizer.normalize(source, out)
        except ValueError:
            pass
        else:
            raise AssertionError(f'Invalid phase count accepted: {value}')
print('Single-pose framing, duplicate removal and invalid phase counts verified.')
