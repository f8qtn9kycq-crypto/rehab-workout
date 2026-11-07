import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../public/calf-self-massage-guide.html', import.meta.url),
  'utf8',
);
const expectedIds = [
  'jUuksM7zUU4',
  'psL-JcDp4WA',
  '-2wXrK76WxQ',
  'Vwct0Y56JWo',
  'KnaeyPgOtTI',
  'bAT4Fw0-iXw',
];
const linkPattern =
  /<a href="https:\/\/www\.youtube\.com\/(?:watch\?v=|shorts\/)([A-Za-z0-9_-]{11})" target="_blank" rel="noopener noreferrer">/g;
const linkedIds = [...source.matchAll(linkPattern)].map((match) => match[1]);

assert.deepEqual(
  linkedIds,
  expectedIds,
  'standalone guide must keep the six reviewed YouTube links in the approved order',
);
assert.equal(new Set(linkedIds).size, expectedIds.length, 'YouTube links must be unique');
assert.match(source, /完整內容、講者資格、動作劑量及與本頁操作的一致性均 NOT VERIFIED/);
assert.match(source, /影片不取代本頁的警訊與停止規則/);
assert.doesNotMatch(source, /<iframe\b/i, 'videos must not auto-load third-party iframes');

console.log('Calf guide video regression passed: six unique links and safety disclosure are present.');

if (process.argv.includes('--online')) {
  const results = await Promise.all(
    expectedIds.map(async (id) => {
      const watchUrl = `https://www.youtube.com/watch?v=${id}`;
      const endpoint = new URL('https://www.youtube.com/oembed');
      endpoint.searchParams.set('url', watchUrl);
      endpoint.searchParams.set('format', 'json');
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(10_000) });

      if (!response.ok) {
        throw new Error(`${id}: YouTube oEmbed returned HTTP ${response.status}`);
      }

      const metadata = await response.json();
      assert.equal(typeof metadata.title, 'string', `${id}: missing title`);
      assert.ok(metadata.title.trim(), `${id}: empty title`);
      assert.equal(typeof metadata.author_name, 'string', `${id}: missing channel name`);
      assert.ok(metadata.author_name.trim(), `${id}: empty channel name`);
      return `${id}: ${metadata.title} — ${metadata.author_name}`;
    }),
  );

  console.log('YouTube online availability passed via official oEmbed:');
  for (const result of results) console.log(`- ${result}`);
}
