# 動作庫至紀錄器材交接驗證

## 範圍

PR #225，Tier 2。動作庫／詳情與補記每組共用器材握把欄位；URL 只帶入未完成第一組的 metadata，既有 draft/from 優先。保留原示範、canonical ID、歷史快照、安全與儲存格式。

## 自動化證據（2026-10-23，臺灣時間）

- 本機 npm ci、build、完整 npm test、安全 i18n、diff check 通過；之後 UI 修復再跑 build、交接 regression、安全 audit。
- `scripts/library-recording-browser-qa.mjs` 由 playwright-cli fresh profiles 執行；Chromium／WebKit × zh-TW/en × 320/375/390，各六組通過。
- 實際詳情選器材握把 → 空白未完成第一組 → 完成兩組不同器材握把 → 保存／重載 → draft/from 優先 → 紀錄只有一筆且逐組快照保留。
- 未偽造 reps、疼痛；catalog-only 無引導入口，無安全確認 direct session 仍轉 safety。詳情、表單、紀錄無水平溢出；共用控制項至少44px。
- WebKit 首輪選單僅22px；改成明確 h-11／appearance-none 後重跑通過。
- WebKit 快速輸入後第一次點第二組完成曾未保存，第二次點擊成功；保存狀態顯隱會重新排列表單。保留狀態訊息版面後，原流程在兩引擎全數通過，未靠額外等待或重試掩蓋。

## 證據界線

獨立 Sol/high 靜態審查針對修復前 head 91d2aa6 Pass（實際模型 NOT VERIFIED）；後續 head 以 PR 新審查為準，不能沿用舊 Pass。Claude 桌面建議審查已請求，遇額度限制，未完成即維持 Pending；不是正式 GitHub APPROVE。真人、實體 iPhone、VoiceOver、受保護 Preview 互動與 production 未驗證。

瀏覽器既有 empty-src／favicon／外部 YouTube console 訊息不列為影片播放通過證據。本次不修改播放器。CI、review threads、ruleset、精確head與合併結果另記於PR；本機Pass不代表合併門檻已通過。

GitHub Codex 於91d2aa6另提出預設器材P1：全域排序第一項可能是optional bodyweight而非required chair。改採唯一required器材，多項必要器材無單一預設則保留未知；坐到站及後腳抬高蹲加入SSR與雙瀏覽器回歸，避免把進階負重自動帶入紀錄。
