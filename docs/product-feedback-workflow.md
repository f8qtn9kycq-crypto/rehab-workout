# Product Feedback Workflow

This document defines how raw user observations become actionable GitHub work without creating duplicate issues or unnecessary process overhead.

## Goal

Capture feedback quickly, group it intelligently, and create GitHub issues only when engineering work is justified.

Use this workflow to reduce Human Brain Cycles (HBC) while keeping Codex tasks focused and reviewable.

## Default flow

```text
Use or review app
  ↓
Feedback Inbox
  ↓
ChatGPT PM triage
  ↓
No action / update issue / new issue / epic
  ↓
GitHub Project
  ↓
Codex issue-to-PR workflow
```

## Capture convention

Use this lightweight format during testing:

```text
Feedback:
- Training Logs still mixes English and Taiwan Traditional Chinese.
- Records cards look too similar.
- Exercise detail page feels too long on mobile.
```

Feedback items are intentionally raw. Do not add priority, risk tier, likely files, or acceptance criteria during capture.

## Feedback Inbox rules

The Feedback Inbox is a temporary holding area before GitHub issue creation.

Use it for:

- UX friction
- confusing copy
- visual hierarchy concerns
- repeated user questions
- discoverability issues
- product ideas
- minor polish observations

Do not turn every observation into a GitHub issue immediately. Group related feedback first.

## Immediate GitHub issue rule

Create a GitHub issue immediately only when the feedback is one of the following:

1. Production bug
2. Safety issue
3. Regression
4. Blocker

Examples:

| Feedback | Action |
| --- | --- |
| Pain >= 6 can still start a session | Create issue immediately |
| Red flag does not block training | Create issue immediately |
| English mode shows mixed zh-TW in a primary flow | Create issue immediately if reproducible |
| Exercise detail page feels long | Put in Feedback Inbox first |
| Button spacing feels uneven | Put in Feedback Inbox first |

## PM triage steps

When triaging feedback, ChatGPT should:

1. Remove duplicates.
2. Group related items by theme.
3. Check whether an existing GitHub issue already covers the theme.
4. Decide one of four outcomes:
   - no action
   - update an existing issue
   - create a new GitHub issue
   - create or update an epic issue
5. Keep implementation scope small enough for one Codex PR.

## Grouping examples

Raw feedback:

```text
Feedback:
- Records page is hard to scan.
- Training Logs mixes English and Chinese.
- Cards in Records look identical.
- Latest training is hard to understand.
- Outcome form feels like a debug form.
```

Triage result:

```text
Theme 1: Records localization
Theme 2: Records information hierarchy
Theme 3: Outcome form UX
```

Possible GitHub result:

```text
Issue A: Fix Training Logs mixed-language display
Issue B: Redesign Records progress summary cards
Issue C: Redesign outcome check-in form
```

## Epic vs issue decision

Create an epic when the feedback contains multiple independent implementation areas.

Create a normal issue when the change is small, testable, and can fit into one PR.

| Situation | Use |
| --- | --- |
| One bug, one route, clear acceptance criteria | Normal issue |
| Several related UX issues across routes | Epic + child issues |
| Broad roadmap theme | Epic |
| One-time thought or weak signal | Feedback Inbox only |

## Issue body simplification

Once a feedback item is promoted into a GitHub issue, keep the issue concise.

Required issue sections:

```text
Goal
User Problem
Acceptance Criteria
References
Codex Trigger
```

Do not repeat global repo rules in every issue. Global rules live in:

- `AGENTS.md`
- `REVIEW.md`
- `.github/pull_request_template.md`
- `docs/ai-workflow.md`
- `docs/pr-workflow.md`

## Triage cadence

Use event-based triage by default.

Trigger triage when either:

- a testing session is complete, or
- around 15-20 feedback observations have accumulated.

Do not schedule recurring triage until feedback volume becomes steady or multiple contributors are submitting feedback.

Reassess scheduled triage if these are true for several weeks:

- feedback arrives every week,
- issues are aging without decisions,
- duplicate feedback is increasing,
- PR prioritization becomes unclear.

## Scheduled triage policy

Recurring triage is optional.

Recommended later cadence if needed:

- Weekly PM triage: 30-45 minutes
- Monthly roadmap review: 60-90 minutes

Do not add calendar overhead before there is enough feedback volume to justify it.

## ChatGPT behavior

When the user starts a message with `Feedback:`, ChatGPT should:

1. Treat the content as Feedback Inbox material.
2. Avoid creating GitHub issues immediately unless the immediate issue rule applies.
3. Consolidate duplicates and related themes.
4. Search existing issues when repo access is available and an issue may already exist.
5. Recommend one of:
   - keep in inbox,
   - update existing issue,
   - create new issue,
   - create or update epic.

## Codex behavior

Codex should not start from raw feedback.

Codex should start from a GitHub issue with clear acceptance criteria, then follow the repo issue-to-PR workflow.

## Safety guardrails

Feedback triage must never weaken these rules:

- Do not change pain thresholds unless explicitly approved.
- Do not bypass SafetyGate.
- Do not weaken red-flag blocking.
- Do not change SessionRouteGuard without Tier 2+ review.
- Do not introduce diagnosis or cure claims.
- Written steps and safety notes must remain accessible.

## Outcome

This workflow keeps the backlog clean:

```text
Capture everything.
Implement selectively.
Keep Codex issues small.
Use GitHub Project as the operational source of truth.
```
