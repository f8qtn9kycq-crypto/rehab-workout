# User feedback and specification audit

Verdict: **FAIL** for the nine candidates after the eight references in `comparison-mobile-390.png`, reviewed head `03688a645f903ab95e659bc67bfcc168d14578e6`. Feedback recorded 2026-10-06 Asia/Taipei; exact user words and runtime SHA-256 values are in `user-feedback.json`. Only the first eight are approved style references. No acceptance decision is inferred for the other library cells.

> the images after the first 8 do not have same style and look and feel, audit the visual qa spec against the first 8 images, fix if fails,

The user supplies the overall style rejection. The concrete observations below are the assistant's named comparison, not words attributed to the user and not an independent blind result.

| Candidates | Observed drift relative to first eight |
| --- | --- |
| shoulder-flexion; shoulder-external-rotation-band; shoulder-internal-rotation-band | Larger standing figures, different hair/head outlines and more developed body/foot contours compared with shoulderPress/dip |
| shoulder-scapular-squeeze; shoulder-neck-thoracic-extension-chair | Larger seated characters and different chair/person line language compared with seatedRow/legExtension; scapular squeeze adds bare-back anatomical marks |
| glute-bridge; hip-clamshell; knee-straight-leg-raise | Different head/hand contours and stretched reclining compositions compared with benchPress; no approved floor control exists |
| ankle-band-inversion-eversion | Large frontal/foreshortened character with prominent feet/toes; no comparable approved frontal-floor control exists |

P0: none identified in this documentation audit.

P1: The specification's generic adult proportions and tight-crop guidance permit changed character design and excessive figure fill. File: `ai/skills/rehab-exercise-image-creation/references/visual-contract.md`. Risk: repeat generation can pass geometry while continuing to fail the requested look. Fix: replace generic proportions and mandatory tight-crop advice with named reference comparisons and whitespace preservation.

P1: Earlier evidence describes the current candidates as NOT VERIFIED/PENDING after a user rejection. Files: `docs/exercise-visual-qa.md`, this workflow report and PR evidence. Risk: an explicit rejection can be lost behind green mechanical checks. Fix: record each rejected hash as FAIL and require corrected-image re-review; new hashes invalidate acceptance rather than granting it.

Acceptance criteria: character, drawing language, scale/whitespace and prop rendering match named first-eight references in both panels at native and measured mobile sizes; movement/safety gates remain separate; every corrected candidate receives attributable re-review. Neither shrinking a different character nor copying a reference exercise pose alone meets these criteria.

This revision fixes the specification and records feedback. It does not alter runtime PNGs, regenerate sources, or claim the rejected artwork is fixed. PR #183 remains blocked from merge. Mobile geometry evidence remains local Chromium emulation, not iOS27 Safari validation.
