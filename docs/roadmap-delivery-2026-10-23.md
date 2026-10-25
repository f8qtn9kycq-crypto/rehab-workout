# Roadmap 交付追蹤與下一輪候選

本文件更新 2026-10-08 至 10-22 PR 回顧後的實作路線圖。歷史觀察保留2026-10-24快照；本輪收尾核對為2026-10-26（臺灣時間），main基準 `e35454952701ee8b397a245697ec5cb6bdae4bdf`，已包含#249與#247。產品方向維持安全、信任、低摩擦開始、引導與追蹤；不以 PR 數量代表產品成果。

## 已交付

| 範圍 | PR | 已合併 squash | 證據與限制 |
|---|---|---|---|
| YouTube 動作可重複技能 | #231 | 3b3c3aac5f39ca424ba912043449b0a3ac602651 | 文件與技能驗證；來源不足不猜劑量或推薦資格 |
| 器材／握把交接 | #225 | c528fbb9a50947e7f673bf07a3495b13a0cb81d7 | 必要支撐預設、WebKit控制高度、保存時版面重排修復；雙引擎12組QA；無真機宣稱 |
| 漸進評估 | #151 | ca062552b33a64c0f4e1e5e57b355fd45279b3dc | 保留共用人體圖、評估設定與安全路徑；雙引擎12組QA |
| 授權與來源契約 | #144 | d6a7fd3623d48d603ae04ac385d41585c47e6975 | 明確使用者授權優先；純文件，未降低Tier3審查 |
| 建置相依收斂 | #236 | 8632db3554bdadac2997b3e35b4024a173fe1ba1 | Node修補＋Pillow13；CSS/JS bytes相同，40圖片來源再生相同；剩餘公告明示 |
| 唯讀痠痛趨勢 | #237 | a0a4d03560193da0ca332dac9b2939db4fabdf1b | 前後／側別／中央／legacy分離，7/30/90真實離散點；缺值與0不推論恢復；雙引擎12組QA |
| Exercise Discovery Phase B | #249 | 1a20543ad73acf64f0dd79668b48881aa973859b | Phase A 47項已核准；動作庫／補記用途入口與搜尋、標籤交付；[分類](exercise-taxonomy.md)與[QA](qa/exercise-discovery-phase-b.md)，main Build成功 |
| 功能確認Session／SPA交接 | #247 | e35454952701ee8b397a245697ec5cb6bdae4bdf | 已保存部位交接、返回保留草稿；雙引擎30情境及邊界通過，main Build成功；[QA](qa/outcome-check-in-handoff.md) |

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

## 交接與文件收尾（2026-10-26；保留10/24歷史基準）

10/24交接基準為 main `8d461fc4546740b17f9aabba97620e65a726abe4`，已包含 #246 與 #245；本輪已更新至 `1a20543ad73acf64f0dd79668b48881aa973859b`，另含#249；其後#247已合併，本輪收尾基準為 `e35454952701ee8b397a245697ec5cb6bdae4bdf`。#245 的技能探索、Issue form、審查事件、Project token trusted-main 邊界與 workflow fixtures 均沿用；本機只整理尚未交付的中央契約、Build concurrency 與 roadmap 文件。#244 遠端仍為舊文件分支，本機整合不代表其 PR 已更新或合併。

功能確認的非肩部Session交接與同文件SPA錨點返回已由#247合併為 `e35454952701ee8b397a245697ec5cb6bdae4bdf`，不與#246首頁入口混稱同一修正。Reviewed head為 `50f6d674d7c62e8669f4fb7cdeeac7a32f437b1b`；完整本機測試、雙引擎各15矩陣及真正同document Back/Forward／草稿／完整hip session交接、新head Build／Codex與Claude獨立靜態審查皆Pass。main push Build40214656550亦成功，main內容與reviewed head的diff為空。使用者只批准此PR合併並接受GitHub既有自動刪遠端分支，不外推至#248。

優先序：①#247已交付，維持#248就緒並等待其獨立交付決策；②再審議Phase C。Phase A的47項用途及四項歧義已核准，Phase B已由#249交付main；舊kind仍不等於trainingPurpose。Phase C只有唯讀提案，實作未授權；Phase D未啟動。

#152 產品成果與每 PR 工程門檻分開；不新增每 PR 真人／iPhone／VoiceOver／臨床／production walkthrough，未驗證仍標 NOT VERIFIED。使用者已授權#247與獨立workflow PR #248的push／PR更新／CI／審查，並於本輪選擇先收尾這兩項。其後使用者僅批准#247合併，尚未授權#248合併、刪除、手動部署或改保護設定。#249與#247的獨立合併授權均不擴及#248。#248已發布但尚未合併，本機完成不等於交付；不修改其他工作線的#244。Build 真實取消行為與 fork／審查事件完整矩陣仍依既有計畫驗證。

本 workflow 的本機靜態補充審查：指定 gpt-6-astra/high，實際模型 NOT VERIFIED；repo Tier 0 候選／子任務為高風險契約保留判斷。完整18檔無高信心 P0/P1，另建議同步 #247 發布狀態，已由父代理修正；未改產品或降低安全／審查要求。父代理已執行 workflow fixtures、保留語義檢查、三技能驗證及32個本機連結核對；代理未獨立跑動態 fixtures，結果不當 GitHub provider approval。

## PR #248：push pending 隔離修正（2026-10-25）

在 `576ad14` 的遠端 Build 成功、Codex 無 findings 後，父代理補核 GitHub 官方 concurrency 文件確認：預設 single pending 會以新 pending 取代同組既有 pending，`cancel-in-progress: false` 只保護正在執行的 run。原 push 以 branch ref 共組，不足以完整保證「只取消同 PR 舊執行」。來源：https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency 。

最小修正保留 workflow＋event 前綴，PR 以 pull_request.number 共組，非 PR 以 run_id 獨立分組，cancel-in-progress 仍僅 PR 為 true。原 triggers、jobs、steps、token、安裝與必要檢查不變。既有 workflow-regression.py 補實際 expression 分組及 GitHub single-pending 佇列模型；同分支三次 push 的既有設定先 RED（pending 被取消），修正後 GREEN，另覆蓋同PR取消、不同PR／workflow／event隔離及main／codex push。此模型不是 GitHub 真實取消事件證據，原完整事件矩陣仍 NOT VERIFIED。

原臨時副本在目前執行環境不可用；另建本聊天 work/ 隔離clone，未刪除或更動原 checkout。使用 repo 固定 PyYAML==6.0.3 的本機虛擬環境，不變更系統或全域設定。新增 regression 使本 PR 共19檔，仍無產品 src 或分類實作。新 head 必須重新取得 CI／審查，不能沿用舊head無findings作Pass。

10/25已確認Phase A四項歧義並沿用其餘43項；其後Phase B經獨立授權，由#249合併為1a20543。Phase C只完成唯讀提案，未實作；Phase D延後。

## #249之後的workflow整合核對（2026-10-26）

本PR只以正常merge承接main1a20543，再更新本文件的交付事實；不重寫遠端歷史。來源clone為shallow，已補共同祖先8d461fc後正常合併，未使用allow-unrelated-histories。與新main相比維持原19檔workflow／契約／文件範圍，沒有src／產品行為改動。

本機獨立唯讀補充審查指定gpt-6-astra/high，實際模型NOT VERIFIED；repo Tier0 workflow、子任務為高風險信任邊界判斷。完整19檔核對無高信心P0/P1，指出過時Phase A/B與#247狀態，父代理已更新；代理未寫檔或獨立重跑完整測試。父代理另驗原中央契約各既有區段逐值不變、三個trusted workflow bytes不變、Build除concurrency外的名稱／事件／job／steps不變，再跑workflow fixtures與既有檢查。新精確head的CI／Codex結果留PR，不沿用舊head。

本PR是實際CI排程變更，不稱純文件；按現行docs/pr-workflow.md所容許的不改app runtime之窄幅workflow維持Tier0，不改權限、token、必要檢查、執行來源或部署邊界。Tier0不等於自動合併資格：本PR含可執行regression腳本，不能只憑分級視為符合嚴格檔案白名單，更不能推定合併授權。真實取消／fork事件矩陣仍NOT VERIFIED，不冒稱模型測試等於遠端事件。

本輪整合副本已實際完成：workflow-regression（YAML／form／shell、6事件／6 Build gate／3 review gate／2 API失敗及取消模型）、原14契約區段逐值相同、三個trusted workflow bytes相同、Build除concurrency外結構相同、所有變更Markdown的本機連結、三技能quick_validate、完整npm test、build、safety-i18n與diff check，皆Pass。獨立Astra對本輪roadmap單檔差異再核對無新P0/P1；實際模型仍NOT VERIFIED。這些是本機及獨立靜態證據，遠端CI／provider結果另依新head留言。

## #247合併後的base對齊（2026-10-26）

本輪繼續先前已授權的#248收尾，以普通merge承接main e354549；沒有合併#248至main。相對前一輪4f6079b，除main的四檔#247改動外，只更新本文件的交付事實；相對最新main仍維持原19檔workflow／契約／文件範圍，無src差異。原本對base1a20543的CI／CLEAN結論不直接沿用，另在新head重新驗證。本機原始checkout、本機分支與QA保留；未手動部署，C1／PhaseD未啟動。
