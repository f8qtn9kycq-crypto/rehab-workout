# REVIEW.md

## Review objective

Optimize for merge readiness with minimum additional scope.

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

## Final output

Use this format:

Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
