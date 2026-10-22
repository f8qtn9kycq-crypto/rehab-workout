# 痠痛 v2 唯讀趨勢

## 範圍

Tier3保守分級；7/30/90天實際1–10分離散點，不補值或連線；前後、身體側、中央與legacy身份完全分開。沿用既有position label與程度色階。所有0不作趨勢點，未紀錄／空圖不代表康復；既有地圖明確0分語意與安全警示保持。

不改storage、keys、tombstone、疼痛門檻、紅旗、訓練、推薦或動作資料。reader已過濾刪除紀錄；趨勢不寫入資料。分享、完整CSV/JSON及還原仍是下一獨立交付，不宣稱本PR完成原#230全部範圍。

## 驗證（2026-10-23，臺灣時間）

- Build、完整npm test（含新趨勢regression）、safety-i18n／visible-i18n、diff check PASS。
- 回歸覆蓋同region前後不同值、左右、中央、legacy、不推斷view、inclusive本地日期7/30/90與future排除、legacy0／invalid date／非法程度排除、閏日與DST日差、輸入immutable及不碰storage。
- `scripts/soreness-trends-browser-qa.mjs`：Chromium與WebKit各雙語×320/375/390，位置分離、7/30/90點數、舊0空狀態、tombstone不復活、storage bytes不變、select≥44px、無水平溢出PASS。英文新區塊無中文洩漏。
- 視覺／真機／真人／VoiceOver／production另列；瀏覽器引擎自動化不是實體iPhone證據，未聲稱臨床定位核准。

## 委派與審查

初次指定Astra/high實作，因額度限制停止且未留下檔案；實際模型NOT VERIFIED。主代理接手完成，無以較弱模型冒充Astra結果。新head必須完成獨立Codex、Claude與PM審查；請求不等於完成，結果以PR紀錄為準。沒有合併授權以外的gate豁免。
