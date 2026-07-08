# AI Workflow

This file defines how ChatGPT, Codex, Claude, Gemini, and Perplexity should collaborate on this repo.

## Source Of Truth Order

When instructions conflict, use this order:

1. Latest repo files: `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/ai-automation.yml`, and relevant docs under `/docs`.
2. Current PR description, changed files, and build/test evidence.
3. Current user request.
4. Current compact context.
5. Prior chat memory.
6. Uploaded ChatGPT Project sources or one-time branch context.

Repo-tracked workflow files override pasted compact context, memory, and uploaded Project sources when they conflict.

If GitHub/repo access is unavailable, say the recommendation is based on pasted context and should be verified against the latest repo workflow files.

## Root Workflow Contract

Keep these files in the repo root or `.github` as the workflow contract:

- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`
- `.github/ai-automation.yml`

Detailed product, safety, UX, data, source hygiene, and localization rules live in `/docs`.

## Repo-Owned Automation Contract

`.github/ai-automation.yml` is the repo-owned contract for scheduled automation and low-HBC issue/PR execution.

Scheduled runners must use it to:

- verify repo identity before GitHub mutation.
- stop with `repo-mismatch blocker` when the local remote, queried GitHub repo, or repo-tracked product instructions do not match.
- select at most one issue/PR unit of work per run.
- route Codex, ChatGPT, and Claude review gates by risk tier.
- apply repo-specific validation commands and auto-merge eligibility.
- preserve product boundaries instead of using one generic cross-repo prompt.

Use the shared chain only as the workflow skeleton:

```text
issue implementation -> PR -> ChatGPT PR review -> retrieve verdict -> act on verdict
```

Each repository must own its own `.github/ai-automation.yml` rather than relying on a fully generic cross-repo scheduled task.

## Where Detailed Rules Live

Use this map instead of pasting the full product spec into ChatGPT Project Instructions:

- `.github/ai-automation.yml`: repo-owned scheduled automation contract, repo preflight, issue/PR selection, validation, review routing, and merge gating.
- `docs/chatgpt-project-instructions-compact.md`: paste-ready compact ChatGPT Project Instructions under 8,000 characters.
- `docs/ai-workflow.md`: AI tool roles, source-of-truth order, risk tiers, validation, merge gates, and cleanup.
- `docs/codex-issue-workflow.md`: one-line ChatGPT task creation and short Codex issue-to-PR trigger.
- `docs/product-feedback-workflow.md`: Feedback Inbox, PM triage, promotion rules, and when feedback becomes GitHub work.
- `docs/project-source-hygiene.md`: ChatGPT Project uploaded-source cleanup, stale-source handling, and active/archive naming rules.
- `docs/pr-workflow.md`: branch naming, risk tier evidence, review contract, merge gate, and post-merge cleanup.
- `docs/product-scope.md`: product mission, supported rehab areas, platform priority, journey, and roadmap priorities.
- `docs/architecture.md`: React/Vite/Router structure, route expectations, component responsibilities, LocalStorage, media embed rules, and validation.
- `docs/exercise-data-model.md`: exercise schema, bodyArea/type enums, equipment taxonomy, training log schema, and content data rules.
- `docs/safety-rules.md`: pain rules, red flags, joint-specific safety, prohibited claims, and safety review checks.
- `docs/mobile-ux-guidelines.md`: mobile-first UX, iOS Safari, touch targets, exercise detail IA, YouTube iframe, and LocalStorage expectations.
- `docs/localization-style-guide.md`: zh-TW / English tone, glossary, safety wording, and translation QA.
- `ai/skills/rehab-workout-issue-to-pr/SKILL.md`: repo-tracked Codex skill for implementing a GitHub issue and opening a PR.

## Project Source Hygiene

ChatGPT Project Instructions should use `docs/chatgpt-project-instructions-compact.md` as the active paste-ready block.

Uploaded Project sources, old branch compact contexts, and one-time Codex prompts should be treated as reference or archive material. They must not override repo-tracked workflow, safety, risk tier, validation, or product scope rules.

Use `docs/project-source-hygiene.md` when auditing Project sources or deciding what to archive, remove, or keep active.

## Feedback Intake

Raw product observations should use `docs/product-feedback-workflow.md` before becoming GitHub issues.

Default rule:

```text
Production bug / safety issue / regression / blocker
  -> create GitHub issue immediately

Everything else
  -> Feedback Inbox
  -> ChatGPT PM triage
  -> update existing issue, create new issue, create epic, or no action
```

This keeps the GitHub backlog focused while preserving fast feedback capture.

## ChatGPT Role

ChatGPT is the PM, architect, prompt owner, and review synthesizer.

Use ChatGPT for:

- prioritization
- backlog shaping
- feedback triage
- Codex prompts
- merge gates
- PR review synthesis
- conflict resolution between reviewers
- product decisions

ChatGPT should read `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, and `.github/ai-automation.yml` before producing Codex prompts, scheduled runner instructions, PR reviews, merge gates, post-merge cleanup instructions, or workflow recommendations.

When the user says `Feedback:`, ChatGPT should treat the content as Feedback Inbox material and follow `docs/product-feedback-workflow.md` before creating GitHub issues, unless the feedback is a production bug, safety issue, regression, or blocker.

When the user says `Codex task: <goal>`, ChatGPT should create a GitHub issue using the Codex Task template and return only the issue link, inferred risk tier, and one-line Codex trigger. ChatGPT should not attempt to edit, push, or ship code through the GitHub app.

## Codex Role

Codex is the implementation agent.

Use Codex for:

- repo inspection
- code and docs edits
- branch creation
- build/test/audit execution
- PR creation
- evidence collection

Codex must:

1. Sync from latest `main` before creating an implementation branch.
2. Create a task branch instead of committing directly to `main`.
3. Read `AGENTS.md`, `REVIEW.md`, and `.github/pull_request_template.md` before editing.
4. Read `.github/ai-automation.yml` before scheduled issue selection, PR gating, or repo automation work when present.
5. Classify risk tier before implementation.
6. Keep changes minimal and localized.
7. Fill the PR template with concrete QA evidence.
8. Avoid automatic merge unless the user explicitly asks and the repo automation contract allows it.

For repeated issue-to-PR work, Codex should follow `ai/skills/rehab-workout-issue-to-pr/SKILL.md` and `.github/ai-automation.yml`.

## Project Status Semantics

Project #2 uses Status as an operational view after issues and PRs are created:

- `Backlog`: open issue not started.
- `Ready for Codex`: issue is ready for implementation when that option is available/manual/project-level.
- `In Progress`: implementation underway, or PR exists and `Review` is unavailable.
- `PR Review` / `Review`: PR exists and needs validation or review.
- `Ready to Merge`: current PR head has passed strict readiness checks, including a successful current-head Build check and no active requested-changes review.
- `Done`: issue completed or PR merged.

Automation should prefer conservative status when GitHub mergeability, checks, or review state is unavailable. `Ready to Merge` is a merge-gate result, not a synonym for `ready_for_review`. A `CHANGES_REQUESTED` review remains blocking until the reviewer later approves or the review is dismissed; later review comments alone do not clear the block.

## Claude Role

Claude is a PR reviewer and code risk reviewer.

Use Claude for:

- Tier 2+ PRs
- safety-sensitive logic
- routing/session changes
- LocalStorage/data-loss risk
- iOS Safari risks
- complicated multi-file diff review

Do not treat Claude as source of truth unless it has direct repo or PR diff access.

## Gemini Role

Gemini is a large-context UX and language reviewer.

Use Gemini for:

- mobile UX alternatives
- language quality comparison
- information architecture review
- large multi-file critique
- design option exploration

## Perplexity Role

Perplexity is for source-backed research only.

Use it for:

- rehab UX references
- active-aging accessibility
- plain-language health communication
- browser/platform behavior
- translation principles

Do not let Perplexity directly edit code.

## Risk Tiers

Use the PR template as source of truth.

### Tier 0 — Docs / workflow only

Examples:

- `AGENTS.md`
- `REVIEW.md`
- PR template
- docs updates
- `.github/ai-automation.yml`

Requirements:

- no product code changes
- no safety behavior changes
- build not required unless package/config touched

### Tier 1 — UI / copy / low-risk UX

Examples:

- translation cleanup
- label changes
- body-area selector layout
- empty-state wording
- visual hierarchy
- accessibility copy

Requirements:

- build passes
- mobile QA notes
- no safety behavior changes
- no recommendation behavior changes unless explicitly scoped

### Tier 2 — Product flow / state / routing

Examples:

- session flow
- route guards
- LocalStorage behavior
- recommendation filtering
- exercise detail navigation

Requirements:

- build passes
- relevant tests/audits pass
- safety regression check
- iOS Safari / mobile QA
- Claude review recommended

### Tier 3 — Safety / content / recommendation logic

Examples:

- SafetyGate
- PainScale
- red flags
- Recovery Mode
- recommendation safety
- exercise content additions

Requirements:

- build passes
- audit passes
- safety review required
- no diagnosis/cure claims
- stricter merge gate

## Default Validation

Always run for implementation PRs:

```bash
npm run build
```

Run when exercise data, filters, recommendations, or coverage docs may be affected:

```bash
npm run audit:exercise-coverage
```

Run tests if the project exposes a test script:

```bash
npm run test
```

## Codex Prompt Guardrails

Every Codex prompt should include:

```text
Before making changes:
1. Read AGENTS.md.
2. Read REVIEW.md.
3. Read .github/pull_request_template.md.
4. Read .github/ai-automation.yml when present.
5. Follow them as source of truth.

Do not:
- push to main
- merge automatically
- broaden scope
- change safety thresholds
- bypass SafetyGate
- weaken red-flag blocking
```
