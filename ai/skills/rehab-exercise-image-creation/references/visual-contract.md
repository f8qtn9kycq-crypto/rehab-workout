# Rehab illustration visual contract

Use this reference for movement art, exercise-library images, selected-record images, and interactive body-map visuals.

## Canonical style

- White background with dark, thin, hand-drawn outline art.
- Consistent stroke weight with rounded-looking ends and joins; avoid mixing bold cartoon outlines with the shared fine-line figures.
- Simplified adult anatomy, generally 6.5–7 heads tall for a complete standing figure.
- Preserve hairline, ears, and a minimal nose when visible. Do not add eyes, mouths, expressive faces, shading, gradients, muscle rendering, or photorealistic detail.
- Props use the same visual weight as the human figure. Chairs, walls, bands, bars, and machines must not appear to come from a different illustration system.
- No text, watermark, arrows, decorative background, or outer image border.

## Canvas and two-phase geometry

| Property | Contract |
| --- | --- |
| Output canvas | 320×184 |
| Runtime ratio | 40:23 |
| Content target | 296×160 |
| Left half | x=0–160; ink center x=80 |
| Right half | x=160–320; ink center x=240 |
| Divider | one centered 1px light-gray vertical line |

Center each phase by its own complete composition, including required equipment. A long arm or prop is part of the movement and may extend away from the torso, but neither phase should crowd the divider or outer edge.

Ground-based movements may naturally be wider and shorter than standing movements. Match their perceived figure scale through a tight source crop; do not leave large source whitespace that makes the rendered person look miniature.

## Anatomy and action clarity

- Use full-body or consistent upper-torso framing. Avoid isolated head-and-neck close-ups.
- For neck-focused movements, use a shared crown-to-waist crop and retain the implied normal head-to-body ratio.
- Both frames must clearly communicate start versus finish. If the action difference is subtle, improve limb, joint, or equipment position rather than adding arrows or text.
- Keep paired anatomy coherent. Head direction, arm visibility, foot stance, clothing, and prop placement should remain the same unless the exercise requires a change.
- Show required support equipment in both frames. For example, a sit-to-stand pair needs a chair in both phases.
- Match equipment semantics exactly. A barbell movement must not be illustrated with dumbbells; a standing movement must not silently become seated.
- Do not mirror or swap phases accidentally. Validate which pose belongs on the left and which belongs on the right against the exercise instructions.

## Common failure checks

Use these as review patterns, not as permission to redesign unrelated exercises:

- missing arm or limb in one phase
- opposite head orientation between paired floor poses
- chair, wall, band, or bar missing from one phase
- identical-looking phases for stretches or isometric movements
- inconsistent foot stance when only the upper body should move
- one phase using a close-up while the other uses a half- or full-body view
- materially different head, torso, or leg proportions between related exercises
- accidental outer frames or source-sheet grid lines
- correct 320×184 file whose figure is still too small because the source crop contains excess whitespace

## Shared asset behavior

One exercise ID maps to one canonical asset in movementArtRegistry. Reuse it everywhere the exercise appears:

- quick picker or “更多動作”
- selected movement on the manual-log page
- Records or readback surfaces
- exercise library

If a surface needs a different size, change layout or object-fit behavior while preserving the same asset. Create a new asset only for a genuinely different movement or view.

## Body-map contract

- Use the same simplified human sketch language as movement art.
- Every selectable body area has a visible light fill.
- The selected area uses the same path with a darker fill; selection must not change the region shape.
- Fill paths remain inside and aligned with the human outline, giving the impression of coloring directly on the body rather than placing a floating blob over it.
- Keep the outline readable above or alongside the fill.
- Visual path size and interactive hit-target size are separate. Preserve the current generous transparent stroke target and keyboard activation.
- Verify front-view symmetry where the body map represents bilateral regions.

## Image-generation prompt skeleton

When a source edit genuinely requires image generation, adapt this:

~~~text
Use case: precise-object-edit
Asset type: Rehab-Workout two-phase exercise illustration source
Input images: Image 1 is the edit target; Image 2 is the reviewed full-sheet style reference.
Primary request: Change only <requested anatomy, equipment, or pose>.
Style: match Image 2's thin dark hand-drawn outline, simplified adult proportions, white background, minimal hairline/ears/nose, and no eyes or mouth.
Composition: preserve the two equal panels, keep each complete pose centered in its own half, and retain one central light-gray divider.
Constraints: preserve <explicit invariants>. No outer border, text, arrows, shading, extra objects, thicker lines, enlarged head, or unrelated pose changes.
~~~

Inspect the generated source before committing it. Prefer a targeted second edit over accepting an output that introduces a new style or anatomy mismatch.

## Human walkthrough

At the exact PR head:

1. Open the mobile Preview at 320px or a comparable phone width.
2. Compare the first eight movements with “更多動作” for line weight, person scale, proportions, whitespace, and borders.
3. Select the changed exercise and confirm the same image appears on the next record view.
4. Check the exercise library if the exercise is available there.
5. For two-phase images, compare both phase centers, anatomy, props, and action difference.
6. For body maps, check light selectable areas, darker selected state, outline alignment, and keyboard focus.

Record Pass/Fail against the exact head SHA. Browser automation is supporting evidence only and must not be described as the human result.
