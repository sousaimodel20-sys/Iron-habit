# Iron Habit Agent Rules

## Mission

Iron Habit is a mobile-first sober-fitness app launching publicly on July 13 for Joshua's one-year sober date. Build a real user product, not a pitch deck or internal demo.

Core promise: a sober guy opens the app, gets today's mission, checks in, trains, handles cravings, and can share progress.

## Product priorities

1. Daily sober-strength loop: Check in → Train → Proof/Progress.
2. Rescue during craving moments: immediate, calm, useful actions.
3. Talk Coach: typed fallback first, voice as progressive enhancement only.
4. Shareable milestones for TikTok/social launch.
5. Mobile one-handed usability.

## Working style

- Ship small, PR-sized improvements.
- Do not rewrite the app.
- Reuse existing components, screens, helpers, and localStorage patterns before creating new ones.
- Do not add dependencies unless explicitly approved.
- Avoid medical claims. Use supportive wellness language and emergency guidance where needed.
- Keep UI customer-facing and emotionally useful, not dev/demo language.
- Keep changes easy to review and verify.

## Safety and sobriety rules

- Rescue/Talk urgent flows must preserve user safety and avoid pretending to replace professional help.
- Urgent commands should save durable state before navigation/handoff.
- Always keep typed input fallback; browser voice support is optional and inconsistent.
- Support contact, sober date, check-ins, and streaks should persist locally and survive refresh.
- Use local date keys for user-facing daily buckets. Avoid UTC `toISOString().slice(0, 10)` for streak/check-in logic.

## Verification

Use scripts in package.json where relevant:

```bash
npm run lint
npm run build
npm run test:daily-mission
npm run test:proof-receipts
npm run test:support-helpers
npm run test:emergency-support-chain
```

If a check cannot run, explain exactly why and what was verified instead.

## Launch target

- Feature-complete alpha: June 5-8
- Beta/demo-ready: June 12
- Real-user candidate: June 24-30
- Release candidate: July 7
- Public TikTok/user launch: July 13
