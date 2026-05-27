import assert from 'node:assert/strict';
import { computeDailyMissionState } from '../src/utils/dailyMission.ts';

const today = '2026-05-24';

const baseData = {
  checkIns: {},
  fitnessEntries: [],
  activeLoadout: null,
  latestVictoryProof: null,
};

const checkIn = {
  date: today,
  sober: true,
  mood: 'Locked',
  craving: 2,
  note: 'Still sober.',
  habitsCompleted: [],
};

const highCravingCheckIn = {
  ...checkIn,
  craving: 8,
  note: 'High urge logged.',
};

const highCravingResolvedCheckIn = {
  ...highCravingCheckIn,
  habitsCompleted: ['No alcohol', 'Craving rescue'],
};

const activeLoadout = {
  id: 'loadout-1',
  templateId: 'ppl',
  title: 'Push Pull Legs',
  label: 'PPL',
  goal: 'Build muscle',
  time: '50 min',
  level: 'Intermediate',
  days: ['Push'],
  intent: 'Show up.',
  finisher: 'Walk',
  exercises: [],
  createdAt: '2026-05-24T00:00:00.000Z',
};

const proof = {
  id: 'proof-1',
  date: today,
  title: 'Push Pull Legs',
  label: 'PPL',
  activeDay: 'Push',
  durationMinutes: 45,
  intensity: 'Hard',
  exercises: ['Press'],
  completedSets: 3,
  totalSets: 3,
  finisher: 'Walk',
  proofCopy: 'Proof stacked.',
};

assert.deepEqual(
  computeDailyMissionState({ ...baseData }, today).primaryMission,
  {
    stage: 'check-in',
    title: "Step 1: Lock today's check-in",
    detail: 'No shame. No spiral. Just an honest check-in. Protect today first.',
    to: '/check-in',
    cta: 'Lock In',
  },
);

assert.equal(
  computeDailyMissionState({ ...baseData, checkIns: { [today]: checkIn } }, today).primaryMission.stage,
  'build-loadout',
);

const starterMission = computeDailyMissionState({ ...baseData, checkIns: { [today]: checkIn } }, today);
assert.equal(starterMission.primaryMission.to, '/train');
assert.deepEqual(starterMission.missionSteps.map((step) => [step.label, step.to, step.active]), [
  ['Check in', '/check-in', false],
  ['Train', '/train', true],
  ['Proof', '/proof', false],
]);


const rescueMission = computeDailyMissionState({ ...baseData, checkIns: { [today]: highCravingCheckIn }, activeLoadout }, today);
assert.deepEqual(rescueMission.primaryMission, {
  stage: 'rescue',
  title: 'Rescue first. Do not train through the urge.',
  detail: '8/10 craving is on the board. Start the emergency chain before training, proof, or anything else.',
  to: '/rescue?chain=1',
  cta: 'Start emergency chain',
});
assert.equal(rescueMission.heroTag, 'ACTION: RESCUE FIRST');
assert.equal(rescueMission.proofAction, 'Survive craving first');
assert.deepEqual(rescueMission.missionSteps.map((step) => [step.label, step.to, step.active]), [
  ['Check in', '/rescue?chain=1', true],
  ['Train', '/workout-mode', false],
  ['Proof', '/proof', false],
]);

assert.equal(
  computeDailyMissionState({ ...baseData, checkIns: { [today]: highCravingResolvedCheckIn }, activeLoadout }, today).primaryMission.stage,
  'train',
);

assert.deepEqual(
  computeDailyMissionState({ ...baseData, checkIns: { [today]: checkIn }, activeLoadout }, today).primaryMission,
  {
    stage: 'train',
    title: 'Step 2: Run Push Pull Legs',
    detail: 'Check-in is protected. Move your body and turn discipline into proof.',
    to: '/workout-mode',
    cta: 'Start Workout',
  },
);

assert.equal(
  computeDailyMissionState({
    ...baseData,
    checkIns: { [today]: checkIn },
    activeLoadout,
    fitnessEntries: [{ id: 'fit-1', date: today, type: 'Push Pull Legs', durationMinutes: 45, intensity: 'Hard', note: '' }],
  }, today).primaryMission.stage,
  'proof',
);

const complete = computeDailyMissionState({
  ...baseData,
  checkIns: { [today]: checkIn },
  activeLoadout,
  fitnessEntries: [{ id: 'fit-1', date: today, type: 'Push Pull Legs', durationMinutes: 45, intensity: 'Hard', note: '' }],
  latestVictoryProof: proof,
}, today);

assert.equal(complete.primaryMission.stage, 'complete');
assert.equal(complete.completionLabel, '3/3 locked');
assert.equal(complete.nextBestMove, 'Today is protected. Share the Victory Card, tell Talk it is posted, then come back tomorrow and defend the chain again.');
assert.deepEqual(complete.missionSteps.map((step) => [step.label, step.done, step.active]), [
  ['Check in', true, false],
  ['Train', true, false],
  ['Proof', true, true],
]);

console.log('daily mission tests passed');
