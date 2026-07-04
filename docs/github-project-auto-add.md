# GitHub Project auto-add workflow

This repo uses `.github/workflows/project-auto-add.yml` to add newly opened issues to the user Project backlog.

## What it does

When an issue is opened, reopened, edited, or labeled, the workflow:

1. Adds the issue to Project `f8qtn9kycq-crypto/2`.
2. Sets `Status` to `Backlog` when that single-select field and option exist.
3. Infers and sets `Priority` from the issue title, labels, or body:
   - `P0`
   - `P1`
   - `P2`
4. Infers and sets `Risk Tier` from the issue body:
   - `Tier 0`
   - `Tier 1`
   - `Tier 2`
   - `Tier 3`
5. Sets `AI Owner` to `Codex` when that field and option exist.
6. Infers `Area` when possible:
   - `Safety`
   - `i18n`
   - `Progress`
   - `UX`

If a configured field or option does not exist in the Project, the workflow skips that field and logs the reason instead of failing.

## Required Project fields

Create these single-select fields in GitHub Project #2 for full automation:

| Field | Type | Required option names |
| --- | --- | --- |
| Status | Single select | `Backlog` |
| Priority | Single select | `P0`, `P1`, `P2` |
| Risk Tier | Single select | `Tier 0`, `Tier 1`, `Tier 2`, `Tier 3` |
| AI Owner | Single select | `Codex` |
| Area | Single select | `Safety`, `UX`, `i18n`, `Progress` |

The option names must match exactly because GitHub Project single-select fields are set by option id.

## Token setup

The workflow uses this token order:

```text
secrets.PROJECTS_TOKEN
↓ fallback
GITHUB_TOKEN
```

For user-owned Projects, `GITHUB_TOKEN` may not have enough Project v2 permission in every setup. If the workflow cannot access Project #2, create a fine-grained personal access token and save it as a repository secret named:

```text
PROJECTS_TOKEN
```

Recommended token access:

- Repository access: `f8qtn9kycq-crypto/rehab-workout`
- Project access: Project #2 owned by `f8qtn9kycq-crypto`
- Permissions sufficient for reading issues and writing project items / fields

## Manual backfill

Use the workflow dispatch input to backfill one issue:

```text
Actions → Project auto-add → Run workflow → issue_number
```

Run it once per issue number for existing issues that were created before this workflow was merged.

Suggested first backfill list:

```text
77
78
79
```

## Scope guardrails

This workflow only changes GitHub Project item placement and metadata. It does not change app runtime behavior, safety logic, session flow, LocalStorage schema, recommendations, or exercise data.
