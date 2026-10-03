import manifest from './movementArtManifest.json';

export type MovementArtGroup = 'quick' | 'library';

export type MovementArt = {
  id: string;
  group: MovementArtGroup;
  src: string;
  width: number;
  height: number;
};

const sourceSizes = {
  'manual-workout-quick-line-art-v2.png': { width: 1774, height: 887 },
  'manual-workout-library-line-art-v2.png': { width: 1483, height: 1061 },
} as const;

const entries: MovementArt[] = manifest.map(entry => {
  const source = sourceSizes[entry.sheet as keyof typeof sourceSizes];
  return {
    id: entry.id,
    group: entry.group as MovementArtGroup,
    src: `/exercise-visuals/movements/${entry.id}.png`,
    width: entry.group === 'quick' ? 320 : Math.round(source.width / entry.columns),
    height: entry.group === 'quick' ? 320 : Math.round(source.height / entry.rows),
  };
});

const byId = new Map<string, MovementArt>();

manifest.forEach((entry, index) => {
  const art = entries[index];
  [entry.id, ...(entry.aliases ?? [])].forEach(id => {
    if (byId.has(id)) throw new Error(`Duplicate movement-art id or alias: ${id}`);
    byId.set(id, art);
  });
});

export function getMovementArt(id: string | undefined): MovementArt | undefined {
  return typeof id === 'string' ? byId.get(id) : undefined;
}

export function hasMovementArt(id: string | undefined): id is string {
  return getMovementArt(id) !== undefined;
}

export function hasMovementArtInGroup(id: string, group: MovementArtGroup): boolean {
  return getMovementArt(id)?.group === group;
}
