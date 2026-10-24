# 首頁功能確認交接修正

2026-10-24，基準 main `5ed50040744be5292e30d39f85dc7ffb1a052474`。Roadmap「固定情境觀察→最小修正」中的功能追蹤到期情境；Tier 2，僅導覽／表單部位交接，不改安全或儲存規則。

## 重現與結果

使用隔離origin及合成資料：當日安全完成、有踝部評估與踝部訓練紀錄、沒有近期功能確認。原版首頁提示「新增功能確認」，CTA只到 `/logs`；功能表單位於頁面下方且預選肩膀。直接保存後實際存成 shoulder，回首頁仍是「新增功能確認」。Chrome實際操作重現，非真人易用性結論。

修正後CTA為 `/logs?outcomeArea=ankle#function-check-in`。表單接收合法五部位，定位並聚焦標題；使用者仍可改選。相同操作實際存成 ankle，首頁轉為「繼續訓練」。一般 `/logs` 或沒有指定fragment不改預設；非法部位不帶入。僅導覽不新增紀錄，按保存才沿用既有writer；不把預選部位／分數當成新增觀察。

## 驗證

- `npm run build`、完整 `npm test`、`npm run audit:safety-i18n`、`git diff --check` 通過。既有bundle >500kB警告保留。
- 原16-state helper及46個SSR雙語輸出案例通過；補五部位URL及非法值回退。
- Chrome及WebKit，各96矩陣導航＋18個邊界流程（雙語×320/375/390），合計192＋36通過；每個適用的功能確認情境實際驗證部位、焦點／可視、保存與返回首頁轉向。原安全未通過／過期／blocked／first-run分流及次要補記保留，無水平溢出。
- `scripts/outcome-check-in-browser-qa.mjs` 補五部位、手動改選、一般／非法URL、返回頁面與導覽零寫入。Chrome通過；此額外腳本未獨立跑WebKit，雙引擎證據限上一項矩陣。
- 第一輪browser assertion在URL改變後太早讀React effect，失敗於部位交接；改為等待選取及焦點後重跑完整雙引擎矩陣通過，未改產品來略過測試。
- 初始重現fixture漏type/level導致舊log被正常忽略，補合法欄位後才取得上述原版／修正版結果。

依使用者本輪指示，暫不安排每PR實體iPhone、VoiceOver、臨床定位或production walkthrough；它們仍NOT VERIFIED，不冒充通過。本次沒有實際健康資料、外傳或改動原checkout。Exercise coverage不適用，未改exercise/filter/recommendation。

## 委派與後續

指定gpt-6.1-sol／medium，工具未提供獨立實際模型證明故NOT VERIFIED；子任務為只讀器材補記／痠痛還原核對，通過library-recording、soreness-transfer、manual-workout-draft regression且無高信心P0/P1。父代理獨立發現並重現首頁交接問題，負責全部修正、diff、全測試及雙引擎驗收；無同檔寫入或重做代理任務。

本輪不修改舊#150整體首頁方案，也不重開已完成的#230需求。接續roadmap仍以可重現卡點決定下一個小修正；三動作session orchestration沒有新證據，不擴大。本PR獨立審查／CI結果以精確head留言為準。

## 完成訓練與 SPA 返回收尾（本機，base d67463c）

兩項均以 Chromium 實際重現後才修正：髖部 guided session 完整保存後，原 CTA 到 `/logs#function-check-in` 而表單仍肩部；另在踝部 handoff 手動選膝部、score 7 及合成備註，點真實 `#records-cycling` 錨點再 Back，原 effect 把部位覆寫踝部，其他草稿仍在。

修正僅 SessionTracker 成功畫面 CTA 依已保存 log 的合法 bodyArea 帶 outcomeArea；表單以 Router location key＋query 辨識已套用 handoff，同文件錨點返回不重套，但新 key 或新 query 仍接受明確交接。未改 writer、保存順序、安全、處方、schema、推薦或分類。

既有 browser QA 新增三寬×五部位、兩輪真實頁內點擊／Back／Forward（檢查同 document 標記與草稿）、History API 新 key／query 及同 area 新 key 模擬、導航所有 LocalStorage bytes 不變、功能保存一次，以及真正完成 hip 三組 session→CTA→保存 hip、不重寫訓練 log。Chromium 與 WebKit 實際回傳全部 PASS；History API 新 handoff 是 Router entry 模擬，不冒充真人操作。

委派 gpt-6.1-sol/high，實際模型 NOT VERIFIED；repo／子任務 Tier 2，scope 限上述兩 TSX、既有 browser QA 與本文件。代理完成 RED／GREEN 與大部分測試後遇 usage limit，沒有最終交付；父代理讀 diff 與實際 JSON 結果，接手重跑 build、完整 npm test、safety 及 diff check，皆 exit 0，並補剩餘首頁 WebKit 驗證。QA 初次空 trainingLogs fixture 被既有 migration 補 []，修正合成 fixture 後重跑，未改產品。

未有新遠端 PR／head CI、GitHub 獨立 Codex 或 Claude 結果；本機修正不是 merge Pass。保留原外部審查規則，取得後續發布授權後再綁定新 head 取得適用審查。真人／iPhone／VoiceOver／production 仍 NOT VERIFIED，不新增 walkthrough 要求。

## 對齊 #245 後的交付核對（base 8d461fc）

最新遠端 main 與本機基準核對為 `8d461fc4546740b17f9aabba97620e65a726abe4`。原兩個 TSX 與 browser QA 腳本均保持前述雙引擎驗證版本 bytes；本段是後續文件，不改產品。新基準已完成 build、首頁 16-state／46 SSR、session save guard、records presentation、safety-i18n 與 diff check。本輪未重跑完整 npm test 或瀏覽器矩陣，前節完整測試／瀏覽器證據仍屬 d67463c 基準，不冒稱本輪重跑。

獨立本機補充審查：指定 gpt-6.1-sol/high，實際模型 NOT VERIFIED；repo／子任務 Tier 2，唯讀核對兩 TSX、既有 QA 腳本、保存與安全 guard。結果無高信心 P0/P1；未重跑測試、未寫檔、無返工。父代理核對 finding 範圍與四檔差異，未將本機補充審查當必要 GitHub provider／Claude 結果。

尚未 commit、push、建立 PR、取得新遠端 CI 或必要 provider review；不以本機 Pass 推定合併資格。原工作目錄及未追蹤資料保留。下一步取得明確發布授權，先交付本 Tier 2 功能修正，再處理獨立 workflow patch；兩者不混成同一 PR，不改其他聊天的 #244。
