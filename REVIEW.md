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
- incomplete QA evidence
- i18n inconsistency
- accessibility issue on primary action
- edge case likely to affect normal users

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

## Sole-contributor approval exception

When the live repository collaborator list contains exactly one contributor and
the PR author is that contributor, GitHub may reject formal self-approval. In
that case, a human walkthrough comment on the exact current head may satisfy the
human-approval evidence requirement, provided that:

- Claude review is formally recorded for Tier 3 work.
- ChatGPT PM synthesis is recorded where required.
- Required checks, review threads, mergeability, Draft state, and acceptance
  criteria are clean.
- The comment explicitly says it is human approval evidence and not a GitHub
  `APPROVE` review.

Re-check collaborator count before each delivery decision. This exception is
disabled as soon as a second contributor is present.

## Final output

Use this format:

Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
