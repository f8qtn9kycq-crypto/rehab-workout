# Accessibility Checklist

## What was checked

- Touch targets for primary navigation, language switching, safety choices, PainScale, session controls, rest timer controls, and empty-state actions.
- Keyboard navigation through Home, Safety, Assessment, Exercises, Exercise Detail, Session, Logs, and Education.
- Screen reader labels for navigation, language controls, PainScale, SafetyGate, RedFlagChecklist, exercise filter controls, session progress, rest timer, dialogs, and YouTube embeds.
- Color and non-color state communication for active filters, disabled controls, warnings, recovery mode, and blocked states.
- Small-screen resilience for 320px and 375px layouts.
- Reduced-motion behavior through `prefers-reduced-motion`.
- iOS safe-area behavior for bottom navigation and bottom-sheet style dialogs.

## Files touched

- `src/components/DesktopNav.tsx`
- `src/components/MobileBottomNav.tsx`
- `src/components/PainScale.tsx`
- `src/components/RedFlagChecklist.tsx`
- `src/components/RestTimer.tsx`
- `src/components/SessionTracker.tsx`
- `src/components/ExerciseDetailModal.tsx`
- `src/components/ExerciseFilter.tsx`
- `src/locales/en.js`
- `src/locales/zh-TW.js`
- `src/styles.css`
- `docs/accessibility-checklist.md`

## Manual QA steps

1. Open the app at 320px width and confirm there is no horizontal page scrolling.
2. Open the app at 375px width and confirm bottom navigation, language buttons, and session controls remain visible and tappable.
3. Increase browser zoom or text size and confirm Home, Safety, Exercises, Exercise Detail, Session, Logs, and Education remain usable.
4. Navigate with the keyboard from Home through Safety, Assessment, Exercises, Exercise Detail, and Session.
5. Confirm visible focus appears on links, buttons, inputs, checkboxes, dialog controls, and bottom navigation.
6. Confirm the session exit dialog focuses the safe action first and returns focus to the triggering Back or Exit button when closed.

## Screen reader smoke test checklist

- Navigation is announced as primary or mobile navigation.
- TW / EN buttons announce localized switch actions and selected state.
- PainScale announces the label, current value, and 0 / no pain confirmation.
- SafetyGate announces the safety checklist group and instructions.
- Red flags and “None of the above” announce labels and descriptions.
- Exercise cards announce headings, metadata, and the View exercise action.
- Exercise filter mode and body area buttons announce selected and disabled states.
- Session progress announces current set and rep instruction.
- Rest timer announces remaining seconds without relying on animation.
- YouTube iframe has a localized title.

## Keyboard navigation checklist

- Home primary actions are reachable in visual order.
- Safety red flags and “None of the above” can be toggled with keyboard controls.
- Assessment form controls are keyboard reachable.
- Exercise Library mode buttons, body area buttons, and Clear filters are keyboard reachable.
- Exercise Detail back, video modal, details disclosure, and Start training controls are keyboard reachable.
- Session Back, Exit session, PainScale, Start, Complete set, Next set, Stop, Finish, and Save log are keyboard reachable.
- Logs and Education links/cards remain reachable without pointer input.

## Mobile viewport checklist

- 320px: no horizontal overflow expected from fixed-width controls.
- 375px: bottom navigation remains 44px+ and respects safe-area padding.
- Session controls use wrapping layouts and `min-h-11` touch targets.
- Exit dialog bottom padding respects `env(safe-area-inset-bottom)`.
- Large text may increase vertical scrolling, but controls should not clip.

## Safety regression checklist

- Pain > 3/10 still triggers Recovery Mode / regression guidance.
- Pain >= 6/10 still blocks the session and recommends professional evaluation.
- Red flags still block training.
- “None of the above” remains mutually exclusive with red flags.
- SafetyGate is still required before session entry.
- SessionRouteGuard still blocks unsafe direct session entry.
- PainScale remains required before and after session.
- Session logging behavior remains unchanged.

## Known limitations

- This checklist is a static/manual QA guide; it is not a replacement for a full VoiceOver, TalkBack, or assistive-technology certification pass.
- Browser-based live QA may depend on the local environment allowing a dev server to bind to localhost.
- Large text behavior should be spot-checked on real iOS and Android devices before release.
- Clinical safety copy and recommendation rules were intentionally not changed in this accessibility pass.
