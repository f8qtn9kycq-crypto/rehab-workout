import manifest from './movementArtManifest.json';

export type MovementArtGroup = 'quick' | 'library';

export type MovementArt = {
  id: string;
  group: MovementArtGroup;
  src: string;
  width: number;
  height: number;
};

const entries: MovementArt[] = manifest.map(entry => {
  return {
    id: entry.id,
    group: entry.group as MovementArtGroup,
    src: `/exercise-visuals/movements/${entry.id}.png`,
    width: 320,
    height: 184,
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
