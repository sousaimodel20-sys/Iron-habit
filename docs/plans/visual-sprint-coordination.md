# Iron Habit Visual Sprint Coordination

Current date: 2026-05-29
Launch target: 2026-07-13

## Current State

Phase 5 Launch Polish + Tester Push is the active track.

The current uncommitted visual pass includes:

- New launch onboarding route wired at `/` and `/onboarding`.
- Original mock onboarding kept at `/onboarding-preview`.
- Shared photoreal coach asset in use across mockup surfaces.
- Native phone chrome moved into `BrandHeader`.
- Broad CSS visual polish across the real app shell, onboarding, Today, Talk, Train, Rescue, Proof, Share, Settings, and Workout surfaces.

Verification on this working tree:

- `npm run lint` passed.
- `npm run build` passed.
- `npm run test:daily-mission` passed.
- `npm run test:proof-receipts` passed.
- `npm run test:support-helpers` passed.
- `npm run test:emergency-support-chain` passed.

Sprint 0 cleanup in progress:

- `src/screens/LaunchOnboarding.tsx` now reuses shared `PhoneStatus` from `src/screens/IronHabitMockup.tsx`.
- Removed the launch-only phone status renderer and duplicate CSS icon classes.
- Remaining launch onboarding save logic is intentionally local for now because it writes existing storage fields and reuses `createStarterLoadout` plus local date formatting. Revisit only if a second first-run flow starts duplicating the same mapping.

## Next Visual Sprints

### Sprint 0: Stabilize The Current Visual Pass

Goal: make the current uncommitted pass reviewable and prevent duplicate code from shipping.

Expected work:

- Inspect the current diff before editing.
- Decide whether `src/screens/LaunchOnboarding.tsx` is a permanent route or a temporary visual prototype.
- Collapse duplicate visual chrome where practical. `PhoneStatus`, `BrandHeader`, `HelmetCoach`, and `StatCard` already exist in `src/screens/IronHabitMockup.tsx`.
- Review the onboarding save path for duplicated business logic before shipping. Date, localStorage, body profile, support location, and starter loadout behavior should reuse existing helpers and patterns.
- Browser-smoke `/`, `/today`, `/talk`, `/train`, `/rescue`, `/progress-dashboard`, `/share-progress`, and `/settings` on a phone viewport.

Do not start a new visual surface until this sprint is clean.

### Sprint 1: First-Run Onboarding Conversion

Goal: make the first 30 seconds feel premium without breaking setup persistence.

Expected work:

- Keep the splash, support/location, body basics, goal, training level, and complete states mobile-first.
- Keep copy direct and sober-fitness focused.
- Save only durable user state that the real app already understands.
- Confirm reset/clear-data returns to the intended first-launch baseline.

### Sprint 2: Today And Bottom Navigation Polish

Goal: make the daily loop obvious after onboarding.

Expected work:

- Today must clearly lead to check-in, training, proof, and Rescue.
- Bottom navigation must not cover emergency or proof actions.
- Keep `computeDailyMissionState`, local date helpers, and storage helpers as the source of truth.

### Sprint 3: Rescue And Talk Clarity

Goal: keep the premium visual system while preserving craving safety.

Expected work:

- Rescue and Talk must keep urgent actions visible above the dock.
- Typed fallback remains mandatory.
- Urgent commands must save durable state before navigation or support handoff.
- No visual treatment should weaken crisis boundary copy.

### Sprint 4: Share, Launch Kit, And Recording Pass

Goal: prepare the TikTok launch flow and tester handoff.

Expected work:

- Milestone cards should screenshot cleanly on mobile.
- Founder launch copy stays consistent across Share and Launch Kit.
- Browser-smoke the recording path from onboarding to Victory Card.

## Worker Coordination

Default limit: two active workers.

- Command owner: sets product scope, decides sprint order, approves merges, and runs final verification.
- Hermes: implementation/deploy worker for one approved sprint chunk at a time.
- Cursor: review cockpit or focused patch worker. Cursor should not invent product strategy or start parallel rewrites.

Workflow:

1. Command owner names one sprint and one smallest shippable task.
2. Cursor performs a read-only duplicate-code and blast-radius review first.
3. Hermes or Cursor implements only after the expected files and out-of-scope items are stated.
4. The implementer runs verification and reports changed files, behavior, checks, and remaining risk.
5. The other worker reviews the diff before deploy or handoff.

## Duplicate-Code Gate

Before any visual sprint ships, Cursor must report:

- Shared components/helpers checked.
- Any duplicated UI chrome, option lists, save logic, date logic, or storage logic found.
- Which duplicates were removed, or why a duplicate is temporary and acceptable.
- Verification commands run.

Minimum scan:

```bash
git diff --stat
rg -n "renderPhoneStatus|PhoneStatus|renderBrand|BrandHeader|estimateSobrietyDate|createStarterLoadout|saveData\\(|toISOString\\(\\)\\.slice\\(0, 10\\)" src
npm run lint
npm run build
```

Add targeted tests for the area touched.
