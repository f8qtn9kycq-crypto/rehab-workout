# 回訪首頁實際入口驗證

## 範圍與決策

2026-10-24，基準 main `1ce8df8cf46e53531c427606d5e6e3b94b972753`。Tier 1：新增可執行 QA 與文件，不改產品程式、安全規則、路由或儲存格式。此工作可獨立於 #238 的 required Claude 審查進行；它不替代資料還原審查。

目前首頁仍使用情境下一步：安全未完成／過期／blocked → 安全；未評估 → 評估；有紀錄且缺近期同部位功能追蹤 → 紀錄；已有近期功能追蹤 → 最近動作；其餘 → 動作庫。補記保持次要入口。此次沒有發現需要改這些既有分流的產品故障，也沒有使用者證據支持將全部情境改成 `/start`，因此 #150 整體替換仍不採用。

## 測試缺口與補強

原 `home-entry-regression.mjs` 的 16 狀態只測 helper；即使 HomePage 不再呼叫它，測試仍可能綠。新增 `home-rendered-regression.mjs`，依既有 SSR bundle 模式實際 render HomePage，用獨立的預期 href／雙語標題、說明及 CTA 驗證輸出，並確認次要補記與 v2 storage bytes。

- 32 個雙語 boolean 矩陣案例。
- 12 個雙語安全過期、blocked、已保存紅旗、不同部位／過期／未來功能追蹤案例。
- 2 個首次使用 SSR 不顯示訓練 CTA 的案例；SSR 不執行 Navigate effect，實際 redirect 另由 browser QA 驗證。
- mutation：暫將實際 HomePage 主 CTA 改為固定 `/start`，測試 exit 1，實際 `/start` 不等於預期 `/safety`；還原原始 bytes 後 exit 0。`src/` 無變更。

已接入既有 `test:home-entry`，因此完整 `npm test` 與 CI 也會執行。build、完整 tests 與 diff check 通過，既有 bundle size warning 保留。

## 瀏覽器步驟與邊界

`scripts/home-returning-browser-qa.mjs` 透過 Playwright CLI 對本機隔離 Vite `127.0.0.1:4183` 執行。僅合成資料，不讀使用者紀錄。每個引擎包含 16 狀態 × zh-TW/en × 320/375/390 共 96 個實際主 CTA 點擊導覽，再加首次使用 redirect／安全過期／已 blocked 三類共 18 個邊界流程。檢查真實 href、點擊目的路徑、次要補記存在、主按鈕 ≥44px、無水平溢出及關鍵既存資料 bytes 不變；不按開始訓練、不新增完成紀錄。

首輪腳本在 seed 前已被導到 onboarding，重新載入仍停留該路徑，造成 section timeout；已改成 seed 後明確到 `/`。這是 fixture 導覽問題，沒有修改產品來讓 QA 通過。Chrome 開發環境的 favicon 404 是既有非核心資源缺失，不是首頁 runtime 例外。

修正後 Chrome 及 WebKit 各回傳完整 `matrixFlows:96`、`edgeFlows:18` 並 exit 0，合計192矩陣導覽＋36邊界流程通過。兩個引擎獨立 profiles；沒有用 SSR 結果冒充瀏覽器點擊。

本機自動化不代表真人易用性、實體 iPhone Safari、VoiceOver、正式環境或訓練安全的新增臨床證據。到達 session 路徑不代表已開始訓練或略過訓練前疼痛。

## 委派

指定 gpt-6.1-sol／medium，實際執行模型 NOT VERIFIED；repo／子任務 Tier 1，選用原因為獨立 SSR 測試整合。代理僅新增 rendered regression，父代理負責 browser QA、package 接線與整合，檢查46案例及 mutation 證據、重跑專用與完整測試。代理未改 src、commit 或 push；返工為父代理修正 browser fixture 的首次導覽，不是重做代理測試。

## 下一輪

技術證據已能證明目前首頁按情境分流，尚未量測真人是否容易理解。後續固定任務：首次開始、已安全回訪、補功能追蹤與三動作組合逐一返回；記錄 URL/head、裝置語言、是否需提示、卡點與資料正確性，時間只填實測。無具體卡點前不改首頁、不擴大為整套 session 引擎；#238 仍依自己的必要審查門檻。
