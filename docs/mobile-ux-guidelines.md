# Mobile UX Guidelines

This app is mobile-first for active-aging users. Optimize for safe start, low friction, readable guidance, and clear recovery decisions.

## Platform Priority

1. iOS Safari
2. Android Chrome
3. Desktop workable on macOS / Windows / Linux

## First Screen

目前首頁使用一個情境主要操作，依安全確認、評估、最近紀錄與功能追蹤狀態呈現下一步；次要入口為「補記訓練」，附回顧用途說明。常用組合、每週進度／目標與活動細節延伸此核心入口，詳細活動內容採漸進揭露。

```text
一個情境主要下一步
→ 補記訓練的次要入口
→ 常用組合／本週進度
→ 可展開的活動細節
```

首次使用的 onboarding 先說明安全路徑，再引導安全確認。首頁不要求同時並列安全開始、部位選擇與繼續訓練三個等權重 CTA。現況以 `HomePage` 與 `homeNextAction` 為準。

Rules:

- Avoid input fatigue on the first page.
- Use bottom tab navigation on mobile.
- Use top navigation on desktop.
- Minimum touch target: 44px.
- Avoid horizontal scrolling.
- Use large readable text and high contrast for active-aging users.
- Put education details behind progressive disclosure.
- Do not hide core body-area choices behind horizontal scroll.

## iOS Safari Rules

Support iOS safe area:

- `viewport-fit=cover`
- `env(safe-area-inset-top)`
- `env(safe-area-inset-bottom)`

QA should consider:

- 320px width
- 375px width
- 390px / 393px common iPhone widths
- bottom navigation not blocked by safe-area insets
- no accidental horizontal overflow

## Body-Area Selector

Prefer visible mobile choices over hidden complex filters.

Recommended body-area choices:

- shoulder / hip
- shoulder / neck
- knee
- ankle

Preferred mobile layout:

- 2x2 grid when space allows
- count-aware chips when filters can produce no results
- disabled unavailable choices instead of letting users hit dead ends
- clear active filter summary
- one-tap reset

Do not add advanced exercise content just to fill matrix gaps. Content gaps are acceptable when safer for active-aging users.

## Exercise Detail UX

Exercise detail must be readable and safety-first.

Preferred sections:

```text
Overview
Steps
Safety
Adjustments
Start
```

Rules:

- Opening exercise detail should start at the top.
- Long pages should use clear sections, tabs, accordions, or sub-pages.
- Swipe navigation may be optional only.
- Do not make swipe the only navigation method.
- Always provide visible Back / Next / section controls.
- Written steps, cautions, stop rules, regressions, and progressions must remain accessible.
- Start Session CTA must remain easy to find.

## Guided Session UX

A session should make it easy to:

- see the current exercise
- read written instructions
- view safety notes
- record pain before and after
- stop early
- save stoppedEarly and stopReason when relevant
- return safely without losing required state

Pain and stop controls must be more visible than nice-to-have education copy.

## YouTube Iframe Rules

Use responsive 16:9 iframe containers.

Rules:

- Convert YouTube watch URLs into embed URLs when safe.
- Clear iframe `src` or unmount iframe when modal closes to stop playback.
- Do not rely on external YouTube navigation as primary UX.
- Written steps and safety notes must remain visible even when video is available.
- Every iframe needs a meaningful localized title.

## 彈窗互動與驗收

- 使用真正的 modal 隔離背景；不能只加入 `role="dialog"`／`aria-modal`。
- 開啟時把焦點置於明確的初始控制項；Tab／Shift+Tab 在可用控制項間循環，不聚焦背景或 disabled 操作。
- 關閉後返回原觸發按鈕；滑鼠／觸控在 Safari 不必然讓開啟按鈕取得焦點，需驗證此路徑。
- 影片彈窗的 Escape 在應用程式控制項上關閉；關閉按鈕持續可見且至少 44px。關閉後卸載彈窗 iframe。
- 退出訓練彈窗的 Escape 與「繼續訓練」都取消退出、保留組數／休息狀態且不寫入紀錄；儲存仍需明確的前後疼痛，失敗保留狀態並可重試；「不儲存離開」不寫入紀錄。
- 在 320／375／390px 及桌面驗證無水平溢出、核心控制項可見／可捲動、焦點與關閉操作。跨來源播放器可能自行處理 Escape，不宣稱能攔截播放器內所有按鍵。
- 分別記錄 Chromium／WebKit、自動化／真人、實體 iPhone／VoiceOver 與 production 證據；未執行者標示 `NOT VERIFIED`，不把引擎自動化視為真機驗證。

現有可重現案例見 `scripts/exercise-video-dialog-browser-qa.mjs`、`scripts/session-exit-dialog-browser-qa.mjs`；在獨立測試 profile 執行，避免影響使用者本機紀錄。

## LocalStorage Training Logs

Use LocalStorage by default for MVP tracking.

Each log entry should preserve key fields such as:

```js
{
  id,
  date,
  exerciseId,
  title,
  bodyArea,
  type,
  level,
  setsCompleted,
  repsCompleted,
  painBefore,
  painAfter,
  difficultyRating,
  notes,
  stoppedEarly,
  stopReason
}
```

Do not break existing LocalStorage compatibility unless explicitly requested.

## Mobile Review Checklist

For PRs touching mobile UX, check:

- iPhone 320px / 375px width has no horizontal scroll.
- Desktop layout remains usable.
- Touch targets remain at least 44px.
- Focus and screen-reader access are not degraded.
- Visible UI explains active filters.
- Important safety warnings are not buried.
- Exercise start and stop controls remain easy to find.
- Written instructions remain accessible even with video.
