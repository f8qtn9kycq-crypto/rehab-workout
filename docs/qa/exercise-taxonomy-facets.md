# Strength／Rehab 次層分類驗收

2026-10-30；基準 main `b3e719a91928752c149cfb6b8401b42032e76718`。使用者已授權實作 PR、獨立 QA 聊天驗證、回傳 PM、修復問題及通過後合併；不手動部署。精確 head、CI、QA 及必要審查結果留在 PR，不以本文件預先宣稱完成。

## 已實作與保護面

動作庫及補記選擇器共用 `ExerciseTaxonomySelector`、`exerciseTaxonomy` 與 `exercisePurposes`。Strength 按推／拉／下肢／核心／其他，下肢有模式；Rehab 按五部位＋功能，多標籤可重疊。Library URL 及詳情返回保留分類；Manual 只在當前選擇器狀態，不寫入新 schema。

原47項 primaryPurpose／secondaryPurposes／rehabGroup 的 b3e719a 契約雜湊回歸不變。canonical動作內容、劑量、ID、catalogOnly、推薦資格、safety、Session、writer/schema、C1、recordsPresentation 與 weekly 統計均未修改。分類理由與來源見[逐 ID 對照](../exercise-taxonomy-facets.md)。

## 父代理本機證據

- 完整 `npm test`（含新增實際 Library SSR 與分類邏輯）通過；舊47項用途、C1、資料與安全回歸仍通過。
- `npm run build`、`npm run audit:safety-i18n`、`npm run audit:exercise-coverage`、`git diff --check` 通過。coverage為47/47；既有空矩陣不填新內容。build既有chunk大小提示不宣稱改善。
- Chromium／WebKit 各6組（zh-TW／en × 320／375／390px）：分類、同一套下肢／復健篩選、搜尋收藏交集、詳情返回、空結果清除、跨用途清除不適用條件、私人動作仍可找到。
- Library 讀取／切換前後 storage bytes 相同；Manual 等待原初始化草稿實際建立後，純分類／搜尋／切換前後 bytes 相同且攔截 setItem=0。選取動作才沿用原保存流程，未產生完成紀錄，也未將新分類寫入草稿。
- 痛6分推薦停訓、catalogOnly直接session轉向及明確切換所有動作仍保持；新分類只縮小既有安全引擎結果，不自動擴大推薦範圍。
- 父代理以AI視覺檢查自動截圖中的320px英文補記與375px中文動作庫；版型自動檢查為全矩陣無水平溢出與44px目標。這是AI視覺核對，不是真人操作證據。

重跑方式：在專用 Vite origin 的隔離 profile 執行 `playwright-cli -s=<profile> run-code --filename scripts/exercise-taxonomy-browser-qa.mjs`。腳本清空該 profile 的合成資料，不能用於日常使用者 profile；不是 production 驗證。結果JSON、日誌保存於本任務 `outputs/rehab-taxonomy-20261029/`，圖片於 `output/playwright/taxonomy-*.png`。

第一次父代理 QA 在初始化尚未完成時即開始計量，觀測到既有300ms建草稿 revision1寫入；已調整為等待實際草稿建立後再開始，產品writer與初始化行為未修改。

## 獨立 QA 與審查

使用者指定的獨立聊天：`01a1885a-3ca2-7950-8867-96af3407be05`，標題「QA：Strength／Rehab 分類」。該聊天已讀取原聊天人工授權並完成計畫；收到 PR 與精確 head 後，在自己的 clone、依賴、port、profile 重驗，回傳原聊天 PM 綜整。未收到結果前為 Pending，不把父代理證據當獨立驗證。

本 PR Tier 2，理由為安全相鄰的分類顯示／URL與補記選擇器，不涉及動作內容或個人醫療決策。必要 Codex、建議 Claude 與使用者指定 QA 的觸發及結果依精確 head 記錄；head 改變即重新核對。QA 聊天保留原聊天設定，實際模型 NOT VERIFIED，不冒稱已切換模型或正式GitHub APPROVE。

真人、實體iPhone、VoiceOver、臨床位置及production walkthrough：依使用者指示本輪略過，**NOT VERIFIED**。未量測真人完成時間；固定秒數或互動次數不是已達成成果。C2／D、近期表現快捷及混合引導Session未啟動。
