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
