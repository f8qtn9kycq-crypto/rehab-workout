# Roadmap 交付追蹤與下一輪候選

本文件更新 2026-10-08 至 10-22 PR 回顧後的實作路線圖。觀察日為 2026-10-23（臺灣時間），已核對的 main 基準為 `a0a4d03560193da0ca332dac9b2939db4fabdf1b`。產品方向維持安全、信任、低摩擦開始、引導與追蹤；不以 PR 數量代表產品成果。

## 已交付

| 範圍 | PR | 已合併 squash | 證據與限制 |
|---|---|---|---|
| YouTube 動作可重複技能 | #231 | 3b3c3aac5f39ca424ba912043449b0a3ac602651 | 文件與技能驗證；來源不足不猜劑量或推薦資格 |
| 器材／握把交接 | #225 | c528fbb9a50947e7f673bf07a3495b13a0cb81d7 | 必要支撐預設、WebKit控制高度、保存時版面重排修復；雙引擎12組QA；無真機宣稱 |
| 漸進評估 | #151 | ca062552b33a64c0f4e1e5e57b355fd45279b3dc | 保留共用人體圖、評估設定與安全路徑；雙引擎12組QA |
| 授權與來源契約 | #144 | d6a7fd3623d48d603ae04ac385d41585c47e6975 | 明確使用者授權優先；純文件，未降低Tier3審查 |
| 建置相依收斂 | #236 | 8632db3554bdadac2997b3e35b4024a173fe1ba1 | Node修補＋Pillow13；CSS/JS bytes相同，40圖片來源再生相同；剩餘公告明示 |
| 唯讀痠痛趨勢 | #237 | a0a4d03560193da0ca332dac9b2939db4fabdf1b | 前後／側別／中央／legacy分離，7/30/90真實離散點；缺值與0不推論恢復；雙引擎12組QA |

各 PR 的精確 head、獨立審查、CI 與分支清理以該 PR 留言為準。#225／#151 的 Claude 為建議審查，額度限制及未採用原因有記錄；#236／#237 的必要 Claude 已實際完成，不能將此差異抹平。

## 尚未完成的原路線圖範圍

完整分享CSV、完整CSV/JSON備份、additive restore由 #238 承接原 #230，不能用 #237 的唯讀趨勢代替。#238 尚待最終精確 head 必要審查與合併；在 main 實際包含交付前，這項維持 Pending。

#230 舊分支基於v1而與main衝突。保留其需求，但不機械合入舊writer。#134／#135／#145／#186指定版本已由#236涵蓋；這是main版本證據，並非那些PR本身已合併。#187的Tailwind4方案目前因PostCSS設定失敗，不能作為一般修補直接合入；新版selector公告與剩餘工具鏈風險仍需另案評估。

## 下一輪優先序

1. 完成 #238 必要審查、任何具體修復與 exact-head gate；備份／還原不得以「只做匯出」或只支援新資料縮小驗收。
2. 對已交付流程做固定情境觀察：首次安全開始、已安全且有評估的回訪、功能追蹤到期、動作庫器材交接補記、痠痛資料攜出與空白profile還原。每項記錄是否需要提示、卡點、是否產生重複／遺失；只填實測時間，不估算改善百分比。
3. 依上述觀察重新決定 #150。舊diff移除情境首頁nextAction並固定導向/start，會失去回訪繼續／功能追蹤主入口。先保留既有情境與次要補記，再比較是否需要身體圖入口；不把unused helper的16-state測試當實際首頁導覽證據。
4. 另訂Tailwind工具鏈遷移方案：列公告適用路徑、PostCSS設定、CSS前後比對、雙語320/375/390核心操作與回退計畫；Tier3獨立審查。未證明production可利用性，不宣稱目前網站已被利用，也不將所有相依公告視為同一緊急事件。

暫不排入新增進階動作、整套session orchestration、後端同步、AI chatbot或遊戲化。組合執行上下文需先觀察3動作使用情境，再定partial save、去重、停止／resume與跨動作安全契約。保守內容缺口可以保留。

## 下一個實作的準備條件

候選分支 `codex/home-returning-flow-validation`；範圍為首頁實際render/navigation驗證及有證據的最小修正，涉及routing/session時至少Tier2。可能檔案：HomePage、homeNextAction、home-entry regression、兩locale與QA。驗收必須涵蓋首次／回訪、安全有效／失效／blocked、已有評估、最近紀錄及功能追蹤狀態；SafetyGate、疼痛門檻、紅旗、guard、推薦與storage保持。不先實作全新首頁或新增常駐分類服務。

> Read AGENTS.md, REVIEW.md, the PR template and the latest roadmap status. First inspect the rendered HomePage and existing next-action coverage on current main. Compare first-run, safe returning, continue-training and outcome-check-in scenarios before adopting PR #150. Preserve the current primary context and retrospective logging entry. Implement only a demonstrated scoped regression, add meaningful rendered-navigation validation, open a minimal PR and trigger applicable exact-head review. Do not merge without explicit authorization and a clean final gate.

這是下一輪候選提示，不代表本輪自動啟動新的首頁改版。完成 #238 後重新核對main與需求，再選一個工作單位。

## 證據邊界

本機測試、CI、Chrome/WebKit自動化、真人、實體iPhone、VoiceOver與production分開記錄。沒有新的真人／真機結果；walkthrough不得要求刻意誘發疼痛或紅旗。專業動作定位驗收另依既有視覺與安全規則，不能用此roadmap文件授予核准。`sources/`同步參考不修改。
