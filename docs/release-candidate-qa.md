# Release Candidate QA

Use this checklist before treating Rehab-Workout as release-ready. It is a manual UAT pack for the full MVP flow and should be used alongside:

- `docs/core-flow-smoke-tests.md` for source-level regression checks
- `docs/accessibility-checklist.md` for touch target, keyboard, and safe-area follow-up
- `docs/pr-workflow.md` for PR evidence and merge gates

## Preflight

1. Sync to the release candidate branch or commit.
2. Run:

```bash
npm run build
npm run test
npm run audit:safety-i18n
```

3. Confirm the production deployment path is still Vercel-driven, not a GitHub Actions deploy job, before interpreting environment checks.
4. Clear browser cache or use an incognito window for first-run checks.
5. Prepare both zh-TW and English modes for spot checks.

## Evidence Format

Capture each section using the same short format:

```text
Area:
Viewport / Device:
Language:
Result: Pass / Fail
Evidence:
Notes:
```

Example:

```text
Area: SafetyGate red-flag block
Viewport / Device: 375px iPhone width
Language: zh-TW
Result: Pass
Evidence: Selecting a red flag blocks session start and shows blocked guidance.
Notes: None
```

## Device Matrix

Run the core flow at minimum on:

- 320px iPhone-width viewport
- 375px iPhone-width viewport
- 390px or 393px iPhone-width viewport
- Android Chrome mobile width sanity check
- Desktop sanity check

For iPhone-sized checks, confirm:

- no horizontal overflow
- bottom navigation respects safe-area padding
- primary actions remain at least 44px tall
- key actions remain visible without dense copy pushing them offscreen

## Core Journey Checklist

### First Launch And Onboarding

- Fresh LocalStorage user lands on a simple first-run path.
- First screen stays focused on safe start, body area, and how to continue.
- Education details are behind progressive disclosure rather than front-loaded.
- Returning users are not forced through unnecessary onboarding again.

### Home And Next Action

- Home clearly explains the next safe step.
- Primary action hierarchy is understandable in under a few seconds.
- Important actions are not hidden below noisy cards or secondary education.

### SafetyGate And Red Flags

- SafetyGate is reachable before starting training.
- Red flags block training.
- "None of the above" stays mutually exclusive with red flags.
- No copy implies diagnosis, cure, or guaranteed recovery.

### Assessment And Exercise Entry

- Body-area selection is visible and understandable on mobile.
- Assessment or recommendation entry remains reachable after safety checks.
- Users can reach a suitable exercise list without dead-end navigation.

### Exercise Detail

- Exercise detail opens at the top.
- Written steps remain visible and understandable even when video is present.
- Safety notes, adjustments, and stop rules remain easy to find.
- Back navigation remains obvious.

### Guided Session

- Pain-before is required before session start.
- Current exercise, written instructions, and stop controls remain visible.
- Session stop or exit controls are easy to reach.
- Pain-after entry is still required before log completion.

### Logs And Progress

- Saved logs appear after session completion or early stop.
- Refreshing the page keeps existing logs readable.
- Progress summary renders without layout breakage.
- Functional outcomes and progress copy remain understandable in both languages.

### Functional Outcomes

- Outcome check-in flow is reachable from the expected area.
- Latest outcome visibility is understandable by body area.
- Progress wording stays supportive and non-clinical.

### Weekly Routine Builder

- Routine builder loads without broken layout.
- Body-area choices and saved preferences remain readable on mobile.
- No important controls are hidden behind overflow or cramped copy.

### Education

- Education cards remain readable and skimmable.
- Long-form guidance does not bury the main rehab flow.
- Links or disclosures do not create confusing loops back into training.

## Localization Checks

For zh-TW and English:

- No mixed-language UI appears in the same surface unless intentional.
- No raw i18n keys appear.
- Safety wording remains plain and supportive.
- Progress and recovery wording avoids guarantees.

## Media And Layout Checks

- YouTube iframe remains responsive at mobile widths.
- Written steps and cautions stay visible without relying on the video.
- No clipped buttons, overlapping text, or broken cards appear at 320px / 375px / 390px.
- Desktop remains workable even though mobile is primary.

## Production Verification

Before sign-off, verify the live deployment matches the intended release candidate:

- Confirm the latest production deployment corresponds to the expected commit or PR merge.
- Confirm the live app loads in zh-TW and English.
- Re-run a short live sanity path: Home -> SafetyGate -> Assessment/Exercises -> Exercise Detail -> Session -> Logs.
- Confirm no stale production build is serving older UI or copy.

If production deploys remain Vercel-driven, record the Vercel deployment URL or commit reference in the evidence notes.

## Release Verdict

Use this summary at the end of the checklist:

```text
Release candidate verdict: Pass / Partial Pass / Fail

Blocking findings:
- ...

Follow-up findings:
- ...

Validated on:
- 320px
- 375px
- 390px or 393px
- Android Chrome
- Desktop

Validation commands:
- npm run build
- npm run test
- npm run audit:safety-i18n
```
