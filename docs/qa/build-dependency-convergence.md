# 建置相依收斂驗證

## 範圍

PR #236 擴充為同一建置工具鏈修補交付，Tier 3。以 main `d6a7fd3623d48d603ae04ac385d41585c47e6975` 為基準；不變更 package.json constraints、Tailwind 3.4.19、產品程式、圖片、manifest 或凍結 hash。

| 套件 | 原版本 | 本次版本 | 關聯 PR |
|---|---|---|---|
| source-map-js | 1.2.1 | 1.2.2 | #186 |
| browserslist | 4.28.2 | 4.29.3 | #135 |
| baseline-browser-mapping | 2.10.34 | 2.11.28 | #145 |
| postcss-selector-parser | 6.1.2 | 6.1.4 | #134 |
| Vite | 6.4.3 | 6.4.5 | 相容範圍修補 |
| Pillow | 12.3.0 | 13.0.0 | #236 |

browserslist 同步其 caniuse-lite、electron-to-chromium、node-releases、update-browserslist-db 相依。Pillow 修復及來源驗證詳見 `pillow-13-reproducibility.md`。版本由既有 PR lockfile 及 npm registry 解析取得，保留 registry integrity。

## 本機證據（2026-10-23）

- `npm ci --ignore-scripts`、`npm run build`、完整 `npm test`、`npm run audit:safety-i18n`、`npm run audit:movement-art`、`git diff --check` 通過。
- 獨立乾淨 main worktree 安裝及 build 後，比對最終 CSS bytes；兩者 SHA-256 均為 `e05599f3c82ce658ee25375516373ee085d03bd3f1c98fd1f296186131053064`，無 CSS 差異。
- 隔離 Python 3.12.14／Pillow 13.0.0：`python scripts/verify-movement-overrides.py` 通過，40 effective sources byte equality、PNG decode、非法 framing、單姿勢與 phaseCount 回歸；8 frozen references／46 images 完整性通過。不改全域套件。
- 既有 bundle >500kB 提示仍存在，未宣稱效能改善。沒有新增真人、實體 iPhone、VoiceOver 或 production 證據；未執行獨立瀏覽器操作。

## 尚未修復的公告

本次 npm audit 快照仍為 7 個 affected packages（5 high、2 moderate），含 Tailwind 3 工具鏈的 braces／chokidar／micromatch／fast-glob，以及 selector parser 的另一個 quadratic-complexity 公告。這是 npm 相依快照，不等於 GitHub 全 repo alerts 數或網站正式環境可利用性證明。

`postcss-selector-parser` 6.1.4 不修復要求 >=7.1.6 的 GHSA-rj75-hqrm-r3gf，不能把 #134 合併視為所有 selector 公告消失。#187 將 Tailwind 升至 4 的方案目前 CI 因既有 PostCSS plugin 設定失敗；框架遷移需另訂範圍並驗證，不以 `npm audit fix --force` 混入此次修補。

## 審查門檻

最終 head 需重新完成 CI、獨立 Codex／Claude 與 PM synthesis；舊 head 結果不可沿用，請求不等於完成。只有證明 main 實際含目標版本後，才能將重疊 PR 註記已涵蓋。沒有正式 GitHub APPROVE 的宣稱。
