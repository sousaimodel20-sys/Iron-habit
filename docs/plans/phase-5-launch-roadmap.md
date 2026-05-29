# Iron Habit Phase 5 Launch Roadmap

Purpose: keep the app moving while Joshua sleeps, without turning the product into a science project. Every pass should be small, mobile-first, verified, and reversible.

## Current status

- Core app exists and production builds successfully.
- Latest design/intro/train/fuel/meetings polish is local and needs to be committed/deployed after final checks.
- Production Vercel may lag behind local work until pushed/deployed.

## Phase 5 goal

Make Iron Habit feel like a real, tester-ready mobile beta: premium sober-fitness, red/black graphite, grounded copy, no prototype chrome, and a clear first-user journey.

## Sprint loop rules

Each automated mini-sprint must:

1. Inspect current git status and progress log first.
2. Choose one small user-facing improvement only.
3. Prefer polish, bug fixes, copy tightening, mobile spacing, route/nav consistency, or tester-readiness.
4. Use Cursor as advisory/review when available; use Codex or direct edits for implementation if appropriate.
5. Run `npm run build` before committing.
6. Commit only if the build passes and the diff is coherent.
7. Add a short progress-log entry with what changed, verification, and what remains.
8. Stop without editing if the repo is in a conflicted/broken state or if a previous pass already queued deployment work.

## Roadmap

### 5.1 Mobile visual polish

- Tighten spacing on intro, Today, Train, Fuel, Rescue, Talk, Meetings, and Progress.
- Remove remaining mockup/prototype artifacts.
- Confirm bottom navigation does not cover important content.
- Keep aesthetic premium, grounded, red/black, not gamey or sci-fi.

### 5.2 Trust/PWA polish

- Check title, meta, manifest, app name, icon, and install feel.
- Clarify beta/local-data/privacy wording.
- Ensure the first-run experience explains what the app is and how to use it.

### 5.3 Tester handoff

- Add or polish tester instructions.
- Make obvious what testers should try: setup, check-in, craving rescue, Talk, workout, fuel, proof/progress, meetings.
- Add simple feedback wording or CTA.

### 5.4 Final regression/deploy prep

- Run full mobile journey.
- Prepare launch/demo path.
- Keep a production deployment checklist.
- Commit/push/deploy only after build and sanity checks pass.

## Do-not-do list

- Do not add large new feature systems overnight.
- Do not delete Meetings or onboarding pillars.
- Do not make paid/token-heavy changes beyond the requested Cursor/Codex sprint loop.
- Do not push/deploy broken builds.
- Do not hide uncertainty; log skipped/failed automation honestly.
