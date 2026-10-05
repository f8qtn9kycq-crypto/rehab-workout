# Phone feedback and local simulated mobile validation

This report supersedes the previous correction proposal. The user rejected head `8498bfd52aff2873f1468a5ebfc3385d6cbccac8`: missing bench/shoulder press and other quick images, plus inconsistent glute-bridge/clamshell style. The user explicitly requested retaining those original quick illustrations as the desired look and feel.

## Changes

Restored all six original catalog aliases (bench press, shoulder press, squat, lat pulldown, seated row, leg extension). All eight original quick PNGs are byte-unchanged from reference main `6a18c78`. No missing quick images remain. Existing labels, exercise instructions, catalog IDs, stored records, safety rules and recommendation eligibility are unchanged.

Revised only glute-bridge and hip-clamshell sources in `overrides/phone-v4/`, using the original quick sheet as primary style reference: simplified adult contours, dark rounded outlines, plain shirt/shorts, minimal face, paired consistent proportions. Runtime outputs are normalized through the generator; prompt transcripts are in `prompts.json`. These are new candidates, not a user-approved style result.

The earlier seven other pose corrections remain. In total, nine runtime assets differ from reference main and 34 do not. `asset-hashes.csv` binds evidence to exact runtime bytes. Earlier anonymous comparison cards/keys describe the prior revision and are stale for current bridge/clamshell; no independent blind result exists.

## Local browser evidence

Chromium 153.0.8010.0, Playwright iPhone 13 mobile/touch profile, DPR 3, viewport 390×844 CSS pixels; additional widths 375 and 320 at height 844. This is desktop-engine mobile emulation, not iOS 27 Safari or a physical iPhone test. User device OS was reported as iOS 27; its engine behavior is NOT VERIFIED.

Used localhost Vite and fresh isolated browser contexts; all dummy records were created only in test-context local storage. No production/user records were touched. A temporary npm Chromium runtime avoided the unavailable Playwright browser download; repo dependencies and browser security settings were not changed. CJK fonts were supplied in the test environment only.

204 image observations cover all eight quick choices and nine changed rehabilitation images at three widths: quick/more picker, selected entry, saved Records, and library. Assertions check successful decoding, natural 320×184 dimensions, rendered 40:23 ratio, object-contain, parent/image geometry, viewport bounds and no document horizontal overflow. All eight quick choices have images again. Records are saved through the actual form and read back. No page errors. Raw results: `mobile-results.json`.

Automated rendering: PASS at 390/375/320px. Build, npm test and exercise coverage (43/43, catalog-only isolation) pass. This does not establish motion, clinical safety or style acceptance.

## Acceptance

| Gate | Current disposition |
| --- | --- |
| Original quick images present | PASS, eight original URLs and bytes retained |
| Mobile loading/ratio/overflow | PASS, local Chromium emulation only |
| Visual consistency | PENDING; previous user result remains FAIL until the new head is reviewed |
| Movement and safety representation | NOT VERIFIED; content review still required |
| iOS 27 Safari | NOT VERIFIED |
| Independent anonymous screening | NOT VERIFIED; previous packet invalidated by new hashes |

The six restored aliases retain the earlier documented equipment/posture discrepancies (barbell vs dumbbells, machine vs band/chair, standing vs seated). Restoring the requested images fixes presence/style preservation; it does not prove semantic equivalence. Their movement gate remains FAIL against written catalog steps until content review resolves the discrepancy. Do not silently change written instructions to make images fit.

No merge: Tier 3 Claude review, ChatGPT PM synthesis and current-head image acceptance remain required. Re-review the preview using the original eight quick images as the visual baseline, especially bridge/clamshell. A new image hash invalidates any older visual approval.
