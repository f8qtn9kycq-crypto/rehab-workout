import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../public/calf-self-massage-guide.html', import.meta.url),
  'utf8',
);
const expectedIds = [
  'Ky7_Hhp6Me0',
  'T5FaG9OZnCk',
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
const expectedExerciseIds = [
  'ankle-gastrocnemius-stretch',
  'ankle-soleus-stretch',
  'ankle-seated-soleus-raise',
  'ankle-calf-raise',
];
const exerciseLinkPattern = /<a href="\/exercise\/([a-z0-9-]+)">查看完整動作<\/a>/g;
const linkedExerciseIds = [...source.matchAll(exerciseLinkPattern)].map((match) => match[1]);

assert.deepEqual(
  linkedIds,
  expectedIds,
  'standalone guide must keep the eight reviewed YouTube links in the approved order',
);
assert.equal(new Set(linkedIds).size, expectedIds.length, 'YouTube links must be unique');
assert.match(source, /Ky7_Hhp6Me0&amp;t=268s/);
assert.match(source, /Ky7_Hhp6Me0&amp;t=383s/);
assert.match(source, /T5FaG9OZnCk&amp;t=76s/);
assert.match(source, /T5FaG9OZnCk&amp;t=121s/);
assert.match(source, /T5FaG9OZnCk&amp;t=423s/);
assert.match(source, /2026-03-05 發布/);
assert.match(source, /2020-10-15 發布/);
assert.match(source, /7:00 後包含離心、平衡與跳繩等進階內容，不列為本頁日常舒緩步驟/);
assert.match(source, /不宣稱滾筒能解除組織沾黏/);
assert.match(source, /不要以疼痛或更大壓力作為有效標準/);
assert.match(source, /肩或手腕不適、無法穩定撐地者，改用本頁坐姿或徒手方法/);
assert.match(source, /其餘影片的完整內容、講者資格、動作劑量及與本頁操作的一致性均 NOT VERIFIED/);
assert.match(source, /影片不取代本頁的文字步驟、警訊與停止規則/);
assert.doesNotMatch(source, /<iframe\b/i, 'videos must not auto-load third-party iframes');

assert.match(source, /<title>小腿舒緩與訓練指南<\/title>/);
assert.match(source, /<a href="#relief-guide">查看徒手舒緩<\/a>/);
assert.match(source, /<a href="#training-options">查看活動度與肌力<\/a>/);
assert.deepEqual(
  linkedExerciseIds,
  expectedExerciseIds,
  'guide must reuse the approved calf mobility and strength exercise IDs',
);
assert.match(source, /點選開始訓練後，仍須完成 App 的安全確認/);

assert.match(source, /疼痛維持 0–3／10；若超過 3，停止當前按壓/);
assert.match(source, /若達 6／10 以上，停止並儘速尋求專業評估/);
assert.match(
  source,
  /若新出現單側腫脹、發熱、泛紅、變色，或休息疼痛不退，停止且不要再按摩，並儘快就醫/,
);
assert.match(source, /若同時突然喘不過氣、胸痛、咳血、心跳異常、頭暈或昏厥，立即撥打 119/);
assert.match(source, /用一到兩指的指腹從單側輕觸，不跨過或夾捏肌腱/);
assert.doesNotMatch(source, /用拇指與食指輕觸兩側肌肉/);
assert.match(
  source,
  /<desc id="figure-desc">示意圖標出腓腸肌、比目魚肌、阿基里斯腱與五個操作位置；灰色區塊代表不直接按壓的阿基里斯腱。<\/desc>/,
);

const tendonMatch = source.match(/<rect x="(\d+)" y="348" width="(\d+)" height="92"[^>]+fill="var\(--tendon\)"/);
const positionsMatch = source.match(/var positions = \[([^;]+)\];/);
assert.ok(tendonMatch, 'Achilles tendon geometry must remain explicit');
assert.ok(positionsMatch, 'massage marker positions must remain explicit');
const positions = JSON.parse(`[${positionsMatch[1]}]`);
const tendonLeft = Number(tendonMatch[1]);
const markerFiveX = positions[4][0];
const selectedRadius = 15;
const hitRadius = 24;
assert.ok(
  tendonLeft - markerFiveX > selectedRadius,
  'marker 5 selected dot must not touch the Achilles tendon',
);
assert.ok(
  tendonLeft - markerFiveX > hitRadius,
  'marker 5 tap target must not touch the Achilles tendon',
);

console.log('Calf guide regression passed: purpose paths, canonical exercises, video links, safety wording, and Achilles avoid-zone geometry are present.');

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
