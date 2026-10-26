# C1：依官方動作用途找回紀錄

日期：2026-10-26。基準 main：`8e260d85c2a14e7b6b6a81d1f98db31748e27885`。本次授權為實作、驗證及建立 PR，不含合併、刪分支或手動部署；C2／D 未啟動。精確 head 與遠端 CI／審查以 PR 證據留言為準。

## 使用者可見行為

- 紀錄頁新增全部／復健／肌力／有氧／未分類入口；用途與部位須符合相同動作。
- 官方 ID 沿用 Phase B 的主要與次要用途，標明「官方動作用途」，不當作當次目的。
- 舊 kind、私人、遺失 ID、內容修訂有歧義及失效連結維持未分類，不依名稱猜 ID。原名稱、數字、完整場次保留。
- 先篩選全部日期，再取近期五天；完整歷史使用相同結果，混合場次不拆筆。linked logs 保留既有去重。完整歷史另保留 reader 接受的未來日期舊紀錄，仍用相同用途／部位判斷；近期與週統計維持原日期排除規則。
- 清除篩選只改頁面狀態；週統計依原分類計算，畫面明示與新用途篩選的區別。
- 完整歷史的隔日反應與連結動作組數編輯仍可明確保存。`ActivityTracking` 只新增歷史顯示清單／證據 props，傳入的完整 activities 仍用於週摘要、補記及已連結判斷，沒有將篩選結果傳入 writer。

## 實際檔案範圍

純讀投影 `recordsDiscovery.ts`；`LogsPage`；用途依據元件；ManualWorkoutCard 的可選標籤；ActivityTracking 的可選歷史清單與證據；TrainingLog 僅 export 原組數編輯器供 linked 場次沿用；雙語文案；純邏輯回歸、瀏覽器腳本、既有 source assertions 對齊與 npm test 接入。

`recordsPresentation.ts`、`recordsBodyArea.ts`、TodayGoalPlan、storage services、schema、安全、推薦、Session 與功能確認元件均未修改。修訂紀錄辨識由 ManualWorkoutCard 搬到純讀工具，共用原邏輯，保留舊 export 相容性。

## 本機驗證

| 證據 | 結果與邊界 |
|---|---|
| `npm test` | 完整既有測試與新增 C1 回歸通過；不是遠端 CI |
| `npm run build` | 通過；保留既有 chunk 大小提示，未宣稱效能改善 |
| `npm run audit:safety-i18n` | 通過 |
| `npm run audit:exercise-coverage` | 官方補記覆蓋 47/47，catalogOnly 隔離通過；既有矩陣空缺未擴充內容 |
| `git diff --check` | 通過 |
| 純讀工具實載 TS 回歸 | 官方／次要用途、kind-only／私人／未知／修訂歧義、同動作 AND、部分失效連結、去重、五日前篩選、原資料及週統計不變 |
| Chromium、WebKit | 各 6 組：zh-TW／en × 320／375／390px；每組檢查四類用途、近期／完整歷史、較舊日期、同動作交集、未分類、空狀態、清除、鍵盤、44px 與無水平溢出 |
| 瀏覽器資料邊界 | 篩選／清除後所有 LocalStorage bytes 相同，攔截 setItem 確認零寫入；明確隔日回報及 linked 組數保存各可用，無關紀錄不變；未來日期舊紀錄在完整歷史可讀，近期與週統計維持原規則 |
| React 檢查 | 新狀態限用途；由 render 推導篩選，無同步 effect、無新增依賴；沿用原 writer，使用具標籤按鈕與 aria-pressed |

以隔離瀏覽器 profile 開啟本輪 Vite，再執行：

```sh
playwright-cli -s=rehab-c1-chrome run-code --filename scripts/records-discovery-browser-qa.mjs
playwright-cli -s=rehab-c1-webkit run-code --filename scripts/records-discovery-browser-qa.mjs
```

腳本以頁面 origin 作為目標，使用合成資料並清空該隔離 profile 的 LocalStorage，不能用在日常使用者 profile。固定合成日期為 2026-10-10 至 2026-10-25；執行環境日期須不早於 2026-10-26。腳本需要 Vite 開發模組，不能直接套用 production。

結果 JSON 與 12 張截圖保存於本任務 `outputs/rehab-records-c1-20261026/`、`output/playwright/c1-*.png`。這些是本機瀏覽器自動化；真人、實體 iPhone、VoiceOver、臨床位置、production walkthrough 均為 **NOT VERIFIED**。

## 審查與決策邊界

整體 Tier 2：顯示層篩選跨完整歷史及既有編輯入口，沒有修改安全邏輯、資料契約或統計算法。Codex 必要、Claude 建議；精確 head 的觸發、結果及 CI 留於 PR，不以本文件預先宣稱完成。

委派：指定 gpt-6.1-sol／medium，實際模型 NOT VERIFIED；一般純讀工具實作，整體 Tier 2／子任務一般實作。僅工具與新增回歸兩檔，通過實載 TS 回歸及 tsc。父代理檢查 API、原 helper 行為、全測試與兩引擎操作；返工一次補上部分失效 linked ID 的未分類投影，其餘無父代理重作。

下一步先完成此 PR 審查，再決定合併；C2（保存當次目的或改統計）與 D（Home／Routine／Session 延伸）需另行決策，不因 C1 自動啟動。
