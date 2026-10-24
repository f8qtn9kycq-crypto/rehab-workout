# 工具鏈剩餘公告與遷移準備

觀察日期：2026-10-24；基準 main `1ce8df8cf46e53531c427606d5e6e3b94b972753`。本文件為 Tier 0 調查與方案，不改套件、瀏覽器支援、安全門檻或審查規則。實際套件／安全性修補仍依 repo 列 Tier 3。

## 目前證據

- 乾淨 checkout 執行 `npm ci`、`npm audit --json`、`npm ls postcss-selector-parser postcss-nested tailwindcss`。本次 npm snapshot 為3個 moderate 受影響套件、0 high/critical；三者是同一 advisory 的依賴傳播，不能解讀成3個獨立漏洞，亦不是 GitHub 全部 alerts 的清單。
- 依賴路徑為 Tailwind `3.4.19` → postcss-nested `6.2.0` → selector-parser `6.1.4`，Tailwind也直接引用同一parser。#236 已涵蓋 #134/#135/#145/#186 指定版本；不代表這些舊PR本身merged，也不代表parser已達本公告修補版本。
- [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) 列 `<7.1.6` 受影響、`7.1.6` 修補，涉及惡意平面selector的二次方解析成本。公告明示一般可信來源的build-time使用不屬於其描述的受影響部署情境。
- 本repo檢查 `postcss.config.js`、`tailwind.config.js`、`src/styles.css`、package與tracked workflows：目前走建置期PostCSS/Tailwind、來源是repo CSS與src。`src/`搜尋未發現parser/PostCSS呼叫。這是靜態範圍推論，未證明所有託管平台或未追蹤工具；不宣稱正式環境已遭利用，也不把保留版本寫成漏洞已修復。含外部不可信CSS的建置、外掛或新服務應重新評估。

## 方案與目前決策

| 方案 | 可做程度 | 取捨 |
|---|---|---|
| 暫保留Tailwind3，記錄公告適用路徑 | 現在可交付此調查 | 維持現有CSS與平台相容性；依賴公告仍存在，不能寫成修復 |
| 受控override至parser7.1.6以上 | 只作後續隔離實驗，尚未驗證 | 跨上游宣告major範圍，不以audit變綠當相容證據；需測parser輸出、nested處理及CSS/runtime差異 |
| 正式Tailwind4遷移 | 尚未ready直接實作／合併#187 | 須先確認最低瀏覽器支援，再遷移設定、樣式及視覺驗收；不是單純lockfile更新 |

不執行 `npm audit fix --force`，不為消除單一公告直接合併 #187。此決策不是永久豁免：若輸入信任邊界、公告或部署模式變更，重做適用性查核。

## Tailwind4 準備條件

依[官方升級指南](https://tailwindcss.com/docs/upgrade-guide)，v4要求Safari16.4+、Chrome111+、Firefox128+；仍需舊瀏覽器時應留v3.4。repo目前只訂平台優先序，沒有明確最低版本，不自行提高支援門檻。指南另說明PostCSS plugin改至獨立套件、CSS載入指令改變、JS config需明確載入；本repo現有plugin、`@tailwind`及calm/ink/shadow設定都須納入計畫。

後續最小實驗應獨立於 #238，固定base並只選一條整合路徑，不混入首頁改版、動作內容或storage：

1. 明確最低iOS Safari／Android Chrome版本與驗收環境；不足資料時migration保持未ready，不靠升級工具替產品決策。
2. 列package/lock、PostCSS或Vite plugin、styles、theme的逐檔遷移差異；保留既有色階、焦點、touch target與safe area，不能默默丟失自訂theme。
3. 同一base建立現有CSS/JS、固定頁面截圖及核心操作基準；對照首次安全開始、評估、動作詳情、session停止、補記、組合、紀錄及痠痛頁，雙語320/375/390及桌面。CSS不要求無條件byte相同，但每個可見差異須說明。
4. 執行build、完整tests、安全及適用圖片audit、雙引擎與最低支援環境；新框架不能降低現有pain/redflag/guard或資料相容性。
5. 按Tier3取得精確head Codex／Claude與PM結果；通過才依明確授權合併。失敗時不發布；若已發布後需rollback，回退到已知合格commit與lock，保留所有使用者資料，不清localStorage。

## 待驗證與下一步

override相容性、Tailwind4遷移、最低版本真機、正式環境可利用性均未驗證。本輪完成的是原roadmap的「先訂工具鏈遷移方案」；下一個runtime工作取決於平台需求及獨立實驗，不能以本文件當安全審查或migration Pass。使用者理解／三動作組合觀察亦不是此調查的證據。

## 2026-10-24 隔離實驗完成更新

#243已完成保留Tailwind3的parser7.1.6精確override，reviewed head `e3d9c3e223fef69d097a30d6a798a39a712ed43b`，squash `5ed50040744be5292e30d39f85dc7ffb1a052474`。前文「override尚未驗證」為當時快照；目前現行consumer、全dist、完整測試與必要獨立審查已通過，範圍和跨major剩餘風險見[QA](qa/parser-override-compatibility.md)。npm audit當次snapshot為0，不等於所有安全風險已消除。

使用者明確選擇最低版本尚未決定、保留目前相容性，因此不執行Tailwind4遷移；#187新head f7fec2e的Build仍因舊PostCSS plugin設定失敗。不能用本次parser維護Pass替代v4框架遷移驗收。
