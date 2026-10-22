"""Mechanically frame generated two-panel sources; never redraw their anatomy.

Requires Python 3 and Pillow (see movement-art-requirements.txt).
"""
import json
import math
import sys
import os
import tempfile
import struct
import zlib
from pathlib import Path
from PIL import Image, ImageDraw


def deterministic_png(image):
    """RGB/filter-zero PNG with stored DEFLATE blocks, independent of zlib version."""
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    pixels = image.tobytes()
    stride = image.width * 3
    raw = b''.join(b'\x00' + pixels[i:i + stride] for i in range(0, len(pixels), stride))
    blocks = []
    for offset in range(0, len(raw), 65535):
        block = raw[offset:offset + 65535]
        final = offset + len(block) == len(raw)
        blocks.append(bytes([int(final)]) + struct.pack('<HH', len(block), len(block) ^ 65535) + block)
    stream = b'\x78\x01' + b''.join(blocks) + struct.pack('>I', zlib.adler32(raw))
    header = struct.pack('>IIBBBBB', image.width, image.height, 8, 2, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', stream) + chunk(b'IEND', b'')


def normalize(source_path, output_path):
    source = Image.open(source_path).convert('RGB')
    width, height = source.size
    middle = width // 2
    inset = max(2, width // 100)
    phases = [source.crop((0, 0, middle - inset, height)),
              source.crop((middle + inset, 0, width, height))]
    layout_path = Path(source_path).with_suffix('.layout.json')
    layout = json.loads(layout_path.read_text()) if layout_path.exists() else {}
    phase_count = layout.get('phaseCount', 2)
    if type(phase_count) is not int or phase_count not in (1, 2):
        raise ValueError('phaseCount must be 1 or 2')
    phases = phases[:phase_count]
    bounds = []
    for phase in phases:
        mask = phase.convert('L').point(lambda p: 255 if p < 184 else 0)
        box = mask.getbbox()
        if box is None:
            raise ValueError('Each phase must contain visible dark artwork')
        bounds.append(box)
    # One common scale preserves paired anatomy. Complete props count as ink.
    top, bottom = min(b[1] for b in bounds), max(b[3] for b in bounds)
    max_width, max_height = layout.get('maxWidth', 136), layout.get('maxHeight', 148)
    if not all(isinstance(v, (int, float)) and not isinstance(v, bool)
               and math.isfinite(v) and 0 < v <= limit
               for v, limit in ((max_width, 136), (max_height, 148))):
        raise ValueError('Framing limits must fit the shared content area')
    scale = min(max_width / max(b[2] - b[0] for b in bounds), max_height / (bottom - top))
    canvas = Image.new('RGB', (320, 184), 'white')
    for center, phase, box in zip((160,) if phase_count == 1 else (80, 240), phases, bounds):
        crop = phase.crop((box[0], top, box[2], bottom))
        size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
        crop = crop.resize(size, Image.Resampling.LANCZOS)
        canvas.paste(crop, (round(center - crop.width / 2), round(92 - crop.height / 2)))
    if phase_count == 2:
        ImageDraw.Draw(canvas).line((160, 12, 160, 171), fill=(212, 212, 212), width=1)
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    # Readers must never observe a half-written/empty output.
    with tempfile.NamedTemporaryFile(dir=Path(output_path).parent, suffix='.png', delete=False) as temp:
        temporary = temp.name
    try:
        if layout_path.exists():
            Path(temporary).write_bytes(deterministic_png(canvas))
        else:
            canvas.save(temporary, optimize=True)
        os.replace(temporary, output_path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('usage: normalize-movement-override.py <source> <output>')
    normalize(*sys.argv[1:])
