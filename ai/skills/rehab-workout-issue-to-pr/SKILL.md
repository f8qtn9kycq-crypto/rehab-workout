---
name: rehab-workout-issue-to-pr
description: Implement a GitHub Codex Task issue for the Rehab-Workout repo, run the required validation, and open a PR without merging automatically.
---

# Rehab-Workout Issue-to-PR

Use this skill when the user asks to implement a GitHub issue, especially with:

```text
Implement issue #<number>
```

or:

```text
Implement GitHub issue #<number> following AGENTS.md, REVIEW.md, and .github/pull_request_template.md. Keep scope minimal, create a branch, run required validation, open a PR, and do not merge automatically.
```

## Source of truth

Before making changes, read:

1. `AGENTS.md`
2. `REVIEW.md`
3. `.github/pull_request_template.md`
4. `.github/ai-automation.yml`
5. The GitHub issue
6. Relevant docs:
   - mobile UX: `docs/mobile-ux-guidelines.md`
   - localization: `docs/localization-style-guide.md`
   - safety: `docs/safety-rules.md`
   - architecture/routing/storage: `docs/architecture.md`
   - exercise data: `docs/exercise-data-model.md`
   - workflow: `docs/ai-workflow.md`, `docs/pr-workflow.md`, `docs/codex-issue-workflow.md`

以 repo-tracked 文件核對實作現況與驗證門檻；使用者目前明確指示決定任務與授權。舊提示與記憶不會自行擴大範圍或取得合併授權。

## Workflow

1. Sync from latest `main`.
2. Read the issue and classify risk tier.
3. Create a branch named with the `codex/` prefix and risk level when practical.
4. Implement only the issue scope.
5. Do not change product code for docs-only tasks.
6. Do not broaden scope without asking.
7. Run required validation.
8. Fill the PR template with concrete evidence.
9. Open a PR.
   依 `.github/ai-automation.yml` 風險分級主動發起必要或建議的 exact-head 審查，先查同 SHA 請求避免重複；請求不等於完成，外部結果不可用時標 Pending。新 head 重查 checks、threads 與 review 狀態。
10. 未獲使用者明確合併授權時停止於本機或 PR；已有授權時依[單一契約](../../../.github/ai-automation.yml)的 `review_policy.exact_head_gate`、`approval_policy` 與 `auto_merge` 執行及回報，不另設技能門檻。

## Risk tiers

分級與必要審查統一依[單一契約](../../../.github/ai-automation.yml)的 `risk_tiers`、`risk_classification_policy` 與 `review_policy`；Draft／正式review／合併資格分別讀 `pull_request_state_policy`、`approval_policy`、`auto_merge`。不在技能維護副本。

## Safety guardrails

For product tasks:

- Do not change pain thresholds unless explicitly scoped.
- Do not bypass SafetyGate.
- Do not weaken red-flag blocking.
- Do not change SafetyRouteGuard unless explicitly scoped.
- Do not change recommendation safety logic unless explicitly scoped.
- Do not introduce diagnosis, cure, guarantee, or medical-certainty claims.
- Keep written steps and safety notes accessible even when video exists.

## Validation

Always run for implementation PRs:

```bash
npm run build
```

Run when exercise data, filters, recommendations, or coverage docs may be affected:

```bash
npm run audit:exercise-coverage
```

Run tests if available:

```bash
npm run test
```

UI 證據與真人／真機條件依同一契約 `review_policy.routing_and_evidence`；不另設一律人工驗證門檻。

## PR body evidence

Include:

- scope
- user impact
- risk tier
- safety impact
- QA evidence
- changed files
- merge readiness
- post-merge branch cleanup plan

## Return format

Return:

1. PR URL
2. changed files
3. validation results
4. safety impact
5. 實際交付／合併狀態、精確 head、驗證結果及尚未通過的 gate；不把 Pending 寫成完成。
