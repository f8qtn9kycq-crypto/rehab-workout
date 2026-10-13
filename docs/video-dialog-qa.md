# 影片彈窗鍵盤與手機 QA

## 問題與範圍

基準 main `466b0f2`：動作詳情開啟「放大觀看影片」後，Shift+Tab 可聚焦背景的「開始訓練」；Escape 不關閉。屬 Tier 1 的 P1 無障礙問題。

改用原生 `dialog.showModal()` 隔離背景，明確排列彈窗控制項的 Tab 順序，關閉時返回開啟按鈕。Safari 點擊按鈕不必然聚焦，因此開啟處先明確聚焦。未修改動作內容、推薦、安全、session 或 LocalStorage。

## 可重現驗收

啟動 `npm run dev -- --port 4173`，從 repo 根目錄開啟 playwright-cli session，再把 `scripts/exercise-video-dialog-browser-qa.mjs` 全文傳給該 session 的 `run-code`。腳本需使用預設繁體中文及可讀寫的 `output/playwright/`。

Chromium 與 WebKit 各測 320、375、390、1280px × `shoulder-flexion`（fallback）及 `glute-bridge`（iframe），每個案例驗證：

- 開啟後為 native modal，初始焦點在關閉按鈕。
- Tab／Shift+Tab 操作彈窗控制項時不聚焦背景。
- 關閉按鈕至少 44 × 44px 且在 viewport 內；無水平溢出。
- 焦點在應用程式控制項時，Escape 關閉並返回開啟按鈕。
- 關閉按鈕能關閉，彈窗 iframe 卸載，焦點返回開啟按鈕。

2026-10-14 本機 Chromium、WebKit 各 8 個案例通過；320px screenshot 已檢視。腳本輸出與 screenshots 位於本機 `output/playwright/`，不把暫存圖片加入 PR。

## 證據邊界

跨來源 YouTube 播放器可能自行處理 Escape；此驗收不聲稱能攔截播放器內的按鍵，也不聲稱外部影片播放／內容通過。原生 modal 提供背景隔離，關閉按鈕保留可見的退出途徑。

WebKit 自動化不等於實體 iPhone／VoiceOver 或 production 驗證；上述三項未驗證。真人可在 Preview 開啟上述兩個動作、確認關閉按鈕可見、操作 Tab／Shift+Tab／Escape 並確認返回開啟按鈕；回報 head SHA、裝置／瀏覽器、動作 ID、步驟、PASS／FAIL 與觀察。
