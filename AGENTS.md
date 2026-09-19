# AGENTS.md

## Mandatory workflow bootstrap

For every ChatGPT, Codex, Claude, Gemini, or other AI-assisted task in this repo:

1. Read this file first.
2. Read `REVIEW.md` before reviewing or preparing a PR for review.
3. Read `.github/pull_request_template.md` before opening or updating a PR.
4. Read `.github/ai-automation.yml` before scheduled automation, issue selection, PR gating, or any GitHub mutation when the file exists.
5. Treat repo-tracked workflow files as source of truth over pasted chat context or memory.
6. Classify risk tier before implementation:
   - Tier 0: docs / copy / small CSS
   - Tier 1: mobile UX / i18n / navigation
   - Tier 2: safety / session / storage / routing
   - Tier 3: architecture / data migration / security
7. Keep changes minimal and localized. Split broad work into the smallest safe PR.

## Product and safety contract

This is a mobile-first Active Aging / rehab-oriented web app for adults returning to exercise, beginners, and users with minor shoulder, hip, knee, or back limitations.

- Pain 0-3: allow normal or modified training.
- Pain >3: recommend regression, recovery, or easier movement.
- Pain >=6: stop training.
- Red flags must block training.
- Do not make diagnosis, cure, or medical-certainty claims.
- Shoulder: avoid aggressive overhead defaults.
- Hip: avoid high-impact and deep-flexion defaults.
- Back: avoid heavy hinge defaults.

Preserve existing user data, LocalStorage compatibility, iOS Safari compatibility, mobile-first layout, and existing safety gates unless the selected task explicitly changes them.

## Detailed repo docs

Use root workflow files as the contract and `/docs` as detailed handbooks:

- `.github/ai-automation.yml`
- `docs/ai-workflow.md`
- `docs/pr-workflow.md`
- `docs/codex-issue-workflow.md`
- `docs/product-scope.md`
- `docs/architecture.md`
- `docs/exercise-data-model.md`
- `docs/safety-rules.md`
- `docs/mobile-ux-guidelines.md`
- `docs/localization-style-guide.md`
- `docs/project-source-hygiene.md`
- `docs/chatgpt-project-instructions-compact.md`
- `ai/skills/rehab-workout-issue-to-pr/SKILL.md`

Uploaded Project files, branch contexts, and one-time prompts are reference material only and must not override current repo-tracked workflow or safety rules.

## AI execution rules

Scheduled automation runners must verify repo identity, read `.github/ai-automation.yml`, stop on repo mismatch, and execute at most one issue/PR unit per run.

Codex must:

- sync latest `main` before creating a branch;
- never commit directly to `main`;
- keep PRs small and reviewable;
- fill the PR template with concrete QA evidence;
- run `npm run build` for implementation work;
- run `npm run audit:exercise-coverage` when exercise data, filters, recommendations, or coverage docs may be affected;
- avoid changing safety, session, storage, or routing behavior unless explicitly scoped.

ChatGPT must inspect the repo workflow contract before generating Codex prompts, PR reviews, merge gates, or workflow recommendations. Review agents follow `REVIEW.md`, avoid duplicate findings, and include file, behavior, risk, and acceptance criterion for every P0/P1.

## PR Draft and readiness policy

Draft means implementation or required current-head automated evidence is incomplete.

Mark a PR **Ready for review** when:

- implementation is complete;
- required current-head automated checks pass;
- no known blocking P0 remains;
- P1 findings are fixed or explicitly deferred according to the review contract.

Do **not** keep a PR in Draft solely because:

- a human walkthrough has not occurred;
- an automation agent cannot authenticate to a Vercel preview;
- physical iPhone Safari evidence is absent;
- the sole contributor cannot formally self-approve.

Those are evidence gaps, not default Draft gates. They block merge only when the changed behavior cannot be validated reliably by automation, an explicit acceptance criterion requires that environment, or an unresolved P0/P1 requires human confirmation.

## Sole-contributor approval policy

While this repository has one collaborator and the PR author is that collaborator, formal GitHub self-approval is not a default merge-readiness requirement.

For Tier 0-2 work, the default gate is:

- required AI review routing complete;
- current-head required checks pass;
- no active requested-changes review;
- no unresolved blocking review threads;
- clean mergeability;
- product safety and acceptance criteria pass.

For Tier 3 work, keep required Claude Tier 3 review and ChatGPT PM synthesis. Add a human walkthrough only when the change includes safety logic, destructive or irreversible data migration, security-sensitive behavior, or another acceptance criterion that cannot be validated reliably by automation.

Never claim a formal GitHub `APPROVE` when none exists. If collaborators are added, follow actual branch-protection and requested-review rules rather than inventing an extra blanket manual gate.

## GitHub Projects V2 automation

`.github/workflows/project-auto-add.yml` adds issues and PRs to Project #2 and synchronizes lifecycle status. `PROJECTS_TOKEN` remains required for Projects V2 field writes; do not fall back to `github.token`.

Lifecycle semantics:

- open/reopened issue -> `Backlog`;
- completed issue -> `Done`;
- open PR -> `Ready to Merge` only when open, not draft, clean/mergeable, current-head Build succeeds, and no active requested-changes review exists;
- otherwise open PR -> `Review` or `In Progress`;
- merged PR -> `Done`;
- closed-unmerged PR must not be marked `Done`.

## P0 blockers

Use P0 only when:

- build fails;
- core user flow is broken;
- safety gate can be bypassed;
- pain >=6 can start training;
- red flag does not block training;
- required session state is lost;
- iOS Safari / SPA routing breaks core use;
- existing stored user data may be lost.

## P1 improvements

Use P1 for material merge-scope issues such as confusing mobile navigation, hidden important controls, dense user-facing copy, broken i18n, missing accessibility labels on primary controls, or changed behavior lacking test/QA evidence.

Do not classify the mere absence of manual or physical-device evidence as P1 when reliable automated/scripted evidence covers the changed behavior and no acceptance criterion explicitly requires that environment.

## Post-merge cleanup

After merge, confirm the PR is merged into `main`, confirm no open follow-up depends on the branch, verify/delete the remote branch, and remove only safe temporary local branches/worktrees. Do not touch unrelated local edits.

## Output contract

Return:

1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

Do not include P2 wishlist items unless explicitly requested. Do not suggest broad rewrites.
