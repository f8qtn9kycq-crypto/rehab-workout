# ChatGPT and Codex workflow

This document keeps the human, ChatGPT, Codex, and reviewer workflow synchronized.

## Source of truth order

When instructions conflict, use this order:

1. Repository workflow files: `AGENTS.md`, `REVIEW.md`, `.github/pull_request_template.md`
2. Current PR description and changed files
3. Current user request
4. Chat history / compact context

Do not rely on memory when repo workflow files are available.

## ChatGPT behavior

ChatGPT should:

1. Read `AGENTS.md`, `REVIEW.md`, and the PR template before producing Codex prompts or PR reviews.
2. Treat GitHub repo files as the workflow source of truth.
3. Keep product prompts scoped and implementation-ready.
4. Avoid broad refactors unless explicitly requested.
5. Include exact files, acceptance criteria, QA checklist, and merge gate.
6. Use ChatGPT PM synthesis only when findings conflict, the PR is high-risk, or a product decision is needed.

## Codex behavior

Codex should:

1. Start from latest `main`.
2. Create a task branch.
3. Read `AGENTS.md`, `REVIEW.md`, and the PR template before editing.
4. Classify risk tier before implementation.
5. Keep changes minimal and localized.
6. Preserve LocalStorage compatibility, iOS Safari compatibility, and mobile-first layout.
7. Run required validation.
8. Open a PR and complete the PR template.
9. Do not merge automatically.

## Default validation

Always run:

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

## Review routing

- Tier 0: Codex review only is usually enough.
- Tier 1: Codex review; Claude only if findings conflict or UX risk is high.
- Tier 2+: Claude review is recommended because safety, session, storage, or routing may be affected.
- ChatGPT PM synthesis is for conflicts, high-risk PRs, or prioritization decisions.

## Post-merge cleanup

After merge:

1. Confirm PR is merged into `main`.
2. Confirm no open follow-up depends on the branch.
3. Verify GitHub auto-deleted the remote branch or delete it manually.
4. Delete local temporary branch or worktree when present.
5. Do not touch unrelated local edits or stashes.
