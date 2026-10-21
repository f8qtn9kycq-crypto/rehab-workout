# 共用人體圖第一階段驗證

## 範圍與視覺來源

- Tier 1：人體圖呈現與近期紀錄唯讀篩選。沒有修改安全規則、推薦、動作內容、LocalStorage schema 或正式痠痛地圖。
- 基底：`89f91e7bc2d9ef1f1f5384ed94d92f5bb9703f28`。沿用 `public/exercise-visuals/body-map-line-art.png` 的原始 1024×1536 座標及人物比例，將線條輪廓描繪為向量填色路徑；沒有內嵌 PNG。
- 原始 PNG SHA-256：`c05809f44862a211481c2c13b466cf3ae239ecf721f4b7449161f2776e9e0b9a`。
- 向量來源與部位幾何：`src/data/bodyMapGeometry.json`，SHA-256 `297dc11a4cdf32a052a8f984c613da7c753321de0b77cf9a82a1a4cdd18fec6f`。後續編修以此路徑資料為來源；禁止只替換底圖而沿用不同座標色塊。
- 使用者已在本對話確認原圖比例向量原型。這不等於實作後的真人 walkthrough、臨床解剖核准或真機證據。
- PNG 原始圖資與所有 movement art／frozen baseline 未修改。此為部位選取圖，不是動作示範圖；不改動動作姿勢或器材語意。

## 功能契約

- `BodyMapSelector` 使用同一向量線稿、人體裁切與五大部位路徑。高亮及命中範圍分層，沒有向鄰近部位延伸的透明粗邊；文字按鈕保留至少 44px。
- `useId` 讓同 React root 內各實例的裁切 ID 唯一；dev-only fixture 直接掛載兩個獨立選取元件，驗證裁切與選取狀態不互相干擾。
- 原有 assessment 也已使用此共用元件，因此同步取得向量呈現；評估互動及儲存不變。
- 紀錄初始全部，先篩選所有日期再取最近五天；只改近期列表，不改每週、恢復、完整歷史或活動統計。
- 儲存部位快照優先；僅缺少快照時依有效 canonical ID 回查。未知、自訂且無部位、單純騎車不推算部位。混合補記保留整張卡片並標記符合動作名稱。

## 已執行驗證

- `npm run build`：PASS；既有大於 500 kB bundle 提示仍存在，未宣稱效能改善。
- `npm test`：PASS，包含新的 `test:records-body-area`。
- `npm run audit:exercise-coverage`：PASS；46 個動作，內容與 coverage 未改變；未保留只有時間／來源 SHA 的 audit report 差異。
- `npm run audit:movement-art`：PASS，8 個 frozen reference 與 45 個圖片／來源完整；不是風格人工核准。
- `npm run audit:safety-i18n`：PASS。
- Chromium 本機自動化：320、375、390、1280px PASS。篩選、混合卡片保留、清除、空結果、SVG 滑鼠命中、Enter／Space、可用性、重複元件 ID、資料不變、週統計不變、無水平溢出。
- 可重跑程式：`scripts/shared-body-map-browser-qa.mjs`（在獨立 Playwright profile，以 `http://127.0.0.1:4178` dev server 執行）。多元件檢查使用 `scripts/fixtures/shared-body-map.html`／`.tsx`，透過 Vite 載入真實元件；因此使用 dev server 而非 production preview。
- 自動化結果與 375px 截圖：`output/playwright/shared-body-results.json`、`shared-body-library-375.png`、`shared-body-records-375.png`。人工檢視本機截圖：比例維持、圖像未裁切；不代表真人使用者驗收。
- 實體 iPhone Safari、VoiceOver、正式環境：NOT VERIFIED。

## 委派與審查

指定模型 `gpt-6.1-sol / medium`；實際模型 NOT VERIFIED（工具接受指定模型，無獨立執行身分證據）。repo／子任務風險 Tier 1／唯讀呈現；範圍為紀錄 helper、頁面、locale 及回歸；子代理交付後父代理檢查差異並執行整合 build、完整測試及瀏覽器驗證。返工：locale 改用既有 cleanup resource；未改產品規則。未提供品質提升／節費結論。

PR 建立後，以當前 head 觸發建議 Codex review，CI 與外部結果依 PR 留言更新。未授權合併。

## 第二階段邊界

下一輪僅製作詳細痠痛地圖的同畫風互動原型。37 個區域 ID、左右側、正背面、肌肉／關節、放大及多部位保留；位置仍屬觀察示意。正式痠痛地圖與安全規則不在本 PR 替換。
