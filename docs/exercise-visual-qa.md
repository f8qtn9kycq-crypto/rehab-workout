# Exercise Visual QA

Apply this contract to added or edited movement illustrations and to changes in their exercise-ID mappings. It supplements `REVIEW.md`; it does not replace the repo risk tiers, required AI reviews, or safety rules.

## Reference and scope

Before reviewing, read the root workflow contract, `docs/safety-rules.md`, the relevant exercise entry, and `ai/skills/rehab-exercise-image-creation/references/visual-contract.md`.

Record the exact reviewed commit, exercise ID (including aliases), runtime asset path and SHA-256, source sheet/cell or override, and reference asset/commit. Trace PR references to real assets. PR #160 is historical context; current main incorporates #175 anatomy/style and #177 320×184 framing. Never silently revert to an older approved style.

The user-designated primary style is the original eight quick images frozen in `visual-qa/approved-style-baseline.json` (reference main `6a18c78f582cf2424f40b9ba1e42e0c990d842d8`). Preserve their bytes, original catalog mappings and source sheet. Run `npm run audit:movement-art`; a missing mapping, changed reference hash or missing image is a failure. Do not make image presence pass by removing a mapping or declaring a text-only fallback. Record equipment/posture discrepancies separately for content review; style approval is not movement approval. Do not refresh frozen hashes merely to make CI green; replacement requires a new attributable user style decision.

Run `node scripts/extract-movement-art.mjs --list-sources` to inspect effective source selection and `npm run audit:movement-art-sources` to regenerate active Python overrides in temporary files and compare exact runtime bytes. The manifest override wins over legacy overrides. A source string existing in a script is not evidence it was used. These checks are mechanical, not style acceptance.

Review every changed asset and every affected alias. Check the canonical registry, `WorkoutMovementArt`, picker, selected entry, Records and library. Use the existing image-creation skill for edits; no additional skill or reviewer agent is required by this contract.

## Reference-derived style acceptance

The user's 2026-10-06 feedback rejects the nine candidates shown after the first eight in the named comparison. Their style gate is **FAIL**, superseding earlier NOT VERIFIED/PENDING wording. See [feedback and specification audit](visual-qa/2026-10-06-workflow/user-feedback.md) and the hash-bound `user-feedback.json`. This is an attributable user decision, not an independent blind result or a GitHub requested-changes review.

Compare the final runtime image with named frozen references at equal display size. Record each dimension separately; a mismatch in any dimension fails visual consistency:

| Dimension | Required reference comparison | Reject |
| --- | --- | --- |
| Character | `shoulderPress`, `squat`, `dip`: small simplified head, short hair, plain T-shirt/shorts, economical hands and feet | New hair/head silhouette, enlarged head, bare anatomical torso, individually detailed toes/fingers |
| Drawing language | All eight: restrained dark sketch outlines and sparse internal marks | Anatomical contour tracing, added back/muscle marks, smoother detailed rendering or changed apparent stroke strength |
| Scale and whitespace | Standing: `shoulderPress`/`dip`; seated: `seatedRow`/`legExtension`; reclining: `benchPress` | Enlarging the person to fill the available box, crowding edges, or choosing scale by total equipment bounds alone |
| Props and view | Preserve the required movement's view and equipment while using the references' simple construction and line language | Importing a different illustration system for chairs/bands, or changing the movement to imitate a reference pose |

`benchPress` supplies reclining drawing/scale context, not approval of floor-exercise anatomy. No approved floor control exists in the eight; disclose this limit. A generic 6.5–7-head rule, a 320×184 canvas, and a 136×148 ink fit do not establish reference fidelity. Canvas bounds are limits, not required figure fill. The current Python normalizer tightly fits ink to 136×148; treat its output as a candidate needing final-size comparison, never as style normalization. If framing causes drift, correct the authoring/framing workflow before accepting another output.

On a rejected hash, retain FAIL until a corrected candidate has attributable re-review; changing a prompt, generating a packet, or passing CI does not clear it. On a new hash, invalidate prior acceptance and mark the replacement NOT VERIFIED until reviewed. Do not relabel the unchanged rejected hash PENDING. Review the eight references and all affected candidates together; inspect both phases at native size and measured mobile size.

## Four independent gates

Record `PASS`, `FAIL`, or `NOT VERIFIED` for each gate. `NOT VERIFIED` is an evidence gap, never a pass. Do not average gates into a score.

| Gate | Evidence and pass condition |
| --- | --- |
| Visual consistency | Compare named reference assets at native resolution and mobile card size: adult proportions, view, thin dark line weight, minimal facial detail, white background, no shading/text/outer frames, consistent props, crop and whitespace. Output is 320×184, with a single light-gray divider and each phase centered in its own half. Measurements support review; they cannot prove drawing quality. |
| Movement accuracy | Match the actual exercise's steps, not its generic name: start/end order, joint motion, controlled range, trunk/limb continuity, contact, resistance direction, equipment and posture. No barbell-for-dumbbell, machine-for-band or standing-for-seated alias. In isometrics, relaxation and sustained stretches, identical poses may be correct; do not invent motion just to differentiate panels. |
| Safety representation | Show the conservative variant in the written instructions, required support, stable contact, and bounded range. Do not visually promote a progression as the default. Keep written steps, cautions, stop rules and adjustments accessible. Escalate to the repo safety/content review when a correction changes exercise meaning, support or ROM; an illustration alone is not professional clinical approval. |
| Mobile rendering | Current-head evidence at 320px and 375px: asset loads, correct ratio, neither phase clipped, visible motion/props at actual card size, same URL across intended surfaces, no horizontal overflow. Consider iOS Safari per `REVIEW.md`; physical-device testing is targeted, not blanket. |

A verified `FAIL` blocks acceptance of the affected image or mapping. Missing required evidence blocks claiming full acceptance. Audit findings on existing assets do not automatically block a documentation-only PR that records them without changing product behavior; list them explicitly as follow-up work.

## Disposition and minimal correction

- `PASS`: all four gates pass with attributable evidence.
- `EDIT`: a localized pose, prop, crop, mapping or line-weight correction is sufficient.
- `REGENERATE`: the source cannot preserve the required anatomy/style through a localized correction; explain why.
- `PENDING`: evidence is insufficient to choose acceptance or an edit reliably.

Each material finding includes file, observed behavior, risk, acceptance criterion and a source/reference. Use the existing P0/P1 severity definitions. A subjective preference without a concrete contract mismatch is not a blocker.

Change the source and regenerate the runtime asset through the existing generator. Re-review the changed asset and affected aliases, confirm unrelated assets are byte-unchanged, and invalidate earlier approval when their hashes change. Sheet extraction requires macOS. Manifest `overrideSource` entries can be normalized on Linux/macOS through `--ids` with Python 3 and `scripts/movement-art-requirements.txt`; do not hand-edit only generated PNGs.

## Anonymous consistency trial

First prepare a named final-image comparison: all eight frozen runtime references plus every changed runtime image at native 320×184 and measured card widths for 390px (iPhone 13), 375px and 320px viewports. Use the final normalized PNGs, not large generation sources. Record line strength, character/head/body proportions, clothing, detail density, prop rendering, perceived figure scale and whitespace as separate observations. Include exact image hashes and the mobile measurement source. A contact sheet alone is not a browser layout test; a green layout test is not a style Pass. Use `python3 scripts/create-movement-art-review.py --mobile-results <current measurement JSON> --output <evidence directory>` to prepare the packet.

Use this as evidence of style consistency, separate from the named movement/safety review:

1. Freeze exact-head assets and explicitly selected unchanged approved controls of comparable framing (full body, floor, upper torso, equipment). Every control needs attributable style approval. For the current baseline, only the eight listed references have that status; do not promote an unchanged library cell (such as the rejected clamshell) to an approved control. If no approved comparable control exists, disclose that limit and call the exercise an anonymous screening.
2. Shuffle cards at equal display size, label only anonymous IDs, and keep the key from the reviewer. No filenames, dates, PR numbers or source cohorts in the reviewer packet.
3. Before revealing the key, record a reviewer identity/role, timestamp, candidate/control guess, confidence and concrete style differences for every card.
4. Reveal the key; report actual counts and correctness, including the unchanged/candidate mix. A small trial is qualitative evidence, not statistical proof that new images are indistinguishable. Repeated correctly attributed concrete drift requires correction.
5. Pair this with the named four-gate review; an anonymous trial cannot identify the required exercise semantics.

If all available assets were recently changed, there are no unchanged controls: call it an anonymous consistency screening, not a validated old/new blind test. An AI that already inspected the key cannot supply an independent blind result. Leave the independent result pending; do not fabricate human acceptance.

## PR evidence

For asset/mapping PRs, include exact head and reference paths/hashes; per-asset gate results and disposition; minimal edits; relevant generator/build/test output; mobile evidence; any independent trial result or its limitations; and deferred work. Follow the repo risk tier: docs-only Tier 0, presentation-only Tier 1, safety/content semantics Tier 3 per `.github/ai-automation.yml`.

First audit: [2026-10-05](visual-qa/2026-10-05/audit.md). Reuse this rubric for 3–5 image changes and record issues caught, disagreements, re-review outcomes and effort before extending skill automation. The existing creation skill remains the authoring workflow.
