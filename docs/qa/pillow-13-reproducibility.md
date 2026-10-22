# Pillow 13 圖像來源可重現性

## 範圍與風險

PR #236；Tier 3 安全相依更新。Pillow 12.3.0 → 13.0.0；normalizer 明確先水平再垂直 LANCZOS 縮圖，保持舊版像素次序。沒有變更圖片、layout、manifest、frozen baseline 或任何 hash；沒有產品、安全、session、routing、storage 變更。

## 根因與修復

Pillow 13 可依縮放尺寸選擇不同雙軸取樣次序。舊 normalizer 一次雙軸 resize，`shoulder-flexion` 在新版本不能重現受控 PNG；明確先水平再垂直後，40 個 Python effective sources 全部 byte-for-byte 相同。PNG encoder 與凍結基準保持原樣，沒有降低 byte equality gate。

## 本機證據（2026-10-23，臺灣時間）

- 環境：Python 3.12.14，暫存 venv，Pillow 13.0.0；不改全域套件。
- Red：記憶體中執行修復前 normalizer，確認 `shoulder-flexion` 輸出 bytes 與既有 runtime 不同。
- Green：`python scripts/verify-movement-overrides.py` 通過；40 個來源 byte-for-byte、全部 PNG decode、非法 framing／phaseCount 拒絕、單姿勢裁框均通過。
- `npm run audit:movement-art`：8 frozen references、46 images/sources 完整性通過。
- `npm ci --ignore-scripts`、build、完整 npm test、安全 i18n、diff check 通過。既有 >500kB bundle 提示仍存在。
- 未變更 runtime 圖片；上述機械驗證不等於新動作、風格、解剖或專業安全核准。沒有新增真人、真機或 production 證據。

## 審查與交付

前置只讀相依診斷指定 Astra/high（實際模型 NOT VERIFIED），確認相依重疊、工具鏈風險及候選修復；父代理在 Pillow 13 做 red/green 及完整來源比對。無模型效能／節費結論。精確 head、CI、必要 Codex／Claude／PM 結果以 PR 最終紀錄為準；請求不等於完成。合併須所有門檻通過，禁止修改基準 hash 來通過 CI。
