# Visual QA workflow guardrails

Implemented the workflow audit's five corrections without changing or regenerating any runtime artwork.

| Audit finding | Implemented guardrail | Validation |
| --- | --- | --- |
| Ambiguous primary style | Eight user-designated quick references, original catalog mappings and source sheet frozen in `../approved-style-baseline.json` at main `6a18c78f582cf2424f40b9ba1e42e0c990d842d8` | Current bytes and mappings pass; altered-reference fixture fails |
| Prompts changing character/style | Skill and visual contract preserve baseline clothing, character, detail density and final-size stroke strength; other cells are movement context only | Instructions now reject unsolicited shirtless/finer-line redesign; current candidates are not automatically approved |
| Missing-image fallback accepted | Image audit requires all eight original mappings and PNG hashes | Removing the bench-press alias fails regression |
| Inactive source strings treated as evidence | Generator and inspection share one effective-source resolver; manifest overrides take priority | All nine Python overrides regenerate in temporary files byte-for-byte; a corrupted output fixture fails |
| Geometry mistaken for style acceptance | Named final-runtime packet at native and measured 390/375/320px card sizes; explicit reference/candidate status and hash-bound measurements | Eight references and nine candidates included; previous head's mobile geometry evidence reuses identical artwork bytes; style remains NOT VERIFIED |

CI installs the existing pinned Pillow dependency, runs reference integrity and actual-source regeneration before build/tests. Tests no longer infer approved anatomy or source selection from unused constants/legacy strings. Unchanged runtime PNGs and app source under `src/` are untouched in this workflow revision.

Commands:

```sh
npm run audit:movement-art
npm run audit:movement-art-sources
node scripts/extract-movement-art.mjs --list-sources
python3 scripts/create-movement-art-review.py --mobile-results docs/visual-qa/2026-10-05-phone/mobile-results.json --output docs/visual-qa/2026-10-06-workflow
npm test
npm run build
```

The 204 prior local mobile observations are bound to SHA-256 values after verifying all measured assets remain byte-identical to the measured artwork revision (remote head `28fc2022550a0dda3acc9f46d988935c8f1cb8d2`, equivalent local tree `3c3bf0f`). This metadata addition is not a new physical-device run. The named comparison is deterministic contact-sheet evidence, not independent blind testing or a browser screenshot. Measurements describe Chromium iPhone13 emulation, not iOS27 Safari.

No existing acceptance is upgraded: new candidates require attributable style/movement/safety review. Only the eight frozen images are designated approved style references. Rejected or merely unchanged library cells are not approved anonymous controls. The current image PR remains blocked from merge for its existing acceptance/content-review gaps.
