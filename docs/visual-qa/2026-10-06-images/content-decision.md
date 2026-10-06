# 槓鈴肩推內容決策紀錄

日期：2026-10-06（臺灣）。範圍：catalog-shoulder-press，PR #183。

來源：本任務的使用者明確授權「將『啞鈴肩推』改成槓鈴版本，包含名稱、器材與說明」，以及「站姿槓鈴肩推」與「左側起始槓鈴須在身體前方，下巴至肩膀高度」。這是可歸屬的產品內容決策；沒有將 Claude 或使用者要求冒稱治療師／醫療核准。

決策：catalog 的目前版本採站姿、身體前方起始的可控制輕槓鈴。移除目前 entry 的靠背坐姿啞鈴支撐設定是上述器材／姿勢選擇的刻意結果。沒有將舊靠背版本重解讀成站姿：歷史紀錄的名稱與實際器材保留，缺少版本或新版槓鈴證據時不套用新版槓鈴插圖；不改寫 storage schema 或既有資料。

限制：此版本僅供動作庫查詢／完成後補記；不進入引導訓練、保守推薦或 fallback。catalogOnly、advanced_only、aggressive_overhead_loading、loaded_progression、avoidIfPainHigh、疼痛／紅旗 gates 保留；槓鈴不列入 Assessment。舒適且可控制範圍、不要追求過頭高度／重量、症狀停止規則保留。插圖過頭終點不是所有使用者必須達到的 ROM。

sourceRef 仍為 reviewed-content-needed；動作／安全專業與真人驗收尚未取得，不把產品選擇視為一般復健安全推薦。若後續內容審查不能接受此支撐或範圍，應修正或保留未核准狀態，不能以 CI Pass 取代。Claude 需在新 exact head 重新判定 P1-3 是否滿足 repo content-review 要求。
