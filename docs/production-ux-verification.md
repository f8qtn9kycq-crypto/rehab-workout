# Production UX Verification

Use this checklist to verify the real Rehab-Workout user journey before treating a release candidate or production deployment as ready for users.

This checklist is intentionally manual and evidence-oriented. It complements `docs/release-candidate-qa.md`, `docs/mobile-ux-guidelines.md`, and the PR template. It does not change app behavior.

For full release-candidate QA, use `docs/release-candidate-qa.md`. This document is the production UX evidence overlay for screenshots, deployment freshness, real-device/mobile viewport notes, and reviewer evidence around the core rehab journey.

## Scope

Validate the core rehab journey:

```text
Home -> SafetyGate -> Assessment / Exercises -> Exercise Detail -> Session -> Logs / Outcomes
```

Also spot-check supporting surfaces:

```text
Routine Builder
Education
Language switching
Production deployment freshness
```

## Preflight

1. Sync to the target release candidate branch, PR preview, or production deployment.
2. Confirm validation commands in the PR evidence where practical:

```bash
npm run build
npm run test
npm run audit:safety-i18n
```

3. Use a clean browser profile, incognito window, or cleared LocalStorage for first-run checks.
4. Prepare both language modes:
   - zh-TW
   - English
5. Record the tested commit, PR preview URL, or production deployment URL.

## Device matrix

Run the core path at minimum on:

| Device / viewport | Required checks |
|---|---|
| 320px iPhone-width viewport | No horizontal overflow; primary actions usable |
| 375px iPhone-width viewport | Bottom navigation and safe-area spacing intact |
| 390px / 393px iPhone-width viewport | Common iPhone layout sanity |
| Android Chrome mobile width | Touch and scroll sanity |
| Desktop | Navigation and content remain workable |

For each mobile size, confirm:

- No accidental horizontal scrolling.
- Primary buttons and bottom navigation remain visible.
- Primary tap targets are at least 44px tall/wide where practical.
- Safety warnings are not buried below noisy cards.
- Text remains readable for active-aging users.

## Evidence format

Use this short format for each check:

```text
Area:
Device / viewport:
Language:
Result: Pass / Fail / Partial
Evidence:
Notes:
```

Example:

```text
Area: SafetyGate red-flag block
Device / viewport: 375px iPhone width
Language: zh-TW
Result: Pass
Evidence: Selecting numbness blocks training and shows professional evaluation guidance.
Notes: No horizontal overflow.
```

## Core journey checklist

### 1. Home and next best action

- Home loads without stale or broken content.
- The next safe action is understandable within a few seconds.
- Primary action hierarchy is clear.
- Returning-user state does not hide the safe-start path.
- Routine builder or progress cards do not crowd out the primary next action.

Evidence suggestion:

```text
Screenshot: Home at 375px in zh-TW and English.
Note: Primary CTA and next safe step are visible without horizontal overflow.
```

### 2. SafetyGate entry

- SafetyGate is reachable before starting training.
- SafetyGate cannot be skipped before a protected session path.
- Copy stays educational and does not diagnose or promise recovery.
- The “none of the above” style option, if present, remains understandable and mutually exclusive with red flags.

Evidence suggestion:

```text
Screenshot: SafetyGate initial state and pass state.
```

### 3. Red-flag block state

Select at least one red flag and confirm:

- Training is blocked.
- The app recommends professional evaluation using supportive, non-diagnostic wording.
- No Start Session CTA remains enabled.
- Back or safe exit navigation remains available.

Red flags include severe acute pain, numbness / tingling / weakness / electric sensation, dizziness / nausea / fever, recent trauma, inability to bear weight, deformity, swelling / warmth / redness, and worsening neurological symptoms.

Evidence suggestion:

```text
Screenshot: blocked red-flag state at 320px or 375px.
```

### 4. Assessment and pain-before entry

- Body-area choices are visible and understandable on mobile.
- Users can reach a suitable exercise path without dead-end navigation.
- Pain-before entry appears before session start.
- Pain 0 remains selectable.
- Pain > 3 offers regression / recovery guidance.
- Pain >= 6 blocks training and recommends professional evaluation.

Evidence suggestion:

```text
Screenshot: body-area selection and pain-before state.
```

### 5. Exercise detail

- Exercise detail opens at the top.
- Exercise title, overview, written steps, safety notes, stop rules, regressions, and progressions remain discoverable.
- YouTube iframe does not hide or replace written instructions.
- Back navigation remains obvious.
- Start Session CTA is easy to find.
- Optional swipe gestures are not the only navigation method.

Evidence suggestion:

```text
Screenshot: top of exercise detail and safety/steps area.
```

### 6. Guided session

- Current exercise and set/session state are clear.
- Written instructions remain available during the session.
- Stop / exit controls are visible and reachable.
- Rest timer, if shown, does not block safety controls.
- Session can be completed or stopped early without losing required state.

Evidence suggestion:

```text
Screenshot: active session with stop control visible.
```

### 7. Pain-after entry and save

- Pain-after entry is required before completing the log.
- Pain-after increase greater than 2 points shows a warning and recommends modification.
- Pain >= 6 stops training guidance remains conservative.
- Saved logs include stoppedEarly and stopReason when applicable.

Evidence suggestion:

```text
Screenshot: pain-after state and saved confirmation.
```

### 8. Logs and progress / outcomes

- Saved log appears after completion or early stop.
- Refreshing keeps the log readable.
- Logs do not expose raw enum IDs, raw i18n keys, or mixed-language labels.
- Outcome prompt or latest outcome visibility is understandable by body area when available.
- Progress wording stays supportive and avoids cure or guarantee claims.

Evidence suggestion:

```text
Screenshot: saved log and progress/outcome surface in both languages.
```

### 9. Routine builder

- Routine builder is reachable from the expected surface.
- Body-area choices and session-length choices remain readable on mobile.
- No important controls are hidden behind overflow.
- Generated routine remains conservative and low-impact.

Evidence suggestion:

```text
Screenshot: routine builder at 375px.
```

### 10. Education cards

- Education cards remain skimmable.
- Long-form content does not bury the main rehab flow.
- Safety education avoids diagnosis, cure, or certainty claims.
- Links or disclosures do not create confusing loops back into training.

Evidence suggestion:

```text
Screenshot: education list and one expanded/readable card.
```

## Localization spot checks

Run the core path in zh-TW and English.

Confirm:

- No unintended mixed-language UI appears on the same surface.
- No raw i18n keys appear.
- English copy sounds plain and supportive, not overly literal or clinical.
- zh-TW copy uses Taiwan Traditional Chinese.
- Safety wording remains calm and conservative.
- Progress wording avoids cure guarantees.

Minimum surfaces:

```text
Home
SafetyGate
Assessment
Exercise Detail
Session
Logs / Outcomes
Routine Builder
Education
```

## Production deployment freshness

Before production sign-off:

- Confirm the production deployment corresponds to the expected merge commit or release candidate.
- Confirm the live app loads in both zh-TW and English.
- Re-run this short live sanity path:

```text
Home -> SafetyGate -> Assessment / Exercises -> Exercise Detail -> Session -> Logs
```

- Record the Vercel deployment URL or commit reference in PR or release notes when production remains Vercel-driven.

## Release verdict

Use this summary at the end of the verification pass:

```text
Production UX verdict: Pass / Partial Pass / Fail

Blocking findings:
- ...

Follow-up findings:
- ...

Validated on:
- 320px
- 375px
- 390px / 393px
- Android Chrome
- Desktop

Languages:
- zh-TW
- English

Validation commands:
- npm run build
- npm run test
- npm run audit:safety-i18n

Deployment / commit checked:
- ...
```
