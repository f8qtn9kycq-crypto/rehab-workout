# PR Workflow

This document preserves the branch, PR, review, merge, and cleanup workflow for AI-assisted work in this repo.

## Source Of Truth Order

任務範圍與授權依目前使用者明確指示；平台安全限制仍適用。
實作現況依最新 `AGENTS.md`、`REVIEW.md`、automation contract 與相關 docs 核對。
PR 描述、舊 compact context、記憶與上傳文件都是參考，不能自行覆蓋使用者授權。

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

## 風險與審查契約

所有規則依[單一契約](../.github/ai-automation.yml)的 `risk_tiers`、`risk_classification_policy`、`review_policy`、`approval_policy` 與 `pull_request_state_policy`。本手冊說明操作順序，不維護分級或門檻副本。

Tier 3 PRs automatically receive one exact-head AI review request on open,
reopen, synchronization, and transition to ready-for-review. The trusted
`pull_request_target` workflow reads only GitHub metadata, never checks out or
executes PR code, and deduplicates requests by head SHA. The request mentions
Claude and records the ChatGPT PM synthesis requirement; it is not itself a
completed review, synthesis result, approval, or merge authorization.

If the automatic request workflow fails, fix or rerun the request path and keep
the PR blocked. Do not treat a required-review checkbox or request comment as
evidence that either reviewer completed its work.

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

## Review、Merge 與 Auto-Merge

由 [REVIEW.md](../REVIEW.md) 進入[單一契約](../.github/ai-automation.yml)：finding／輸出格式讀 `review_policy`，精確 head 合併讀 `review_policy.exact_head_gate` 與 `approval_policy`，自動化資格及 workflow 額外條件讀 `auto_merge`。執行與回報所用證據必須對應實際變更，不以本手冊作第二份門檻。

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
- Pull requests on opened, reopened, edited, synchronize, ready_for_review, labeled, and closed events. The ordinary `pull_request` job records a non-secret lifecycle check on the PR head, while the independent `pull_request_target` job uses the trusted default-branch workflow definition to write Project V2 fields. These jobs do not gate one another: the record job is not security or mutation evidence, and a successful trusted job is the authoritative Project-sync evidence. The privileged job must never check out or execute PR code. The current-head `build` check remains the merge-readiness check.
- Manual `workflow_dispatch` backfills for either `target_type=issue` or `target_type=pull_request`.

Status sync rules:

- Open or reopened issues should set Project Status to `Backlog`.
- Issues closed as completed should set Project Status to `Done`.
- Open pull requests should set Project Status to `Ready to Merge` only when strict readiness is verifiable: the PR is open, not draft, mergeable with clean merge state, has a successful current-head `build` check run, and has no active requested-changes review. Do not treat unrelated combined commit statuses as a substitute for the current-head Build gate.
- Open pull requests that are not strictly ready should set Project Status to `Review` when that Project option exists, otherwise `In Progress` when that option exists.
- If `Ready to Merge` does not exist as a Project Status option, the workflow should log the fallback and keep using `Review` / `In Progress`.
- Merged pull requests should set Project Status to `Done`.
- Pull requests closed without merge should not be marked `Done`; leave Status unchanged if there is no safer Project option.
- Merged pull requests with `Closes #N`, `Fixes #N`, or `Resolves #N` should also set linked issue `#N` Project Status to `Done`.

Project Status meanings:

- `Backlog`: issue is open and not started.
- `Ready for Codex`: issue is ready for implementation when that option is available/manual/project-level.
- `In Progress`: implementation is underway or a PR exists and `Review` is unavailable.
- `PR Review` / `Review`: PR exists and needs validation, review, or unresolved-gate work.
- `Ready to Merge`: strict merge gate passed for the current PR head, including the current-head Build check and review-state gate.
- `Done`: issue is completed or PR is merged.

GitHub can briefly return unknown mergeability or incomplete check state immediately after PR events. When any readiness signal is unavailable or not clean, the workflow should prefer `Review` / `In Progress` rather than `Ready to Merge`. A `CHANGES_REQUESTED` review remains blocking until that reviewer later approves or the review is dismissed; later comments alone do not clear it.

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
