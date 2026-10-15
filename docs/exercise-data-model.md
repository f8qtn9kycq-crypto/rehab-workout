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
  catalogOnly? // searchable in All exercises; excluded from recommendations
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
  sets? // optional per-set detail
}
```

Optional strength details use this additive shape without migrating or replacing the aggregate fields:

```js
sets: [
  { weightKg?: number, reps?: number, completed: boolean }
]
```

- `setsCompleted` and `repsCompleted` remain readable for every legacy and new log.
- Set details are optional and capped at 20 rows. Weight is kilograms when supplied; reps are whole numbers.
- Mobility, bodyweight, and cycling flows do not require weight. Strength logs may omit the entire `sets` field.
- Malformed optional set details are ignored while the otherwise-valid training log remains readable.
- Editing or removing set details updates the existing log ID in `rehab.trainingLogs.v2`; it does not create a duplicate log or change linked `ResistanceSession.exerciseLogIds`.

Preserve LocalStorage compatibility unless a migration is explicitly requested.

## Retrospective workout record

`rehab.manualWorkouts.v1` is additive and separate from guided `rehab.trainingLogs.v2` and activity `rehab.activities.v1`. One saved workout has a local `YYYY-MM-DD` date, a stable ID, creation time, and 1–12 exercises. Each exercise has its actual name, optional equipment, and 1–20 completed sets with required positive integer reps and optional nonnegative weight in kg. A set may be marked as warm-up. Optional exercise feedback includes type, body area, effort, and a paired before/after pain score; an omitted value remains unknown, including when the user does not provide any pain score. These records do not enter rehab recommendations or recovery trends. New cycling entries use separate `rehab.activities.v1` records so two rides stay distinct. Existing manual workouts with `cyclingMinutes` remain readable and still count as one workout, without creating a cycling activity. Invalid or corrupt stored data must not be overwritten by a new save; clear-local-data includes this key.

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

`catalogOnly: true` is reserved for content that users may search and read in All exercises but cannot start as a guided session. It remains excluded from conservative recommendations and Today defaults until a separate safety/content decision is made.

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
- 阻力場次可用選填 `segments` 記錄多個訓練部分。新寫入的 phase 必須唯一，每筆 `exerciseLogId` 只能歸入一個 segment，且各 segment 的 log 聯集必須等於場次頂層 `exerciseLogIds`；每個 segment 可各自記錄 `performanceQuality`。舊版已保存的 segment 仍可讀取及補填隔天回饋，不因新驗證規則失效。
- 騎車使用 `kind: cycling`，不偽造 Exercise 或 bodyArea。同日多趟可分別保存。
- 週範圍為瀏覽器本機週一至今日，完成阻力目標 3 次、騎車目標 4 趟。未完成與未歸組動作不計次；歷史動作不依日期自動合併。
- 回饋為 `same | better | worse | red_flag`，缺少隔天反應不視為正常。隔天回饋於活動日期之後開放。連結動作中的停止／疼痛加劇會保守納入活動回饋。
- 週建議先看規律，再看症狀／隔天反應、兩類活動各自的分鐘變化，最後才提出一項條件式小進展。警訊／惡化優先顯示停止／降階；分鐘數不是重量或組數的替代測量。
- `rehab.weeklyActivityPlan.v1` 保存七個活動各自的星期（週一 0 至週日 6），前三個為下肢／推／拉主題，後四個為騎車；可同日安排，排程不會建立完成紀錄。
- 兩個新 key 都納入清除本機資料。資料損壞或儲存不可用時拒絕覆寫，不以空陣列取代原資料。
- Today 與 Records 提供已發生活動的補記與週摘要；引導訓練仍先進入 `/safety`。不新增訓練路由、不改疼痛門檻、不把使用者重量紀錄轉成動作處方。
- 週摘要可選取複製，無後端、跨裝置或 ChatGPT 自動同步。功能指標繼續使用 Records 既有獨立儲存與呈現。

隔天回饋狀態區分：今天的活動為「尚待觀察」，不算應補未補；過去日期未填才算缺漏。已達週目標但今天仍有待觀察活動時維持，不直接進入小幅進展分支。

## 補記復健實際劑量

`rehab.manualWorkouts.v1` 的每組新增可選 `durationSeconds`／`holdSeconds`（整數 1–86400 秒），`reps` 改為可選；每組至少填一種實際劑量，次數仍限整數 1–1000，最多 20 組。原有 reps-only 紀錄不需轉換，含 duration／hold 的新紀錄不假填 reps。UI 一次選一種記錄方式，切換會清除目前劑量並明確告知；reader 可讀含多種劑量的紀錄。kg、暖身、成對可選 pain 與舊 ID 關係保留。此為已完成訓練補記，不改引導處方或安全推薦。

## 個人補記動作

`rehab.customExercises.v1` 獨立保存最多 200 個私人定義：`custom-` 前綴穩定 ID、名稱（1–100 字元）、`kind`（strength／mobility）、可選 canonical equipmentId、`recordOnly: true`。名稱正規化後重複會提示，資料損壞或寫入失敗不得覆寫。只由補記 picker 讀取，不加入官方 exercises、推薦、routine 或 guided session。名稱與 kind、recordOnly 會保存於 manual workout snapshot；定義缺失不影響歷史閱讀，缺失定義不能作為新選取。現有清除本機資料功能納入此 key。
