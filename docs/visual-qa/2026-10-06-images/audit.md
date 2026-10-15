# 2026-10-06 圖片修正與槓鈴肩推
判定：Partial Pass。機械驗證通過，真人風格、動作／安全審查與 Claude 結果待完成，不能合併。

## 最精簡規格
依原始前 8 張的角色、筆觸、人物大小與留白重繪；左右各一個完整動作階段，白底與中央淡灰線。槓鈴肩推從身體前方、下巴至肩高度開始。

## 實作與歷史
9 張遭拒絕候選以 imagegen 原快選圖風格重繪，另修正 shoulderPress，共 10 張；canonical override 及逐圖 framing sidecar 經 generator 產生 320×184 runtime。原圖與歷史拒絕 hash 都保留；舊 hash 的 FAIL 沒有改為 PASS。原肩推風格參考封存，原 hash 與 alias 不變；其餘 7 張快選 PNG 不變。其餘 33 張 runtime 與 main 相同。

肩推已同步中英文名稱、站姿說明、身體前方起始步驟、barbell equipment/requiredEquipment 與搜尋連結。catalogOnly、advanced_only、overhead/loaded safety tags、疼痛與紅旗 gates 保留；沒有遷移或覆寫歷史紀錄 name/equipment。原「啞鈴標籤／槓鈴圖」finding 已解決，新的圖仍待驗收。

其他 5 個原快選 alias 的器材／姿勢差異仍存在於 main；本次不擅改文字或刪 alias，保留先前 audit 的獨立內容阻擋。地板姿勢沒有原 8 張中的直接核准 control；benchPress 僅供線條與尺度參考，不代表地板動作已核准。

## 驗證
npm test、build、safety/i18n、coverage、基準完整性、10 張來源重建、framing 非法值負向測試通過。槓鈴可滿足肩推器材條件，啞鈴＋椅子不能；疼痛 0/3/4/6 均不會讓 catalog 肩推進入推薦或 fallback。缺 alias、篡改原參考與封存肩推均會使 regression 失敗。

桌面本機 Chromium：390×844、375×844、320×844；129 筆 picker 圖片 DOM 實測，43 張在每個尺寸載入並保持 40:23，無水平溢出。肩推 selected card 在 320px 顯示相同 URL，寬 230px。截圖與 hash-bound mobile-results.json 隨附。這批不是 DPR3／iPhone Safari 測試，未重現雲端 204 筆四介面證據；Records/library 共享 canonical registry 由程式與既有 regression 驗證，這批沒有逐張 browser walkthrough。

comparison-native 與 comparison-mobile-390/375/320 包含 8 個原 hash 參考與 10 個候選；封存肩推採相同 runtime 卡框尺寸作比例比較。此證據不是獨立盲測。prompt 完整保存於 ../2026-10-06-generation.json。

## 驗收步驟
1. 比較原 8 張及新版 10 張在 native 與手機尺寸的角色、上衣、頭身、筆觸、人物大小、留白與器材線條。
2. 打開 Preview /logs/new，確認「槓鈴肩推」，左格槓鈴位於身體前方，下巴至肩高度，選取後同圖。
3. 展開更多動作，逐張比對 written steps 的左右階段、支撐、ROM 與 band 方向。
4. 回報「head SHA、圖片 ID、視覺 Pass/Fail、動作 Pass/Fail、安全 Pass/Fail、具體差異、測試裝置」。新版不得繼承舊核准。

## CI 編碼修正
466b224 的 Linux 來源位元組重建失敗；macOS Pillow 12.3 使用 zlib 1.2.12。逐圖 framing 的 PNG 改用固定 filter-zero／stored DEFLATE 編碼，排除壓縮器版本差異。10 張 runtime 解碼 RGB 與先前本機 commit 逐像素相同；手機量測與截圖保留並更新 hash，非新增 browser 或真人 Pass。新 head 仍須 CI 證實跨平台重建。

## Claude P1 修正
Claude 對 cf9dd02 的審查為 Partial Pass。紀錄顯示已修正：舊 catalog-shoulder-press 紀錄保留儲存 name／equipment，不套用新槓鈴圖；已記錄新版中英文名稱且器材相容的紀錄仍使用 canonical 圖。這只影響歷史卡片，不移除任何 canonical alias 或 active picker 圖。

Assessment 改用排除 barbell 的選項集合；動作庫／補記器材與已儲存 assessment 相容性保留。coverage audit 的 45 是 catalog filter matrix，不等同「Assessment 選取就沒有結果」；推薦本身有 bodyweight／fallback。P1-2 的未揭露 Assessment 控制項擴張確實存在並已修正。

新增 test:pr183 在中英文實際 SSR 渲染紀錄與 Assessment，含舊啞鈴紀錄 fixture、無 equipmentId 舊紀錄、新槓鈴紀錄、可選器材未填與原始 LocalStorage 字串不變。

P1-3 內容決策見 content-decision.md；使用者明確選擇站姿槓鈴 catalog 版本，非保守訓練預設，無臨床安全核准聲明。真人圖片／movement／safety 結果仍 NOT VERIFIED，原 5 個 alias 處置及必要 mobile profile 未完成，不因此合併。
