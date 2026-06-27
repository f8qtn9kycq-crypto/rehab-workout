# AGENTS.md

## Review mode

This repo uses AI-assisted PR review. Optimize for minimal, high-confidence findings.

## Product rules

Mobile-first web app.
Do not request full rewrites.
Prefer localized changes.
Preserve existing user data and LocalStorage compatibility.
Preserve iOS Safari compatibility.

## Safety rules

Pain >= 6 must block training.
Red flags must block training.
Pain > 3 should recommend regression or recovery.
Do not make diagnosis, cure, or medical certainty claims.
Shoulder: avoid aggressive overhead defaults.
Hip: avoid high-impact and deep-flexion defaults.
Back: avoid heavy hinge defaults.

## P0 blockers

Flag only if:
- app cannot build
- user cannot complete primary flow
- safety gate can be bypassed
- pain >= 6 can start training
- red flag does not block training
- session exit loses required state
- iOS Safari / SPA route breaks core usage
- LocalStorage migration loses existing user data

## P1 improvements

Flag if:
- mobile navigation is confusing
- important controls are hidden on mobile
- copy is too dense for 3-second scan
- i18n is mixed or broken
- accessibility labels are missing on primary actions
- QA evidence is incomplete for changed behavior

## Output format

Return:
1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

No broad rewrites.
No speculative issues.
No low-value style comments.
