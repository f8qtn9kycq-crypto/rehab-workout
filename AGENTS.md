# AGENTS.md

## Product context

This is a mobile-first Active Aging / rehab-oriented web app.

Primary users:
- adults returning to exercise
- beginners
- users with minor shoulder, hip, knee, or back limitations

## Safety rules

- Pain 0-3: allow normal or modified training.
- Pain >3: recommend regression, recovery, or easier movement.
- Pain >=6: stop training.
- Red flags must block training.
- Do not make diagnosis, cure, or medical certainty claims.
- Shoulder: avoid aggressive overhead defaults.
- Hip: avoid high-impact and deep-flexion defaults.
- Back: avoid heavy hinge defaults.

## Engineering rules

- Keep changes minimal and localized.
- Do not rewrite the app unless explicitly requested.
- Preserve existing user data.
- Preserve LocalStorage compatibility.
- Preserve iOS Safari compatibility.
- Preserve mobile-first layout.
- Prefer tests or explicit QA evidence for changed behavior.

## P0 blockers

Flag as P0 only when:
- build fails
- core user flow is broken
- safety gate can be bypassed
- pain >=6 can start training
- red flag does not block training
- required session state is lost
- iOS Safari / SPA routing breaks core use
- existing stored user data may be lost

## P1 improvements

Flag as P1 when:
- mobile navigation is confusing
- important controls are hidden on mobile
- user-facing copy is too dense
- i18n is mixed or broken
- primary controls lack accessibility labels
- changed behavior lacks test or QA evidence

## Output contract

Return:
1. Verdict: Pass / Partial Pass / Fail
2. P0 blockers
3. P1 improvements
4. Exact files to change
5. Acceptance criteria

Do not include P2 wishlist items unless explicitly requested.
Do not suggest broad rewrites.
