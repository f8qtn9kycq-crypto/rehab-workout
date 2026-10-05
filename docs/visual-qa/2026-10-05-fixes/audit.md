# 2026-10-05 illustration corrections

Reference: main `6a18c78f582cf2424f40b9ba1e42e0c990d842d8`, the [first audit](../2026-10-05/audit.md), current v2 sheet and named runtime assets. This is implementation evidence, not independent visual or clinical acceptance. The PR head identifies the reviewed tree; `asset-hashes.csv` freezes all 43 before/after runtime SHA-256 values.

## Six incompatible aliases

Removed catalog aliases for bench press (dumbbells/barbell), shoulder press (seated dumbbells/standing barbell), squat (chair/barbell), lat pulldown and seated row (band/machine), and leg extension (chair single-leg/machine bilateral). Existing strength IDs and saved records remain compatible. New canonical choices use the existing text fallback until matching art is approved. Pull-up and dip retain their equivalent aliases. No exercise instructions were changed to match a picture.

Registry regression passes: the six aliases resolve to no image; eight legacy paths remain stable; pull-up/dip share the intended URLs. Mapping mismatch removal passes; rendering at actual mobile size remains NOT VERIFIED.

## Eight replacement candidates

Sources are committed under `scripts/assets/movement-art-sources/overrides/audit-v3/`. Built-in image generation edited the current references; Python/Pillow only performs cropping, common scaling and framing. `prompts.json` records prompt specifications and revisions, not verbatim tool transcripts. No anatomy is programmatically redrawn.

| Asset | Implemented correction | Visual | Movement | Safety representation | Mobile |
| --- | --- | --- | --- | --- | --- |
| shoulder-flexion | Forward reach limited to shoulder height | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| shoulder-scapular-squeeze | Seated, hands on thighs, shoulder-blade retraction | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| shoulder-external-rotation-band | Palms up, band between hands, elbows at sides | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| shoulder-internal-rotation-band | Same-side anchor; hand moves toward abdomen | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| ankle-band-inversion-eversion | Band around forefoot; revised outward phase | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| shoulder-neck-thoracic-extension-chair | Supported seated upper-back extension, neutral neck | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| knee-straight-leg-raise | Opposite foot planted; straight working leg raised low | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |
| glute-bridge | Refined contour and conservative two-phase bridge | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED | NOT VERIFIED |

Disposition is PENDING acceptance for all eight. Author review is not independent validation. Particular review targets: ankle band resistance/motion clarity, bridge line weight against unchanged controls, opposite knee/support continuity in leg raise, shoulder rotation elbows/anchors and bounded range. Reject or revise any concrete mismatch before merge.

## Reproduction and checks

Install Python dependency with `python3 -m pip install -r scripts/movement-art-requirements.txt`. Regenerate only these eight:

```sh
node scripts/extract-movement-art.mjs --ids shoulder-flexion,shoulder-scapular-squeeze,shoulder-external-rotation-band,shoulder-internal-rotation-band,ankle-band-inversion-eversion,shoulder-neck-thoracic-extension-chair,knee-straight-leg-raise,glute-bridge
```

All eight outputs are byte-reproducible from committed sources. All 43 decode at 320×184; exactly eight changed and 35 are byte-unchanged. Build, npm test, exercise coverage (43/43), safety/i18n audit, JS syntax and diff whitespace checks passed. Pain >=6, red flags, SafetyGate, session guards and storage compatibility are covered by the existing regression suite; their implementation, routes and storage formats are unchanged. No new browser-specific code.

Mobile gate remains NOT VERIFIED: CLI Chromium installation failed; cloud browser refused the local preview (`ERR_BLOCKED_BY_CLIENT`). Neither 320/375px browser rendering nor iOS Safari is claimed. Runtime picker, selected entry, Records and library use the existing shared registry; regression verifies registry resolution, not a browser walkthrough.

## Independent screening packet

`anonymous-comparison.png` has 16 equal-size cards: eight candidates and eight byte-unchanged controls. Give the reviewer only that sheet and `blind-response.csv`; withhold `comparison-key.csv` and this report until responses are frozen. Controls are comparison references, not newly certified movement approvals. The response file is entirely PENDING; no reviewer identity, guesses or results have been fabricated. This packet prepares an independent screening, not a completed blind trial.

Tier 3: Claude review, ChatGPT PM synthesis and required image acceptance remain pending. Automated checks alone do not authorize image acceptance or merge.
