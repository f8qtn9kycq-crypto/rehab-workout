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
