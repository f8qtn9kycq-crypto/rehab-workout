# Issue-driven Codex workflow

## Workflow version

Current operating model: **Workflow v2.0**.

Workflow v2.0 means:

- active open issues and all future implementation issues should use the Codex Task contract below.
- closed historical issues are not rewritten for cosmetic consistency.
- obsolete open issues should be closed or clearly marked as superseded instead of being silently left active.
- Project #2 is the operational source of truth after an issue is created.
- ChatGPT owns PM triage and issue creation; Codex owns branch, implementation, validation, and PR creation.

## Why

Long prompts are hard to keep synchronized with repo rules. This repo now keeps workflow requirements in:

- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`
- `/docs/*`

A GitHub issue can hold the task scope and acceptance criteria. Codex then only needs a short trigger.

## Recommended flow

1. Tell ChatGPT one short command:

   ```text
   Codex task: <one sentence goal>
   ```

2. ChatGPT reads the repo workflow files and relevant docs, then opens a GitHub issue using the **Codex Task** issue template.
3. The issue should include:
   - risk tier
   - goal
   - user problem
   - scope
   - likely files
   - safety constraints
   - validation
   - acceptance criteria
   - short Codex trigger
4. Paste the short trigger into Codex.
5. Codex reads the issue plus repo workflow docs.
6. Codex creates a branch, implements the smallest safe change, runs validation, and opens a PR.
7. Review the PR using `REVIEW.md`.
8. Merge only when the PR template evidence is complete and no P0 remains.
9. After merge, verify branch auto-delete or delete the branch manually.

## Active issue normalization

Open active issues should include enough metadata for both humans and Project #2 automation:

- `Status`
- `Priority`
- `Risk Tier`
- `AI Owner`
- `Area`
- `Goal`
- `User problem`
- `Scope`
- `Likely files`
- `Safety constraints`
- `Validation required`
- `Acceptance criteria`
- `QA checklist`
- `Short Codex trigger`

If an older open issue is otherwise clear but lacks one or more sections, prefer adding a concise clarifying comment instead of rewriting the issue history. Do not rewrite closed legacy issues unless essential traceability is missing.

## ChatGPT shortcut

Use this command in ChatGPT:

```text
Codex task: <one sentence goal>
```

ChatGPT should then:

1. Read `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`, and relevant `/docs` files.
2. Infer the risk tier.
3. Create a GitHub issue using the Codex Task template.
4. Add scope, safety constraints, validation, and acceptance criteria.
5. Return only the issue link, inferred risk tier, and one-line Codex trigger.

Repo-tracked files are source of truth over chat memory or pasted compact context.

## Short Codex trigger

```text
Implement GitHub issue #ISSUE_NUMBER following AGENTS.md, REVIEW.md, and .github/pull_request_template.md. Keep scope minimal, create a branch, run required validation, open a PR, and do not merge automatically.
```

## Codex skill

The repeatable Codex-side workflow is tracked as a repo skill:

```text
ai/skills/rehab-workout-issue-to-pr/SKILL.md
```

Use it when the user says:

```text
Implement issue #<number>
```

The skill keeps product decisions in the GitHub issue and repo docs, while Codex handles implementation, validation, and PR evidence.

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
