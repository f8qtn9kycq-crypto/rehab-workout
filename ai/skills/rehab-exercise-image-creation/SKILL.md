---
name: rehab-exercise-image-creation
description: Create, edit, standardize, and validate Rehab-Workout movement illustrations and interactive body-map visuals. Use for exercise image generation, pose corrections, style or proportion alignment, shared-image reuse, and image-focused PR acceptance; do not use for unrelated UI icons or general marketing artwork.
---

# Rehab Exercise Image Creation

Create clinically legible, visually consistent exercise illustrations without weakening the app's existing safety, localization, mobile, or data contracts.

## Start from the repo contract

Read AGENTS.md, REVIEW.md, .github/pull_request_template.md, and .github/ai-automation.yml before implementation or PR work. Treat current repo files as authoritative over this skill when they conflict.

Before editing an asset, inspect:

- src/data/movementArtManifest.json
- src/data/movementArtRegistry.ts
- src/components/WorkoutMovementArt.tsx
- scripts/extract-movement-art.mjs
- scripts/crop-movement-art.swift
- the relevant source sheet or override under scripts/assets/movement-art-sources/
- every product surface that displays the exercise

Read [references/visual-contract.md](references/visual-contract.md) before generating, editing, reviewing, or accepting an illustration.

Use `docs/visual-qa/approved-style-baseline.json` as the frozen visual reference: the original eight quick images, their catalog mappings, source sheet and SHA-256 values. Preserve these images and mappings. Treat the user's approval as style approval only; review movement semantics separately. Never remove a mapping or use a text-only fallback to resolve a content discrepancy. Record that discrepancy for content review while preserving the requested images.

## Choose the lowest-drift source

Use this order:

1. Reuse the existing canonical registry asset when the same exercise appears in the picker, selected record card, Records, or exercise library.
2. Re-extract or tightly recrop the reviewed source sheet when the pose is already correct.
3. Make a small deterministic source edit when an editable source exists.
4. Create a single override only when the source sheet cannot satisfy the required pose or anatomy.

Do not create page-specific duplicates of the same exercise. Do not replace a correct shared asset merely to solve CSS sizing.

For raster generation or editing, use the available image-generation skill. Supply the existing movement cell as the edit target and the full reviewed sheet as the style reference. State exact invariants and change only the requested anatomy, equipment, or pose. Persist the accepted source under scripts/assets/movement-art-sources/; never leave a project asset only in a generated-image or temporary directory.

Use the frozen quick sheet as the primary style reference; other cells are movement references, not automatic style approvals. Preserve its character design, clothing, line weight and detail density. Do not instruct “shirtless”, “no t-shirt”, “finer lines” or added detail unless explicitly requested. Compare the normalized runtime result, not only the large generated source.

## Preserve the visual system

- Output movement assets at 320×184 on white, matching the runtime 40:23 frame.
- Keep usable content within the shared 296×160 area.
- Treat each two-phase asset as two equal 160px halves. Center the actual dark-ink bounding box of each phase at x=80 and x=240, not by applying one shared offset.
- Keep one 1px light-gray central divider. Remove accidental outer frames, crop borders, and sheet grid remnants.
- Match the frozen references' final-size line strength, character design, facial-detail policy, equipment treatment and whitespace defined in the visual contract.
- Preserve movement correctness. Dynamic movements need a legible, anatomically plausible change; holds and stretches may retain identical poses when the instructions require it. Do not change unrelated body or equipment orientation.
- Keep full-body figures near the shared adult 1:7 head-to-body baseline. Neck-focused illustrations may use a consistent crown-to-waist crop, but must not become enlarged head-only close-ups.
- Keep left and right poses internally consistent: head direction, foot placement, chair or wall placement, and equipment must change only when the movement requires it.

For body maps, keep selectable and selected fills inside the human silhouette and aligned to the same anatomical paths. Use a lighter fill for selectable regions and a darker fill for the selected region; keep the invisible hit target at least as generous as the current implementation.

## Regenerate and constrain scope

Update the source asset, generator metadata, generated output, and a meaningful regression assertion together. Run the repo generator instead of hand-editing only the committed 320×184 output.

After regeneration, confirm that unrelated assets are byte-unchanged. If the generator rewrites unrelated files unexpectedly, stop and diagnose rather than committing broad binary churn.

Keep one PR focused on one coherent visual problem. Record deferred illustration feedback explicitly instead of mixing it into the current PR.

## Validation and acceptance

Run:

~~~bash
npm test
npm run build
npm run audit:movement-art
npm run audit:movement-art-sources
git diff --check
~~~

Also verify:

- every changed PNG reports 320×184
- images load on all intended surfaces through the canonical registry
- the picker and selected record card show the same asset
- 320px and 375px mobile layouts have no horizontal overflow
- both phases are centered within their own halves
- no outer-border remnants, clipping, unexpected facial details, or mismatched line weight remain
- body-map fills follow the human outline and maintain keyboard/ARIA behavior when body-map paths change

Automated checks can prove dimensions, loading, registry reuse, and overflow. They cannot prove that anatomy, motion, scale, or drawing touch feels correct. For those qualities, provide the exact-head Preview, focused walkthrough steps, and request human Pass/Fail evidence. Any new image commit invalidates prior visual approval.

Create the named final-image comparison packet required by `docs/exercise-visual-qa.md`: all eight frozen references and every changed runtime image at native and measured mobile sizes. Include exact hashes and record visual acceptance separately from loading/overflow. Only attributable approved images may be anonymous controls; byte-unchanged is insufficient.

Use the repo's risk tier and PR review workflow. Image-only mobile UX changes are normally Tier 1 unless they also alter safety, routing, session, storage, or exercise data semantics. Never merge without explicit authorization.

## Handoff

Report:

1. source and generated files changed
2. generation or edit method and final prompt when image generation was used
3. exact invariants preserved and requested differences introduced
4. automated validation evidence
5. Preview URL and human walkthrough checklist
6. deferred image work and merge status
