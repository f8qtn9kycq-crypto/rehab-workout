# Exercise Data Model

This document preserves the canonical data and storage model for Rehab-Workout. Use it when editing exercise data, filters, recommendations, logs, or audit scripts.

## Exercise Schema

Every exercise should follow this shape:

```js
{
  id,
  title,
  joint,
  bodyArea,
  condition,
  type,
  level,
  description,
  detail,
  steps,
  sets,
  reps,
  holdSeconds,
  restSeconds,
  durationText,
  benefits,
  cautions,
  stopRules,
  regressions,
  progressions,
  equipment,
  youtubeEmbedUrl,
  youtubeSearchUrl,
  sourceRef
}
```

## Body Area IDs

Allowed `bodyArea` values:

```text
shoulder
hip
shoulder_neck
knee
ankle
```

Do not introduce new body-area IDs without updating filters, recommendations, copy, audits, and docs.

The audit script may group `shoulder` and `hip` as `shoulder_hip` for coverage reporting. `shoulder_hip` is not a valid exercise schema value.

## Exercise Type IDs

Allowed `type` values:

```text
mobility
strength
stretch
relaxation
balance
proprioception
```

## Level IDs

Common `level` values:

```text
beginner
intermediate
advanced
```

For active-aging defaults, prefer beginner-safe or conservative movements unless a more advanced level is clearly justified.

## Equipment Taxonomy

Canonical equipment IDs:

```text
bodyweight
dumbbell
kettlebell
chair
wall
resistance_band
foam_roller
```

Rules:

- Do not mix `無器材`, `徒手`, `none`, and `bodyweight` as separate data values.
- `chair`, `wall`, and `bodyweight` may be support or fallback equipment.
- `foam_roller` may remain canonical even if unsupported by current exercises.
- Assessment, filters, exercise cards, recommendation logic, and audits should use the same canonical IDs.

Recommended mapping:

```text
徒手 / 無器材 / none / no equipment -> bodyweight
啞鈴 / dumbbells -> dumbbell
壺鈴 / kettle bell -> kettlebell
椅子 -> chair
牆 / 牆壁 -> wall
彈力帶 / band -> resistance_band
滾筒 / foam roller -> foam_roller
```

## Training Log Schema

Each saved log entry should preserve:

```js
{
  id,
  date,
  exerciseId,
  title,
  bodyArea,
  type,
  level,
  setsCompleted,
  repsCompleted,
  painBefore,
  painAfter,
  difficultyRating,
  notes,
  stoppedEarly,
  stopReason
}
```

Preserve LocalStorage compatibility unless a migration is explicitly requested.

## Functional Outcome Schema

Functional outcome check-ins use a separate LocalStorage key and must not change the training log key or shape.

Each saved outcome entry should preserve:

```js
{
  id,
  date,
  bodyArea,
  questionId,
  score,
  note
}
```

Rules:

- `bodyArea` must use the canonical body-area IDs above.
- `score` uses a 1-5 scale where higher means the daily function feels easier.
- Malformed outcome entries should be ignored safely.
- Outcome storage must not require migration of existing training logs.

## Required Exercise Detail Fields

Every exercise detail should include:

- written steps
- benefits or purpose
- cautions
- stop rules
- regressions
- progressions
- equipment or support notes
- media fallback when video is unavailable

Video must not replace written guidance.

## Content Safety Constraints

Detailed safety rules live in `docs/safety-rules.md`. Data edits should preserve these product constraints:

- no diagnosis or cure claims
- no high-impact defaults for active-aging users
- shoulder defaults avoid aggressive overhead loading
- hip defaults avoid high impact and deep flexion when discomfort exists
- knee defaults avoid deep squat, jumping, running, and high impact
- ankle balance defaults include chair or wall support

Do not add random advanced exercises just to fill coverage matrices. Conservative gaps are acceptable when safer for users.

## Audit Expectations

When exercise data, filters, recommendations, or coverage docs change, run:

```bash
npm run audit:exercise-coverage
```

Audit output should help identify:

- missing fields
- unsupported filter combinations
- unavailable equipment filters
- body-area coverage gaps
- risky defaults
