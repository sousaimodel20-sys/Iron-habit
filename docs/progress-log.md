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

## 2026-05-29 — Phase 5 Launch Kit demo CTA route polish

- Change: fixed the Launch Kit primary `Start demo on Today` CTA so it opens `/today` directly instead of sending testers back through `/` first-run onboarding.
- Files: `src/screens/LaunchKit.tsx`, `docs/progress-log.md`.
- Verification: `npm run build` passed.
- Cursor status: used advisory wrapper; it recommended this one-line Launch Kit route fix.
- Next remaining task: continue tiny tester-readiness polish, likely Launch Kit handoff copy or mobile scroll-clearance checks.

## 2026-05-29 — Phase 5 tester-facing launch kit labels

- Change: removed internal `Phase 5` wording from tester-facing Launch Kit and Settings CTAs so the handoff screen matches its own no-internal-roadmap promise.
- Files: `src/screens/LaunchKit.tsx`, `src/screens/Settings.tsx`, `docs/progress-log.md`.
- Verification: `npm run build` passed.
- Cursor status: used advisory wrapper; it recommended this tiny copy polish.
- Next remaining task: continue Launch Kit / Settings tester-readiness polish, likely mobile scroll-clearance or PWA trust copy.

## 2026-06-01 — Fuel AI scan mock-mode guardrail

- Change: staged the Fuel photo scan flow up to the paid-provider boundary without enabling any real AI API calls.
- Added `src/utils/aiFoodScan.ts` with deterministic mock estimates, confidence copy, and a 3-scan/day guardrail that mirrors the future paid cap.
- Updated `/fuel` so photos are staged first, then `Mock analyze — $0 AI spend` creates an editable estimate before logging.
- Files: `src/screens/IronHabitMockup.tsx`, `src/utils/aiFoodScan.ts`, `src/index.css`, `scripts/test-food-scan-mock.mjs`, `package.json`, `docs/progress-log.md`.
- Verification passed: `npm run test:food-scan-mock`, `npm run test:nutrition-log`, `npm run build`, and `npm run lint`.
- Local smoke passed: preview server returned 200 for `/fuel` and `/`; browser CDP was unavailable in this session, so route smoke used HTTP fetch.
- Paid boundary: real Gemini/OpenAI integration still requires an approved backend/serverless function, API key, model choice, and spending cap before any paid call is made.

## 2026-06-01 — Fuel scan readiness polish

- Change: polished the mock-only Fuel scan flow before paid AI discussion.
- Added selected-photo preview using a local object URL, while keeping the sample plate fallback.
- Added scanned meal-type selection, serving-size review, confidence copy, and detected-food chips before logging.
- Improved daily scan-limit UX so the mock analyze button becomes an intentional `Daily scan limit reached` state.
- Scanned meals now save to the selected meal type instead of always logging as custom.
- Verification passed: `npm run test:food-scan-mock`, `npm run test:nutrition-log`, `npm run build`, and `npm run lint`.
- Local smoke passed: preview server returned 200 for `/fuel` and `/`.
- Paid boundary remains unchanged: no Gemini/OpenAI/Claude calls, no API key, no paid backend route.
## 2026-06-01 — Phase 5 Meetings surfaced in Today/Rescue

- Change: surfaced saved support-city meeting handoff on `/today` and `/rescue` so Meetings is no longer isolated on its own tab.
- Added shared meeting support summary copy for verified starter cities vs fallback map/finder mode.
- Today now includes a Meeting backup mission and direct Open meetings card.
- Rescue now includes a crisis-first nearby support card with map handoff copy.
- Files: `src/screens/IronHabitMockup.tsx`, `src/utils/meetings.ts`, `scripts/test-meeting-locator.mjs`, `docs/progress-log.md`.
- Verification passed: `npm run test:meeting-locator`, `npm run build`, and `npm run lint`.
- Still $0: no paid meeting API, scraping, or live database claims.

## 2026-06-01 — Phase 5 tester handoff package

- Change: tightened `/launch-kit` into a practical tester handoff package for the first 2–5 testers.
- Tester message now gives a phone-first path through setup, check-in, Rescue, Meetings, Train, Fuel, and Proof.
- Added a dedicated feedback capture card with exactly three questions and copy/SMS actions.
- Files: `src/screens/LaunchKit.tsx`, `docs/progress-log.md`.
- Verification passed: `npm run build` and `npm run lint`.
- Local route smoke passed: preview served `/launch-kit` successfully.

## 2026-06-01 — Phase 5 local final regression gate

- Change: ran the final local regression gate across the tester path before deploy/push.
- Checks passed: `git diff --check`, all focused test scripts, `npm run build`, and `npm run lint`.
- Focused tests: daily mission, proof receipts, support helpers, emergency support chain, Talk next move, Fuel macros, nutrition log, food-scan mock guardrail, and meeting locator.
- Local route smoke passed via Vite preview for `/`, `/setup-profile`, `/today`, `/check-in`, `/rescue`, `/meetings`, `/train`, `/fuel`, `/proof`, and `/launch-kit`.
- Browser/CDP visual console smoke was unavailable in this session because no CDP endpoint was reachable at `127.0.0.1:9222`; HTTP route smoke covered route availability only.
- No blocking code issues found. Remaining gate: push/deploy and verify the production URL.

