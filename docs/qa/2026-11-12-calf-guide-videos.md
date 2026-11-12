# 小腿指南啾c影片來源與 QA 紀錄

## 任務與來源

- 模式：獨立指南新增外部影片參考；不新增或修改 canonical 動作資料。
- 使用者授權範圍：加入兩支指定影片與章節連結；保留文字教學、安全門檻、既有動作劑量、推薦資格、session、routing 與 LocalStorage 契約。
- Repo／branch／內容 commit／風險：`f8qtn9kycq-crypto/rehab-workout`／`codex/calf-guide-purpose-flow`／`04fe80f994d71f381574bad11cee526be6783239`／Tier 3 exercise content。最終 exact head 由 PR #253 current-head gate 記錄。
- 查證日期：2026-11-12。
- 方法：YouTube 官方 oEmbed 核對公開狀態、標題與頻道；原站 player metadata 核對發布日期及創作者說明中的章節。第一支字幕端點回傳空內容，第二支未提供字幕；未完成逐影格動作安全審查。

| 時間碼與來源 | 直接確認的內容 | 網站採用／不採用及理由 |
| --- | --- | --- |
| [Ky7_Hhp6Me0](https://www.youtube.com/watch?v=Ky7_Hhp6Me0)，2026-03-05，啾c物理治療師 | 04:28 小腿放鬆；06:23 靜態伸展；07:00 離心；08:40 單腳平衡；10:32 腳踝剛性；11:11 跳繩 | 只提供 04:28、06:23 直接連結。7:00 後標為進階內容，不列入日常舒緩。影片中的阿基里斯腱論述不作為診斷或個別治療依據。 |
| [T5FaG9OZnCk](https://www.youtube.com/watch?v=T5FaG9OZnCk)，2020-10-15，啾c物理治療師 | 01:16 小腿下段；02:01 小腿上段；07:03 小腿外側 | 提供三段直接連結。保留官方標題，但明示網站不宣稱滾筒能解除組織沾黏；肩腕不適或無法穩定撐地者改用坐姿或徒手方法。 |

- 器材與支撐：第一支核心索引不新增器材；第二支使用泡棉滾筒並需要地面支撐。網站不把滾筒改寫為徒手按壓。
- 劑量：未新增 sets、reps、時間或個人化處方；沿用既有指南的疼痛與停止規則。
- 內容邊界：影片不是唯一操作資訊，不取代紅旗、文字步驟或停止規則。未採用「筋膜沾黏已解除」、阿基里斯腱病因、單腳測試診斷或跳繩適用性等確定性論述。
- 資料相容性：未改 canonical ID、動作資料、圖片 mapping、推薦規則、LocalStorage 或既有使用者紀錄。

## 驗證結果

| 項目 | 結果與證據 | 未驗證範圍 |
| --- | --- | --- |
| Build／tests／safety-i18n／diff check | `npm run build`、`npm test`、`npm run audit:safety-i18n`、`npm run test:calf-guide -- --online`、`git diff --check` 均通過 | CI 須以最終 exact head 另查 |
| Exercise coverage | 本次不改動作資料、filter、推薦或 coverage 文件；同一內容 commit 的 `npm run audit:exercise-coverage` 通過，僅產生未納入的時戳差異 | 不以本機結果取代 current-head CI |
| 320／375／390px | Playwright 檢查章節連結與水平溢出；結果記於 PR exact-head review | 實體 iPhone Safari、VoiceOver |
| 影片原站／網站行為 | 8 支影片均由官方 oEmbed 回傳可用；兩支新影片的 5 個指定章節 URL 正確，使用新分頁且不自動載入 iframe | App 內播放不適用；完整影音動作與逐影格安全審查 |
| 真人／真機／production | NOT VERIFIED | 物理治療師、復健科醫師、真人、真機與合併後 production 均未驗證 |

## 驗收與交付

- 路徑：`/calf-self-massage-guide.html#videos-title`。
- 驗收：兩支影片顯示來源、日期、精確章節與內容限制；YouTube 失效時，文字步驟、安全提醒及停止規則仍完整可用。
- 委派：指定 `gpt-6-astra`／`high`，處理 Tier 3 醫療內容唯讀核對；實際模型 NOT VERIFIED。成果為來源 metadata、章節與保守文案；父代理核對官方 oEmbed、整合文案並重跑測試。返工：補上發布日期、避免以疼痛或更大壓力作為有效標準。
- 程式／產品：目前本機自動化 Pass，P0 0，P1 0。Workflow／merge 仍須最終 head 的 CI、Claude Tier 3、ChatGPT PM synthesis、threads、mergeability 與 ruleset gate。
