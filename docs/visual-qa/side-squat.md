# 側蹲新增與驗收紀錄

風險：Tier 3。動作 ID：`catalog-side-squat`。

## 範圍與來源

參考 [GYMEFIT Side Squat（2022-02-17）](https://www.youtube.com/watch?v=kR7ykIAuq_0)。已核對標題、作者、說明及約 0:54 示範畫面；沒有取得可靠逐字稿，不宣稱完整影片逐句審核。文字為徒手、縮小幅度的 app 改編，參考劑量不是影片處方。保留 catalogOnly，不納入推薦、Today 或引導訓練；既有疼痛門檻、紅旗與儲存契約不變。

## 插圖來源

使用內建 imagegen，以 frozen quick sheet 為風格參考；新建雙階段固定站距側蹲，未更換既有圖。來源：`scripts/assets/movement-art-sources/overrides/side-squat/catalog-side-squat.png`；以既有 `extract-movement-art.mjs --ids catalog-side-squat` 產生 runtime PNG。

最終修正 prompt：

> Edit this two-panel side squat illustration. Correct only the starting stance in LEFT panel: widen the legs so the distance between shoe centers is exactly the same as in RIGHT panel, at the SAME character scale. Both panels represent feet planted in one fixed wide stance, no stepping. Left pose upright with nearly straight knees, right pose shallow lateral squat over man's right leg (viewer left). Preserve right panel, all character design, clothing, white background, sparse dark outline, simplified hands/feet, central gray divider and no text. Avoid thickening lines. Also simplify shoe lace details to match the restrained sketch style.

Runtime：`public/exercise-visuals/movements/catalog-side-squat.png`，320×184。
SHA-256：`036f309eea7c0e825b9b52619e09c9d1a6d752b2a27da0716ed4c52952af1222`。

## 證據邊界

- 本機 build、完整 npm test、安全／雙語／覆蓋稽核：PASS（44/44 canonical coverage）。
- 八張 frozen baseline integrity、effective-source regeneration：PASS；未改寫既有圖。
- 雙語 library/detail/identity/log 共用來源 SSR 比對：PASS，352 次比較。
- 瀏覽器：詳細頁雙語、影片 iframe、無引導開始入口；1280px viewport 圖片載入成功，384×220.796875，無水平溢位。
- Visual consistency：NOT VERIFIED（具名比較頁已提供，仍待可歸屬真人驗收）。
- Movement accuracy：NOT VERIFIED（AI 已查看固定站距、側向移重、雙腳著地；不替代真人／專業驗收）。
- Safety representation：NOT VERIFIED（圖示徒手版本、支撐為選用；無專業核准）。
- Mobile rendering：NOT VERIFIED（320/375/390px iframe 頁面已載入，但未完成可靠尺寸與裁切量測）；真機 iPhone Safari 未驗證。
- Claude：Pending，本機 CLI 回報未登入；CI、PR exact-head review、production 尚未執行。

## 真人檢查

開啟 `docs/visual-qa/side-squat-comparison.html`，比對八張 frozen 圖與新圖的角色、線條、尺度、留白。272/327/342px 為預估卡片寬度，不是實測證據。再於 Preview 動作庫與補記頁選側蹲，核對同圖、每側計次與影片。回報 commit、圖片 hash，以及 visual / movement / safety / mobile 各項 PASS 或 FAIL 與觀察。此紀錄不授權合併。

## 使用者真人回報（2026-10-18）

使用者於本聊天回覆「human check ok」，並授權「fix if blocked, merge if pass」。對應先前展示的側蹲內容與 runtime PNG `036f309eea7c0e825b9b52619e09c9d1a6d752b2a27da0716ed4c52952af1222`，本輪不改動動作或圖片。整體真人檢查：PASS（使用者回報）。未提供裝置與專業身分資訊，不推定為臨床核准或 iPhone Safari 真機證據。前節 NOT VERIFIED 為初次交付狀態，最新精確 head AI 審查與 CI 以 PR 留言為準。
