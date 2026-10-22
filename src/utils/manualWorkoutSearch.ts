/** Search recorded and canonical names without changing exercise identity. */
export function matchesManualExercise(query: string, names: string[]): boolean {
  const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().trim();
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  const text = names.map(normalize).join(' ');
  return tokens.every(token => text.includes(token));
}
