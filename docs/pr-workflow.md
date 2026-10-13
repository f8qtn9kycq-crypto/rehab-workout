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

風險分級與審查路由以 `AGENTS.md`、`REVIEW.md` 與 `.github/ai-automation.yml` 為契約，PR template 用於記錄適用項目及證據。純文件描述現有行為為 Tier 0；產品變更依最高受影響風險分級。

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

### Tier 2 — 安全相關流程／state／routing／session／storage

Examples:

- session flow（不含安全邏輯變更）
- route guards
- LocalStorage behavior
- recommendation filtering
- exercise detail navigation

Expected evidence:

- build result
- relevant test or manual QA
- safety regression check
- iOS Safari / SPA routing consideration
- Codex 審查必要；Claude 建議，衝突或 merge gate 時建議 ChatGPT PM synthesis

### Tier 3 — 架構／資料遷移／安全性／安全邏輯／推薦安全／動作內容

Examples:

- 架構變更、資料遷移或安全性變更
- SafetyGate、PainScale、red flags 或 Recovery Mode 的安全邏輯
- 推薦安全規則
- 動作內容變更

Expected evidence:

- build result
- relevant audit/test result
- Codex 與 Claude 審查必要，ChatGPT PM synthesis 合併前必要；結果綁定精確 head
- no diagnosis/cure claims
- stricter merge gate

Tier 3 PRs automatically receive one exact-head AI review request on open,
reopen, synchronization, and transition to ready-for-review. The trusted
`pull_request_target` workflow reads only GitHub metadata, never checks out or
executes PR code, and deduplicates requests by head SHA. The request mentions
Claude and records the ChatGPT PM synthesis requirement; it is not itself a
completed review, synthesis result, approval, or merge authorization.

If the automatic request workflow fails, fix or rerun the request path and keep
the PR blocked. Do not treat a required-review checkbox or request comment as
evidence that either reviewer completed its work.

## Sole-contributor approval policy

每次交付前核對即時 collaborator 清單及 PR author。只有 collaborator 恰為一人、且 PR author 為該人時，才適用 sole-contributor 政策；無法查證時不得推定符合條件。

Tier 0–2 不以作者無法 self-approve 作為預設阻塞；仍需適用的 AI 審查、精確 head checks、無 active requested changes／blocking threads、clean mergeability 及驗收通過。Tier 3 保留必要 Claude 審查與 ChatGPT PM synthesis。真人 walkthrough 依 `AGENTS.md`／`REVIEW.md` 的安全邏輯、破壞性或不可逆資料遷移、安全敏感行為、無法可靠自動驗證或明確驗收需求判定，並綁定精確 head。

AI 或 walkthrough 結果不得宣稱為正式 GitHub `APPROVE`；條件不符或新增 collaborator 時，遵循實際 branch protection、ruleset 與 requested-review 要求，不另設一律真人核准的門檻。

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

- 依 `REVIEW.md` 的精確 head gate 核對 SHA、required Check Runs／GitHub App、reviews／threads、Draft、mergeability 及授權；每次 head 改變後重新驗證

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
