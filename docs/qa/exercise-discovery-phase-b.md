# Exercise Discovery Phase B 驗證

日期：2026-10-25。基準 main `8d461fc4546740b17f9aabba97620e65a726abe4`。獨立分支，不含尚未合併的 #247／#248；只交付用途對照、動作庫、補記選擇器及必要卡片／詳情標籤。

## 前後行為

| 情境 | 原行為 | Phase B |
|---|---|---|
| 肩袖外旋復健 | 先依部位或原快捷選擇找動作 | 復健入口＋中英文搜尋；補記直接列出 |
| 深蹲、肩推 | 缺少獨立肌力用途入口 | 肌力＋搜尋；保留推／拉／腿快捷 |
| 熱敷／RICE | 與一般動作混列 | 復健照護群組，標示不是一般反覆次數運動 |
| Y／T／W | 無跨用途入口 | 復健與肌力均找得到，同一 ID |
| 推薦範圍沒有結果 | 用途與推薦可能混淆 | 明示目前範圍、清除條件或明確改看全部 |
| 從詳情返回 | 原部位條件 | 保留 URL 中用途、搜尋、收藏與部位 |
| 私人動作 | 原私人記錄入口 | 入口保留，不由 kind 推論用途 |

## 自動化與本機證據

- `npm test`：完整套件 Pass，含既有安全、session save、migration、draft、favorites、records、art identity、library recording 與新增 discovery 回歸。
- `npm run build`：Pass；仍有既有大於 500 kB chunk 提示，未宣稱效能改善。
- `npm run audit:safety-i18n`：Pass。初次遇新 JSX 中文註解被判英文 UI 滲漏，僅改英文註解後通過，未放寬稽核。
- `npm run audit:exercise-coverage`：47／47 覆蓋、catalog-only 隔離通過；重新生成 coverage 文件，未改官方動作來源。
- `git diff --check`：Pass。
- 新增 SSR／純函式回歸：47 ID 完整且無重複、37／27 入口、17 雙用途、中英文與全形搜尋、未知／原型 ID、收藏／部位／搜尋／範圍交集、原推薦排序與資格、pain 6 停止、localStorage bytes 不變。

## 瀏覽器自動化

以隔離 Playwright profile、合成資料與本機 Vite `127.0.0.1:4217` 執行 `scripts/exercise-discovery-browser-qa.mjs`。Chromium／WebKit 各涵蓋 zh-TW／en × 320／375／390 px，共 12 組完整情境。

驗證動作庫用途與搜尋、詳情 SPA 返回、空結果清除；補記純探索不增加保存、實際選取仍保存 canonical ID、私人入口可用；44 px 用途按鈕、無橫向溢出。額外檢查收藏／部位／用途／名稱交集、鍵盤 Enter／Tab、明確切換全部範圍、catalog-only 直接 session 路由仍受阻、pain 6 空推薦與警示；已有肩部評估時明確選全部部位，恢復全部 47 項。

補記原有 mount autosave 保留；比較初始化完成後的 bytes，不能宣稱進入表單完全零寫入。初次英文 QA fixture 名稱用錯而 timeout，修正為實際名稱 Band shoulder external rotation；後續完整矩陣通過。

結果與畫面保留於本輪 `output/playwright/discovery-{chromium,webkit}-result.json`、對應 `*-library-zh-375.png`／`*-picker-zh-375.png`，不加入正式產品資產。已實際檢視 WebKit 375 px 兩張畫面；用途與搜尋可見，較下方內容可捲動。

## 審查與界線

委派實作：指定 gpt-6.1-sol／high，實際模型 NOT VERIFIED；子任務為 ManualWorkoutPage 與既有 manual regression，父代理核對差異、完整套件及兩引擎互動，未委派安全決策。獨立審查：指定 gpt-6-astra／high，實際模型 NOT VERIFIED，唯讀核對安全、資料及推薦契約；無 P0／P1；採納官方／私人空結果文案區分，補記不再顯示此頁不存在的部位篩選。最終 exact-head 結果於 PR 記錄。

本機與瀏覽器自動化不等於遠端 CI、真人、實體 iPhone、VoiceOver、臨床判定或 production。以上後者均 NOT VERIFIED；CI 與 exact-head Codex／Tier 3 Claude／PM 結果於 PR 更新。沒有合併、分支刪除或手動部署授權。

Phase C 的歷史用途及 Phase D 的 Home／Routine／Session 導覽未啟動。既有疼痛門檻、red flags、SafetyGate、推薦、session writer、storage schema、圖示、Tailwind 3 保留。

## Claude 完整審查後的部位範圍修正

Claude 已取得並讀完整19檔，對293dd22回報一項P1：推薦範圍下的「全部部位」仍回退身體評估部位，按鈕標示誤導。SSR先驗證推薦清單仍等於原肩部推薦，並以「不應有無效全部部位按鈕」新增斷言重現RED。修正只在「所有動作」範圍顯示全部部位，推薦範圍改顯示中英文說明；沒有改推薦引擎或安全資格。新增兩語SSR與兩引擎瀏覽器邊界，涵蓋推薦結果保持、控制項隱藏、說明可見與儲存不變。最終head的驗證與再審查於PR記錄。

另核對到舊head830395a的Codex inline P1（收藏前提錯誤）：已由293dd22改為正確27項，兩引擎原始報告皆完整返回且後續pain-stop通過；解決與驗證紀錄留於該thread，不以最新summary無finding忽略舊thread。
