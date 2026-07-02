## Scope

What changed:

## User impact

What user problem this addresses:

## Workflow contract

- [ ] Read `AGENTS.md`
- [ ] Read `REVIEW.md`
- [ ] Read this PR template before opening the PR
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
- [ ] Mobile layout checked
- [ ] iOS Safari / SPA routing risk considered
- [ ] LocalStorage compatibility considered

## AI review routing

- [ ] Codex review needed
- [ ] Claude review needed only for Tier 2+ or conflicting findings
- [ ] ChatGPT PM synthesis needed only if findings conflict or PR is high-risk

## Merge readiness

- [ ] No P0
- [ ] P1 either fixed or explicitly deferred
- [ ] Acceptance criteria met

## Post-merge cleanup

- [ ] Branch can be deleted after merge
- [ ] No follow-up work depends on this branch
- [ ] GitHub auto-delete branch setting is enabled, or branch deletion is planned
