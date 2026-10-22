# 前端結構與核心操作審查

## 範圍與結論

初始基準 main：`466b0f2470ecf8d1b899247e1d0de0f6226a2153`。影片彈窗由 PR #214 合併至 `09c220d0d3654e0862b39cdb055021509e4d667e`；本次後續修復以該 main 為基準。原工作目錄的未提交修改未納入，也未修改。

審查首頁、首次使用、安全確認、評估、動作庫、詳情、引導訓練、紀錄、常用組合／日期安排與補記。就已執行的核心流程及程式路徑，沒有證據需要全面重寫。首頁依安全／評估／近期紀錄決定下一步，補記入口明確；active session 有一個主要組數操作，詳細步驟與安全文字可展開；儲存服務、推薦與紀錄呈現分開，資料相容性有既有回歸覆蓋。

本輪發現兩個高可信度 P1，均為彈窗未真正隔離背景：

1. `ExerciseDetailModal.tsx`：影片彈窗 Shift+Tab 可聚焦背景「開始訓練」，Escape 不關閉。已由 #214 修復。驗收見 `video-dialog-qa.md`。
2. `SessionTracker.tsx`：退出彈窗初始焦點在「繼續訓練」，按兩次 Tab 可聚焦背景「動作說明與安全提醒」。本 PR 改用 native modal、循環 enabled 控制項、Escape 等同取消退出並返回原觸發按鈕；小視窗內彈窗內容可捲動。

第二項以 Tier 2 保守分類，因修改 session 中的 modal 互動；不改 phase、疼痛、安全、儲存、route 或資料契約。沒有新增共用抽象或修改其他彈窗。

## 驗證與驗收

2026-10-14，本機 Chromium 與 WebKit 各 320／375／390／1280px 驗證退出彈窗：

- 未選疼痛不能開始；疼痛 6 不能開始；明確選 0 可開始。
- 完成一組後，modal 內初始焦點為「繼續訓練」，Tab／Shift+Tab 不聚焦背景或 disabled 儲存按鈕。
- Escape 關閉並返回退出按鈕；組數與休息狀態保留，不寫入紀錄。
- 「繼續訓練」保留同一進度；「儲存並離開」新增一筆提前停止紀錄，完成組數為 1，前後疼痛為明確選擇的 0。
- 「不儲存離開」返回動作庫且既有紀錄不變。
- 320px 模擬 quota 失敗：modal 與狀態保留，顯示錯誤，恢復儲存後重試新增一次。
- 無水平溢出；儲存按鈕至少 44px 且可見；320px screenshot 已檢視。

可重現腳本：`scripts/session-exit-dialog-browser-qa.mjs`。從 repo 根目錄啟動 Vite 4173 與獨立 playwright-cli profile，把腳本全文傳入該 session 的 `run-code`。預設繁體中文；測試只在獨立 profile 寫入測試紀錄。輸出與 screenshot 保存在本機 `output/playwright/`，不納入 PR。

Chromium 另完成首頁、評估、全部動作、動作詳情、紀錄、安排、補記、知識，共 8 頁 × 4 種寬度的 32 組頁面載入、h1 存在與無水平溢出檢查。這不代表每個頁面的每項操作都已驗證。

完整 build／npm test 與 safety-i18n audit 的最終結果、精確 head 的獨立審查、CI、threads 與合併判斷記錄在對應 PR。動作內容與篩選未修改，因此不重新產生 exercise-coverage 文件。

## 效率與證據邊界

保留現有核心入口、漸進揭露及資料服務邊界，只修復有實際操作證據的問題。build 約 578KB 的 bundle 警告不是已量測的使用者延遲；本輪未做網路速度／CPU benchmark，不宣稱效能最佳化已通過。

瀏覽器自動化不等於真人或實體 iPhone／VoiceOver；以上及 production 操作未驗證。native dialog 的 WebKit 路徑有自動化覆蓋，但未承諾所有舊版 iOS 相容性。

選用真人 walkthrough：在 Preview 完成安全確認，進入 shoulder-flexion，選疼痛 0 並完成一組；開啟退出彈窗，檢查焦點、Escape、繼續、儲存及紀錄。回報 head SHA、裝置／瀏覽器、步驟、PASS／FAIL 與觀察；無真人結果時保持 NOT VERIFIED。
