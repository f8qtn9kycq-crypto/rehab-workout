# Roadmap 交付追蹤與下一輪候選

本文件更新 2026-10-08 至 10-22 PR 回顧後的實作路線圖。觀察日更新為 2026-10-24（臺灣時間），已核對的 main 基準為 `4d5c2829a4bd6a3cc9d9d976230712df2a656fd1`。產品方向維持安全、信任、低摩擦開始、引導與追蹤；不以 PR 數量代表產品成果。

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

## 原路線圖完成核對

完整分享CSV、完整CSV/JSON備份與additive restore已由 #238 承接原 #230，於2026-10-24合併為 `4d5c2829a4bd6a3cc9d9d976230712df2a656fd1`。最終head `0365cffc28182d4fe66291516be770db019b106c` 的Codex、Claude、PM與必要CI完成；詳見PR最終gate留言。原路線圖交付完成；舊 #230 分支仍開啟，不能稱該PR已合併。

#230 舊分支基於v1而與main衝突。保留其需求，但不機械合入舊writer。#134／#135／#145／#186指定版本已由#236涵蓋；這是main版本證據，並非那些PR本身已合併。#187的Tailwind4方案目前因PostCSS設定失敗，不能作為一般修補直接合入；新版selector公告與剩餘工具鏈風險仍需另案評估。

## 下一輪優先序

1. 對已交付流程做固定情境觀察：首次安全開始、已安全且有評估的回訪、功能追蹤到期、動作庫器材交接補記、痠痛資料攜出與空白profile還原。每項記錄是否需要提示、卡點、是否產生重複／遺失；只填實測時間，不估算改善百分比。
2. 依上述觀察重新決定 #150。舊diff移除情境首頁nextAction並固定導向/start，會失去回訪繼續／功能追蹤主入口。先保留既有情境與次要補記，再比較是否需要身體圖入口；不把unused helper的16-state測試當實際首頁導覽證據。
3. 依已合併 #241 的[工具鏈遷移方案](toolchain-migration-plan-2026-10-24.md)，先確認最低瀏覽器版本與是否需要控制性實驗，再決定實作。方案已涵蓋：列公告適用路徑、PostCSS設定、CSS前後比對、雙語320/375/390核心操作與回退計畫；Tier3獨立審查。未證明production可利用性，不宣稱目前網站已被利用，也不將所有相依公告視為同一緊急事件。

暫不排入新增進階動作、整套session orchestration、後端同步、AI chatbot或遊戲化。組合執行上下文需先觀察3動作使用情境，再定partial save、去重、停止／resume與跨動作安全契約。保守內容缺口可以保留。

## 下一個實作的準備條件

### 2026-10-24 技術驗證進展

等待 #238 必要外部審查期間，已先補齊目前 HomePage 實際渲染與導覽驗證：46 個 SSR 案例、Chrome/WebKit 合計192矩陣導覽及36邊界流程。固定 `/start` 的 temporary mutation 會使測試失敗，還原後通過；沒有改 runtime。詳見[驗證報告](qa/home-returning-flow-validation.md)。這完成下列候選的技術檢查部分；真人理解、任務時間與三動作組合使用阻力仍待觀察，不能把自動化 Pass 當成新首頁設計已獲接受。

上述驗證已由 #240 合併（`5fe187c132fbe5dddfec1ad6e1fc7bca9dbbb401`），不再作為待實作候選。#241 文件方案亦已合併（`8501178c600c4ede62445e0b8206a012912c0df5`），未升級Tailwind或提高瀏覽器門檻。

下一個產品實作必須先有固定情境的實際卡點與驗收條件，再選一個最小修正。現階段沒有足夠證據直接合入 #150 或啟動三動作session orchestration；不為等待審查而新增範圍。

## 證據邊界

本機測試、CI、Chrome/WebKit自動化、真人、實體iPhone、VoiceOver與production分開記錄。沒有新的真人／真機結果；walkthrough不得要求刻意誘發疼痛或紅旗。專業動作定位驗收另依既有視覺與安全規則，不能用此roadmap文件授予核准。`sources/`同步參考不修改。

## 2026-10-24 再評估：目前可做與等待條件

下表保留原7個舊PR的exact head與Build快照；本次重查#187已closed-unmerged，其他舊head未變。舊head的綠燈不能代替最新main的合併門檻。未知mergeability曾重新查詢，結果如下。未關閉、合併或重寫這些舊分支。

| PR | head | 即時狀態與風險 | 本輪決定 |
|---|---|---|---|
| #230 | b967d73eb9d211e45bd707426772cc43e0362ec0 | 非Draft、dirty/conflict；原head Build success，舊v1 writer不適用目前v2 | 需求由#237/#238交付，不合入舊writer |
| #150 | 8726ea88213f8284151d767b3cd0984992929077 | 非Draft、dirty/conflict；原head Build success；固定/start會丟情境下一步 | 先取得真實使用卡點，不盲解衝突推出原設計 |
| #187 | f7fec2eec9ac22e12e044a00e2b6571748e159bf | 已closed、未merged；歷史Build120776704673 failure，PostCSS plugin未遷移 | 維持目前相容性，不重開或遷移v4 |
| #186 | 3240a27dee8b4b6918b7fa5b1625a8aebebfa8ef | 非Draft、mergeable/behind；原head Build success | source-map-js1.2.2已由#236交付，不重複改lock |
| #145 | b8621ab0254f83d0aceca62aa26aa843cb07c919 | 非Draft、mergeable/behind；原head Build success | baseline-browser-mapping2.11.28已由#236交付 |
| #135 | af2185e166740908195cfa0ef050baa07152080c | 非Draft、dirty/conflict；原head Build success | browserslist4.29.3已由#236交付 |
| #134 | 98051b50ca212787956434429b18eb83899caeac | 非Draft、mergeable/behind；原head Build success | parser6.1.4已由#236交付，不能為合舊PR而降版 |

#185的37張固定圖片hash、canonical/alias及review欄位核對一致；文件準備已具備，實際專業動作/安全結果仍NOT VERIFIED，不以AI機械核對結案。指定Luna/medium，實際模型NOT VERIFIED；Tier0機械核對、無寫檔；父代理核對既有packet與回報，無返工。

後續產品成果觀察可用[固定情境紀錄](qa/roadmap-dogfood-2026-10-24.md)；工程實作優先先收尾已發現的功能確認交接問題，再重新選一個瓶頸。觀察表已準備，真人結果尚未取得；不把表格或自動化視為使用者結果。Tailwind4仍待產品支援版本決策，新的進階動作／雲端／整套session引擎亦沒有新的ready依據。

既有issue-to-PR技能已局部對齊目前授權與證據規則，沒有新增分類服務或自動合併權限。官方quick_validate通過；系統Python缺PyYAML時改用任務專用臨時venv安裝依賴驗證，沒有改全域設定。

本輪已完成可行的維護工作 #243：保留Tailwind3.4.19，以精確parser7.1.6 override移除本次npm公告；squash `5ed50040744be5292e30d39f85dc7ffb1a052474`，reviewed head `e3d9c3e223fef69d097a30d6a798a39a712ed43b`。Codex、Claude、PM與CI均Pass後依明確授權合併；58份dist bytes相同、完整測試與安全audit通過。詳見[相容性QA](qa/parser-override-compatibility.md)。工具鏈方案的「override尚未驗證」是實驗前快照，現由此結果更新；Tailwind4與最低browser決策仍未ready。

## 最新交接與文件修正（2026-10-24）

本輪重新核對 main `8d461fc4546740b17f9aabba97620e65a726abe4`，已包含 #246 與 #245。#245 的技能探索、Issue form、審查事件、Project token trusted-main 邊界與 workflow fixtures 均沿用；本機只整理尚未交付的中央契約、Build concurrency 與 roadmap 文件。#244 遠端仍為舊文件分支，本機整合不代表其 PR 已更新或合併。

功能確認的非肩部 Session 交接與同文件 SPA 錨點返回已獨立發布為 PR #247，head `f5a5cde435314e05ea2b5a656bb9aa2df2667988`，尚未合併。對齊此 main 後兩 TSX 與 browser QA 腳本保持舊驗證版本 bytes；新 head 必要 Build（含完整測試、workflow／動作圖檢查與安全稽核）成功，Codex provider completed 無 findings，Ready／MERGEABLE／CLEAN；Claude 為 Tier 2 建議審查，已請求但 Pending。舊基準瀏覽器結果不冒稱新基準重跑。#246 已交付的是首頁入口，不能與 #247 後續修正混為同一交付。

優先序：①交付已完成的功能確認小修正；②整合 workflow／roadmap 尚餘差異；③再決定 Exercise Discovery。47 項分類仍為提案、四項歧義待決，舊 kind 不是 trainingPurpose，Phase B–D 尚未獲准。

#152 產品成果與每 PR 工程門檻分開；不新增每 PR 真人／iPhone／VoiceOver／臨床／production walkthrough，未驗證仍標 NOT VERIFIED。使用者已分別授權 #247 與獨立 workflow PR 的 push／PR／CI及審查；未授權 merge、刪除、部署或改保護設定。本 workflow 本機完成不代表遠端交付完成，不修改其他工作線的 #244。Build 真實取消行為與 fork／審查事件完整矩陣仍依既有計畫驗證。

本 workflow 的本機靜態補充審查：指定 gpt-6-astra/high，實際模型 NOT VERIFIED；repo Tier 0 候選／子任務為高風險契約保留判斷。完整18檔無高信心 P0/P1，另建議同步 #247 發布狀態，已由父代理修正；未改產品或降低安全／審查要求。父代理已執行 workflow fixtures、保留語義檢查、三技能驗證及32個本機連結核對；代理未獨立跑動態 fixtures，結果不當 GitHub provider approval。

## PR #248：push pending 隔離修正（2026-10-25）

在 `576ad14` 的遠端 Build 成功、Codex 無 findings 後，父代理補核 GitHub 官方 concurrency 文件確認：預設 single pending 會以新 pending 取代同組既有 pending，`cancel-in-progress: false` 只保護正在執行的 run。原 push 以 branch ref 共組，不足以完整保證「只取消同 PR 舊執行」。來源：https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency 。

最小修正保留 workflow＋event 前綴，PR 以 pull_request.number 共組，非 PR 以 run_id 獨立分組，cancel-in-progress 仍僅 PR 為 true。原 triggers、jobs、steps、token、安裝與必要檢查不變。既有 workflow-regression.py 補實際 expression 分組及 GitHub single-pending 佇列模型；同分支三次 push 的既有設定先 RED（pending 被取消），修正後 GREEN，另覆蓋同PR取消、不同PR／workflow／event隔離及main／codex push。此模型不是 GitHub 真實取消事件證據，原完整事件矩陣仍 NOT VERIFIED。

原臨時副本在目前執行環境不可用；另建本聊天 work/ 隔離clone，未刪除或更動原 checkout。使用 repo 固定 PyYAML==6.0.3 的本機虛擬環境，不變更系統或全域設定。新增 regression 使本 PR 共19檔，仍無產品 src 或分類實作。新 head 必須重新取得 CI／審查，不能沿用舊head無findings作Pass。

分類 Phase A 的四項歧義已由使用者確認，並沿用其餘43項草稿；這只完成用途決策，Phase B–D 仍未開始。
