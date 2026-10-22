// 離線檢查證據契約；不操作瀏覽器、不產生觀察，也不授予風格／安全 Pass。
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const mobileSurfaces = ['picker', 'selected', 'records', 'library'];
export const mobileViewports = [390, 375, 320];

export function validateMobileEvidence(evidence, { headSha, assets }) {
  const fail = message => { throw new Error(message); };
  if (!/^[a-f0-9]{40}$/.test(headSha)) fail('需要完整的預期 head SHA');
  if (evidence?.headSha !== headSha) fail('證據 head SHA 過期或缺漏');
  if (evidence.kind !== 'browser-observations') fail('必須提供實際瀏覽器觀察格式');
  if (!evidence.capture?.tool || !Number.isFinite(Date.parse(evidence.capture?.at))) fail('缺少可歸屬的工具與時間');
  if (!Array.isArray(evidence.results)) fail('缺少 results');
  const expected = new Map();
  for (const asset of assets) for (const surface of mobileSurfaces) for (const viewport of mobileViewports) {
    expected.set(`${asset.id}/${surface}/${viewport}`, asset);
  }
  const seen = new Set();
  for (const row of evidence.results) {
    const key = `${row.id}/${row.surface}/${row.viewport}`;
    const asset = expected.get(key);
    if (!asset || seen.has(key)) fail(`非預期或重複觀察：${key}`);
    seen.add(key);
    if (row.sha256 !== asset.sha256) fail(`圖片 hash 過期：${key}`);
    if (row.src !== `/exercise-visuals/movements/${row.id}.png`) fail(`未使用 canonical 圖片：${key}`);
    if (row.observedViewportWidth !== row.viewport || row.dpr !== 3) fail(`實際寬度或 DPR 不符：${key}`);
    if (row.loaded !== true || row.naturalWidth !== 320 || row.naturalHeight !== 184) fail(`圖片未載入或尺寸不符：${key}`);
    if (row.horizontalOverflow !== false || row.clipped !== false) fail(`溢位／裁切未確認：${key}`);
    if (!Number.isFinite(row.width) || !Number.isFinite(row.height) || row.width <= 0 || row.height <= 0
        || row.width > row.viewport || Math.abs(row.height - row.width * 23 / 40) > 1) fail(`卡片比例或寬高不符：${key}`);
  }
  if (seen.size !== expected.size) fail(`四介面證據不完整：${seen.size}/${expected.size}`);
  return { count: seen.size, assets: assets.length, dpr: 3 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length !== 4 || args[0] !== '--file' || args[2] !== '--head') {
      throw new Error('用法：node scripts/audit-movement-mobile-evidence.mjs --file <觀察.json> --head <完整SHA>');
    }
    const headSha = args[3];
    if (!/^[a-f0-9]{40}$/.test(headSha)) throw new Error('需要完整的預期 head SHA');
    // 從指定 commit 讀取 manifest／PNG，避免把目前工作目錄誤當成證據 head。
    const readAtHead = path => execFileSync('git', ['show', `${headSha}:${path}`]);
    const manifest = JSON.parse(readAtHead('src/data/movementArtManifest.json'));
    const assets = manifest.map(({ id }) => ({ id,
      sha256: createHash('sha256').update(readAtHead(`public/exercise-visuals/movements/${id}.png`)).digest('hex'),
    }));
    const result = validateMobileEvidence(JSON.parse(readFileSync(args[1], 'utf8')), { headSha, assets });
    console.log(`證據結構通過：${result.assets} 張 × 4 介面 × 3 寬度，DPR3；不代表真人、風格、動作或安全核准。`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
