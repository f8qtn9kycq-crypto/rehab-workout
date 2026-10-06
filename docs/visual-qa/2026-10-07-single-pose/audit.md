# v8：背面肩胛與單張靜態姿勢

Verdict：Partial Pass。P0：未發現。P1：第10張角度／動作線條與7張重複姿勢已修正，等待新版真人驗收。

本輪 Tier 1，整體 PR183 的 Tier 3 gate 保留。依使用者指定，第10張恢復 v6 背面三分之四坐姿，使用 v7 線條深淺，加上肩胛內緣向中央靠攏與短方向線。這是使用者明確要求的動作線條例外。雙手、大腿、椅子、腳部完整；AI 觀察不授予臨床或真人 Pass。

第21、23、24、26、30、40、41張：機械取用既有來源第一格，同原人物框置中 x=160，移除第二格與分隔線；保留320×184與人物比例。40/41保留完整腳踝、腳跟、前掌及直膝／微彎差異。元件只顯示「維持姿勢」，刪除雙格提示。未改 exercise 內容、aliases 或儲存資料。

|工作流程|結果|證據與限制|
|---|---|---|
|風格／動作|Partial Pass|第10張背面肩胛線條；7張單張姿勢；新版 hash 待真人確認|
|來源／基準|PASS|43圖、8冷凍基準、37 override byte-for-byte；僅8張runtime改變，35張不變|
|本機工程|PASS|build、完整npm test、單張置中／去重／無分隔線及不合法phaseCount回歸|
|picker／selected|PASS scoped|桌面24次選取8張，圖片載入、無水平溢位，實測1280px／DPR2；不可當手機證據|
|Records／library|NOT VERIFIED current|共用canonical registry；本輪未重新完成所有圖片的四介面驗證|
|390／375／320|PASS scoped|改在前景tab重驗，8張selected×三寬度全部載入且無水平溢位，實測DPR1；mobile-results.json|
|DPR3／完整四介面|NOT VERIFIED current|背景tab失效的桌面量測保留；前景DPR1不能替代DPR3與完整四介面|
|真人／真機／動作安全|NOT VERIFIED|不沿用前hash的整體風格Pass；未進行手機登入|
|PR gate|Pending|新head必要CI、Claude實際review、PM與接受條件須重新確認；未合併|

修改檔案：`scripts/normalize-movement-override.py`、`scripts/verify-movement-overrides.py`、`scripts/pr183-regression.mjs`、`src/components/WorkoutMovementArt.tsx`、`src/locales/{zh-TW,en}.js`、`src/data/movementArtManifest.json`、`scripts/assets/movement-art-sources/overrides/style-v8/`、8張runtime及本目錄證據。

接受條件：第10張背面角度、線條深淺及肩胛向中央收攏清楚；指定7張只有單張姿勢且比例保持；40/41重點關節完整；真人按圖片編號回報 Pass／Fail，新head必要審查與mobile門檻通過才合併。

本機驗收：[v8 demo](http://127.0.0.1:5184/v8.html)。`asset-review.json`列43筆before／after hash；`comparison.png`與`demo.png`供同尺寸前後比對。歷史v5／v6／v7來源及FAIL證據保留。
