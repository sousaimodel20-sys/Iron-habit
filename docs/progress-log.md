# Iron Habit Progress Log

## 2026-05-29 — Phase 5 visual sprint coordination + Sprint 0 cleanup

Phase 5 visual work now has a coordination gate:

- Added `docs/plans/visual-sprint-coordination.md` with Sprint 0-4 sequencing, Hermes/Cursor roles, and the duplicate-code gate.
- Added `.cursor/rules/iron-habit-visual-sprints.mdc` so Cursor checks the visual plan and duplicate-code scan before marking visual work done.
- Updated `docs/cursor-code-map.md` to point Cursor at the active visual sprint files.
- Removed duplicate launch-only phone status chrome from `LaunchOnboarding`; the first-run flow now reuses shared `PhoneStatus` from `IronHabitMockup`.
- Removed the unused launch phone-status CSS icon classes and scoped launch onboarding to the shared native status chrome.
- Remaining launch onboarding save logic is intentionally local for now because it writes existing storage fields and reuses `createStarterLoadout` plus local date formatting.
- Verification passed: `npm run lint`, `npm run build`, `npm run test:daily-mission`, `npm run test:proof-receipts`, `npm run test:support-helpers`, `npm run test:emergency-support-chain`, and `npm run test:talk-next-move`.
- Browser smoke passed locally with zero console errors for `/`, `/today`, `/talk`, `/train`, `/rescue`, `/progress-dashboard`, `/share-progress`, `/settings`, `/meetings`, `/fuel`, `/proof`, `/setup-profile`, and `/launch-kit`.

Next step: keep Sprint 0 open only for a final human visual review of the current large CSS/app diff, then move to Sprint 1 onboarding conversion.

## 2026-05-27 — Phase 4 Real User Readiness closeout

Phase 4 is feature-complete for the current launch-readiness path:

- Settings now has a profile control card with name, sober start date, support-contact status, and direct edit links.
- `/setup-profile` now opens and scrolls straight to the baseline form; `?focus=support` still opens the support-contact section.
- First-launch copy now keeps users on the intended baseline path instead of sending them to check-in before setup is complete.
- Demo mode is hidden once baseline setup is complete to reduce accidental overwrite risk for real users.
- Settings trust copy now says profile/support data stays on-device and recommends backup before reset or device changes.
- Talk’s craving safety rail now includes a clear crisis boundary: Iron Habit is support, not emergency care.
- Cursor was used as read-only reviewer for each Phase 4 sprint; Hermes implemented, verified, shipped, and deployed.
- Verification passed: `npm run test:daily-mission`, `npm run test:proof-receipts`, `npm run test:support-helpers`, `npm run test:emergency-support-chain`, `npm run test:talk-next-move`, `npm run lint`, and `npm run build`.
- Browser smoke passed locally for `/setup-profile`, `/settings`, and `/talk` with zero console errors.

Next phase: Phase 5 Launch Polish + Tester Push — final mobile polish, tester handoff, launch recording/copy, and feedback fixes.

## 2026-05-27 — Phase 3 Share/TikTok Engine session 1

Phase 3 session 1 is feature-complete for the share-card and milestone surface:

- Added a dedicated `milestone` Victory Card template for 7 / 14 / 30 / 60 / 90 / 365 day sober milestones.
- Added milestone-specific hooks, captions, hashtags, and video ideas to the Content Studio.
- Tuned Craving/Milestone share card sizing and mobile typography for screenshot/TikTok use.
- Routed dashboard milestone CTAs and proof-angle navigation directly into the new milestone template.
- Verification passed: `npm run test:daily-mission`, `npm run test:proof-receipts`, `npm run test:talk-next-move`, `npm run lint`, and `npm run build`.
- Added founder launch copy: “One year ago I got sober. Today I’m launching the app I wish I had on day one.”
- Added a first-10-seconds launch script: founder hook → craving/rescue/proof → Victory Card screenshot.
- Verification passed: `npm run test:emergency-support-chain` plus the prior Phase 3 gates.
- Browser smoke passed locally for `/share-progress?template=craving` and `/share-progress?template=milestone` with zero console errors.

Next phase: Phase 4 Real User Readiness — settings/reset/privacy/empty states and full fake-user journey QA.

## 2026-05-27 — Phase 2 Rescue + Talk Coach closeout

Phase 2 is feature-complete for the current alpha path:

- Rescue screen handles urgent craving mode with timer/grounding/safe action, support contact handoff, meeting map path, and durable rescue receipts.
- Talk Coach supports typed fallback commands for craving, urgent support, meetings, workout/loadout generation, logging, proof, and next-best-move routing.
- Voice remains progressive enhancement only; typed input stays the dependable path.
- Talk next move now treats a high-craving day as active rescue only until `Craving rescue` is saved. After a completed rescue receipt, Talk resumes the normal daily loop instead of repeatedly forcing emergency chain CTAs.
- Phase 2 verification passed: `npm run test:talk-next-move`, `npm run test:emergency-support-chain`, `npm run lint`, and `npm run build`.

Next phase: start Phase 3 Share/TikTok engine with share progress cards, milestone celebrations, founder launch copy, and mobile polish.

## 2026-05-29 — Phase 5 sleep roadmap

- Saved current Phase 5 launch roadmap at docs/plans/phase-5-launch-roadmap.md.
- Current direction: tester-ready mobile polish, PWA/trust polish, tester handoff, final regression/deploy prep.
- Automated overnight loop requested: every 15 minutes, run small verified coding/polish passes using Cursor/Codex where available.
