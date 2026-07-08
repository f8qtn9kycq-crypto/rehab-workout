# Project Source Hygiene

This document defines how to keep ChatGPT Project Instructions and uploaded project sources synchronized with the repo-tracked workflow.

## Goal

Prevent stale uploaded files, branch compact contexts, and one-time implementation prompts from becoming accidental source of truth.

The repo source of truth remains:

1. `AGENTS.md`
2. `REVIEW.md`
3. `.github/pull_request_template.md`
4. Relevant docs under `/docs`
5. Current issue / PR body and validation evidence

Uploaded Project sources and pasted compact contexts are reference material only. When they conflict with repo files, use the latest repo files.

## Active Project Instructions

Use the compact paste-ready instructions from:

```text
docs/chatgpt-project-instructions-compact.md
```

Do not paste the full product spec, old Codex prompts, branch summaries, or historical audit outputs into active ChatGPT Project Instructions.

## Uploaded Project source policy

Use this status model for ChatGPT Project uploaded files:

| Status | Meaning | Action |
| --- | --- | --- |
| Active | Current reusable instruction aligned with repo docs | Keep active only if it does not duplicate repo docs |
| Reference | Useful historical context but not authoritative | Keep only when clearly named as reference/archive |
| Archive | Old branch context, old setup guide, or one-time prompt | Remove from active Project sources or rename with `archive-` prefix |
| Remove | Duplicated, misleading, or contradicted by repo docs | Delete from Project sources |

## Recommended cleanup for current uploaded sources

| Source pattern | Recommended status | Reason |
| --- | --- | --- |
| `#0 Agent Frontend + Product Expert - 樂齡肩髖復健App.txt` | Archive | Early full-app implementation prompt; current workflow requires small scoped PRs |
| `#1 Agent PM - P0 Backlog Conversion.txt` | Archive / Reference | Useful history, but many next-branch recommendations are completed or superseded |
| `#2 Agent Safety - Fitness Safety Review.txt` | Reference | Safety principles remain useful, but verdicts must come from current repo + PR evidence |
| `GitHub AI Integration Guide.txt` | Archive | Initial setup guide; replaced by issue-driven Codex workflow docs |
| `GitHub Main Branch Protection.txt` | Archive | Historical workflow setup context; current contract lives in root workflow files and docs |
| `Branch · *.txt` compact contexts | Archive | Branch-specific snapshots should not guide future work after PRs merge |
| `Training Logs Tab UX 評估.txt` | Archive / Reference | Useful UX history, but workflow automation state is now repo-tracked |

## Before adding a new Project source

Only add a new uploaded Project source when it passes all checks:

1. It is reusable across future Rehab-Workout work.
2. It does not duplicate `AGENTS.md`, `REVIEW.md`, the PR template, or `/docs`.
3. It has a clear title that says whether it is active guidance or archive/reference.
4. It does not contain a one-time next branch recommendation unless marked as archive.
5. It will not override current repo workflow, safety, risk tier, or validation rules.

## Naming convention

Use explicit prefixes:

```text
active-<topic>.md
reference-<topic>.md
archive-<topic>-<date>.md
```

Examples:

```text
active-rehab-workout-project-instructions.md
reference-safety-agent-baseline.md
archive-translation-mobile-ux-branch-2026-07.md
```

## Periodic audit checklist

Run this check after major workflow or product governance changes:

1. Confirm ChatGPT Project Instructions match `docs/chatgpt-project-instructions-compact.md`.
2. Remove or archive uploaded sources that duplicate repo docs.
3. Remove branch-specific compact contexts after their PRs merge.
4. Keep safety baselines only as reference, not current verdicts.
5. Confirm `Codex task: <goal>` still routes through `docs/codex-issue-workflow.md`.
6. Confirm Project automation guidance matches `.github/workflows/project-auto-add.yml`.

## Manual ChatGPT Project cleanup

This repo cannot directly delete ChatGPT Project uploaded files. When doing Project UI cleanup manually:

1. Open the Rehab-Workout ChatGPT Project.
2. Go to Project instructions / sources.
3. Keep the active instructions aligned with `docs/chatgpt-project-instructions-compact.md`.
4. Remove or rename stale uploaded files using the status table above.
5. Do not keep multiple duplicated versions of the same PM, Safety, or GitHub workflow prompt as active sources.

## Implementation risk

This is workflow documentation only.

Risk tier: Tier 0.

It must not change:

- app code
- safety logic
- pain thresholds
- SafetyGate
- SessionRouteGuard
- LocalStorage behavior
- exercise data
- recommendation logic
