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

依[單一契約](https://github.com/f8qtn9kycq-crypto/rehab-workout/blob/main/.github/ai-automation.yml)的 `risk_tiers` 與 `risk_classification_policy` 選最高受影響分級；以下是表單值，不另定義規則。

- [ ] Tier 0: 依中央契約
- [ ] Tier 1: 依中央契約
- [ ] Tier 2: 依中央契約
- [ ] Tier 3: 依中央契約

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

依[單一契約](https://github.com/f8qtn9kycq-crypto/rehab-workout/blob/main/.github/ai-automation.yml)的 `risk_tiers.<Tier>.review_routing`、`approval_policy` 與 `review_policy`，填寫每項適用審查；不以此表另定必要性。

| Reviewer | required／recommended／不適用 | requested／Pending／completed | head SHA／結果連結 |
|---|---|---|---|
| Codex | 待填 | 待填 | 待填 |
| Claude | 待填 | 待填 | 待填 |
| ChatGPT PM synthesis | 待填 | 待填 | 待填 |

## Merge readiness

依[單一契約](https://github.com/f8qtn9kycq-crypto/rehab-workout/blob/main/.github/ai-automation.yml)的 `review_policy.exact_head_gate`、`pull_request_state_policy`、`approval_policy` 與 `auto_merge` 核對，記錄實際觀察：

精確 head SHA：
P0／P1 與接受條件結果：
Required Check Runs／GitHub App 與結果連結：
Review threads／requested changes／必要 review／Draft／mergeability：
使用者合併授權與清理計畫：
真人／真機／production 的已驗證及未驗證範圍：

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch
- [ ] GitHub auto-delete branch setting is enabled, or branch deletion is planned
