# Safety Rules

This app is educational and supportive. It must not diagnose, claim cure, guarantee treatment, or replace a physician or physical therapist.

Preferred safety wording:

```text
如果疼痛增加、出現麻木無力，或感覺不穩，請停止本次訓練，並建議諮詢醫師或物理治療師。
```

Use this wording instead of diagnosis wording:

```text
建議諮詢醫師或物理治療師
```

Avoid:

- diagnosis claims
- cure claims
- treatment guaranteed
- fixes pain
- safe for everyone

## Pain Rules

Pain scale is mandatory.

- Pain 0-3/10: acceptable if controlled and not worsening.
- Pain >3/10: trigger regression, Recovery Mode, or easier movement.
- Pain >=6/10: stop session and recommend professional evaluation.
- Pain after exercise increasing by more than 2 points: show warning and recommend modification when this rule is in scope.
- Pain = 0 must remain a valid explicit selection.

## Red Flags

Red flags must block training.

Examples:

- severe acute pain
- numbness
- tingling
- weakness
- electric sensation
- dizziness
- nausea
- fever
- recent fall, collision, or trauma
- inability to bear weight
- joint deformity
- swelling
- warmth
- redness
- worsening or new neurological symptoms

The “none of the above” option must be mutually exclusive with red flags.

## Joint-Specific Safety

### Shoulder

Avoid by default:

- aggressive overhead loading
- painful end-range rotation

Prioritize:

- scapular control
- serratus anterior
- rotator cuff
- rhomboids
- gentle mobility

### Hip

Avoid when discomfort exists:

- high impact
- deep hip flexion

Prioritize:

- glute medius
- glute max
- core
- QL stability
- controlled range

### Knee

Avoid as defaults:

- deep squat
- jumping
- running
- high impact

Prefer:

- straight-leg raise
- shallow wall squat
- calf raise
- hamstring curl
- controlled low-impact strengthening

### Ankle

Balance exercises must offer chair or wall support.

Advanced only:

- unstable-surface progressions
- eyes-closed progressions
- unsupported balance progressions

Include:

- mobility
- strength
- balance
- proprioception

## Required Safety Checks When Reviewing Code

Always verify when the PR touches relevant code:

- SafetyGate cannot be skipped before session.
- SessionRouteGuard blocks unsafe direct session entry.
- PainScale appears before and after exercise.
- Pain = 0 is a valid explicit selection.
- Pain >3 triggers Recovery Mode or regression.
- Pain >=6 stops session.
- Pain-after increase >2 shows warning if that rule exists in scope.
- Red flags block training.
- “None of the above” is mutually exclusive with red flags.
- Session screen has a stop / exit option.
- LocalStorage logs preserve key fields.
- `stoppedEarly` and `stopReason` are preserved where relevant.
- YouTube video does not replace written instructions.
- Closing video modal stops playback.
- No diagnosis or cure claims.
- No high-impact defaults for active-aging users.

## Guardrail Audit

Run the lightweight safety and localization guardrail before merging copy, i18n, or exercise-content changes:

```bash
npm run audit:safety-i18n
```

The audit is intentionally narrow. It checks runtime copy/data for obvious cure, guarantee, and universal-safety claims; checks English-visible UI files for unintended Traditional Chinese leakage; and verifies every exercise still has cautions, stop rules, regressions, and progressions.

## Written Instructions Requirement

Video may support an exercise, but written steps and safety notes must remain accessible.

Keep visible or easy to reach:

- steps
- cautions
- stop rules
- regressions
- progressions
- support/equipment notes

## Safety Regression P0 Examples

Flag as P0 when:

- build fails
- core user flow is broken
- SafetyGate can be bypassed
- pain >=6 can start training
- red flag does not block training
- required session state is lost
- iOS Safari / SPA routing breaks core use
- existing stored user data may be lost
