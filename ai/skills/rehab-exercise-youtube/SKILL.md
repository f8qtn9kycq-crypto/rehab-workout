---
name: rehab-exercise-youtube
description: 在 Rehab-Workout 為既有動作新增或替換 YouTube 來源，或依 YouTube 參考新增動作；查證影片、整理雙語內容並驗證資料相容性與 PR 證據。不適用僅調整影片播放器或一般影片摘要。
---

# 動作與 YouTube 工作流程

將使用者指定影片轉成可追溯、可查閱的動作資料。影片是參考來源，不自動等於適合本產品的訓練處方。

## 啟動與範圍

1. 核對 cwd、Git remote、Git status；讀取 `AGENTS.md`、`REVIEW.md`、`.github/pull_request_template.md`、`.github/ai-automation.yml` 及相關資料／安全文件。repo 當前契約優先於本技能。
2. 確認是「既有動作更新」或「新增動作」，記錄目標 ID、中英文名稱、影片 URL、使用者要改的內容及不可改契約。搜尋相同 ID／名稱／影片，避免重複建立。
3. 先讀當前資料與相近動作範例，不以過去 PR 已完成推定現況。保留未提交工作；新分支先同步 main，需要隔離時使用乾淨 worktree。
4. 動作資料／來源／操作指引變更依 repo 規則列 Tier 3；僅撰寫本工作流程、無產品變更時為 Tier 0。播放器 UX 或圖像變更依實際最高風險另判，不擴張原任務。

## 查證影片後才寫內容

- 將分享 URL 正規化為 `https://www.youtube.com/watch?v=<id>` 與 `https://www.youtube.com/embed/<id>`；移除 `si` 等追蹤參數。若使用者指定時間段，另記時間碼，不遺失其意圖。
- 先讀原站標題、頻道、日期、說明及可用字幕／逐字稿；字幕可能有誤，影響動作語意時對照畫面。一般抓取失敗時，可用可用的瀏覽器工具開原站、展開說明及逐字稿；沒有逐字稿時可定位觀看畫面與燒錄字幕。遇登入、年齡或驗證限制依工具規範處理，不繞過限制。
- 記錄實際看過的段落與時間碼、取得方式、可確認內容及未驗證部分。只抽查片段就寫「片段查證」；看見標題／縮圖不等於看過示範，看到 iframe 不等於可播放，原站可播放不等於 App 內可播放。
- 對握把、器材、站姿、徒手／負重等變化，只整理直接查證的差異與操作提示。區分「握把型式」「握距」「正反／中立握」；不要從型式推導效果排名、適用疾病或唯一正確幅度。
- 有多個來源時，逐項標明觀察／說法出自哪個來源與段落；App 的保守改寫也要分開記錄，不冒充影片原話。
- 如果仍無法取得必要內容：既有動作可在使用者已授權的範圍內僅接上來源並保留現有指引，明示尚未評估；不能因此宣稱完成「影片內容整理」。新增動作或變化式缺少必要動作／器材／劑量依據時，先交付證據缺口與草案，請求必要字幕或資訊，不把猜測內容發布為可用動作。

## 兩種實作模式

### A. 更新既有動作

- 以原 canonical ID 更新 `src/data/exercises.ts` 與 `src/data/exerciseTranslations.ts`；保留使用者已存資料、catalog-only 狀態與安全契約。只改授權欄位，不因換影片順便換插圖、器材或推薦資格。
- 改名使用臺灣慣用繁中及自然英文；搜尋 picker、篩選、手動補記、歷史紀錄及圖像 identity 判定的影響。已存名稱／器材為歷史快照，不批次改名或遷移儲存。必要時驗證舊記錄仍可讀、新名字可搜尋及圖像保護仍有效。
- 如果新影片其實是不同器材或不同動作，先拆清新舊語意；不要為配合影片重解釋既有 ID 或舊紀錄。
- 步驟、劑量與安全欄位無新證據或未獲授權時維持原內容。更新步驟時須記錄原指引與影片差異，以及採用／保留／不採用的理由。

### B. 依影片新增動作

- 依 `docs/exercise-data-model.md` 建立唯一且穩定的 ID，補齊雙語名稱、說明、步驟、效益、注意事項、停止規則、降階／進階、劑量來源及器材欄位。
- 比照既有未納入保守推薦的影片動作，採 `catalogOnly: true`，維持查詢／實際完成量補記，驗證不進入推薦、引導訓練或不允許的 routine 流程。若任務明確要求改變資格，依獨立授權與安全審查處理，不藉新增影片開放。
- 固定基礎版本、適用程度、必要／選用／進階器材及支撐方式；三者需與步驟、標籤及插圖一致。影片含進階變化不代表可設成預設。
- 不從標題、剪輯片段或一般常識猜 sets/reps。既有可引用的 App 參考量與影片原處方分別註明；沒有可追溯依據、且 schema 必填時，不捏造數值，先解決缺口。
- 需要插圖時讀取 `ai/skills/rehab-exercise-image-creation/SKILL.md` 與 `docs/exercise-visual-qa.md`；沿用既有風格及 canonical registry。僅在動作語意完全相符時重用圖像，不為了有圖而錯用 alias。

## 頁面文案與來源欄位

- 使用簡短、自然的臺灣繁中與一致英文。名稱明確；description 一句介紹；detail 放最有用的變化差異；steps 寫可操作動作；安全與停止規則放對應欄位，避免同一警語反覆堆疊。
- 保留文字步驟，不讓影片成為唯一操作資訊。不新增診斷、療效保證或醫療確定性；遵守現有疼痛與紅旗規則，不自行決定新安全門檻。
- `youtubeEmbedUrl` 放指定 embed；`sourceRef` 記來源與查證範圍、保守改寫及劑量來源。詳細來源紀錄放 QA 文件，不把技術查證過程塞進使用者文案。
- 先讀 `src/services/videoUtils.js`、`src/components/YouTubeEmbed.jsx` 與詳細頁的實際資料流。當前 `youtubeSearchUrl` 的 fallback helper 只接受搜尋網址，watch URL 會轉成標題搜尋；即使範例欄位存 watch URL，也不能宣稱外部 fallback 直達指定影片。確切影片來源用 `sourceRef` 保存；如需可點擊原片連結，先確認現有 UI，另將必要播放器／連結修改列入範圍與驗證，不悄悄改共用元件。

## 驗證與交付

產品實作至少執行目前契約要求的：

```bash
npm run build
npm test
npm run audit:exercise-coverage
npm run audit:safety-i18n
git diff --check
```

- 名稱／身份或隔離變更：用有意義回歸驗證雙語搜尋、舊資料不被改寫、記錄行為與 catalog-only 隔離；不為單純網址替換增加只比對常數的測試。
- 圖像／mapping 變更另外執行 movement-art 與 source audits、重建及視覺證據流程；無圖像變更不重新生成資產。
- 頁面檢查中英文名稱、器材、指引、影片 ID、實際 fallback 行為及 catalog-only 提示。針對變更在 320／375／390px 檢查可讀性與溢出；共用影片彈窗有變更時才套用 `docs/video-dialog-qa.md` 的焦點／關閉測試。
- 依 [來源與 QA 紀錄範本](references/evidence-template.md) 建立任務紀錄；填實際結果，不照抄過去 coverage 數字或 Pass。分開記本機、CI、瀏覽器、真人、真機、production 與影片播放證據。
- 在授權範圍內建立／更新 PR，使用目前 template。Tier 3 主動發起 exact-head Codex／Claude 審查與合併前 PM synthesis；先查現有請求避免同 SHA 重複。依 repo readiness 政策管理 Draft；缺外部結果標 Pending，不能把已送請求當審查完成。
- head 改變後重查 checks、review threads、requested changes 與必要證據；在 PR 留可追溯結果。若需要真人檢查，附對應 head 的 Preview、操作步驟與回報格式，不替真人回報。
- 不因執行本技能取得 push／發布／合併等額外授權。產品程式可完成而外部門檻未過時分開報告；合併只按使用者明確授權及當前門檻執行。

## 下次可直接使用的指令

- 「依 `ai/skills/rehab-exercise-youtube/SKILL.md`，用 <YouTube URL> 更新既有 <動作名稱或 ID>，整理 <要關注的段落／變化>。」
- 「依 `ai/skills/rehab-exercise-youtube/SKILL.md`，參考 <YouTube URL> 新增 <名稱>，先採動作庫查閱／補記模式。」

完成時回報 Verdict、P0、P1、修改檔案、驗收結果、PR／Preview 及未驗證項目；內容完成與合併就緒分開判定。
