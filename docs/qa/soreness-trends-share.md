# 原生痠痛趨勢、分享與備份驗證

## 來源與範圍

來源：[soreness-map PR #2](https://github.com/f8qtn9kycq-crypto/soreness-map/pull/2)，來源 head `6ab64981fc003e305002cb5d3d94ddf4cfbb64c9`。本次採相同產品語意，整合到原生 `/logs/soreness`，不是嵌入獨立 HTML。

- 7／30／90 個本地日，僅指定 region＋side 的實際 1–10 點；不連線、不補 0、不推論改善。
- 新紀錄只選 1–10，「清除此部位」只移除草稿部位；舊 0 分仍在原資料、最近記錄與完整備份。
- 37 IDs、74 左右組合、SVG 幾何與既有色階不變；友善部位名稱與非診斷位置說明。
- 分享 CSV：僅已儲存正分數、含首尾日期、記錄／列數預覽、預設排除備註；勾選只存在本次元件狀態。UTF-8 BOM、引號／換行跳脫與公式防護；沒有自動上傳。
- 原生原先沒有獨立版既有的備份介面，因此補上完整 CSV、完整 JSON 與 JSON 還原。原生沒有 workout 自由文字欄位，不新增此欄位或訓練連結。
- JSON envelope `{format:"rehab.sorenessEntries",schemaVersion:1,entries:[...]}`；只支援原生備份，不宣稱獨立版 JSON 相容。CSV 無法還原。JSON 保留原有 UUID、createdAt、0、備註；同 ID 既有紀錄優先，整批驗證後才新增，最多 200 筆，不淘汰。檔案限制 32 MiB，涵蓋原生 200×74×500 字元的 Unicode 備註上限；仍受瀏覽器容量限制。
- 新增讀寫流程依保守原則列 Tier 3。沒有更改 SafetyGate、SafetyRouteGuard、疼痛／神經警訊門檻、推薦、訓練 schema、插圖或其他 storage keys。

## 10 組資料測試

執行：`node scripts/soreness-history-regression.mjs`，已納入 `npm test`。

| # | 實際驗證 | 結果 |
|---|---|---|
| 1 | 本地 7／30／90 日邊界、左右隔離、缺值及舊 0 不成點 | PASS |
| 2 | 首尾含當日、閏日、無效／反向日期拒絕 | PASS |
| 3 | 分享 CSV 預設不含備註／舊 0，保留穩定 ID | PASS |
| 4 | 勾選備註、引號／換行及公式注入防護 | PASS |
| 5 | 完整 JSON 無損還原、重複還原不新增、完整 CSV 保留 0 | PASS |
| 6 | 無效日期／UUID／混合無效筆／重複 ID 整批拒絕且不寫入 | PASS |
| 7 | quota 失敗原 bytes 保留、可重試 | PASS |
| 8 | 既有損壞資料禁止還原且保留原文 | PASS |
| 9 | 滿 200 筆拒絕新增、不自動淘汰 | PASS |
| 10 | 訓練鍵 bytes 與原生痠痛儲存鍵不變 | PASS |

這是本次新增的 10 組測試；不代表真人、實體 iPhone 或 production 驗證。

## 瀏覽器與本機證據

環境：macOS、本機 Vite、Playwright CLI；腳本使用隔離 profile，測試清除僅該 profile 的合成資料。

- `scripts/soreness-browser-qa.mjs`：保留原有左右鏡射、traps 去重、Enter／Space、焦點、unknown 禁存、1／3／4／5／6／10 色階、低程度神經警訊、quota 草稿、雙擊單筆、重載、刪除取消、雙語、44px、水平溢出、直接 session guard。新增 0 不再可選，改為 1；舊 0 備份另外測試。
- `scripts/soreness-history-browser-qa.mjs`：實際點下載並讀取分享／完整 CSV、JSON；確認不含未存草稿、預設備註排除、選填跳脫、舊 0 完整保留、反向日期禁用；匯入新增／重複／損壞、草稿保留、重新載入取消 notes opt-in、雙語、四種寬度。
- Chromium 320／375／390／1280：兩份腳本 PASS。
- WebKit 320／375／390／1280：兩份腳本 PASS；首次新面板下拉只有 23px，改為明確 `h-11 appearance-none` 後重跑通過。
- `npm run build`、`npm test`、`npm run audit:safety-i18n`、`npm run audit:visible-i18n`、`git diff --check`：PASS。Build 仍有既有主 bundle >500kB 提示，未宣稱效能改善。
- exercise coverage audit：不適用，未改 exercise/filter/recommendation。
- 截圖：`output/playwright/soreness-trends-chromium.png`、`output/playwright/soreness-trends-webkit.png`；主代理已視讀 Chromium 畫面。自動化畫面不等於真人驗收。

## 人工 walkthrough 與證據邊界

待 Preview 後提供 `/logs/soreness`：選左右部位→分別 1／6→清除其中草稿部位→儲存→看 7／30／90 日→下載預設分享 CSV→勾備註再下載→保存 JSON→重新匯入確認去重→重載→取消刪除。

請回報 head、環境／裝置、步驟、觀察與預期是否相符。真人、VoiceOver、實體 iPhone Safari、production、Google Sheets 真實匯入：NOT VERIFIED。沒有新增安全評估或自動訓練通行能力。

## 委派與審查

- 文案：指定 gpt-6.1-sol／medium，實際模型 NOT VERIFIED（工具未提供執行模型證據）；repo Tier 3、子任務既定文案低風險；僅兩份 locales。父代理查核安全文案未變並執行 i18n audit；修正 interpolation 必須用原生單大括號，非來源雙大括號。
- 獨立 Codex 程式審查：指定 gpt-6.1-sol／high，實際模型 NOT VERIFIED；read-only，檢查原生 I/O／日期／隱私／安全不變；靜態審查 Pass，未發現 P0／P1；最後 head 綁定於 PR 留言。
- Claude Tier 3 與 ChatGPT PM synthesis：須綁定 PR exact head；請求不等於完成，不等於 GitHub APPROVE。未授權本次合併。
