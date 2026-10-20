# 後腳抬高蹲：來源與驗收紀錄

風險：Tier 3。動作 ID：`catalog-rear-foot-elevated-split-squat`。

## 命名與來源邊界

使用者指定 [GYMEFIT「【動作教室】分開蹲更有效？後腳抬高蹲！」](https://www.youtube.com/watch?v=XPmdrYz50gA)。本輪主代理以瀏覽器核對標題、作者與說明中的保加利亞深蹲／分腿蹲標籤；沒有取得可靠逐字稿，不宣稱完整影片逐句審核。

正式名稱為「後腳抬高蹲（扶穩、徒手）」／Rear-foot-elevated split squat。原請求使用 RDL 一詞，但 RDL 是以髖部折疊為主的硬舉；本次建立的內容是前腿屈膝下蹲再站回的分腿蹲，不建立 RDL 的錯誤別名或圖片對應。

[Human Kinetics《Complete Conditioning for Soccer》摘錄](https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat)用於交叉核對後腳抬高、前腳全掌著地與受控下蹲回起的動作語意；該來源面向運動員，較低支撐是其初學調整。本 app 不沿用該來源的深度、負重或運動員訓練要求。

[Guy’s and St Thomas’ NHS 臀部肌力衛教](https://www.guysandstthomas.nhs.uk/health-information/gluteal-strengthening)只作慢速控制、必要支撐與尖銳／強烈疼痛停止等一般原則的交叉核對，並非後腳抬高蹲的特定臨床處方或對本內容的核准。

## 本次內容決策

- 保持 `catalogOnly: true`，僅供查閱與補記已完成的訓練；不進推薦、Today 預設或引導訓練。
- `advanced`、`advanced_only`、`supportRequired: true`，且椅子列為必需支撐器材；文字另外要求一手扶固定扶手。椅子與扶手用途不同，不能用承放後腳的同一椅子充當扶手。
- 採徒手與小幅下蹲，前腳全掌著地；後腳支撐需低、止滑且可承重，例如靠牆固定的無輪穩椅，不把一般椅子一律視為適用。
- 每側分別計次，參考量 1 組每側 3 次僅為 app 保守資料欄位，並非來自影片、個人化建議或臨床驗證劑量；補記採實際完成量。
- 疼痛 >3/10 或不穩時結束本組，後腳回地面退階或休息；疼痛 ≥6/10、尖銳痛、症狀加劇、麻木、無力、頭暈、無法承重或失衡時停止。紅旗症狀不訓練並尋求專業協助。
- 不修改 SafetyGate、安全門檻、session、storage、routing 或推薦引擎。

## 驗收狀態

本節僅記錄內容與本機自動化，圖片、瀏覽器與 PR 精確 head 證據由主代理另外補齊。

- 中英文名稱、書面步驟、安全、退階與進階欄位：已建立。
- 新 ID、指定影片、必要支撐、無預設負重、推薦／fallback 隔離、canonical ID 補記回歸：PASS（`npm test` 中的 manual-workout regression）。
- 本機 `npm run build`、完整 `npm test`、`npm run audit:safety-i18n`：PASS。
- `npm run audit:exercise-coverage`：PASS，canonical 補記覆蓋 45/45，quick strength catalog-only isolation 通過；報告保留新增內容的實質差異。
- `git diff --check`：PASS。
- 安全 smoke 回歸確認疼痛／紅旗、SafetyRouteGuard、catalog-only session 隔離與 LocalStorage 既有契約；這是本機腳本證據，並非真人或真機證據。
- Visual consistency：NOT VERIFIED。
- Movement accuracy：NOT VERIFIED；內容來源交叉核對不等於真人／專業驗收。
- Safety representation：NOT VERIFIED；無臨床核准。
- Mobile rendering：PASS（本機 in-app browser 320／375／390px 同源 iframe 實測）；未做實體 iPhone Safari 驗證。
- CI、Claude、ChatGPT PM synthesis 與 production：未執行；不宣稱合併就緒。

## 人工驗收步驟

在 Preview 動作庫搜尋「後腳抬高蹲」或「Rear-foot-elevated split squat」，開啟詳情核對同 ID、影片與雙語書面內容；確認沒有引導開始入口，直接進入 `/session/catalog-rear-foot-elevated-split-squat` 仍返回詳情。完成後補記應以同一 ID 保存實際次數。比較插圖與步驟中的前腳接地、後腳低支撐、獨立扶手、小幅屈膝與無負重，在 320／375／390px 核對裁切及溢位。

回報格式：commit／runtime 圖片 hash、頁面與語言、裝置與 viewport，visual／movement／safety／mobile 各自 PASS、FAIL 或 NOT VERIFIED 與具體觀察。真人、專業、瀏覽器自動化與真機證據各自註記，不互相替代。

## 插圖與瀏覽器實測

使用內建 imagegen，參照 frozen quick sheet 與 Side Squat 卡框建立獨立雙階段圖。來源在 `scripts/assets/movement-art-sources/overrides/rear-foot-elevated-split-squat/`，經既有 extractor 與 deterministic layout sidecar 產生 320×184 runtime PNG；未改其他圖片。

生成規格：白底、素 T-shirt／短褲、簡化小頭與節制深色線條；同一人側視朝左，一手固定扶手、後腳低穩凳、前腳全掌著地，左階段接近直立、右階段小幅屈膝，無負重、無文字、僅中央淺灰分隔。完整提示詞見 `rear-foot-image-prompt.txt`。

Runtime SHA-256：`dc680a9efa202e930e33e7e3d1ea292ff5a952ecdaf5a53d7e6b51984050fa1b`。

- `audit:movement-art`：PASS，八張 frozen baseline 未變，45 個圖片與來源。
- `audit:movement-art-sources`：PASS，39 個有效 override byte-for-byte 重製，所有 PNG 可解碼。
- AI 具名檢視：兩階段可見前腳接地、低後腳支撐與獨立扶手；原始尺寸及手機卡框無圖內裁切。支撐設備會使人物相較無器材參考縮小；手部細節及線條密度仍供真人風格驗收。visual／movement／safety 專業或真人核准仍 NOT VERIFIED。
- 詳細頁 320／375／390px viewport 的圖框分別為 254×146.046875、309×177.671875、324×186.296875 CSS px；natural size 320×184，載入皆成功、無水平溢位、無圖框裁切。這是同源 iframe 中實際 app DOM 量測，不是真機或獨立頂層手機瀏覽器。
- 繁中與英文詳細頁均顯示專屬名稱、影片與書面內容，沒有引導開始按鈕。影片 iframe 指向 XPmdrYz50gA。
- 實測畫面：`rear-foot-mobile.png`；具名風格比較：`rear-foot-comparison.html`，包含八張 frozen references 與新圖，原始尺寸及上述三種實測詳細頁圖框寬度。未執行獨立盲測；未量測 picker／Records 手機版，不宣稱該環境 PASS。

## 難度版本修正

使用者確認同一動作包含徒手與負重版本，負重屬中階至進階。名稱改為「後腳抬高蹲（徒手／啞鈴）」；equipment 包含 bodyweight、chair、dumbbell，dumbbell 為 progressionEquipment 而非必需器材。既有 advanced level 作整個動作的保守分類；中階至進階的負重難度以雙語進階欄位表達，不建立新 level enum。

基礎書面步驟與未改動插圖仍為徒手扶穩；教練確認後的負重變化採一手扶穩、另一手輕啞鈴，保留低支撐、小幅度及同一停止規則。不得將本次文字修正當成負重插圖已驗收。Human Kinetics 來源明確列有 dumbbell weighted variation，但本 app 的扶穩單手版本是保守改編，非該來源的逐字處方。

詳細頁總覽取消器材只顯示前兩個的限制，與動作卡既有全器材標籤一致，讓第三個啞鈴標籤可見；保留 flex-wrap。先前截圖與文字 QA 屬 4194f92，僅圖片 hash 未變；新 head 的標籤與文字需重新驗證。

本次更新驗證：build、完整 npm test、安全/i18n、coverage 45/45 通過；增加同一 canonical ID 的啞鈴重量補記回歸。繁中/英文瀏覽器頁面顯示 bodyweight、chair、dumbbell 三標籤與中階至進階負重說明；320／375／390px 實際 app iframe 皆確認徒手/啞鈴可見且無水平溢位。最新總覽截圖 `rear-foot-tags.png`；原 mobile 插圖截圖僅作前版圖片參考。圖片 bytes 未變，本次不宣稱新增負重圖已驗證。

## 2026-10-20 合併前更新

使用者明確授權「fix if blocked, merge if pass」。分支重疊 main 問題以乾淨 clone rebase 修正，原 checkout 未改動。另依回饋將名稱改為「後腳抬高蹲（徒手／負重）」；負重例子包含啞鈴、壺鈴等可穩定手持器材，canonical equipment 與 progressionEquipment 包含 dumbbell/kettlebell，皆非基礎必需器材。保留單手固定扶手、可控制輕負荷、中階至進階與同一停止規則，不提供槓鈴或其他會佔用扶穩手的預設。圖片 hash 與徒手基本步驟不變。舊 head 的檢查/審查僅歷史資料，新 head 重新驗證與Claude審查，以PR留言為準；尚未收到真人圖片結果，不推定真人/專業核准。
