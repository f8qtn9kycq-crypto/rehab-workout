# Product Scope

This document preserves the detailed product direction for Rehab-Workout. Keep ChatGPT Project Instructions compact and point future agents here for product scope.

## Mission

Rehab-Workout is a mobile-first rehab companion for active-aging / 樂齡 users. It helps users safely start, continue, and track low-friction rehab-strength routines.

The app is educational and supportive. Detailed safety rules live in `docs/safety-rules.md`.

## Target Users

Primary users:

- adults returning to exercise
- active-aging / 樂齡 users
- beginners
- users with minor shoulder, hip, knee, ankle, or neck limitations
- users who need simple, safe, low-impact movement guidance

## Supported Areas

The app covers:

- Shoulder + hip rehab / 肩髖復健
- Shoulder + neck soreness rehab / 肩頸痠痛復健
- Knee pain relief workout
- Ankle rehab / 踝關節穩定性訓練

Canonical body-area IDs live in `docs/exercise-data-model.md`.

## Platform Priority

1. iOS Safari
2. Android Chrome
3. Desktop workable on macOS / Windows / Linux

Mobile is the primary design target. Desktop must remain usable, but should not drive the information architecture.

## Product Journey

目前首次使用的主要引導路徑（依 `src/main.tsx`、`OnboardingFlow`、`SafetyGate` 與 `SessionTracker`）：

```text
首次使用引導
→ Safety Gate（當日安全確認）
→ Assessment（部位／疼痛與活動狀態）
→ 建議動作與文字／安全說明
→ 訓練前疼痛選擇
→ Guided Session
→ 訓練後疼痛與儲存
→ Training Logs
```

首頁依當日安全確認、評估、最近紀錄與功能追蹤決定一個主要下一步；不是每次回首頁都重新走首次使用流程。安全規則以 `docs/safety-rules.md` 為準。

另有兩條明確入口：

- 唯讀瀏覽：動作庫、詳情、知識與常用組合可先閱讀，不代表已取得開始訓練資格；進入 session 仍經當日安全確認與訓練前疼痛選擇。`catalogOnly` 健身動作不提供引導 session。
- 補記訓練：`/logs/new` 回顧已完成的活動，與即時引導訓練分開。未明確輸入的選填疼痛不自行推定，補記不授予訓練安全資格。

## Product Principles

Optimize in this order:

```text
Safety
→ Trust
→ Low-friction start
→ Clear guided session
→ Pain and function tracking
→ Education
→ Motivation
→ Polish
```

## MVP Defaults

Default stack and product constraints:

- React + Vite
- React Router
- LocalStorage MVP tracking
- responsive YouTube iframe
- mobile-first layout
- desktop workable layout
- no backend unless explicitly requested
- no Make / Google Sheet integration unless explicitly requested
- no AI chatbot unless explicitly requested

## Priority Model

P0 is reserved for safety, broken primary flow, data loss, or major mobile usability blockers.

P1 includes:

- personalization
- recommendation UX
- accessibility
- translation quality
- mobile body-area selector clarity
- exercise detail readability
- weekly routine builder
- education cards
- progress summary
- functional outcomes

P2 includes:

- advanced charts
- gamification
- therapist mode
- export reports
- backend sync
- Make / Google Sheet integration
- AI chatbot

Do not prioritize P2 before safety, trust, usability, and behavior-change fundamentals.

## Current Product Direction

Before adding new content or advanced features, prefer work that improves:

- safe start
- clear body-area selection
- readable exercise details
- clear safety notes
- low-friction guided session flow
- pain and function trend visibility

Do not add advanced exercises just to fill coverage matrices. Conservative gaps are acceptable when safer for active-aging users.
