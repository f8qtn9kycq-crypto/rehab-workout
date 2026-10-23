# 痠痛 v2 分享、備份與還原

## 範圍與資料契約

Tier 3；接續 #230 的剩餘完整功能。分享 CSV 可選日期，預設備註排除且需主動勾選；所有欄位 CSV 引號與公式防護。完整 CSV 包含所有可見記錄、0、備註與 createdAt／tissue／note_present，供閱讀而非匯入。JSON 是可見紀錄 snapshot，保留原 ID、日期、createdAt、0、空／缺少備註、F/B/side/center 與沒有 view 的 legacy；不是兩個 LocalStorage key 的原始 bytes 備份。完整備份不受分享日期控制、不含已刪紀錄。

還原接受原 #230 schemaVersion 1 的 legacy JSON，以及 schemaVersion 2 可見 snapshot。全檔先驗證，duplicate backup IDs／非法日期、位置、程度、備註或 schema 整批拒絕；既存 ID 與本機 legacy 刪除狀態優先，不覆蓋現有內容。來源 tombstone 不攜入、不刪目的端可見資料。每次確認重讀目前資料，成功只一次 setItem(v2)，v1 原 bytes 永不改寫；quota／read-failed／corrupt／capacity 保留原值，重試不重複，不自動淘汰紀錄。

v2 envelope 新增 optional `importedLegacyEntries`，專放從備份加入的 legacy，不能塞入新式 `entries` 或猜 view。讀取嚴格驗證各集合與跨集合 ID collision。刪除 imported legacy 保留 payload 及 tombstone，避免舊備份復活；可見集合、imported 集合、墓碑各最多200，超額操作拒絕並保留原資料。已刪 payload 不進匯出；clear-data 仍涵蓋整個v2 key。既有無 imported 欄位的資料相容。

這是加項且可回復的還原；不更動疼痛門檻、紅旗、SafetyGate、SafetyRouteGuard、session 或推薦，不把0或缺值解釋成康復。

## 驗證（2026-10-23）

- 父代理在最新相依基準後執行 npm ci/build/完整 npm test/safety-i18n/diff check，exit0；既有v1/v2/trends與新增transfer回歸全部通過。
- `scripts/soreness-transfer-regression.mjs`：fresh/current roundtrip、schema1、正背中央／legacy／0／notes保真、current-wins／墓碑不復活、整批invalid拒絕、跨集合collision、容量／200墓碑邊界、read/corrupt/quota原bytes及其他keys保留、重試去重、雙語CSV/date/filter/formula escaping。
- `scripts/soreness-transfer-browser-qa.mjs`，Vite 4181、獨立 profiles：Chrome（Chromium）及WebKit × zh-TW/en ×320/375/390 共12組通過。實際讀取下載stream確認分享隱私、主動備註、完整CSV/JSON內容；實際file input選檔、確認前不寫、quota失敗不寫、同份pending重試一次寫入、非法JSON不寫、v1／其他key原值不變；核心控制≥44px、無水平溢出、英文無中文洩漏。
- 初次browser QA誤將原生選檔按鈕的role當成確認，停在file chooser；改以明確雙語確認標籤後兩引擎完整重跑通過。這是QA定位修正，不是產品故障。
- 使用合成資料與隔離origin，未讀取使用者健康資料。真人／實體iPhone Safari／VoiceOver／受保護Preview互動／production NOT VERIFIED。沒有宣稱所有iOS下載行為或臨床驗收。

## 委派與獨立審查

指定Astra/high，實際模型工具未提供證明故NOT VERIFIED；repo／子任務皆Tier3（資料還原決策），範圍為上述transfer，不更動安全契約。代理完成主要實作及專用tests後因額度停止，未commit；父代理檢查儲存與CSV差異、補可重跑browser QA、整合main、完整測試及12組browser驗證後提交。沒有重複委派或以較弱模型冒充結果；返工為補齊未完成的browser證據與QA定位。獨立Codex／Claude與PM以最終PR exact head重新執行，實作代理不算審查。

## Walkthrough

在PR Preview使用隔離測試資料：①各記一筆正面、背面及0分，含測試備註；②展開分享，確認預設不含備註，下載後檢查，再主動勾選；③完整JSON備份，在另一個空白測試origin或profile匯入，先看預覽再確認；④重複匯入應略過既有ID、不增加重複；⑤刪除測試legacy後舊備份不復活。不要為驗收刻意誘發疼痛或紅旗。回報日期、PR head／URL、裝置瀏覽器、語言、起始資料、預期／實際、卡點、檔案內容與重複／遺失結果；未實際操作不填Pass。

## P1 修正：原生日期未完成輸入

真實 Chrome 的分段日期只輸入 `1` 時，`value === ''` 但 `validity.badInput === true`；舊UI仍顯示不限日期2筆、下載可用，可能分享超出使用者預期的日期範圍。只監聽input事件不足以捕捉此原生鍵盤狀態；改在input/keyup/blur更新validity，並在下載當下再次讀實際欄位有效性。空白仍是合法不限日期；未完成或倒置日期顯示錯誤且禁止分享，完整備份不受影響。新增真實鍵盤、修正日期恢復預覽、倒置與清空日期回歸，Chrome/WebKit雙語三寬完整流程重跑通過。

## Codex P1 修正：無 payload 的墓碑仍具權威

獨立Codex於a80d25d指出一般save/delete會沿用舊過濾、清除沒有本地payload的墓碑，造成restore已略過的ID於下一次匯入復活。先新增restore→一般save/delete→再import的三路徑regression，舊碼RED實際新增了原本應略過的1筆。修復為所有writer保留同一份validated墓碑，不分restore或一般寫入；墓碑滿200時新增刪除操作capacity拒絕並保留bytes，不以清理墓碑騰空間。原v2測試的「刪除stale墓碑」預期因此更新為資料保留／容量拒絕；不是刪除安全驗證來取得綠燈。
