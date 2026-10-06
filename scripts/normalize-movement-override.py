"""Mechanically frame generated two-panel sources; never redraw their anatomy.

Requires Python 3 and Pillow (see movement-art-requirements.txt).
"""
import json
import math
import sys
import os
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw


def normalize(source_path, output_path):
    source = Image.open(source_path).convert('RGB')
    width, height = source.size
    middle = width // 2
    inset = max(2, width // 100)
    phases = [source.crop((0, 0, middle - inset, height)),
              source.crop((middle + inset, 0, width, height))]
    bounds = []
    for phase in phases:
        mask = phase.convert('L').point(lambda p: 255 if p < 184 else 0)
        box = mask.getbbox()
        if box is None:
            raise ValueError('Each phase must contain visible dark artwork')
        bounds.append(box)
    # One common scale preserves paired anatomy. Complete props count as ink.
    top, bottom = min(b[1] for b in bounds), max(b[3] for b in bounds)
    layout_path = Path(source_path).with_suffix('.layout.json')
    layout = json.loads(layout_path.read_text()) if layout_path.exists() else {}
    max_width, max_height = layout.get('maxWidth', 136), layout.get('maxHeight', 148)
    if not all(isinstance(v, (int, float)) and not isinstance(v, bool)
               and math.isfinite(v) and 0 < v <= limit
               for v, limit in ((max_width, 136), (max_height, 148))):
        raise ValueError('Framing limits must fit the shared content area')
    scale = min(max_width / max(b[2] - b[0] for b in bounds), max_height / (bottom - top))
    canvas = Image.new('RGB', (320, 184), 'white')
    for center, phase, box in zip((80, 240), phases, bounds):
        crop = phase.crop((box[0], top, box[2], bottom))
        size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
        crop = crop.resize(size, Image.Resampling.LANCZOS)
        canvas.paste(crop, (round(center - crop.width / 2), round(92 - crop.height / 2)))
    ImageDraw.Draw(canvas).line((160, 12, 160, 171), fill=(212, 212, 212), width=1)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    # Readers must never observe a half-written/empty output.
    with tempfile.NamedTemporaryFile(dir=Path(output_path).parent, suffix='.png', delete=False) as temp:
        temporary = temp.name
    try:
        canvas.save(temporary, optimize=True)
        os.replace(temporary, output_path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: normalize-movement-override.py <source> <output>')
    normalize(*sys.argv[1:])
