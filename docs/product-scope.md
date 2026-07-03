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

The target user journey is:

```text
Assessment
→ Safety Gate
→ Today's Suitable Exercises
→ Guided Session
→ Pain Tracking
→ Recovery Guidance
→ Training Logs
```

The app is not just an exercise library. It is a safety-aware rehab workflow.

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
