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
4. The GitHub issue
5. Relevant docs:
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
10. 沿用本次使用者授權：未授權合併時停止於 PR；已明確授權 merge-if-pass 時，依 REVIEW.md 重查 exact-head checks／App、threads、requested changes、Draft、mergeability、適用獨立審查與接受條件，以 expected head SHA 合併。授權持續有效，但不得繞過任何門檻。

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

UI 變更依影響驗證 320px／375px，必要時加 390px 與桌面；可採可靠瀏覽器自動化。只有明確接受條件、具體 P0/P1，或自動化無法可靠涵蓋的變更行為，才將真人／真機列為 gate。分開標示本機、CI、瀏覽器、真人、真機與 production，不能以一種證據冒充另一種。

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
5. 實際交付狀態：未合併時列具體 gate；已授權且合併時列 reviewed head、merge SHA、main 核對及遠端分支清理結果。不得把仍 Pending 的審查寫成完成。
