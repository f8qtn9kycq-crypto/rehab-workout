# AGENTS.md

## Mandatory workflow bootstrap

For every ChatGPT, Codex, Claude, Gemini, or other AI-assisted task in this repo:

1. Read this file first.
2. Read `REVIEW.md` before reviewing or preparing a PR for review.
3. Read `.github/pull_request_template.md` before opening or updating a PR.
4. Treat repo-tracked workflow files as the source of truth over pasted chat context when they conflict.
5. Classify the task risk tier before implementation:
   - Tier 0: docs / copy / small CSS
   - Tier 1: mobile UX / i18n / navigation
   - Tier 2: safety / session / storage / routing
   - Tier 3: architecture / data migration / security
6. Keep the change scoped to the selected risk tier.
7. If the requested work is broad, split it into the smallest safe PR.
8. Do not rely on memory alone for workflow, safety, or review requirements.

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

## AI execution rules

Codex must:
- sync from latest `main` before creating an implementation branch.
- create a branch for changes instead of committing directly to `main`.
- keep PRs small and reviewable.
- fill the PR template with concrete QA evidence.
- run `npm run build` before reporting completion.
- run `npm run audit:exercise-coverage` when exercise data, filters, recommendations, or coverage docs may be affected.
- avoid changing safety, session, storage, or routing behavior unless the task explicitly asks for it.

ChatGPT must:
- check repo workflow files before generating Codex prompts or PR reviews when repo access is available.
- use `AGENTS.md`, `REVIEW.md`, and the PR template as the workflow contract.
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
