# Iron Habit Progress Log

## 2026-06-01 — Fuel macro sex calculation guardrail

Made Fuel macro math explicit for male and female BMR branches.

- Added tested sex-adjustment handling for `male`/`M` and `female`/`F` so M/F inputs map to the correct Mifflin-St Jeor offsets.
- Changed blank/Other sex from silently using the male branch to a neutral midpoint fallback.
- Expanded `npm run test:fuel-macros` to cover male, female, M/F aliases, and neutral fallback behavior.
- Verification passed: `npm run test:fuel-macros`, `npm run test:launch-onboarding-date`, `npm run build`, and `npm run lint`.

## 2026-06-01 — Launch onboarding imperial body metrics

Aligned the Body Basics onboarding fields with the app's imperial body profile model.

- Replaced the confusing height numeric field with a feet/inches picker that saves total `heightInches`.
- Changed weight copy/unit from `kg` to `lb` and kept age as `yrs`.
- Verified save-through locally from onboarding to `/today`: selected `6 ft 2 in`, `205 lb`, `35 yrs`, and confirmed `heightInches = 74`, `weightLbs = 205`, and `age = 35` in saved storage.
- Verification passed: `npm run test:launch-onboarding-date`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for the Body Basics picker with no layout overflow and zero JS errors.

## 2026-06-01 — Launch onboarding sober-date fix

Fixed the intro/setup sober-date field so tester onboarding can save the actual recovery start date.

- Root cause: the field switched between text/date input modes and called the native picker on focus, which caused typed values to clear or reject user-friendly formats.
- Replaced the dynamic date input with a stable text input that accepts and normalizes `YYYY-MM-DD`, `YYYY-M-D`, `MM/DD/YYYY`, and `M/D/YY`.
- Added quick sober-date presets for Just Starting, A Few Days, Weeks, and Months+ while still saving the exact normalized date.
- Added `npm run test:launch-onboarding-date` for date normalization, baseline estimates, and save-resolution behavior.
- Browser smoke passed locally from `/` → Start My Plan → enter `06/01/2025` → normalize to `2025-06-01` → Save & Continue → Enter Iron Habit → `/today`, with `profile.sobrietyDate` saved as `2025-06-01` and zero JS errors.
- Verification passed: `git diff --check`, `npm run test:launch-onboarding-date`, `npm run build`, and `npm run lint`.

Next Phase 5 polish slice: continue mobile launch cleanup on the remaining first-run surfaces, then final regression/tester handoff.

## 2026-06-01 — Fuel dock polish: remove Rescue obstruction

Removed the Fuel-page Rescue dock/floating affordance so the bottom navigation stays clear on mobile.

- `/fuel` now hides both the floating Rescue button and the dock-level Rescue action.
- Kept the normal Today / Meetings / Train / Fuel / Progress bottom nav intact.
- Verification passed: `git diff --check`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for `/fuel`: no `.ih-floating-rescue`, no `.ih-rescue-dock-action`, five primary nav links visible, and zero reported JS errors.

Next Phase 5 polish slice: continue mobile visual cleanup page-by-page, likely Today/Rescue/Talk/Proof.

## 2026-06-01 — Training Sprint T4: final Training regression

Closed the Training page sprint sequence with a no-redesign regression pass.

- Automated checks passed: `npm run test:training-summary`, `npm run test:talk-next-move`, `npm run test:proof-receipts`, `npm run build`, and `npm run lint`.
- Browser smoke passed for `/train`: active/default training summary, Start Workout/View Program actions, Push/Pull/Legs cards, and primary bottom nav.
- Browser smoke passed for `/exercise?split=push`: Push Day program sheet, six exercise rows, Start Workout handoff to `/workout-mode`, and bottom nav.
- Browser smoke passed for `/workout-mode`: proof-already-saved state, Victory Card link, Proof Stack link, Back to Train link, and primary bottom nav.
- Proof/progress smoke passed for `/profile` and `/share-progress?template=receipts&proof=...`: saved training receipt appeared in the proof vault and Victory Card route rendered the selected receipt.
- Visual smoke on `/train` confirmed the bottom navigation was visible and not blocking critical Training buttons/cards; spacing is tight but usable.
- Console check finished with zero browser console messages and zero JS errors.

Training is tester-ready. Next Phase 5 coding slice should move outside Training: mobile visual polish on remaining key pages or PWA/install/trust polish.

## 2026-06-01 — Training Sprint T3: Start Workout path polish

Tightened the `/workout-mode` path without changing the route structure or adding new backend scope.

- Updated no-loadout starter copy so the fallback path explains: start starter loadout, check real sets, save proof.
- Sharpened the active routine hero to "Log the work. Save the proof." and tied the route directly to the Victory Card handoff.
- Changed locked/ready finish CTAs from generic finish language to proof-specific states: "Check Sets First" while locked and "Save Proof" once all sets are checked.
- Kept existing set checklist, draft persistence, proof save, Proof Stack, and Victory Card links intact.
- Verification passed: `git diff --check`, `npm run test:training-summary`, `npm run test:talk-next-move`, `npm run build`, and `npm run lint`.
- Browser smoke passed from `/train` → Start Workout → starter loadout → check all sets → Save Proof → proof-saved receipt, with zero console errors.

Next Training slice: T4 final Training regression across `/train`, `/exercise?split=push`, `/workout-mode`, proof/progress links, bottom-nav clearance, and console errors.

## 2026-06-01 — Training Sprint T2: program-card usefulness

Continued Training page dial-in without changing the page layout.

- Added `buildTrainingProgramCards` so Push/Pull/Legs cards have a tested Today / Next / Base intent model.
- Kept the same card stack and visual structure, but made cards read more like selectable workout paths instead of placeholders.
- Reflected active loadout stats on the matching day card while keeping default PPL fallbacks for tester launch.
- Expanded `npm run test:training-summary` to cover default and active-loadout card contracts.
- Verification passed: `git diff --check`, `npm run test:training-summary`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for `/train`: program cards showed Today / Next / Base labels, updated metadata, correct links, and zero console errors.

Next Training slice: Start Workout path polish for `/workout-mode`, still keeping scope tight.

## 2026-06-01 — Training Sprint T1: first-screen clarity

Started Training page dial-in without changing the page layout.

- Added `buildTrainingHeroSummary` so the `/train` hero and stat cards derive a clear today summary from the active loadout or the default PPL fallback.
- Kept the same hero/stat/program-card structure, but sharpened first-screen copy around today's session, target sets/moves/time, and proof logging.
- Added `npm run test:training-summary` for the training summary contract.
- Verification passed: `git diff --check`, `npm run test:training-summary`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for `/train`: hero summary, Start Workout/View Program actions, stat cards, program cards, and zero console errors. Screenshot vision timed out, so smoke used DOM/snapshot inspection instead.

Next Training slice: program-card usefulness polish, still without changing the overall layout.

## 2026-06-01 — Meetings improvement pass: day/time filters

Continued the post-B3 improvements with a small no-cost Meetings usability slice.

- Added tested meeting intent filters: All, Today, Tonight, Online, and In person.
- `/meetings` now has a second filter row that combines with the AA / NA / SMART / Other type filters.
- Added a guarded empty state when filters hide every row, with a clear-filters action and copy that pushes users back to official finder verification instead of over-filtering.
- Verification passed: `git diff --check`, `npm run test:meeting-locator`, `npm run test:aa-canada-import`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for `/meetings?q=Kelowna%2C%20BC`: Tonight filter narrowed rows, Online filter showed online/finder rows, NA + Today showed the empty-state guard, and zero console errors were observed.

Next improvement slice: continue Phase 5 launch polish with either PWA/install trust polish or final tester-handoff/regression gate; defer live meeting refresh until backend/cron/storage is explicitly chosen.

## 2026-06-01 — Meetings improvement pass: loading/error safety

Started the post-B3 improvement track with the safest no-cost upgrade: better runtime handling when the AA Canada starter JSON is loading or unavailable.

- `useAaCanadaMeetingIndex` now returns payload/loading/error/retry state instead of only a nullable payload.
- `/meetings` shows a guarded “checking starter AA data” card while preserving immediate finder handoffs.
- `/meetings` shows a “starter data unavailable” fallback with a retry button if the JSON request fails; imported/source rows are not fabricated.
- `/rescue` keeps the meeting handoff safe and adds a small note if starter AA data is unavailable.
- Verification passed: `git diff --check`, `npm run test:meeting-locator`, `npm run test:aa-canada-import`, `npm run build`, and `npm run lint`.
- Browser smoke passed for normal Kelowna starter data, simulated missing starter JSON with finder fallback + retry, restored starter JSON, and zero console errors.

Next later-improvement slice: add day/time filters or distance sorting; live scheduled refresh should wait until we explicitly choose backend/cron storage and update policy.

## 2026-06-01 — B3 meetings bundle/data-loading polish

B3 reduced the Meetings launch bundle hit from the AA Canada starter data:

- Moved the 2,057-row AA Canada starter index to `public/data/aa-canada-meeting-index.json` so it is fetched only on meeting-support screens instead of imported into the main app shell.
- Added a cached `useAaCanadaMeetingIndex` loader and made `getMeetingsForLocation` accept optional starter data, preserving finder fallback behavior before/if the JSON loads.
- Updated `/meetings` and `/rescue` to use the on-demand data payload while keeping source/checked-date provenance and safe handoff copy.
- Updated the importer so future AA Canada regenerations write both the verification TS module and the public JSON payload.
- Verification passed: `git diff --check`, `npm run test:meeting-locator`, `npm run test:aa-canada-import`, `npm run build`, and `npm run lint`.
- Bundle check: production app shell JS dropped to about 474 kB / 138 kB gzip; the starter meeting JSON remains a route-demand asset at about 1.93 MB.
- Browser smoke passed locally for `/meetings?q=Kelowna%2C%20BC` and `/rescue` with zero console errors.

Follow-up B3 finish pass:

- Removed the stale Austin/sample default preview from `/meetings`; empty state now stays generic until the user enters or saves a support area.
- Softened Meetings/Rescue copy from “loaded/ready” language to “starter data,” “available,” and “trusted handoffs,” while keeping source and checked-date provenance visible.
- Re-ran verification: `git diff --check`, `npm run test:meeting-locator`, `npm run test:aa-canada-import`, `npm run build`, and `npm run lint` all passed.
- Browser smoke passed locally for `/meetings`, `/meetings?q=Kelowna%2C%20BC`, fallback `/meetings?q=Moose%20Jaw%2C%20SK`, and `/rescue` with zero console errors.

B3 is locally complete. Next gate is shipping: push/deploy and live production smoke before tester handoff/final launch regression.

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

## 2026-06-01 — Phase 5 Meetings Canada starter expansion

- Change: expanded `/meetings` support to Canadian finder handoffs for Toronto, Calgary, Edmonton, Ottawa, Montreal, Winnipeg, Halifax, Victoria, and Kelowna.
- Added province/city aliases plus Canada-wide fallback copy for unsupported Canadian cities without paid APIs, runtime scraping, or live-availability claims.
- Verification passed: `npm run test:meeting-locator`, `npm run build`, and `npm run lint`.

## 2026-06-01 — Sprint B1 AA Canada local meeting dataset

- Change: added an import/normalizer script for Codex's verified AA Canada TSML/Meeting Guide source manifest.
- Generated a local starter dataset with 5,770 normalized AA Canada meeting rows from 24 primary sources, preserving source IDs, source URLs, meeting URLs, city/province, day/time, coordinates when available, and `checkedAt` provenance.
- Added import summary docs at `docs/handoffs/aa-canada-import-summary-2026-06-01.json` and generated app data at `src/data/aaCanadaMeetings.generated.ts`.
- Added package scripts: `npm run import:aa-canada-meetings` and `npm run test:aa-canada-import`.
- Verification passed: `npm run test:aa-canada-import`, `npm run test:meeting-locator`, `npm run build`, and `npm run lint`.
- Safety boundary remains: local starter dataset only; app copy must still say verify schedules before going and avoid live/complete meeting claims.

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
## 2026-06-01 — Phase 5 production deploy gate

- Change: pushed the clean Phase 5 tester-ready build to GitHub and deployed production via Vercel.
- GitHub push: `main` updated on `origin`.
- Vercel production alias: https://iron-habit-vite.vercel.app
- Production route smoke passed for `/`, `/today`, `/rescue`, `/meetings`, `/fuel`, `/proof`, and `/launch-kit` with HTTP 200 and root app shell present.
- No blocking production availability issues found.
## 2026-06-01 — Sprint B2 AA Canada meetings app integration

- Change: wired the generated AA Canada starter index into `getMeetingsForLocation` with imported AA rows, source names, source URLs, checked dates, and verify-schedule warnings.
- `/meetings` now shows safe `LOCAL AA DATA` / `AA CANADA STARTER DATA` copy with imported/indexed row counts and keeps official AA, NA, SMART, and map handoffs available.
- Unsupported Canadian cities remain in fallback finder mode instead of fabricating local rows.
- `/today` and `/rescue` now use the shared meeting support summary so Meetings is visible from the daily and urgent support surfaces.
- The import script now regenerates both the full local dataset and the smaller shipped starter index so future imports do not drift.
- Verification passed: `npm run test:meeting-locator`, `npm run test:aa-canada-import`, `npm run build`, and `npm run lint`.
- Browser smoke passed locally for `/meetings?q=Kelowna%2C%20BC` and `/rescue`; earlier smoke also covered Toronto, Calgary, Regina, Kelowna, and Moose Jaw fallback.
- Cursor status: used read-only Cursor reviewer; it found B2 launch-acceptable after landing untracked data/scripts, rerunning verification, clarifying Rescue scope, and adding index regeneration.
- Known follow-up for B3: JS bundle remains large because the starter meeting index is bundled; lazy-load or fetch meeting data only on `/meetings` later.


## 2026-06-01 17:26 PDT — Training split-system slice 1

- Slice: added the first split-family registry and shared active-day resolver so PPL is modeled as one family with Push/Pull/Legs child days, alongside Arnold, Upper/Lower, Full Body, Bro, Dumbbell/Home, Conditioning, and Beginner families.
- Cursor status: used advisory wrapper; recommended a typed split-family registry + shared resolver before UI redesign.
- Codex status: used read-only advisory; recommended a pure split helper, backward-compatible ActiveLoadout metadata, and tests.
- Files changed: src/utils/splitSystem.ts, src/utils/trainingSummary.ts, src/utils/storage.ts, src/screens/FitnessTracker.tsx, src/screens/WorkoutMode.tsx, scripts/test-training-summary.mjs.
- Verification: npm run test:training-summary; npm run lint; npm run build.
- Next slice: make /train cards family-aware without changing the visual shell.

## 2026-06-01 18:03 PDT — Training split-system slice 2

- Slice: made `/train` program cards render the resolved split family’s internal days instead of hardcoded Push/Pull/Legs cards, preserving PPL as one top-level family with Push, Pull, and Legs child days.
- Cursor status: used advisory wrapper; recommended family-aware `/train` cards with no layout/CSS redesign.
- Codex status: read-only advisory produced useful partial guidance but timed out after 60s; no Codex edits were used.
- Files changed: `src/utils/trainingSummary.ts`, `src/screens/IronHabitMockup.tsx`, `scripts/test-training-summary.mjs`, `docs/progress-log.md`.
- Verification: `npm run test:training-summary`; `npm run build`; `npm run lint`; local browser smoke for `/train` seeded with Upper/Lower confirmed four internal day cards: Upper A, Lower A, Upper B, Lower B.
- Next slice: make `/exercise?split=...` understand the selected internal split day instead of showing the static Push Day sheet.

## 2026-06-01 18:39 PDT — Training split-system slice 3

- Slice: made `/exercise?split=...` route-aware so selected internal split days render the correct family label, day title, focus, stats, exercise rows, demo detail, and start CTA instead of always showing static Push Day.
- Cursor status: `CURSOR_TIMEOUT` after 45s; continued with Hermes-owned narrow edits.
- Codex status: read-only advisory timed out after partial inspection; no Codex edits were used.
- Files changed: `src/utils/splitSystem.ts`, `src/screens/IronHabitMockup.tsx`, `scripts/test-training-summary.mjs`, `docs/progress-log.md`.
- Verification: `npm run test:training-summary`; `npm run build`; `npm run lint`; `git diff --check`; local browser smoke for `/exercise?split=pull` and `/exercise?split=lower-a` confirmed PPL Pull and Upper/Lower Lower A sheets with zero console errors.
- Next slice: make `/workout-mode` carry split family + selected day from the chosen program handoff.

## 2026-06-01 19:20 PDT — Training split-system slice 4

- Slice: wired `/exercise?split=...` start links into `/workout-mode?split=...`, persisted the selected `splitFamilyId` + `activeDayId` on start, and made Workout Mode display/log the chosen internal split day instead of falling back to weekday rotation.
- Cursor status: used advisory wrapper; recommended the Exercise → Workout Mode selected-day handoff as the smallest next split-system slice.
- Codex status: used read-only advisory; recommended carrying selected split day/family into Workout Mode and proof copy. No Codex edits were used.
- Files changed: `src/utils/splitSystem.ts`, `src/screens/IronHabitMockup.tsx`, `src/screens/WorkoutMode.tsx`, `scripts/test-training-summary.mjs`, `docs/progress-log.md`.
- Verification: `npm run test:training-summary`; `npm run build`; `npm run lint`; local browser smoke for `/exercise?split=lower-a` → `/workout-mode?split=lower-a` confirmed `Lower A` visible and localStorage persisted `activeDayId: lower-a` with zero console errors.
- Next slice: make Workout Mode’s active exercise list/proof copy more day-specific when the selected split day differs from the saved loadout’s generic exercises.
