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
- [ ] Tier 2: safety / session / storage / routing
- [ ] Tier 3: architecture / data migration / security

## Safety impact

- [ ] No safety logic changed
- [ ] Safety logic changed and tests/QA updated
- [ ] Pain >=6 still blocks training
- [ ] Red flags still block training
- [ ] SafetyGate cannot be bypassed
- [ ] SessionRouteGuard still blocks unsafe direct session entry

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

- [ ] Codex review needed
- [ ] Claude review needed only for Tier 2+ or conflicting findings
- [ ] ChatGPT PM synthesis needed only if findings conflict or PR is high-risk

## Merge readiness

- [ ] No P0
- [ ] P1 either fixed or explicitly deferred
- [ ] Acceptance criteria met
- [ ] Current-head required checks passed
- [ ] No active requested-changes review or unresolved blocking review thread
- [ ] Manual walkthrough required only when a P0/P1, explicit acceptance criterion, or changed behavior cannot be validated reliably by automation

A PR should be marked **Ready for review** once implementation is complete and required automated evidence is green. Do not keep a PR in Draft solely because human/iPhone/preview evidence is absent.

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch
- [ ] GitHub auto-delete branch setting is enabled, or branch deletion is planned
