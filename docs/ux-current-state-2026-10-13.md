# 最新版 UX 現況與使用阻力盤點

盤點日期：2026-10-13（Asia/Taipei）。基準：main `7544dbfe731151a6d8f55d2a01bf8711ff28f0f6`，包含 #204。此報告是 Tier 0 文件交付；改善項目是可追蹤提案，不代表已實作或已授權全部開發。

## 1. 結論與證據範圍

Today 已提供安全下一步、補記、我的計畫、收藏及本週進度。官方動作圖片在動作庫、收藏、補記及訓練完成／紀錄識別畫面共用 canonical 圖片來源。收藏是書籤，保存組合是有序動作清單；每週安排是日期配置，三者沒有自動串成整套訓練執行器。

在此基準版本，第一優先是每週排程入口與頁面名稱不一致；接著評估動作詳情／進行中的圖片連續性，以及使用保存計畫逐一訓練的操作成本。

後續交付狀態（2026-10-13）：F1 已由 [PR #207](https://github.com/f8qtn9kycq-crypto/rehab-workout/pull/207) 合併到 main `46404d2c6779a9066a6f03e0b4efb5c0ecc50c24`，首頁及每週安排頁已有日期入口，焦點修復與草稿保留經 Codex／Claude 審查及 [真人回報](https://github.com/f8qtn9kycq-crypto/rehab-workout/pull/207#issuecomment-6136799907) 確認。下方矩陣與 F1 節保留原基準盤點，不將其重列為目前未修阻塞；下一個建議是 F2 的詳情圖片重用。

| 證據 | 可支持的結論 | 限制 |
|---|---|---|
| 本次最新 main 原始碼／路由／文字靜態盤點 | 頁面組成、圖片元件、連結目的地、哪些操作尚不存在 | 未於本次重新執行瀏覽器或真人測量；不能推定耗時、點擊錯誤率或視覺可讀性 |
| [Goal #195 真人回報](https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/195#issuecomment-6127162778) | 使用者提供 iPhone 13／Safari，安全復健、三類補記與重載、Push 計畫／Pull 實際三情境 Pass | 回報沒有逐步時間、截圖或涵蓋每一動作；不代表全資產臨床／姿勢核准 |
| [常用組合五步 Pass](https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/195#issuecomment-6109606150) | 收藏、新／既有計畫、首頁編輯／排序、重載與取消收藏獨立性 | 原次回報未提供裝置；不能自行補成 iPhone 證據 |
| [#204 圖片驗收與最終回歸](https://github.com/f8qtn9kycq-crypto/rehab-workout/pull/204#issuecomment-6127457926) | iPhone 13／Safari 圖片一致性 Pass 歸屬 679a7c9 Preview；final e72d978 保留同圖片、恢復坐站肌群內容，258 次渲染來源／身份比對 | 不將舊 head 真人 Pass 擴大為 final 全頁真機 QA；SSR 比對不證明圖片動作／安全／風格正確 |

[Goal #195 已完成](https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/195#issuecomment-6127511899)，不重開已交付功能。此文件沒有更新或重新核准任何圖片資產。圖片四個獨立 gate 仍依 [exercise-visual-qa](exercise-visual-qa.md)：視覺一致性、動作正確性、安全呈現、手機渲染；本次未重新驗證的各 gate 均為 **NOT VERIFIED**，圖片同源不是四項 Pass。

## 2. 使用者看見的架構

| 概念 | 現況／入口 | 不應誤解成 |
|---|---|---|
| Today／首頁 | 一個安全下一步主按鈕＋補記；下方依序我的計畫、收藏、本週進度；活動細節收合 | 固定每日課表或自動調整處方 |
| 收藏 | 動作卡與補記圖片旁的小按鈕；首頁連到 `/routine#saved-routine-title` 的收藏清單；空狀態去動作庫 | 安全推薦資格、已完成訓練 |
| 我的計畫／我的常用組合 | 同一 saved routine 的兩種介面名稱；有序官方 ID 清單，首頁最近儲存三組、可精確編輯 | 具有整套開始／下一動作／共同 session 的執行器 |
| 個人每週目標 | 首頁本週進度內展開編輯；復健／肌力／有氧每週有紀錄天數，0–7 或未設定 | session 次數、計畫完成率或醫療建議 |
| 每週日期排程 | 首頁活動細節內的 ActivityPlan，安排 lower／push／pull／cycling 星期；允許計畫與實際不同 | 保存組合與星期的直接配對 |
| `/routine`「每週安排」 | 收藏＋我的常用組合＋三種 starter routines；手機在「更多」也可進入，首頁已有直達入口 | ActivityPlan 日期排程表所在頁面 |
| 紀錄 | `/logs` 跨 guided、manual、activity 三來源呈現，另有疼痛／功能進度；補記入口 `/logs/new` | 已合併為一個 storage 或共同 session 模型 |

實際手機主導覽是「首頁、安全、動作庫、紀錄、更多」，並非已改成三個 tab。來源：[HomePage](../src/pages/HomePage.tsx)、[HomeSavedPlans](../src/components/HomeSavedPlans.tsx)、[TodayGoalPlan](../src/components/TodayGoalPlan.tsx)、[MobileBottomNav](../src/components/MobileBottomNav.tsx)、[RoutinePage](../src/pages/RoutinePage.tsx)、[ActivityPlan](../src/components/ActivityPlan.tsx)。

## 3. 逐頁圖片、操作與阻力

以下「有／無」是程式組成判定；沒有動作圖不一定是缺陷，安全問卷／首頁摘要不需要強制補圖。

| 畫面／路徑 | 使用者目的與圖片現況 | 主要操作與可能阻力 | 狀態／來源 |
|---|---|---|---|
| 首次使用 `/onboarding` | 認識安全開始；沒有 canonical 動作圖 | 首次進首頁會先導向 onboarding；需與回訪流程分開測量 | 靜態確認：[OnboardingPage](../src/pages/OnboardingPage.tsx)、HomePage |
| 首頁 `/` | 計畫卡是名稱／數量／展開後有序文字，不含動作縮圖；收藏顯示有效數量與入口 | 安全下一步、補記、計畫編輯；多張卡增加下滑距離需量測，不當作已發生失敗 | 結構確認；原主流程真人 Pass；HomeSavedPlans／TodayGoalPlan |
| 安全 `/safety` | 症狀檢查文字；沒有 canonical 動作圖 | red flag blocking 必須保留；問卷操作不能以「減少摩擦」略過 | [SafetyPage](../src/pages/SafetyPage.tsx)、[SafetyRouteGuard](../src/components/SafetyRouteGuard.tsx) |
| 評估 `/assessment` | BodyMapSelector 是選部位圖，不是動作示範 | 部位、狀態、器材；受安全 guard 保護，完整評估與每日安全確認用途不同 | [AssessmentPage](../src/pages/AssessmentPage.tsx) |
| 動作庫 `/exercises` | 每張官方卡使用 WorkoutMovementArt＋名稱／分類／器材／劑量；圖片是輔助，文字仍可讀 | 模式／部位／收藏子集合、查看詳情；收藏不增加安全資格 | [ExerciseCard](../src/components/ExerciseCard.tsx)、[ExercisesPage](../src/pages/ExercisesPage.tsx) |
| 詳情 `/exercise/:id` 與放大影片 | YouTube iframe 或搜尋備援；沒有 WorkoutMovementArt，影片畫面不等同 canonical 圖片 | 需捲動或跳區段看步驟／安全／開始；catalogOnly 不提供 guided start | [ExerciseDetailPage](../src/pages/ExerciseDetailPage.tsx)、[ExerciseDetailModal](../src/components/ExerciseDetailModal.tsx)、[YouTubeEmbed](../src/components/YouTubeEmbed.jsx) |
| Session 訓練前 | 名稱＋必填前疼痛；沒有 canonical 動作圖 | 0 分需明確確認，≥6 阻擋；不可預填疼痛 | [SessionTracker](../src/components/SessionTracker.tsx) before phase |
| Session 進行／休息 | 名稱、目前組數／次數、第一步提示、可展開完整說明；沒有 canonical 動作圖 | 做動作時要回想先前圖片或返回查看；是否需要常駐／收合圖為待驗證假設 | [ActiveSessionPanel](../src/components/ActiveSessionPanel.tsx) |
| Session 完成後疼痛／儲存確認 | ExerciseIdentityVisual 優先同 canonical 動作圖；坐站另保留肌群圖、主次區域及 legend | 後疼痛、難度、備註、儲存／停止原因；避免圖片把主要操作推離視窗需量測 | SessionTracker finish/saved；[ExerciseIdentityVisual](../src/components/ExerciseIdentityVisual.tsx)；#204 |
| 補記 `/logs/new` | 快速肌力分類及「更多動作」卡、選中官方動作共用圖片；自訂動作沒有官方示範圖 | 多動作／器材／劑量／選填回饋表單較長；更多卡需捲動；cycling 分鐘在同一表單 | [ManualWorkoutPage](../src/pages/ManualWorkoutPage.tsx)；真人補記重載 Pass；找動作耗時未測 |
| `/routine` 收藏清單 | 收藏動作有 canonical 圖＋名稱；只有這裡顯示加入新／既有計畫 | 看收藏→選目的地→新計畫名稱→儲存；使用者已 Pass，不再列未修 hidden entry | [SavedRoutinePicker](../src/components/SavedRoutinePicker.tsx)、[FavoritePlanPicker](../src/components/FavoritePlanPicker.tsx) |
| `/routine` 已存組合／編輯器 | 清單與排序是文字；編輯新增用全 catalog 下拉；starter routines 也非圖片卡 | 計畫名稱／組合名稱切換、長下拉、逐一開詳情；不支援整套一鍵執行 | SavedRoutinePicker／[WeeklyRoutineBuilder](../src/components/WeeklyRoutineBuilder.tsx) |
| 紀錄 `/logs` | guided 使用同 canonical 身份圖；manual 官方用同圖，舊器材／姿勢版本刻意保留名稱、抑制新圖；活動用 cycling／resistance 圖示，linked logs 另顯動作圖 | 按日／來源／分類與有紀錄天數；不能把有紀錄天數當訓練完成率；多筆圖片增加長度需量測 | [LogsPage](../src/pages/LogsPage.tsx)、[ManualWorkoutCard](../src/components/ManualWorkoutCard.tsx)、[ActivityIdentityVisual](../src/components/ActivityIdentityVisual.tsx)、[TrainingLog](../src/components/TrainingLog.tsx) |
| 知識 `/education` | 教育文字，不是逐動作圖片庫 | 維持教育與執行頁分工；不新增診斷／療效宣稱 | [EducationPage](../src/pages/EducationPage.tsx) |

路由以 [main.tsx](../src/main.tsx) 為準；`/demo-entry` 僅條件式 demo build，wildcard 回首頁，不當正式新增頁面。不存在獨立 `/progress` route；進度在紀錄等現有頁面。

圖片例外不可誤判：

- 自訂 record-only、catalog 缺失 ID、舊補記器材版本不能借用另一動作圖片。ManualWorkoutCard 對五個 revised catalog ID 的舊器材／名稱有保護，保留這個資料契約。
- WorkoutMovementArt 圖片 `alt=""`、父層 aria-hidden，身份由旁邊名稱／文字說明提供；不是證明 a11y 全面通過。現有元件沒有獨立圖片載入錯誤 handler，缺失 ID 備援不等於壞 URL 備援；若追蹤此項需先實測載入失敗。
- 影片外部搜尋可能導致離開 app；不可據此宣稱影片的姿勢、安全或同圖已核准。

## 4. 核心流程與摩擦位置

| 任務 | 現行走法 | 已驗證／尚缺 |
|---|---|---|
| 每日復健 | 首頁依狀態下一步→當日安全→需要時評估→推薦動作→詳情→前疼痛→單動作組數→後疼痛→儲存確認→紀錄 | 真人整流程 Pass；詳情／active 圖像連續性、找回說明成本未測；不能要求每次全評估 |
| 肌力訓練與補記 | 動作庫或補記選 Push/Pull/Leg→選官方動作→組數／次數／重量／暖身→儲存→紀錄 | 真人補記 Pass；catalogOnly 健身動作不能當 guided rehab 啟動；尚未整合整套 session |
| 收藏建立計畫 | 動作圖片收藏→首頁收藏清單→建立新或加入既有→首頁找到→編輯排序→儲存重載 | 五步已 Pass；不是新的主要故障；當計畫／收藏數量增大時的尋找成本未測 |
| 重用保存組合 | 首頁展開組合→開第一個詳情→單動作安全訓練→儲存→再找組合／下一個動作 | 原始碼確認沒有 plan context／下一動作協調；整套連續執行需求需另外確認 |
| 每週目標與日期安排 | 首頁本週進度展開編輯目標；日期排程需活動細節→ActivityPlan→展開編輯 | 日期安排入口與 `/routine` 名稱有落差，F1；Goal進度以紀錄天數計算 |
| 騎車／自訂補記 | 首頁補記→cycling分鐘或新增record-only自訂→保存／重用→紀錄重載 | 真人 Pass；不要加假 reps／pain；不同Preview origin的LocalStorage獨立，不是同origin遺失 |

本次不公布估算點擊次數或任務秒數。要量測時需固定：first-run／回訪、已有安全／評估、計畫數、收藏數、資料 origin、裝置、語言，才可比較前後。

## 5. 前三項改善提案與最小 PR

P0：本次靜態盤點沒有證明新安全／資料遺失／核心故障；不是完整安全掃描結論。P1／P2 是改善嚴重度；risk tier 是實作影響範圍，兩者不可混用。

### F1 — P1：每週日期安排入口與「每週安排」頁面名稱不一致

- File：[RoutinePage](../src/pages/RoutinePage.tsx)、[HomePage](../src/pages/HomePage.tsx)、[ActivityTracking](../src/components/ActivityTracking.tsx)、[ActivityPlan](../src/components/ActivityPlan.tsx)、[zh-TW locale](../src/locales/zh-TW.js)。
- Behavior：手機「更多→每週安排」到 `/routine`，顯示保存組合與 starter routines；實際星期編輯在首頁收合活動細節中的 ActivityPlan，且其編輯再收合一層。這是程式可證明的入口落差，尚未收到使用者對這條特定走法的 Fail。
- Risk：使用者想改 Push 星期時，依頁名找不到日期表；把組合誤當日期計畫，增加尋找／解釋成本。沒有證據顯示資料 loss 或安全 bypass。
- 最小建議：Tier 1 PR 先讓本週進度提供清楚「編輯每週日期安排」直達定位，並明示 `/routine` 的「動作組合」用途；不搬移 state、不改預設週排程或 storage。是否改 nav 名稱需看使用者理解結果，避免一次全面重命名。
- Acceptance criterion：從首頁本週進度能直接到已展開的日期編輯；從每週安排頁能找到清楚排程入口／說明；中英文可理解組合 vs 日期安排；未存草稿與已存星期重載保持；不改安全／推薦。
- QA：回訪 iPhone Safari 找到並改 Push 星期；320/375/390px、keyboard focus／返回；原排程與 Goal/Today regression。若改 routing/state，升 Tier 2＋適用獨立審查。

### F2 — P2：動作圖片在詳情與進行中缺少連續性

- Evidence：ExerciseCard／ExerciseIdentityVisual 使用共用圖；ExerciseDetailPage 與 ActiveSessionPanel 未使用該元件。存在視覺中斷，但是否造成操作錯誤尚未驗證，不能當已確認 P1。
- 最小建議：Tier 1 PR 先在詳情概覽重用已選 ID 的既有圖片；active 若加圖採可收合輔助，不壓縮組數／完成／停止操作，不更換資產、aliases、器材或姿勢。
- Acceptance criterion：同 ID 跨 library/detail/finish/history 的 actual rendered img src 一致；缺失 ID graceful；影片與完整文字仍可用，手機操作不被擋；坐站補充肌群圖／legend保留。
- QA：先請使用者找圖／認動作，再量測有圖前後差異；兩語言、320/375px、圖片失敗、scroll、stop button；源一致、手機渲染與clinical動作核准分開。動作／mapping變更須另升風險與四gate，不藏在此 UI PR。

### F3 — P2：保存計畫可重用，但逐動作執行缺少計畫上下文

- Evidence：HomeSavedPlans／SavedRoutinePicker 都連到 `/exercise/:id`；SessionPage／SessionTracker 是單動作，沒有整套開始或下一動作協調。這是既有 MVP 邊界，不是宣稱 #195 未完成。
- 使用者假設：做 3–5 個動作可能需要反覆回首頁／組合找下一個；尚無本次整套實測時間與中途離開回報。
- 最小建議：先 Tier 1 說明保存組合用途、提供穩定「回此組合」導覽提案；只有使用者確認要整套執行後才做 Tier 0 session contract，再 Tier 2／3 實作。不得冒用「開始整套」按鈕導向單一動作假裝完成。
- Acceptance criterion：第一階段使用者能分辨保存 vs 執行、可回同組合且排序不變；後续 orchestration 必須明確處理跨動作安全有效期、前後疼痛、partial save、去重、停止／resume及legacy storage，不自動授予安全資格。
- QA：固定 3 動作組合逐一完成／中止，紀錄切分與順序；需要此需求後才訂整套驗收，不能用單動作測試代替。

候補觀察：補記「更多」卡片及組合全 catalog 下拉在43動作時的尋找成本；首頁三張計畫為最近儲存而非最近使用；不同頁排序是否困惑。均需觀察，不新增 P0/P1，也不把已修收藏／圖片問題重列故障。

## 6. 下一輪真人觀察與記錄格式

以同一 origin／資料狀態操作：①從本週進度找到日期安排並改 Push 星期；②選同一動作於詳情／active辨識與查看說明；③三動作保存組合逐一執行並回組合。既有已 Pass 的補記與收藏流程僅在變更影響時重測。

每項記錄：日期、head／網址、裝置瀏覽器、語言、first-run或回訪、起始資料、預期、實際、卡住位置、是否需提示、是否離開app、資料正確／重複與任務時間（有實測才填）。不要求真人刻意誘發疼痛或紅旗。

## 7. Codex-ready 下一步

本報告不批次啟動三項實作。建議先 F1，分支 `codex/weekly-plan-entry-clarity`。實作前重新讀 workflow及最新main、核對本 finding仍存在，搜尋既有 issue／PR，然後建立單一可驗收追蹤。

> Implement the F1 weekly schedule entry clarification described in docs/ux-current-state-2026-10-13.md. Read AGENTS.md, REVIEW.md, .github/pull_request_template.md and applicable docs first. Verify the current route mismatch. Add the smallest clear route/anchor to the existing weekday editor without changing schedule defaults, safety rules, recommendations or storage. Preserve drafts and localization, validate mobile and keyboard behavior, classify risk based on actual routing/state impact, open one PR, trigger applicable exact-head reviews, and do not merge without authorization.

後续每次更新報告須更換基準SHA／觀察日期與證據範圍；不將歷史真人 Pass 自動套用新head。不修改 ChatGPT project的 `sources/`。
