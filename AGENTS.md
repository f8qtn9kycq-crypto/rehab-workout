# AGENTS.md

## Mandatory workflow bootstrap

For every ChatGPT, Codex, Claude, Gemini, or other AI-assisted task in this repo:

1. Read this file first.
2. Read `REVIEW.md` before reviewing or preparing a PR for review.
3. Read `.github/pull_request_template.md` before opening or updating a PR.
4. Read `.github/ai-automation.yml` before scheduled automation, issue selection, PR gating, or any GitHub mutation when the file exists.
5. Treat repo-tracked workflow files as the source of truth over pasted chat context when they conflict.
6. Classify the task risk tier before implementation:
   - Tier 0: docs / copy / small CSS
   - Tier 1: mobile UX / i18n / navigation
   - Tier 2: safety / session / storage / routing
   - Tier 3: architecture / data migration / security
7. Keep the change scoped to the selected risk tier.
8. If the requested work is broad, split it into the smallest safe PR.
9. Do not rely on memory alone for workflow, safety, or review requirements.

## Detailed repo docs

Use root workflow files as the contract and `/docs` files as detailed handbooks:

- `.github/ai-automation.yml`: repo-owned automation contract for scheduled runners, repo preflight, issue/PR selection, validation, review routing, and merge gating.
- `docs/chatgpt-project-instructions-compact.md`: paste-ready compact ChatGPT Project Instructions under 8,000 characters.
- `docs/ai-workflow.md`: AI tool roles, source-of-truth order, risk tiers, validation, merge gates, and cleanup.
- `docs/project-source-hygiene.md`: ChatGPT Project uploaded-source cleanup, stale-source handling, and active/archive naming rules.
- `docs/pr-workflow.md`: branch naming, risk tier evidence, review contract, merge gate, and post-merge cleanup.
- `docs/product-scope.md`: product mission, supported rehab areas, platform priority, journey, and roadmap priorities.
- `docs/architecture.md`: React/Vite/Router structure, routes, component responsibilities, LocalStorage, media embed rules, and validation.
- `docs/exercise-data-model.md`: exercise schema, bodyArea/type enums, equipment taxonomy, training log schema, and content data rules.
- `docs/safety-rules.md`: pain rules, red flags, joint-specific safety, prohibited claims, and safety review checks.
- `docs/mobile-ux-guidelines.md`: mobile-first UX, iOS Safari, touch targets, exercise detail IA, YouTube iframe, and LocalStorage expectations.
- `docs/localization-style-guide.md`: zh-TW / English tone, glossary, safety wording, and translation QA.

Do not duplicate the full product spec inside ChatGPT Project Instructions. Keep ChatGPT compact and route detailed rules to repo docs.

## External Project sources

ChatGPT Project uploaded files, branch compact contexts, and one-time implementation prompts are reference material only unless they explicitly match current repo docs.

Use `docs/project-source-hygiene.md` when auditing or cleaning Project sources. Archive or remove stale uploaded sources instead of letting old prompts override current repo workflow, safety, risk tier, or validation rules.

## Product context

This is a mobile-first Active Aging / rehab-oriented web app.

Primary users:
- adults returning to exercise
- beginners
- users with minor shoulder, hip, knee, or back limitations

## Safety rules

- Pain 0-3: allow normal or modified training.
- Pain >3: recommend regression, recovery, or easier movement.
- Pain >=6: stop training.
- Red flags must block training.
- Do not make diagnosis, cure, or medical certainty claims.
- Shoulder: avoid aggressive overhead defaults.
- Hip: avoid high-impact and deep-flexion defaults.
- Back: avoid heavy hinge defaults.

## Engineering rules

- Keep changes minimal and localized.
- Do not rewrite the app unless explicitly requested.
- Preserve existing user data.
- Preserve LocalStorage compatibility.
- Preserve iOS Safari compatibility.
- Preserve mobile-first layout.
- Prefer tests or explicit QA evidence for changed behavior.

## Workflow docs

Detailed workflow rules live in repo docs:

- `.github/ai-automation.yml`
- `docs/ai-workflow.md`
- `docs/pr-workflow.md`
- `docs/codex-issue-workflow.md`
- `docs/project-source-hygiene.md`
- `docs/chatgpt-project-instructions-compact.md`
- `ai/skills/rehab-workout-issue-to-pr/SKILL.md`

Use repo-tracked workflow files as source of truth over pasted compact context or prior chat memory.

## AI execution rules

Scheduled automation runners must:
- read `.github/ai-automation.yml` before selecting issues, gating PRs, or mutating GitHub.
- verify the local git remote, queried GitHub repo, and repo-tracked instructions match this repository.
- stop with `repo-mismatch blocker` before mutation when identity or product instructions do not match.
- execute at most one issue/PR unit of work per scheduled run.

Codex must:
- sync from latest `main` before creating an implementation branch.
- create a branch for changes instead of committing directly to `main`.
- keep PRs small and reviewable.
- fill the PR template with concrete QA evidence.
- run `npm run build` before reporting completion.
- run `npm run audit:exercise-coverage` when exercise data, filters, recommendations, or coverage docs may be affected.
- avoid changing safety, session, storage, or routing behavior unless the task explicitly asks for it.

## GitHub Projects V2 automation

The repo uses `.github/workflows/project-auto-add.yml` to add issues and pull requests to Project #2, populate project fields, and sync Project Status from GitHub lifecycle state.

This workflow requires:

- A repo secret named `PROJECTS_TOKEN`.
- A PAT value with GitHub Projects V2 read/write access, including the `project` OAuth scope or equivalent fine-grained Projects read/write permission.

`GITHUB_TOKEN` cannot access Projects V2 fields. The workflow must not fall back to `github.token` for project field writes.

The workflow tracks:

- Issues: opened / reopened / edited / labeled / closed.
- Pull requests: opened / reopened / edited / synchronize / ready_for_review / labeled / closed.

Lifecycle status rules:

- Open or reopened issues sync to `Backlog`.
- Issues closed as completed sync to `Done`.
- Open pull requests sync to `Ready to Merge` only when strict readiness is verifiable: the PR is open, not draft, mergeable with clean merge state, has a successful current-head Build check, and has no active requested-changes review.
- Open pull requests that are not strictly ready sync to `Review` when available, otherwise `In Progress` when available.
- If `Ready to Merge` does not exist as a Project Status option, the workflow logs the fallback and keeps using `Review` / `In Progress`.
- Merged pull requests sync to `Done`.
- Pull requests closed without merge must not be marked `Done`.
- Merged pull requests with `Closes #N`, `Fixes #N`, or `Resolves #N` also sync linked issue `#N` to `Done`.

If `Project auto-add` fails:

1. Check whether `PROJECTS_TOKEN` exists in repo Actions secrets.
2. If it is missing, report it as the blocker.
3. Do not work around the failure by using `github.token`.

After the secret is set, missed issues and pull requests can be backfilled by running:

```bash
gh workflow run project-auto-add.yml -f target_type=issue -f target_number=<N>
gh workflow run project-auto-add.yml -f target_type=pull_request -f target_number=<N>
```

ChatGPT must:
- check repo workflow files before generating Codex prompts or PR reviews when repo access is available.
- use `AGENTS.md`, `REVIEW.md`, and the PR template as the workflow contract.
- use detailed docs under `/docs` for safety, mobile UX, localization, workflow specifics, and Project source hygiene.
- avoid broad refactor prompts unless explicitly requested.
- provide Codex-ready prompts with changed-file targets, acceptance criteria, QA checks, and merge gates.

Review agents must:
- follow `REVIEW.md` severity definitions.
- avoid duplicate findings.
- include file, behavior, risk, and acceptance criterion for every P0/P1.

## P0 blockers

Flag as P0 only when:
- build fails
- core user flow is broken
- safety gate can be bypassed
- pain >=6 can start training
- red flag does not block training
- required session state is lost
- iOS Safari / SPA routing breaks core use
- existing stored user data may be lost

## P1 improvements

Flag as P1 when:
- mobile navigation is confusing
- important controls are hidden on mobile
- user-facing copy is too dense
- i18n is mixed or broken
- primary controls lack accessibility labels
- changed behavior lacks test or QA evidence

## Post-merge cleanup

After a PR is merged:
- Confirm the PR is merged into `main`.
- Confirm no open follow-up work depends on the branch.
- Delete the remote branch, or verify GitHub auto-deleted it.
- Delete any temporary local branch or worktree if it exists.
- Do not touch unrelated local edits.

Prefer GitHub's built-in automatic head-branch deletion after merge when available. It is the lowest-HBC path because GitHub handles routine remote branch cleanup without extra manual steps.

## Output contract

Return:
1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

Do not include P2 wishlist items unless explicitly requested.
Do not suggest broad rewrites.
