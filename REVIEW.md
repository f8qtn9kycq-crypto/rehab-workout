# REVIEW.md

## Review objective

Optimize for merge readiness with minimum additional scope.

Before reviewing, read:
- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`

Use repo-tracked workflow files as the source of truth over pasted chat context when they conflict.

## Review severity

### P0

Must fix before merge.

Use only for:
- build failure
- broken primary flow
- safety regression
- data loss risk
- route/load failure
- severe mobile usability blocker

### P1

Should fix in this PR.

Use for:
- confusing mobile UX
- incomplete QA evidence for changed behavior
- i18n inconsistency
- accessibility issue on primary action
- edge case likely to affect normal users

Do not classify the mere absence of a manual walkthrough, physical-device run, or authenticated preview as P1 when the changed behavior has reliable automated or scripted evidence and no acceptance criterion explicitly requires that environment.

### P2

Backlog only. Do not block merge.

## Review behavior

- Prefer high-confidence findings.
- Avoid subjective style comments.
- Avoid architectural rewrites.
- Avoid duplicate findings.
- If another reviewer already flagged the issue, do not repeat it unless adding new evidence.
- Every P0/P1 finding must include file, behavior, risk, and acceptance criterion.
- Confirm the PR template includes risk tier, safety impact, QA evidence, AI review routing, merge readiness, and post-merge cleanup.
- Do not request Claude / ChatGPT PM synthesis for Tier 0 or Tier 1 PRs unless findings conflict or safety/session/routing risk appears.
- For Tier 2+ PRs, explicitly verify SafetyGate, pain rules, red-flag blocking, session route guards, LocalStorage compatibility, and iOS Safari / SPA routing risk.
- Treat iOS Safari / physical-device testing as a targeted gate, not a blanket gate. Require it only when the changed behavior depends on device/browser behavior that cannot be covered reliably by automated or scripted QA, or when an explicit acceptance criterion requires it.

## Draft and ready-for-review policy

Draft means implementation or required automated evidence is incomplete. Once implementation is complete, current-head required checks pass, and there is no known blocking P0/P1, mark the PR Ready for review.

Do not keep a PR in Draft solely because:
- a human walkthrough has not occurred,
- an authenticated Vercel preview cannot be opened by an automation agent,
- a physical iPhone Safari run is absent,
- formal self-approval is unavailable to the sole contributor.

Those items may still be recorded as evidence gaps, but they block merge only when a changed behavior or explicit acceptance criterion genuinely depends on them.

## Sole-contributor approval policy

When the live repository collaborator list contains exactly one contributor and the PR author is that contributor, formal GitHub self-approval is not required as a default merge-readiness gate.

For Tier 0-2 work, current-head checks, required AI review routing, clean mergeability, no active requested changes, no unresolved blocking review threads, and satisfied acceptance criteria are sufficient unless manual evidence is specifically required by the changed behavior.

For Tier 3 work, retain required Claude review and ChatGPT PM synthesis. Add a human walkthrough only when the change includes safety logic, destructive/irreversible data migration, security-sensitive behavior, or another acceptance criterion that cannot be validated reliably by automation.

Never claim a formal GitHub `APPROVE` when none exists.

## Final output

Use this format:

Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
