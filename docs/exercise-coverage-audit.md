# Exercise Coverage Audit

Generated: 2026-06-14T08:41:25.914Z

Source commit: c011306

Scope: audit only. This report does not add exercise content, change recommendation behavior, change pain thresholds, or bypass SafetyGate.

## 1. Executive summary

- Total exercises audited: 29
- Audit body areas: shoulder_hip, shoulder_neck, knee, ankle
- App body area enums: shoulder, hip, shoulder_neck, knee, ankle
- Canonical equipment ids: bodyweight, dumbbell, kettlebell, chair, wall, resistance_band, foam_roller
- Raw equipment-field bodyArea + difficulty + equipment gaps: 66
- App-realistic filter dead-end combinations: 47
- Canonical equipment with 0 exercises: foam_roller
- Non-canonical exercise bodyArea values: None
- Non-canonical exercise type values: None
- Non-canonical exercise equipment values: None

Top 5 gaps:

1. shoulder_neck has 0 intermediate and 0 advanced exercises.
2. foam_roller has 0 total exercise coverage.
3. Advanced coverage is missing for shoulder_hip, shoulder_neck, knee; overall, 47 app-realistic bodyArea + difficulty + equipment combinations have 0 matching exercises.
4. 「為我推薦」/Recommended for me is a copy and explanation issue, not current evidence of recommendation logic failure.
5. shoulder_hip is a user/audit mental model while the app stores shoulder and hip separately, which may confuse copy and reporting.

## 2. Exercise inventory table

| Exercise | ID | Body Area | Type | Difficulty | Equipment |
| --- | --- | --- | --- | --- | --- |
| 肩關節前彎運動 | shoulder-flexion | shoulder_hip | mobility | beginner | bodyweight, chair, dumbbell |
| 肩胛骨收縮運動 | shoulder-scapular-squeeze | shoulder_hip | strength | beginner | chair, resistance_band |
| 肩關節外旋運動 | shoulder-external-rotation-band | shoulder_hip | strength | intermediate | resistance_band |
| 站姿擺臂 | shoulder-standing-arm-swings | shoulder_hip | mobility | beginner | bodyweight |
| 彈力帶肩內旋 | shoulder-internal-rotation-band | shoulder_hip | strength | intermediate | resistance_band |
| 髖關節屈曲運動 | hip-flexion-seated | shoulder_hip | mobility | beginner | chair |
| 髖關節外展運動 | hip-abduction | shoulder_hip | strength | beginner | chair, bodyweight, resistance_band |
| 臀橋運動 | glute-bridge | shoulder_hip | strength | intermediate | bodyweight |
| 蚌殼式 | hip-clamshell | shoulder_hip | strength | beginner | bodyweight |
| 坐到站 | hip-sit-to-stand | shoulder_hip | strength | beginner | bodyweight, chair, kettlebell |
| 牆壁滑行 | shoulder-wall-slide | shoulder_hip | mobility | intermediate | wall |
| 下巴內收 | shoulder-neck-chin-tuck | shoulder_neck | mobility | beginner | chair |
| 頸椎等長收縮 | neck-isometric | shoulder_neck | strength | beginner | chair |
| 上斜方肌伸展 | upper-trap-stretch | shoulder_neck | stretch | beginner | chair |
| 胸大肌伸展 | pec-doorway-stretch | shoulder_neck | stretch | beginner | wall |
| 熱敷與放鬆擺位 | neck-heat-relax | shoulder_neck | relaxation | beginner | bodyweight |
| 頸部旋轉伸展 | neck-rotation-stretch | shoulder_neck | stretch | beginner | chair |
| 貼牆站立姿勢矯正 | neck-wall-posture | shoulder_neck | relaxation | beginner | wall |
| 膝蓋急性舒緩 RICE | knee-rice-care | knee | relaxation | beginner | bodyweight |
| 直膝抬腿 | knee-straight-leg-raise | knee | strength | beginner | bodyweight |
| 靠牆半蹲 | knee-wall-squat | knee | strength | intermediate | wall |
| 站姿腿後彎 | knee-hamstring-curl | knee | strength | beginner | chair |
| 膝痛友善小腿提踵 | knee-calf-raise | knee | strength | beginner | chair |
| 坐姿腳踝畫圓 | ankle-circles | ankle | mobility | beginner | chair |
| 坐姿腳踝字母 | ankle-alphabet | ankle | mobility | beginner | chair |
| 彈力帶腳踝內翻外翻 | ankle-band-inversion-eversion | ankle | strength | beginner | resistance_band |
| 單腳站立 | ankle-single-leg-stand | ankle | balance | intermediate | chair |
| 站姿小腿提踵 | ankle-calf-raise | ankle | strength | intermediate | chair |
| 單腳觸遠 | ankle-single-leg-reach | ankle | proprioception | advanced | chair |

## 3. Difficulty coverage table

| Body Area | Beginner | Intermediate | Advanced |
| --- | --- | --- | --- |
| shoulder_hip | 7 | 4 | 0 |
| shoulder_neck | 7 | 0 | 0 |
| knee | 4 | 1 | 0 |
| ankle | 3 | 2 | 1 |

## 4. Equipment coverage table

| Equipment | # Exercises | Body Areas Covered | Empty Levels |
| --- | --- | --- | --- |
| bodyweight | 9 | shoulder_hip, shoulder_neck, knee | advanced |
| dumbbell | 1 | shoulder_hip | intermediate, advanced |
| kettlebell | 1 | shoulder_hip | intermediate, advanced |
| chair | 16 | shoulder_hip, shoulder_neck, knee, ankle | None |
| wall | 4 | shoulder_hip, shoulder_neck, knee | advanced |
| resistance_band | 5 | shoulder_hip, ankle | advanced |
| foam_roller | 0 | None | beginner, intermediate, advanced |

## 5. Type coverage table

| Type | Count | Body Areas Covered |
| --- | --- | --- |
| mobility | 7 | shoulder_hip, shoulder_neck, ankle |
| strength | 14 | shoulder_hip, shoulder_neck, knee, ankle |
| stretch | 3 | shoulder_neck |
| relaxation | 3 | shoulder_neck, knee |
| balance | 1 | ankle |
| proprioception | 1 | ankle |

## 6. Empty combinations table

This section models live filter compatibility, including bodyweight-required exercises and bodyweight fallback for support-only chair/wall exercises, following the minimal logic in src/utils/exerciseModel.ts. The raw equipment-field gap count is 66, but it should not be used as live UI dead-end evidence.

| Body Area | Difficulty | Equipment | Result | Suggested Action |
| --- | --- | --- | --- | --- |
| shoulder_hip | advanced | bodyweight | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | dumbbell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | kettlebell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | chair | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | wall | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | resistance_band | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_hip | advanced | foam_roller | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | intermediate | bodyweight | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | dumbbell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | kettlebell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | chair | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | wall | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | resistance_band | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | intermediate | foam_roller | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| shoulder_neck | advanced | bodyweight | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | dumbbell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | kettlebell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | chair | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | wall | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | resistance_band | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| shoulder_neck | advanced | foam_roller | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | intermediate | dumbbell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| knee | intermediate | kettlebell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| knee | intermediate | chair | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| knee | intermediate | resistance_band | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| knee | intermediate | foam_roller | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| knee | advanced | bodyweight | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | dumbbell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | kettlebell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | chair | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | wall | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | resistance_band | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| knee | advanced | foam_roller | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| ankle | beginner | dumbbell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | beginner | kettlebell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | beginner | wall | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | beginner | foam_roller | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | intermediate | dumbbell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | intermediate | kettlebell | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | intermediate | wall | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | intermediate | resistance_band | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | intermediate | foam_roller | 0 exercises | Content gap or filter availability issue: consider count-aware filter guidance before adding content. |
| ankle | advanced | dumbbell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| ankle | advanced | kettlebell | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| ankle | advanced | wall | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| ankle | advanced | resistance_band | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |
| ankle | advanced | foam_roller | 0 exercises | Content gap: add reviewed advanced option only if safety guardrails are explicit. |

## 7. Data quality findings

| Issue | File | Example | Severity | Suggested Fix |
| --- | --- | --- | --- | --- |
| Duplicate exercise IDs | src/data/exercises.ts | None | P2 | No action needed. |
| Duplicate exercise titles | src/data/exercises.ts | None | P2 | No action needed. |
| Missing safety metadata: cautions | src/data/exercises.ts | None | P2 | No action needed. |
| Missing safety metadata: stopRules | src/data/exercises.ts | None | P2 | No action needed. |
| Missing safety metadata: regressions | src/data/exercises.ts | None | P2 | No action needed. |
| Missing safety metadata: progressions | src/data/exercises.ts | None | P2 | No action needed. |
| Missing requiredEquipment metadata | src/data/exercises.ts | 22 exercises: shoulder-external-rotation-band, shoulder-standing-arm-swings, shoulder-internal-rotation-band, hip-flexion-seated, glute-bridge, hip-clamshell, ... | P2 | Backfill requiredEquipment when touching exercise data; current app has fallback inference. |
| Canonical equipment has no exercise coverage | src/data/equipmentOptions.ts | foam_roller | P1 | Keep the option hidden/clearly empty until reviewed content exists, or add reviewed safe content later. |
| Difficulty level has zero coverage for body area | src/data/exercises.ts | shoulder_hip + advanced | P1 | Add reviewed content later or make filter counts visible so users do not select dead ends. |
| Difficulty level has zero coverage for body area | src/data/exercises.ts | shoulder_neck + intermediate | P1 | Add reviewed content later or make filter counts visible so users do not select dead ends. |
| Difficulty level has zero coverage for body area | src/data/exercises.ts | shoulder_neck + advanced | P1 | Add reviewed content later or make filter counts visible so users do not select dead ends. |
| Difficulty level has zero coverage for body area | src/data/exercises.ts | knee + advanced | P1 | Add reviewed content later or make filter counts visible so users do not select dead ends. |
| User-facing audit dimension shoulder_hip is not an app enum value | src/types/rehab.ts; src/services/logService.ts | App BODY_AREAS=shoulder, hip, shoulder_neck, knee, ankle; log migration maps shoulder_hip to shoulder: true | P1 | Clarify copy/model naming before changing behavior; this report groups shoulder and hip as shoulder_hip for audit only. |
| Non-canonical bodyArea values in exercises | src/data/exercises.ts | None | P2 | No action needed. |
| Non-canonical type values in exercises | src/data/exercises.ts | None | P2 | No action needed. |
| Non-canonical level values in exercises | src/data/exercises.ts | None | P2 | No action needed. |
| Non-canonical equipment values in exercises | src/data/exercises.ts | None | P2 | No action needed. |
| Equipment option ids not represented in EQUIPMENT_OPTIONS | src/data/equipmentOptions.ts | None | P2 | No action needed. |

## 8. Root-cause classification

| Finding | Content Gap | Filter Bug | Recommendation Bug | Copy/UX Issue | Evidence |
| --- | --- | --- | --- | --- | --- |
| Some equipment/difficulty selections produce no matching exercise. | Yes | No current evidence | Potentially, if fallback crosses user intent later | No | 47 app-realistic empty bodyArea + difficulty + equipment combinations; 66 raw equipment-field gaps. |
| Canonical foam_roller option has zero total exercise coverage. | Yes | No current evidence | No current evidence | Potentially | foam_roller appears in EQUIPMENT_IDS/EQUIPMENT_OPTIONS and has 0 exercises. |
| Advanced coverage is sparse and absent outside ankle. | Yes | No current evidence | No current evidence | Potentially | shoulder_hip, shoulder_neck, knee |
| 「為我推薦」 may be unclear to users. | No | No current evidence | No current evidence | Yes | Mode label exists, but the visible copy does not explain inputs used: assessment, equipment, pain, and logs. |
| Empty states are present for major filter miss cases. | No | No current evidence | No current evidence | No | No assessment + Recommended mode + all body areas: handled; Pain >= 6: handled; Equipment filters too narrow: handled; Recovery mode has no match: handled; Mobile filter fatigue: handled |

## 9. Safety implications

| Scenario | Safety Risk | Severity | Required Guardrail |
| --- | --- | --- | --- |
| Adding content to fill knee advanced gaps | Unsafe defaults could introduce deep squat, jumping, or running. | P0 if implemented without guardrails | Keep knee defaults low-impact; require explicit safety metadata, support notes, stop rules, and no pain-threshold changes. |
| Adding ankle balance/proprioception content | Unsupported balance drills can increase fall risk. | P0 if unsupported balance is recommended | Chair or wall support must remain explicit; unsupported_balance must stay excluded from conservative recommendations. |
| Adding shoulder/neck advanced or loaded content | Aggressive overhead loading can worsen symptoms for some users. | P0 if recommended by default | Keep advanced/loading out of beginner defaults; use progressionEquipment and avoidIfPainHigh. |
| Pain >= 6 assessment | Training recommendations could be unsafe if stop threshold is bypassed. | P0 | Existing recommendationEngine returns [] and ExercisesPage shows stop-training copy; keep unchanged. |
| Recovery mode pain > 3 | Advanced or painful progressions could be suggested during recovery. | P0 if guardrails regress | Existing recovery path limits to beginner support-only exercises; keep unchanged. |

## 10. Mobile UX implications

| Scenario | User Impact | Severity | Suggested UX |
| --- | --- | --- | --- |
| User sees 「為我推薦」 without knowing why | Lower trust and lower comprehension. | P1 | Add concise helper copy or rename to explain that recommendations use assessment, pain, equipment, and recent logs. |
| Equipment filter includes options with zero or sparse coverage | Users hit dead ends and assume the app is broken. | P1 | Show result counts, disable zero-count chips, or move sparse equipment behind progressive disclosure. |
| Advanced difficulty selected for body areas with no content | Filter feels broken and blocks personalization. | P1 | Add count-aware chips or body-area-specific disabled states before adding content. |
| Many empty combinations exist | Mobile users may spend too much effort trial-and-error filtering. | P1 | Prioritize compact active chips and clear one-tap reset; keep advanced filters collapsed. |
| Safety copy competes with filter copy | Critical warnings can be missed if the page is too text dense. | P2 | Keep pain stop and cautions visible; move non-critical explanations behind progressive disclosure. |

## Empty-state handling observed

| Scenario | Handled in UI | Evidence |
| --- | --- | --- |
| No assessment + Recommended mode + all body areas | Yes | ExercisesPage returns [] and uses exercises.chooseBodyArea. |
| Pain >= 6 | Yes | ExercisesPage shows painStopEmpty and recommendationEngine returns [] at stop threshold. |
| Equipment filters too narrow | Yes | ExercisesPage uses equipmentTooNarrowEmpty when filtered results are empty. |
| Recovery mode has no match | Yes | ExercisesPage uses recoveryNoMatchEmpty for recovery recommendation misses. |
| Mobile filter fatigue | Yes | ExerciseFilter keeps advanced filters collapsed and renders active summary chips. |

## Methodology and limitations

- Raw equipment-field coverage counts only whether an equipment id appears on an exercise.
- App-realistic filter dead ends model the live compatibility rules from src/utils/exerciseModel.ts: required bodyweight is compatible with any equipment selection, and selecting bodyweight can satisfy support-only chair/wall requirements.
- Empty-state checks confirm code references, not runtime i18n resolution.
- This audit does not verify actual rendered UI.
- This audit does not validate safety metadata completeness beyond presence/absence checks.
- This audit does not add or recommend random exercises.
- Content additions require rehab safety review.

## Next-step recommendations

1. Clarify the 「為我推薦」 label with short helper copy before changing recommendation behavior.
2. Add count-aware filter states so mobile users can see unavailable equipment/difficulty combinations before selecting them.
3. Prioritize reviewed beginner/intermediate content for empty equipment/body-area gaps before adding advanced exercises.
4. Keep advanced, loaded, balance, and knee-flexion content out of default recommendations unless safety metadata is explicit.
5. Decide whether product copy should continue grouping shoulder + hip as shoulder_hip or expose shoulder and hip separately.
