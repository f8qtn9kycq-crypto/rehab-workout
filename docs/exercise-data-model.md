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

## Knowledge sources

Exercise content may reference `src/data/knowledgeSources.ts` using a stable `knowledgeSources:<sourceId>` value in `sourceRef`. The registry is an evidence and curation layer, not a replacement for written exercise instructions. Records distinguish hospital/professional sources, expert videos, and higher-level evidence, and must retain safety limitations and content notes.
Audit output should help identify:

- missing fields
- unsupported filter combinations
- unavailable equipment filters
- body-area coverage gaps
- risky defaults

## 每週活動追蹤

`rehab.activities.v1` 獨立保存 `ResistanceSession` 與 `CyclingActivity`，不遷移或改寫 `rehab.trainingLogs.v2`。

- 共用欄位：`id`、本機日期 `date`、`completed`、`actualMinutes`、`symptomResponse`、選填 `nextDayResponse`。
- 阻力場次另有 `kind: resistance`、`primaryFocus: lower | push | pull | mixed` 與 `exerciseLogIds`。同一動作紀錄只能歸入一個場次；UI 僅提供當天尚未歸組的紀錄。既有 log 保留上限可能使舊連結無法展開，場次本身仍保留。
- 騎車使用 `kind: cycling`，不偽造 Exercise 或 bodyArea。同日多趟可分別保存。
- 週範圍為瀏覽器本機週一至今日，完成阻力目標 3 次、騎車目標 4 趟。未完成與未歸組動作不計次；歷史動作不依日期自動合併。
- 回饋為 `same | better | worse | red_flag`，缺少隔天反應不視為正常。隔天回饋於活動日期之後開放。連結動作中的停止／疼痛加劇會保守納入活動回饋。
- 週建議先看規律，再看症狀／隔天反應、兩類活動各自的分鐘變化，最後才提出一項條件式小進展。警訊／惡化優先顯示停止／降階；分鐘數不是重量或組數的替代測量。
- `rehab.weeklyActivityPlan.v1` 保存七個活動各自的星期（週一 0 至週日 6），前三個為下肢／推／拉主題，後四個為騎車；可同日安排，排程不會建立完成紀錄。
- 兩個新 key 都納入清除本機資料。資料損壞或儲存不可用時拒絕覆寫，不以空陣列取代原資料。
- Today 與 Records 提供已發生活動的補記與週摘要；引導訓練仍先進入 `/safety`。不新增訓練路由、不改疼痛門檻、不把使用者重量紀錄轉成動作處方。
- 週摘要可選取複製，無後端、跨裝置或 ChatGPT 自動同步。功能指標繼續使用 Records 既有獨立儲存與呈現。
