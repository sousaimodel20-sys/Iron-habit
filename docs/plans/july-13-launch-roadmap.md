# Iron Habit July 13 Launch Roadmap

Current date: 2026-05-24
Launch date: 2026-07-13
Time available: 50 days / ~7 weeks

## Launch definition

Iron Habit is ready for a real user/TikTok launch when a new user can open the app on a phone, understand the sober-fitness promise, set up their baseline, complete a daily sober-strength mission, log training, use Rescue/Talk during cravings, see progress, and share a milestone without broken or confusing states.

## Agent operating model

Default: 2 active workers max.

- Mise / main agent: product direction, scope control, architecture, final QA, deploy decisions.
- 5.4 mini worker A: focused implementation chunk.
- 5.4 mini worker B or Cursor: QA, mobile/copy review, small fix pass.

If Cursor is available, Cursor becomes the coding cockpit for focused implementation while Mise stays command center. Cursor should not decide product strategy or rewrite the app.

Rules:
- One feature at a time.
- PR-sized tasks only.
- Reuse existing helpers/components before creating new ones.
- No new dependencies without approval.
- Verify after each chunk: npm run lint, relevant helper scripts/tests, npm run build.
- Stop after a demoable improvement; do not run endless retries.

## Timeline with Cursor help

Cursor does not cut the whole project cleanly in half. It can cut implementation/debug time by ~30-45% if the tasks are small and well-scoped. The realistic schedule becomes:

- June 5-8: feature-complete alpha
- June 12: beta/demo-ready checkpoint
- June 24-30: real-user ready candidate
- July 7: release candidate
- July 13: public TikTok/user launch

## Phase 1 — Core loop lock-in: May 24-May 31

Goal: make the app's promise obvious and daily-useable.

- May 24: freeze scope, audit current screens, save launch roadmap.
- May 25: onboarding baseline: sober date, goal, support contact, reason.
- May 26: Today screen: Sober Strength Mission, next action, streak, craving defense, workout target.
- May 27: Daily check-in: mood, craving, sober status, training, note.
- May 28: local date/streak QA, reset/clear-data returns to first-launch baseline.
- May 29: fitness tracker simplified into daily mission completion.
- May 30: progress dashboard shows sober days, workouts, consistency, milestones.
- May 31: phase QA: lint, build, helper tests, phone smoke.

## Phase 2 — Rescue and Talk Coach: June 1-June 8

Goal: make the app useful in the dangerous moments.

- June 1: Rescue screen: timer, breathing/grounding, immediate safe action.
- June 2: emergency support chain: urgent command saves rescue check-in and routes to support.
- June 3: typed Talk commands: craving, workout, log workout, meeting, next move.
- June 4: voice progressive enhancement with typed fallback always available.
- June 5: meeting/help discovery path with clear safety disclaimers.
- June 6: Talk Coach reads state and recommends next best move.
- June 7: Rescue/Talk mobile QA and saved-state QA.
- June 8: feature-complete alpha checkpoint.

## Phase 3 — Share/TikTok engine: June 9-June 16

Goal: make progress naturally shareable.

- June 9: share progress card for sober streak + workouts.
- June 10: milestone celebrations: 7, 14, 30, 60, 90, 365 days.
- June 11: one-year founder launch copy: Built from one year sober.
- June 12: beta/demo-ready checkpoint.
- June 13: TikTok landing flow: Start your Iron Habit.
- June 14: share captions/copy snippets.
- June 15: mobile polish pass.
- June 16: deploy checkpoint.

## Phase 4 — User readiness: June 17-June 24

Goal: make the app safe, clear, and usable by strangers.

- June 17: settings: sober date, support contact, privacy/reset.
- June 18: first-run empty states across all screens.
- June 19: persistence QA: check-ins, workouts, habits, contact, streak.
- June 20: privacy/safety copy: not medical advice, emergency help guidance.
- June 21: habit tracker polish.
- June 22: complete fake-user journey test.
- June 23: fix issues from journey test.
- June 24: real-user ready candidate.

## Phase 5 — Launch polish: June 25-July 1

Goal: make it feel premium.

- June 25: visual polish: dark sober-fitness brand, typography, cards.
- June 26: first 10 seconds conversion pass.
- June 27: founder/about section: one-year sober story.
- June 28: PWA/mobile install polish if feasible.
- June 29: edge cases: missing date/contact/history/check-in.
- June 30: full regression: lint, tests/scripts, build, browser smoke.
- July 1: soft launch candidate.

## Phase 6 — Private testers: July 2-July 7

Goal: learn before public launch.

- July 2: send to 2-5 trusted testers.
- July 3: fix onboarding confusion.
- July 4: fix mobile layout issues.
- July 5: fix Rescue/Talk issues.
- July 6: improve share cards/TikTok flow.
- July 7: release candidate.

## Phase 7 — Launch week: July 8-July 13

Goal: no big new features; only confidence and content.

- July 8: final product QA; feature freeze.
- July 9: TikTok launch assets and screen recording.
- July 10: final copy pass.
- July 11: final deploy and phone verification.
- July 12: launch rehearsal.
- July 13: launch.

Launch line: One year ago I got sober. Today I'm launching the app I wish I had on day one.

## Cursor starter prompt for Iron Habit

Paste this into Cursor from `/Users/imac/iron-habit-vite`:

```text
Read the project before editing. We are preparing Iron Habit for a July 13 public TikTok/user launch tied to the founder's one-year sober date.

Do not rewrite the app. Do not add dependencies. Keep changes mobile-first, sober-fitness focused, and PR-sized.

Inspect current routes/screens/helpers and propose the smallest next shippable improvement for the launch roadmap.

Return only:
1. Recommended task
2. Files expected to change
3. What is out of scope
4. Verification commands

Do not edit files yet.
```
