# 43張線條／左右階段再稽核

Verdict：Partial Pass。使用者最新回饋覆蓋前輪整體風格Pass；3/6/7/8指定原圖Pass保留。

本輪已逐張比對43張native runtime與冷凍8張基準；9張線條問題、9張動態左右差異，重疊後16張修正，其餘27張位元相同。每張觀察、來源、before/after SHA、severity、risk、acceptance與disposition見 `audit-before.json`／`asset-review.json`。

P0：未發現。P1：上述16張修正已實作，仍需新hash真人驗收；細微動作不靠誇大ROM製造差異。

|工作流程|結果|證據與限制|
|---|---|---|
|風格／線條|Partial Pass|16來源重繪；floor24/30另補強線條；亮度統計只是診斷，不授予風格Pass|
|左右動作|Partial Pass|9動態加階段標籤；10/20以側面上半身呈現，35/36改腳掌方向；27/29細微幅度仍待真人確認|
|靜態維持|實作完成|21/23/24/26/30/40/41加擺位／維持說明，不捏造動態|
|動作／安全表現|NOT VERIFIED|AI對照保留支撐、器材與關節；未作真人或臨床核准|
|來源與基準|PASS|43 PNG、8冷凍參考、37有效來源byte-for-byte；歷史來源保留|
|picker|PASS scoped|43圖×390/375/320，DPR1，全載入且無水平溢位|
|selected|PASS scoped|下巴內收×三寬度；完整43圖未驗|
|Records|PASS scoped|既有直膝踝測試紀錄×三寬度；折疊歷史的lazy圖未載入不當作Fail；完整43未驗|
|library|PASS scoped|43圖×三寬度載入且無水平溢位；英文320px標籤無溢位|
|DPR3／iPhone Safari|NOT VERIFIED|本工具僅支援viewport寬高，實測DPR1；未進行手機登入或真機驗證|
|PR gate|Pending|新head CI、Claude實際審查、PM synthesis與未解thread須重查；不合併|

修改檔案：16張 `scripts/assets/movement-art-sources/overrides/style-v7/` 來源及layout、16張runtime、`src/data/movementArtManifest.json`、`src/components/WorkoutMovementArt.tsx`、兩語系與`pr183-regression.mjs`。未改exercise資料或儲存紀錄。

接受條件：同等顯示尺寸逐張確認線條接近基準；動態左右可分辨、靜態解釋正確；無支撐或關節截斷；新版必要PR gate與明確手機接受條件通過後才合併。

本機 demo：http://127.0.0.1:5184/v7.html；不屬於production。
