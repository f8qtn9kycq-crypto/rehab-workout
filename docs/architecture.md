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

## Default Routes

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
/education
```

## Default File Areas

- `src/routes/`: page routes
- `src/components/`: reusable UI
- `src/data/`: exercise, education, routine, and rules data
- `src/services/`: persistence, media helpers, recommendations
- `src/utils/`: formatting and rule helpers
- `src/styles/`: global layout and mobile styles

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
- Stop playback when modal/detail closes.
- Written steps and safety notes remain accessible when video exists.

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
