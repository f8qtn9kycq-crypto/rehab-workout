# PR Workflow

This document preserves the branch, PR, review, merge, and cleanup workflow for AI-assisted work in this repo.

## Source Of Truth Order

When instructions conflict, use this order:

1. `AGENTS.md`
2. `REVIEW.md`
3. `.github/pull_request_template.md`
4. relevant `/docs` files
5. current PR description and validation evidence
6. current user request
7. compact context or memory

Repo-tracked files override pasted compact context or memory.

## Branch Workflow

Do not push directly to `main`.

Use branch + PR workflow:

```text
codex/p0-...
codex/p1-...
codex/p2-...
codex/docs-...
codex/workflow-...
```

Before implementation:

1. Sync latest `main`.
2. Read `AGENTS.md`.
3. Read `REVIEW.md`.
4. Read `.github/pull_request_template.md`.
5. Read relevant `/docs` files.
6. Classify risk tier.
7. Keep scope minimal and localized.

## Risk Tiers

Use the PR template as source of truth.

### Tier 0 — Docs / workflow only

Examples:

- docs files
- workflow instructions
- PR template wording
- review docs

Rules:

- no product code changes
- no app behavior changes
- no safety logic changes
- no data migration

### Tier 1 — Copy / UI / low-risk UX

Examples:

- labels
- translation copy
- visual hierarchy
- simple mobile UX adjustments
- accessibility wording

Expected evidence:

- build result when runtime files change
- mobile QA notes when UX changes
- confirmation no safety behavior changed

### Tier 2 — State / routing / session / LocalStorage

Examples:

- session flow
- route guards
- LocalStorage behavior
- recommendation filtering
- exercise detail navigation

Expected evidence:

- build result
- relevant test or manual QA
- safety regression check
- iOS Safari / SPA routing consideration
- Claude review recommended when risk is meaningful

### Tier 3 — Safety / recommendation safety / exercise content

Examples:

- SafetyGate
- PainScale
- red-flag behavior
- Recovery Mode
- recommendation safety logic
- exercise content additions

Expected evidence:

- build result
- relevant audit/test result
- safety review
- no diagnosis/cure claims
- stricter merge gate

## PR Template Evidence

Every PR should fill or preserve:

- Scope
- User impact
- Workflow contract
- Risk tier
- Safety impact
- QA evidence
- AI review routing
- Merge readiness
- Post-merge cleanup

## Review Contract

Follow `REVIEW.md`.

Final review output should use:

```text
Verdict:
P0:
P1:
Files:
Acceptance criteria:
Suggested next Codex command:
```

Every P0/P1 finding must include:

```text
File:
Behavior:
Risk:
Acceptance criterion:
```

Do not include P2 wishlist items unless explicitly requested.

## Merge Gate

Before merge, confirm:

- no P0 remains
- P1 findings are fixed or explicitly deferred
- acceptance criteria are met
- PR template is filled
- branch cleanup plan exists
- no broad unrelated refactor was introduced

For runtime PRs, also confirm:

- build passes
- relevant audit/test passes
- mobile 320px / 375px checked when UI changed
- LocalStorage compatibility considered when storage changed
- iOS Safari / SPA routing risk considered when routes changed

## Deployment Environment Gate

Issue #39 audit result as of 2026-07-03:

- The tracked GitHub Actions workflow on `main` is `.github/workflows/build.yml`.
- That workflow runs a CI build only. It does not contain a deployment job.
- No tracked workflow job currently uses `environment: Production`.
- Recent GitHub deployments are created by `vercel[bot]` for `Preview` and `Production`, which indicates the active deployment path is the Vercel GitHub integration rather than a GitHub Actions deployment job.

Do not add `environment: Production` to the CI-only `build` job. That would gate the build check, not the production deploy.

If this repo later adds a GitHub Actions deployment job, scope the environment gate to that deployment job only:

```yaml
jobs:
  deploy:
    environment: Production
```

If production deploys remain Vercel-driven, configure production approval/protection in Vercel or the Vercel/GitHub integration. GitHub Environment protection alone does not gate an external Vercel production deploy unless the deploy is routed through a GitHub Actions job that declares `environment: Production`.

## Project Auto-Add Gate

The tracked GitHub Actions workflow `.github/workflows/project-auto-add.yml` adds issues to Project #2 and populates project fields.

Projects V2 automation requires a repo Actions secret named `PROJECTS_TOKEN` whose value is a PAT with GitHub Projects V2 read/write access. For classic PATs, this means the `project` OAuth scope. For fine-grained PATs, grant the repo access needed to read issues and Projects read/write access for the owner project.

Do not rely on `GITHUB_TOKEN` for Projects V2 field writes. The workflow `permissions.repository-projects: write` entry applies to Classic Projects only and does not grant Projects V2 access.

If Project fields are empty or the `Project auto-add` workflow fails:

1. Confirm `PROJECTS_TOKEN` exists in repo Actions secrets.
2. Confirm the token can access Project #2 owned by `f8qtn9kycq-crypto`.
3. Re-run `Project auto-add` with `workflow_dispatch` for the missed issue number.
4. Backfill missed issues only after a test issue verifies field population.

## Post-Merge Cleanup

After merge:

1. Confirm the PR is merged into `main`.
2. Confirm no follow-up work depends on the branch.
3. Verify GitHub auto-deleted the branch or delete it manually.
4. Delete local temporary branches or worktrees only when safe.
5. Do not touch unrelated local edits.
6. Do not delete local stashes without explicit user approval.

Return:

- merged PR number
- merge commit if available
- branch cleanup result
- validation status
- next recommended action
