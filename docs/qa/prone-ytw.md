# 俯臥 Y／T／W 來源與 QA

- 來源：https://www.youtube.com/watch?v=QdGTI4Lshg4 ，The Active Life，Prone Y T W，30 秒。2026-10-21 以瀏覽器觀察示範及匯出英文自動字幕；自動字幕不是專業內容核准。
- 0:03–0:06：俯臥、額頭可墊衣物；0:08–0:14：Y、拇指朝上、抬離地面再回原位；0:15–0:21：T；0:21–0:27：W、肘彎靠側、受控放下。未提供組次、停留或休息時間。
- 僅新增 catalog-prone-ytw；catalogOnly、advanced_only；徒手。安全提醒為沿用專案規則的編輯補充，不是影片原話或治療保證。無圖片或 image-ID alias 變更；新動作保留無圖 fallback，沒有借用其他姿勢。
- dosageStatus=unspecified 的四個數值 0 是內部未指定值，卡片不顯示；詳細頁既有 catalogOnly 隱藏引導訓練。手動補記維持由使用者填入實際量。
- 本機 npm run build、npm test、npm run audit:exercise-coverage（46/46 canonical coverage）、npm run audit:safety-i18n、git diff --check 通過。新增回歸驗證雙語劑量提示、無數字格、catalog-only invariant、無引導入口、影片來源及無錯誤配圖；所有既有動作仍驗證原圖一致性。
- 本機瀏覽器：中英文詳細頁文字、影片 iframe QdGTI4Lshg4 載入、無 session link、桌面無水平 overflow；不是完整影片播放、真人、iPhone Safari、Preview 或 production 證據。
- 委派：指定 gpt-6-astra/high；可驗證的實際模型 NOT VERIFIED（工具僅回傳代理名稱）；Tier 3 repo／安全內容決策子任務，限只讀劑量與安全邊界建議。成果為未指定劑量方案及文案建議，父代理核對資料路徑並以實作回歸驗證。未將其當獨立 Claude PR 審查。返工：首個新增 SSR 測試錯將影片 ID 當成初始 HTML 內容，改為檢查實際資料 URL；實際 iframe 另以瀏覽器確認。
- CI、Claude 獨立 Tier 3 審查與 PM 合併綜整：建立 PR 後綁定 head 記錄，尚未核准合併。
