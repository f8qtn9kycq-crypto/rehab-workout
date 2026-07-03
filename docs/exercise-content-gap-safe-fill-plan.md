# Exercise Content Gap Safe-Fill Plan

Issue: #35
Risk tier: Tier 3

## Decision

Do not add new exercise content in this PR.

The current coverage audit shows real gaps, but the highest-signal gaps are not safe to fill quickly with new movements. For active-aging users, conservative gaps are preferable to adding advanced, loaded, or balance-heavy defaults without deeper safety review.

This PR is a review and plan only. It does not change exercise data, filters, recommendations, pain rules, session routing, storage, or app behavior.

## Current Audit Snapshot

Validation command:

```bash
npm run audit:exercise-coverage
```

Observed results from the latest clean main snapshot:

- Total exercises audited: 29
- App-realistic empty body-area + difficulty + equipment combinations: 47
- Raw equipment-field empty combinations: 66
- Canonical equipment with zero exercise coverage: `foam_roller`
- Advanced coverage is absent for `shoulder_hip`, `shoulder_neck`, and `knee`
- `shoulder_neck` has no intermediate or advanced exercises
- Existing safety metadata presence checks pass for cautions, stop rules, regressions, and progressions

## Gap Classification

| Gap | Classification | Rationale | Safe action |
| --- | --- | --- | --- |
| `foam_roller` has zero exercises | Acceptable conservative gap | Foam roller guidance can imply treatment technique or pressure placement. It needs reviewed content before being user-facing as a viable filter path. | Do not add foam roller exercises now. Prefer hiding, disabling, or count-aware filtering in a future UX PR. |
| Advanced `shoulder_hip` coverage is empty | Acceptable conservative gap | Advanced shoulder or hip work can introduce loaded, overhead, single-leg, or deep-flexion risk. | Do not add advanced defaults. Add only after safety review and explicit progression guardrails. |
| Advanced `shoulder_neck` coverage is empty | Acceptable conservative gap | Advanced neck/shoulder-neck content risks loaded neck movement or aggressive end-range work. | Keep beginner-only defaults. Consider intermediate posture/endurance content only after review. |
| Advanced `knee` coverage is empty | Acceptable conservative gap | Knee advanced content can drift into deep squats, jumping, running, or high impact. | Do not add advanced knee content. Keep knee defaults low-impact. |
| `shoulder_neck` intermediate coverage is empty | Potential user-blocking gap | Users can select intermediate difficulty and get no shoulder-neck match, which can feel broken even if it is safer than adding risky content. | Prefer count-aware disabled difficulty/equipment states before adding exercises. If adding content later, keep it low-load posture endurance or gentle scapular control. |
| Sparse equipment combinations | Potential user-blocking gap | Some equipment + level combinations return no app-realistic matches. | Prefer result counts, unavailable states, and clearer empty-state guidance before adding content. |
| `shoulder_hip` audit grouping differs from app body-area IDs | Copy/reporting gap | The audit groups shoulder and hip for user mental model, while app data stores them separately. | Keep data model unchanged. Clarify reporting/copy only if users see this term. |

## Safe-Fill Principles

Only add exercise content when all of these are true:

1. The gap affects normal beginner or intermediate users.
2. The movement is low-impact, controlled, and suitable for active-aging defaults.
3. The movement does not require diagnosis-specific instructions.
4. The movement avoids high-risk defaults:
   - no jumping, running, or high-impact knee work
   - no deep squat defaults
   - no aggressive overhead shoulder loading
   - no loaded or end-range neck movement
   - no unsupported balance challenge
5. The entry includes complete fields:
   - steps
   - benefits
   - cautions
   - stop rules
   - regressions
   - progressions
   - equipment and support notes
   - media fallback
6. Pain and red-flag safety meaning remains unchanged.
7. The exercise is excluded from conservative recommendations if it has advanced, loaded, unsupported balance, or pain-sensitive characteristics.

## Candidate Future Fills

These are candidates for future reviewed PRs, not this PR.

| Candidate | Target gap | Safety posture | Required review |
| --- | --- | --- | --- |
| Shoulder-neck intermediate posture endurance drill | `shoulder_neck` intermediate | Low-load, time-limited, no end-range neck loading | Safety review |
| Shoulder-neck supported scapular endurance drill | `shoulder_neck` intermediate | Chair or wall supported, stop for numbness/tingling | Safety review |
| Knee intermediate low step or supported sit-to-stand variation | Knee intermediate equipment gaps | Low height, no deep flexion, no impact | Safety review |
| Ankle supported balance variation | Ankle non-advanced equipment gaps | Chair/wall support required | Safety review |

## Preferred Non-Content Fixes First

Before adding new exercises, prefer these lower-risk UX fixes:

1. Show count-aware equipment and difficulty states so users avoid empty combinations.
2. Disable or clearly mark zero-count filter choices.
3. Keep advanced filters collapsed on mobile.
4. Improve empty-state guidance for sparse equipment combinations.
5. Keep pain-stop and recovery-mode guidance more prominent than coverage explanations.

## Explicit Non-Goals

This plan does not recommend:

- filling every audit matrix cell
- adding advanced knee exercises
- adding aggressive shoulder or neck progressions
- adding unsupported ankle balance work
- changing pain thresholds
- changing SafetyGate
- changing SessionRouteGuard
- changing recommendation safety logic
- changing LocalStorage or saved logs

## Acceptance Gate For Future Content PRs

A future content PR should include:

- complete exercise schema fields
- no diagnosis, cure, or guaranteed recovery claims
- written steps and safety notes visible in detail view
- `npm run build`
- `npm run audit:exercise-coverage`
- 320px and 375px mobile detail-page QA
- Safety or Claude review before merge
