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
