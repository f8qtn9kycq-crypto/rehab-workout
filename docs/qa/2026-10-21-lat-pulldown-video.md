# 滑輪下拉影片來源更新

- 範圍：既有 `catalog-lat-pulldown` 接上使用者指定的 YouTube `4Z9DgtQu-T4`，沿用 Side Squat／引體向上的資料欄位與既有影片元件。
- 風險：Tier 3（動作內容來源）。ID、標題、插圖、器材、步驟、安全欄位、訓練量數值、catalog-only、推薦隔離與儲存契約維持既有內容。
- 來源：https://www.youtube.com/watch?v=4Z9DgtQu-T4 。已移除分享追蹤參數；未取得可查證的字幕、影片內容或嵌入播放證據，不推定作者、動作細節或影片處方。
- 雙語說明將既有 2 組 × 8 次標為 App 參考量，不視為影片處方或個人化建議。

## 驗證

- 本機 `npm run build`、`npm test`、`npm run audit:exercise-coverage`、`npm run audit:safety-i18n`、`git diff --check` 通過。
- Coverage：45/45；catalog-only 隔離通過。既有 build 有大型 bundle 提醒。
- 未執行真人、真機、正式環境或影片播放驗證；CI 與獨立 Claude 審查以 PR 的精確 head 結果為準。
- 手動驗收路徑：`/exercise/catalog-lat-pulldown?mode=all`，切換中英文，確認影片指向指定 ID、書面步驟與參考量可讀，且 catalog-only 不提供引導訓練。

## 委派紀錄

指定模型 gpt-6-luna / 實際模型 NOT VERIFIED；固定來源替換與雙語參考說明，repo Tier 3 / 子任務低風險，不決定動作安全或劑量。父代理檢查完整 diff 並執行上述驗證；整合時保留原座椅固定提醒，將技術查證限制留在來源與 QA 紀錄，縮短使用者說明。品質提升、時間與節費 NOT VERIFIED。
