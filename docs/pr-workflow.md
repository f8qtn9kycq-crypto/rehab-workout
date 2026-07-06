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

## Auto-Merge Eligibility

Auto-merge is allowed only after the normal merge gate is satisfied. Risk tier lowers the review burden; it does not bypass evidence, CI, or the PR template.

### Tier 0 docs-only PRs

Auto-merge may be enabled when all are true:

- changed files are limited to documentation, comments, templates, or non-runtime workflow instructions
- no product source files under `src/` changed
- no app behavior changed
- no safety, session, storage, routing, recommendation, or exercise data behavior changed
- PR template is filled
- required checks pass
- no P0 remains
- P1 findings are fixed or explicitly deferred
- acceptance criteria are met
- branch cleanup plan exists

### Tier 0 workflow PRs

Workflow-only PRs are still Tier 0 when they do not change runtime app behavior, but they affect repository trust and automation reliability.

Auto-merge may be enabled only when all Tier 0 docs-only conditions are true and the PR also documents:

- changed workflow files are limited to `.github/workflows/*` and supporting docs
- YAML and shell syntax were validated as practical
- `PROJECTS_TOKEN` remains required for Projects V2 field writes
- no fallback to `github.token` is introduced for Projects V2
- Project owner type remains explicit when Projects V2 automation is touched
- post-merge runtime validation steps are listed when behavior depends on real GitHub Actions or GitHub Projects events

For Tier 0 workflow PRs, human review is recommended but not mandatory when the PR is narrow, evidence is complete, and CI passes. Claude review is not required unless findings conflict or the change broadens beyond workflow/docs.

### Tier 1 and higher PRs

Do not enable blind auto-merge for Tier 1 or higher.

- Tier 1 PRs require acceptance-criteria review before merge.
- Tier 2 PRs require state, routing, session, storage, and safety regression consideration where applicable.
- Tier 3 PRs require stronger safety/content review and should not auto-merge without explicit approval.

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

The tracked GitHub Actions workflow `.github/workflows/project-auto-add.yml` adds issues and pull requests to Project #2, populates project fields, and syncs Project Status from GitHub lifecycle state.

Projects V2 automation requires a repo Actions secret named `PROJECTS_TOKEN` whose value is a PAT with GitHub Projects V2 read/write access. For classic PATs, this means the `project` OAuth scope. For fine-grained PATs, grant the repo access needed to read issues and Projects read/write access for the owner project.

Do not rely on `GITHUB_TOKEN` for Projects V2 field writes. The workflow `permissions.repository-projects: write` entry applies to Classic Projects only and does not grant Projects V2 access.

Keep the Projects V2 owner type explicit in `.github/workflows/project-auto-add.yml`. The current Project #2 is a user-owned project, so the workflow should use `PROJECT_OWNER_TYPE: user` with `PROJECT_OWNER: f8qtn9kycq-crypto` and GraphQL `user(login:)` lookup instead of implicit owner inference.

The workflow should track these GitHub content types:

- Issues on opened, reopened, edited, labeled, and closed events.
- Pull requests on opened, reopened, edited, synchronize, ready_for_review, labeled, and closed events.
- Manual `workflow_dispatch` backfills for either `target_type=issue` or `target_type=pull_request`.

Status sync rules:

- Open or reopened issues should set Project Status to `Backlog`.
- Issues closed as completed should set Project Status to `Done`.
- Open pull requests should set Project Status to `Review` when that Project option exists, otherwise `In Progress` when that option exists.
- Merged pull requests should set Project Status to `Done`.
- Pull requests closed without merge should not be marked `Done`; leave Status unchanged if there is no safer Project option.
- Merged pull requests with `Closes #N`, `Fixes #N`, or `Resolves #N` should also set linked issue `#N` Project Status to `Done`.

For pull requests, explicit PR title/body/label metadata should win first. If metadata is missing and the PR body links an issue with `Closes #N`, `Fixes #N`, or `Resolves #N`, the workflow should fetch that issue and use its metadata as fallback for Priority, Risk Tier, AI Owner, Area, and Status where appropriate.

If Project fields are empty or the `Project auto-add` workflow fails:

1. Confirm `PROJECTS_TOKEN` exists in repo Actions secrets.
2. Confirm the token can access Project #2 owned by `f8qtn9kycq-crypto`.
3. Re-run `Project auto-add` with `workflow_dispatch` for the missed issue or pull request.
4. Backfill missed content only after a test item verifies field population.

Backfill examples:

```bash
gh workflow run project-auto-add.yml -f target_type=issue -f target_number=77
gh workflow run project-auto-add.yml -f target_type=pull_request -f target_number=89
```

Expected backfill behavior:

- Issue #77 should sync to Project Status `Done` because it is closed as completed.
- PR #89 should be added to Project #2 and inherit missing metadata from issue #79 because its PR body contains `Closes #79`.

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
