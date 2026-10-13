## Scope

What changed:

## User impact

What user problem this addresses:

## Workflow contract

- [ ] Read `AGENTS.md`
- [ ] Read `REVIEW.md`
- [ ] Read this PR template before opening the PR
- [ ] Read `.github/ai-automation.yml` when automation, issue selection, PR gating, or GitHub mutation behavior is touched
- [ ] Kept changes minimal and localized
- [ ] Did not rewrite unrelated app areas

## Risk tier

- [ ] Tier 0: docs / copy / small CSS
- [ ] Tier 1: mobile UX / i18n / navigation
- [ ] Tier 2: 安全相關流程、session、storage、routing 或推薦流程；不含安全邏輯變更
- [ ] Tier 3: 架構、資料遷移、安全性、安全邏輯、推薦安全規則或動作內容變更

純文件描述現有行為仍為 Tier 0；產品變更依最高受影響風險分級。

## Safety impact

- [ ] No safety logic changed
- [ ] Safety logic changed and tests/QA updated
- [ ] Pain >=6 still blocks training
- [ ] Red flags still block training
- [ ] SafetyGate cannot be bypassed
- [ ] SafetyRouteGuard still blocks unsafe direct session entry

## QA evidence

- [ ] Build passed
- [ ] Tests passed if available
- [ ] `npm run audit:exercise-coverage` passed if exercise data, filters, recommendations, or coverage docs changed
- [ ] Mobile layout checked when UI changed
- [ ] iOS Safari / SPA routing risk considered; automated evidence is acceptable unless the changed behavior specifically requires physical-device verification
- [ ] LocalStorage compatibility considered

For exercise-image or image-ID mapping changes, link the per-asset evidence required by `docs/exercise-visual-qa.md` (visual consistency, movement accuracy, safety representation, mobile rendering). Mark unverified gates explicitly; do not claim human/blind acceptance from automation. Not applicable for changes without image or mapping impact.

For those changes, include frozen-baseline integrity and effective-source regeneration results, plus the named final-runtime comparison at native and measured 390/375/320px mobile card sizes. Keep style acceptance separate from load/ratio/overflow; identify approved anonymous controls and record reviewer/head/hash attribution.

## AI review routing

- [ ] Codex：Tier 0 選用、Tier 1 建議、Tier 2／3 必要
- [ ] Claude：Tier 2 建議、Tier 3 必要；Tier 0／1 依衝突或升級風險判斷
- [ ] ChatGPT PM synthesis：Tier 2 的衝突／merge gate 建議、Tier 3 合併前必要

每項適用審查填寫：required／recommended、requested／Pending／completed／不適用、reviewer、head SHA、結果連結。建議審查未採用時記錄原因；請求不等於完成，AI 結果不等於正式 GitHub `APPROVE`。

## Merge readiness

- [ ] No P0
- [ ] P1 either fixed or explicitly deferred
- [ ] Acceptance criteria met
- [ ] Current-head required checks passed
- [ ] No active requested-changes review or unresolved blocking review thread
- [ ] Manual walkthrough required only when a P0/P1, explicit acceptance criterion, or changed behavior cannot be validated reliably by automation

精確 head SHA：
Required Check Runs／GitHub App 與結果連結：
Review threads／requested changes／Draft／mergeability：
真人／真機／production 的已驗證及未驗證範圍：

A PR should be marked **Ready for review** once implementation is complete and required automated evidence is green. Do not keep a PR in Draft solely because human/iPhone/preview evidence is absent.

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch
- [ ] GitHub auto-delete branch setting is enabled, or branch deletion is planned
