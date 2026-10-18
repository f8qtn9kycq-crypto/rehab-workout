# Issue #226：身體痠痛記錄驗證

## 範圍

Records 次要入口與 `/logs/soreness`，37 個獨立觀察部位、原始 38 個 SVG shapes、左右側、前後視圖、肌肉／關節、六組縮放、可見文字替代操作及頁內編輯。與訓練 bodyArea、動作插圖及安全通行狀態分離。

原始幾何來源：[Issue SVG handoff](https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/226#issuecomment-6249339084)。完整原始 HTML 的樣式／像素一致性：NOT VERIFIED。部位輪廓為觀察定位，不代表醫療精確邊界。

## 資料契約

只新增 `rehab.sorenessEntries.v1`，最多 200 筆、不自動淘汰；每筆最多 74 個合法 region＋side，note 最多 500 UTF-16 字元。UUID v4、ISO 建立時間與本地 YYYY-MM-DD。新舊資料皆經 runtime validation；任何損壞／讀取失敗阻止寫回。沒有 migration。0 必須明確選取；缺值不會儲存或視為 0。五種症狀可不選。

寫入失敗保留記憶體草稿、UUID 與建立時間；同步提交鎖與服務層 ID 檢查防重複。成功後需明確新增記錄才建立下一筆。刪除需原生確認；取消／寫入失敗保留原資料。既有 clear-local-data 納入新鍵。

## 本機驗證

- `npm run build`：PASS（Vite 既有單一 bundle >500kB 提醒，非錯誤）。
- `npm test`：PASS，含新增 `test:soreness` 與既有 safety/session/storage/Records 回歸。
- `npm run audit:safety-i18n`、`git diff --check`：PASS。
- Exercise coverage audit：不適用；未改動作內容、篩選或推薦。
- `scripts/soreness-regression.mjs`：明確 0、未知／非法資料、左右、多區、重複、閏日／未來日期、UUID／時間、字數／容量、損壞 JSON、讀寫失敗、quota、刪除、舊鍵保留與 clear-data。
- Codex 子代理獨立唯讀檢視：無可重現 P0/P1；不是 Claude review。

## 瀏覽器自動化

使用獨立 Playwright profile、production build 的本機 Preview。重跑方式：啟動 `npm run preview -- --port 4173`；以 playwright-cli 開啟獨立 Chrome 或 WebKit session，再以 `run-code` 載入 `scripts/soreness-browser-qa.mjs`。僅使用測試 profile，腳本會清除該 profile 的測試資料。

Chromium／WebKit × 320／375／390／1280px：PASS。

涵蓋 SVG Enter／Space、編輯區焦點、正背面左右 transform、traps 共用資料、未知拒存、明確 0、多區、六組縮放、肌肉／關節、神經症狀／程度 6 警告、quota 草稿保留／重試、同一 event 連點只存一筆、reload、user note 作文字呈現、刪除取消／接受分支、既有四個資料鍵不變、44px 以上文字控制項、無水平溢出、英文無中文混入、損壞資料保留及直接 session 導向安全檢查。

刪除分支腳本替換測試 profile 的 `window.confirm` 回傳值；原生確認視窗另已觀察到，不將此視為真人操作。WebKit 原生 select 高度問題已修正為明確 48px。

截圖：`output/playwright/soreness-{chromium,webkit}-{320,375,390,1280}.png`。已目視檢查 320px WebKit 圖面。色彩沿用現有亮色主題；未新增深色模式。

## 證據邊界與真人 walkthrough

CI、exact-head reviews 與 Preview URL 以 PR 即時紀錄為準；下列皆未由本機自動化代替：真人／VoiceOver、實體 iPhone Safari、安全區真機操作、production：NOT VERIFIED。

本 PR 新增觀察提示判定，提供真人 walkthrough 以核對安全語意與手機操作。回報格式：`head SHA / 裝置與瀏覽器 / 步驟 / 實際結果 / PASS 或 FAIL`。

1. 從 Records 次要入口進入，確認沒有新增底部分頁。
2. 正面選自己的左側、背面選右側，切換縮放與肌肉／關節，核對側別。
3. 選取部位但不填程度，確認不能儲存；明確選 0 後可保留。
4. 選程度 6，或程度 0 加麻木／刺麻／無力／電擊感，確認停止訓練與專業評估提示清楚，仍可記錄，沒有開始訓練按鈕。
5. 儲存多區、重新整理、檢查原訓練紀錄；刪除先取消再確認。
6. 在 iPhone 檢查文字替代清單、焦點、底部安全區與可見控制項。

不自動合併。Required Claude Tier 3 review、exact-head Codex review 與 PM synthesis 必須在 PR 可追溯；請求不等於完成或正式 APPROVE。
