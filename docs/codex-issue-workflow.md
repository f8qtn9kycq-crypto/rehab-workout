# Issue-driven Codex workflow

Use this workflow when you want to trigger Codex with a short instruction instead of pasting a long prompt.

## Why

Long prompts are hard to keep synchronized with repo rules. This repo now keeps workflow requirements in:

- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`
- `/docs/*`

A GitHub issue can hold the task scope and acceptance criteria. Codex then only needs a short trigger.

## Recommended flow

1. Open a GitHub issue using the **Codex Task** issue template.
2. Fill in:
   - risk tier
   - goal
   - user problem
   - scope
   - likely files
   - safety constraints
   - validation
   - acceptance criteria
3. Start Codex from the issue or paste the short trigger into Codex.
4. Codex reads the issue plus repo workflow docs.
5. Codex creates a branch, implements the smallest safe change, runs validation, and opens a PR.
6. Review the PR using `REVIEW.md`.
7. Merge only when the PR template evidence is complete and no P0 remains.
8. After merge, verify branch auto-delete or delete the branch manually.

## Short Codex trigger

```text
Implement GitHub issue #ISSUE_NUMBER following AGENTS.md, REVIEW.md, and .github/pull_request_template.md. Keep scope minimal, create a branch, run required validation, open a PR, and do not merge automatically.
```

## Risk tier routing

- Tier 0: docs / copy / small CSS. Codex review is usually enough.
- Tier 1: mobile UX / i18n / navigation. Codex review is usually enough unless findings conflict.
- Tier 2: safety / session / storage / routing. Claude review is recommended.
- Tier 3: architecture / data migration / security. Split scope if possible and require stronger review.

## Guardrails

Codex must not:

- commit directly to `main`
- merge automatically
- broaden scope without asking
- change pain thresholds unless explicitly requested
- bypass SafetyGate
- weaken red-flag blocking
- break LocalStorage compatibility
- ignore iOS Safari / mobile-first requirements

## When to use a long prompt instead

Use a long prompt only when:

- the task has no GitHub issue yet
- the task needs a one-off research synthesis
- the task is a cross-tool review that should not create code changes
- the task needs detailed external references not yet captured in repo docs
