# Architecture

This document preserves the default technical architecture for Rehab-Workout. Keep ChatGPT Project Instructions compact and link here for implementation details.

## Default Stack

- React
- Vite
- React Router
- LocalStorage for MVP persistence
- responsive embedded video container
- mobile-first CSS
- no backend unless explicitly requested

## Platform Priority

1. iOS Safari
2. Android Chrome
3. Desktop workable

## 目前路由

```text
/
/onboarding
/safety
/assessment
/exercises
/exercise/:exerciseId
/session/:exerciseId
/logs
/logs/new
/routine
/education
```

路由宣告以 [`src/main.tsx`](../src/main.tsx) 為準。`/demo-entry` 只在 `__ENTRY_DEMO__` 啟用時提供，不是預設 production 路由。

| 路由／入口 | 存取與行為 |
|---|---|
| `/`、`/onboarding` | 首次使用首頁導向 onboarding；完成後進入 `/safety`。一般首頁顯示情境主要下一步。 |
| `/safety` | 當日安全確認與紅旗阻擋；安全通過後回原要求路徑或預設 `/assessment`。 |
| `/assessment`、`/session/:exerciseId` | 由 `SafetyRouteGuard` 保護；缺少當日安全確認或 blocked 狀態時返回 safety。Session 另驗證動作及訓練前疼痛，`catalogOnly` 返回詳情。 |
| `/exercises`、`/exercise/:exerciseId`、`/routine`、`/education` | 可先瀏覽；未經安全流程不能因此開始引導訓練。 |
| `/logs`、`/logs/new` | 紀錄閱讀與回顧補記；補記不進入 guided-session gate，也不推定疼痛。 |

## 目前檔案責任

- `src/main.tsx`：React 掛載、Router、provider 與路由宣告。
- `src/pages/`：頁面組合與各路由入口。
- `src/components/`：共用 UI、表單與引導互動；安全及 session 元件的行為契約需個別驗證。
- `src/data/`：動作、教育、器材及其他靜態資料。
- `src/services/`：LocalStorage 讀寫／相容性、i18n 與 media helpers。
- `src/utils/`：推薦、安全／疼痛規則、紀錄呈現與格式等邏輯 helpers。
- `src/hooks/`：可重用狀態及 safety／LocalStorage hooks。
- `src/styles.css`：全域樣式、mobile layout 與 safe-area 規則。

以上描述既有結構，不要求為符合文件而搬動檔案或重寫架構。

## Mobile Requirements

- `viewport-fit=cover`
- safe-area inset support
- no horizontal overflow at 320px / 375px
- primary touch targets at least 44px
- bottom navigation clear of iOS safe area

## Persistence

LocalStorage is the MVP persistence layer. Preserve existing stored keys unless a migration is explicitly requested.

`/logs/new` is a retrospective workout form. It stores one workout with multiple exercises in a separate additive key; it does not enter guided-session routes or infer pain scores. Optional pain and effort are saved only when explicitly entered. Cycling is recorded separately through the existing activity key. Records groups workouts, guided logs, and activities by local day for display without changing their stored records.

## Media Embed Rules

- Use a responsive 16:9 media container.
- Use meaningful localized titles.
- Convert watch URLs to embed URLs when safe.
- Keep fallback links when conversion is unsafe.
- 影片彈窗關閉時卸載其中的 iframe；詳情離開時卸載詳情的 iframe。保留可讀的文字及 fallback 入口。
- Written steps and safety notes remain accessible when video exists.

### 彈窗與焦點

`ExerciseDetailModal` 與 `SessionTracker` 退出確認使用原生 `dialog.showModal()`；僅 `aria-modal` 標記不代表背景已隔離。開啟時設定初始焦點，彈窗內循環可用控制項，關閉後返回觸發按鈕；退出確認的 Escape 等同取消退出，保留進度且不寫入紀錄。小視窗內容可捲動，核心控制項保持可操作。

Safari 的滑鼠／觸控開啟不必然讓按鈕取得焦點，影片開啟處明確聚焦以便返回。跨來源 iframe 的按鍵與播放內容另列證據邊界；WebKit 自動化不等於實體 iPhone 或 VoiceOver。驗收參照 [影片彈窗 QA](video-dialog-qa.md) 與 [前端結構審查](frontend-structure-review-2026-10-14.md)。

## Exercise Detail IA

Preferred sections:

```text
Overview
Steps
Safety
Adjustments
Start
```

Opening detail should start at the top. Long pages should use sections, tabs, accordions, or sub-pages. Swipe can be optional only; visible controls are required.

## Validation

Product-code PRs should run `npm run build`. Run `npm run audit:exercise-coverage` when exercise data, filters, recommendations, or coverage docs change. Run `npm run test` if available.

## 紀錄分類呈現

保留三個既有儲存來源並顯示來源。引導紀錄列為復健；肌力活動列為肌力，也可包含連結的復健紀錄。補記先採使用者明確的 strength／mobility 分類，再依既有 canonical ID 判定（catalogOnly 健身動作為肌力，其餘復健動作庫為復健）。缺失 ID 與舊 name-only 紀錄維持未分類，不從翻譯名稱推測。舊 cyclingMinutes 只加入同一筆補記的有氧標籤，不產生新騎車紀錄。

每週紀錄筆數不是訓練 session 次數。有紀錄天數及各類別每天最多算一天，包含提前停止紀錄；混合分類可重疊，不能相加。這些呈現計數不影響疼痛／功能趨勢或安全推薦資格。


### 每週目標與 Today 安排
`rehab.trainingGoals.v1` 獨立保存三類個人每週天數意圖（0–7 或 null 未設定），未設定時不產生處方。進度沿用 Records 有紀錄天數，非完整 session 次數。Today 只讀既有 weekday 排程與今日來源／已知重訓分類，允許 Push 計畫與 Pull 實際不同，不改排程或安全推薦。損壞資料／寫入失敗不覆寫，清除本機資料包含此新鍵。


### 個人常用組合
`rehab.savedRoutines.v1` 只保存名稱、routine ID 與有序 canonical exercise IDs；50 組、每組 20 個動作上限。讀取容許歷史缺失 IDs 並提示編輯替換，寫入只接受目前 canonical IDs，拒絕 custom record-only 動作。不自動推薦或一鍵啟動整套訓練；組合連到既有詳情頁，步驟／安全說明／原有 session gate 不變。保留三種 starter routines。損壞／quota 不覆寫，清除本機資料包含新鍵。

### 動作收藏
`rehab.favoriteExercises.v1` 獨立保存 canonical IDs；保留歷史缺失 ID，損壞／quota 時不覆寫。圖片卡片下方提供收藏按鈕，Today 的收藏入口連到 `/routine#saved-routine-title` 的收藏清單，空狀態連到動作庫；動作庫收藏是既有篩選結果的子集合，不改推薦資格或安全規則。取消收藏不刪除紀錄、目標或常用組合，清除本機資料包含此新鍵。每週目標表單位於 Today 本週進度區塊，透過 details 展開編輯。


### 每週日期安排入口
首頁本週進度的「編輯每週日期安排」以 `/#weekly-schedule` 同頁定位既有 ActivityPlan，展開活動細節、排程與日期編輯並聚焦第一個欄位。`/routine` 亦重用 ActivityPlan，提供同頁 `#weekly-schedule` 入口與日期／動作組合用途說明；hash 不重設組合或目標草稿。沿用 `rehab.weeklyActivityPlan.v1` 與既有 saveActivityPlan，星期選項立即保存、不改預設或 safety／recommendation。相同 hash 再次點擊也能展開。


最新版頁面／圖片與使用阻力盤點見 [2026-10-13 UX 現況報告](ux-current-state-2026-10-13.md)；它是指定 main SHA 的盤點快照，不代表後續改善已實作。F1 日期入口後續由 #207 交付；現況以本文件日期入口段落與最新程式為準。

### 常用組合返回來源
從首頁／組合清單進入詳情時，以 URL `routine` ID 保留來源，開始單一動作時沿用該 query；SafetyRouteGuard 已保留 search，無 guard 修改。詳情與成功儲存畫面提供回原組合，只在目前 reader 可讀且該組合仍含目前動作時顯示；無新 key、跨動作完成狀態或自動續做。返回 `/routine#<routine-id>` 聚焦對應卡片並沿用原順序，下一動作由使用者自行選取並再次經既有獨立安全／疼痛流程。停止或症狀加劇不自動指派下一動作，儲存失敗不顯示成功返回入口。
