# Iron Habit Cursor Code Map

Use this with `AGENTS.md`, `.cursor/rules/*`, and `docs/plans/july-13-launch-roadmap.md` before making changes.

## Project root

`/Users/imac/iron-habit-vite`

Git remote: `git@github.com:sousaimodel20-sys/Iron-habit.git`
Branch: `main`

## Stack

- Vite
- React 19
- TypeScript
- React Router
- Local-first persistence with `localStorage`

## Commands

```bash
npm run lint
npm run build
npm run test:daily-mission
npm run test:proof-receipts
npm run test:support-helpers
npm run test:emergency-support-chain
```

## Main routes

Defined in `src/App.tsx`:

- `/` and `/setup-profile` → `src/screens/Onboarding.tsx`
- `/daily-check-in` → `src/screens/DailyCheckIn.tsx`
- `/habit-tracker` → `src/screens/HabitTracker.tsx`
- `/fitness-tracker` and `/train` → `src/screens/FitnessTracker.tsx`
- `/meetings` → `src/screens/Meetings.tsx`
- `/progress-dashboard` and `/profile` → `src/screens/ProgressDashboard.tsx`
- `/share-progress` → `src/screens/ShareProgressScreen.tsx`
- `/craving-rescue` and `/rescue` → `src/screens/CravingRescue.tsx`
- `/talk` → `src/screens/TalkCoach.tsx`
- `/workout-mode` → `src/screens/WorkoutMode.tsx`
- `/settings` → `src/screens/Settings.tsx`

## Core files

### App shell and styling

- `src/App.tsx` — routes, topbar, bottom nav.
- `src/index.css` — app styling and mobile layout.
- `src/components/UI.tsx` — reusable UI components.
- `src/components/MilestoneBadge.tsx` — milestone UI.
- `src/components/ShareableProgressCard.tsx` — share/proof card UI.

### State and persistence

- `src/utils/storage.ts` — `IronHabitData`, profile/body/check-in/habit/fitness/loadout/proof types, `defaultData`, `loadData`, `saveData`, `replaceData`, `resetData`.
- `src/utils/date.ts` — local date helpers. Do not replace with UTC date slicing.
- `src/utils/streaks.ts` — sobriety streak helpers.

### Daily mission / proof / support logic

- `src/utils/dailyMission.ts` — computes Today mission: check-in → train → proof.
- `src/utils/proofReceipts.ts` — share/proof receipt helpers.
- `src/utils/support.ts` — support contact/meeting helper logic.
- `src/utils/emergencySupportChain.ts` — urgent Talk → Rescue/support chain logic.

### Script tests

- `scripts/test-daily-mission.mjs`
- `scripts/test-proof-receipts.mjs`
- `scripts/test-support-helpers.mjs`
- `scripts/test-emergency-support-chain.mjs`

## Current active launch work

Cursor harness and roadmap files were added for the July 13 sober-anniversary launch:

- `AGENTS.md`
- `.cursor/rules/iron-habit-july13-launch.mdc`
- `.cursor/rules/iron-habit-shipping-workflow.mdc`
- `.cursor/rules/iron-habit-safety-and-dates.mdc`
- `.cursor/rules/iron-habit-visual-sprints.mdc`
- `docs/plans/july-13-launch-roadmap.md`
- `docs/plans/visual-sprint-coordination.md`
- `docs/cursor-code-map.md`

There are active uncommitted app changes from the current visual sprint pass:

- `public/mockup-assets/helmet-coach.svg`
- `public/mockup-assets/iron-habit-coach-v2.png`
- `src/App.tsx`
- `src/index.css`
- `src/screens/LaunchOnboarding.tsx`
- `src/screens/Onboarding.tsx`
- Multiple real screens that now use shared `BrandHeader` phone chrome instead of rendering `PhoneStatus` separately.

Do not overwrite those blindly. Inspect diffs before editing.

## Cursor behavior requested

Before editing, Cursor should answer:

1. Smallest shippable task
2. Files expected to change
3. What is out of scope
4. Verification commands

Then wait for approval before editing.

## Product guardrails

- July 13 is the public TikTok/user launch tied to Joshua's one-year sober date.
- June 12 is the beta-complete checkpoint.
- Keep the app focused on sobriety + training + daily mission + Rescue/Talk + shareable proof.
- Avoid generic habit-app drift.
- Avoid medical claims or crisis-care claims.
- Voice features require typed fallback.
- No new dependencies unless approved.
- Keep every improvement phone-first.
