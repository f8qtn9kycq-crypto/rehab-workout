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
