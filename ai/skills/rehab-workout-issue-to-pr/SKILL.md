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

Repo-tracked files override pasted compact context and chat memory.

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
10. Stop before merge unless the user explicitly asks to merge.

## Risk tiers

- Tier 0: docs / copy / small CSS.
- Tier 1: mobile UX / i18n / navigation.
- Tier 2: 安全相關流程、session、storage、routing 或推薦流程；不含安全邏輯變更.
- Tier 3: 架構、資料遷移、安全性、安全邏輯、推薦安全規則或動作內容變更.

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

UI 變更需附 320px 與 375px QA，可使用可靠的瀏覽器自動化；只有變更行為無法可靠自動驗證、明確驗收條件或未解 P0/P1 要求時，才增加真人／真機 walkthrough。分開標示證據環境。

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
5. note that the PR was not merged automatically
