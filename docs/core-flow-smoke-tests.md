# Core Flow Smoke Tests

Issue #43 adds a lightweight regression command for the app's highest-risk flows without adding a browser test framework.

Run:

```bash
npm run test:smoke
```

The default test command also runs the same checks:

```bash
npm run test
```

For full validation, run the build first so the smoke command also checks the generated `dist/index.html` entrypoint:

```bash
npm run build
npm run test:smoke
```

## What It Checks

- The React app bootstraps and key routes remain present.
- `SafetyRouteGuard` still protects assessment, exercise library, exercise detail, and session routes.
- Red flags still create a blocked safety status.
- "None of the above" remains mutually exclusive with red flags.
- Pain >3, pain >=6, pain-after warning, and pain = 0 handling remain represented in `painRules.ts`.
- Session start still requires pain-before, and log save still requires pain-before and pain-after.
- Training logs and functional outcomes still use their existing LocalStorage keys and normalization paths.
- Logs, progress summary, functional outcome check-in, weekly routine builder, and education page render paths remain wired.
- Mobile overflow guardrails remain present for 320px / 375px review fallback.
- Required zh-TW and English copy keys for the covered flows still exist.

## Manual QA Still Needed

This command is intentionally source-level and build-output-level. It does not replace browser QA for visual behavior.

For PRs that change UI, routing, session behavior, LocalStorage, or safety behavior, still capture manual evidence for:

- 320px and 375px widths with no horizontal overflow.
- SafetyGate cannot be bypassed.
- Red flags block training.
- Pain-before and pain-after are required in the session flow.
- Logs and outcomes persist after refresh.
- Existing routes load in iOS Safari / SPA-style navigation.
