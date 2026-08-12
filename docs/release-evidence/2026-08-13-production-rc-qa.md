# 2026-08-13 Production Release-Candidate QA

## Verdict

**Partial Pass**

- P0 blockers: none found in the executed production and desktop-browser lanes.
- P1 finding: switching to English changed visible copy but left the document language as `zh-Hant` and the browser title in Traditional Chinese. The focused fix is included in this branch and passed local regression checks.
- Release-evidence blocker: physical iOS Safari and physical Android Chrome were not available. Responsive Chromium and macOS browser results below are not physical-device UAT.

Issue: [#117](https://github.com/f8qtn9kycq-crypto/rehab-workout/issues/117)

## Tested production target

- Canonical URL: `https://rehab-workout.vercel.app`
- Git SHA: `d17ad303ac36860dbb9be773ee15d83ed3b03dd3`
- GitHub deployment ID: `5874144047`
- Environment: `Production`
- Deployment status: `success`
- Validation window: 2026-08-13 01:43–01:55 CST

The i18n metadata repair in this PR was validated locally and is not part of the production SHA above.

## Evidence boundaries

| Lane | Environment | Result | What it proves |
| --- | --- | --- | --- |
| Production responsive browser | Codex in-app Chromium at 320, 375, 390, 393, 412, and 1440 px | Pass | Route rendering, responsive layout, core interactions, language copy, persistence, and no measured horizontal overflow |
| Production desktop Safari | macOS Safari | Pass | Safari desktop rendering, safety controls, pain slider, pain 6/10 blocking, session start, and English copy |
| Production desktop Chrome | macOS Chrome Guest | Pass | Fresh Chrome state, onboarding, safety, assessment slider, recovery mode, and English copy |
| Local post-fix browser | Vite + in-app Chromium | Pass | `html[lang]` and browser title follow the active language and survive reload |
| Physical iOS Safari | No connected device; Xcode/iOS Simulator unavailable | Blocked | No physical iPhone or iOS Simulator claim |
| Physical Android Chrome | No connected device; Android emulator/ADB unavailable | Blocked | No physical Android or Android emulator claim |

## Viewport matrix

| Viewport | Routes checked | Result |
| --- | --- | --- |
| 320 × 568 | Home, Safety, Assessment, Exercises, Detail, Session, Logs, Education | Pass; `scrollWidth === innerWidth` on every route |
| 375 × 667 | Home, Safety, Assessment, Exercises, Detail, Session, Logs, Education | Pass; `scrollWidth === innerWidth` on every route |
| 390 × 844 | Complete core journey plus Home routine and Education | Pass; no horizontal overflow or clipped primary control observed |
| 393 × 852 | Home, Safety, Detail, Session, Logs | Pass; `scrollWidth === innerWidth` on every route |
| 412 × 915 | Android-width responsive sanity across all primary routes | Pass in Chromium; not Android Chrome device evidence |
| 1440 × 900 | All primary routes | Pass in Chromium |

Native checkboxes and visually hidden radio inputs report smaller intrinsic input boxes, but their labeled controls provide the interactive surface. No primary button or link below the 44 px target baseline was found in the measured routes.

## Core journey evidence

### Fresh user and safety

- Fresh production storage opened the focused onboarding path.
- Selecting `急性劇痛` immediately replaced the continue action with a blocked safety recommendation.
- Clearing the red flag and selecting `無以上狀況` enabled the safety continuation path.
- The same red-flag and safe-continuation behavior was exercised in macOS Safari.

### Assessment and pain rules

- Assessment defaults rendered correctly and saved the selected body area, equipment, time, and mode.
- Pain above 3 switched the assessment to recovery mode.
- Pain 6/10 produced zero recommended exercises plus explicit stop/rest/professional-evaluation guidance.
- In the guided session, pain 6/10 kept `開始訓練` unavailable and displayed the stop-training message in production macOS Safari.
- Selecting the explicit 0-pain control enabled the guided session.

### Exercise detail and guided session

- Recommended shoulder exercises rendered with localized details, equipment, sets, reps, and rest.
- Exercise detail preserved written steps, safety notes, stop rules, easier options, and the session action when the video fallback appeared.
- A three-set guided session completed through rest and next-set states.
- Required pain-before and pain-after gates prevented starting or saving until a value was explicitly selected.

### Logs, refresh, outcomes, routine, and education

- Saved a completed training log with pain `0 → 0`, `3/3` sets, effort, and a QA note.
- Added a shoulder functional outcome at `4/5`.
- Reload preserved both the training log and functional outcome.
- Returning Home displayed the saved-log/outcome summary and continue-last-session path.
- Weekly routine switching (`5 分鐘恢復`, `10 分鐘部位計畫`, `3 天入門`) rendered the expected plan content.
- Education was reachable from the mobile More menu and rendered all learning cards and ankle-stability pillars.

### Language coverage

- zh-TW copy passed the full core journey.
- English copy rendered across Education, Assessment, navigation, and an active guided session in Chromium, Safari, and Chrome.
- Production defect found: the English UI still exposed `document.documentElement.lang === 'zh-Hant'`, and the browser title remained `樂齡復健訓練`.
- Local repair result after switching to English and reloading: `lang === 'en'`, title `Senior Rehab Training`, English heading retained.
- Local default result: `lang === 'zh-Hant'`, title `樂齡復健訓練`.

## P1 repair

Changed files:

- `src/services/i18n.js`
- `scripts/smoke-regression.mjs`

Acceptance evidence:

- The i18n provider now synchronizes `document.documentElement.lang` with the active locale.
- The browser title now uses the localized `app.brand` value.
- A smoke regression check protects both behaviors.

## Exact-head local validation

- `npm ci` — Pass; 0 vulnerabilities.
- `npm run build` — Pass.
- `npm test` — Pass, including the new browser-metadata regression.
- `npm run audit:safety-i18n` — Pass.
- `git diff --check` — Pass; run again at the final PR head.
- `npm run audit:exercise-coverage` — not required; no exercise data, filters, recommendations, or coverage documentation changed.

## Remaining acceptance criteria

- Run the release-candidate matrix on physical iOS Safari at 320/375/390-class devices.
- Run the release-candidate matrix on physical Android Chrome.
- Recheck the metadata repair on the exact deployed PR SHA after release.

Issue #117 must remain open until the two physical-device lanes are evidenced or explicitly re-scoped by the owner.
