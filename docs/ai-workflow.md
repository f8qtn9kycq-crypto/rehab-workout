# AI Workflow

This file defines how ChatGPT, Codex, Claude, Gemini, and Perplexity should collaborate on this repo.

## Source Of Truth Order

When instructions conflict, use this order:

1. Latest repo files: `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, and relevant docs under `/docs`.
2. Current PR description, changed files, and build/test evidence.
3. Current user request.
4. Current compact context.
5. Prior chat memory.

Repo-tracked workflow files override pasted compact context or memory when they conflict.

If GitHub/repo access is unavailable, say the recommendation is based on pasted context and should be verified against the latest repo workflow files.

## Root Workflow Contract

Keep these files in the repo root as the workflow contract:

- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`

Detailed product, safety, UX, and localization rules live in `/docs`.

## ChatGPT Role

ChatGPT is the PM, architect, prompt owner, and review synthesizer.

Use ChatGPT for:

- prioritization
- backlog shaping
- Codex prompts
- merge gates
- PR review synthesis
- conflict resolution between reviewers
- product decisions

ChatGPT should read `AGENTS.md`, `REVIEW.md`, and the PR template before producing Codex prompts, PR reviews, merge gates, post-merge cleanup instructions, or workflow recommendations.

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
4. Classify risk tier before implementation.
5. Keep changes minimal and localized.
6. Fill the PR template with concrete QA evidence.
7. Avoid automatic merge unless the user explicitly asks.

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
4. Follow them as source of truth.

Do not:
- push to main
- merge automatically
- broaden scope
- change safety thresholds
- bypass SafetyGate
- weaken red-flag blocking
- add backend unless requested
- add gamification unless requested
- add new exercises unless explicitly scoped
```

## Merge Gate Template

Use this merge gate for implementation PRs:

```text
Build passes
Relevant audit/test passes
No SafetyGate regression
No pain threshold changes
Red flags still block
SessionRouteGuard still works
No LocalStorage data loss risk
No diagnosis/cure claims
Mobile 320px / 375px no horizontal overflow
IOS safe-area intact
PR scope matches requested branch
PR template filled
Post-merge branch cleanup plan exists
```

## Post-Merge Cleanup

After a PR is merged:

1. Confirm merge completed.
2. Confirm GitHub auto-delete behavior or manually delete remote branch if needed.
3. Delete local branch only after confirming it is merged.
4. Do not touch unrelated local stashes.
5. Do not delete stashes without explicit user approval.
6. Return merged PR number, merge commit if available, branch cleanup result, validation status, and next recommended action.
