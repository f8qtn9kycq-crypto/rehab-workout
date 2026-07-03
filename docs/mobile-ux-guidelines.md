# Mobile UX Guidelines

This app is mobile-first for active-aging users. Optimize for safe start, low friction, readable guidance, and clear recovery decisions.

## Platform Priority

1. iOS Safari
2. Android Chrome
3. Desktop workable on macOS / Windows / Linux

## First Screen

The first screen should be simple:

```text
Start safely
Choose body area
Continue last session
```

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
