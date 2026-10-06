const directory = 'scripts/assets/movement-art-sources';
const legacyOverrides = {
  'glute-bridge': { file: 'overrides/glute-bridge.png', width: 1293, height: 650 },
  'neck-rotation-stretch': { file: 'overrides/neck-rotation-stretch.png', width: 1254, height: 1254 },
};

// Shared by extraction, source inspection and QA. Manifest overrides take priority.
export function resolveMovementArtSource(entry) {
  if (entry.overrideSource) return { id: entry.id, kind: 'override', backend: 'python', path: `${directory}/${entry.overrideSource}` };
  const legacy = legacyOverrides[entry.id];
  if (legacy) return { id: entry.id, kind: 'override', backend: 'swift', path: `${directory}/${legacy.file}`, width: legacy.width, height: legacy.height };
  return { id: entry.id, kind: 'sheet', backend: 'swift', path: `${directory}/${entry.sheet}` };
}
