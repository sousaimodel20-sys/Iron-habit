import assert from 'node:assert/strict';
import { buildTalkNextMove } from '../src/utils/talkNextMove.ts';

const today = '2026-05-27';
const base = {
  profile: {
    name: '',
    sobrietyDate: today,
    why: 'Build a body and life I am proud of.',
    focus: 'sobriety-strength-discipline',
    averageDrinkCost: '8',
    drinksPerDay: '4',
    caloriesPerDrink: '150',
    transformationGoal: 'Lean, sober, strong, and consistent.',
    supportLocation: '',
    supportName: '',
    supportPhone: '',
  },
  bodyProfile: {
    sex: '',
    age: '',
    heightInches: '',
    weightLbs: '',
    goalWeightLbs: '',
    activityLevel: 'moderate',
    trainingDaysPerWeek: '4',
    bodyGoal: 'recomposition',
    pace: 'steady',
    updatedAt: '',
  },
  checkIns: {},
  habits: [],
  fitnessEntries: [],
  activeLoadout: null,
  completedLoadouts: [],
  latestVictoryProof: null,
  celebratedMilestones: [],
};

assert.equal(buildTalkNextMove(base, today).action, 'check-in');
assert.equal(buildTalkNextMove(base, today).path, '/check-in');

const checkedIn = {
  ...base,
  checkIns: {
    [today]: {
      date: today,
      sober: true,
      mood: 'Focused',
      craving: 2,
      note: 'steady',
      habitsCompleted: ['No alcohol'],
    },
  },
};

assert.equal(buildTalkNextMove(checkedIn, today).action, 'seed-workout');
assert.equal(buildTalkNextMove(checkedIn, today).path, '/workout-mode');

const withLoadout = {
  ...checkedIn,
  activeLoadout: {
    id: 'loadout-1',
    templateId: 'ppl',
    title: 'PPL Mass Loadout',
    label: 'Push Pull Legs',
    goal: 'Build muscle',
    time: '50 min',
    level: 'Intermediate',
    days: ['Push'],
    intent: 'Train',
    finisher: 'Walk',
    exercises: [],
    createdAt: today,
  },
};

assert.equal(buildTalkNextMove(withLoadout, today).action, 'workout');
assert.match(buildTalkNextMove(withLoadout, today).detail, /PPL Mass Loadout/);

const trained = {
  ...withLoadout,
  fitnessEntries: [{ id: 'fit-1', date: today, type: 'Gym', durationMinutes: 45, intensity: 'Hard', note: 'done' }],
};

assert.equal(buildTalkNextMove(trained, today).action, 'proof');
assert.equal(buildTalkNextMove(trained, today).path, '/proof');

const proofDone = {
  ...trained,
  latestVictoryProof: {
    id: 'proof-1',
    date: today,
    title: 'PPL Mass Loadout',
    label: 'Push Pull Legs',
    activeDay: 'Push',
    durationMinutes: 45,
    intensity: 'Hard',
    exercises: ['Incline DB Press'],
    completedSets: 12,
    totalSets: 12,
    finisher: 'Walk',
    proofCopy: 'Proof stacked',
  },
};

assert.equal(buildTalkNextMove(proofDone, today).action, 'victory-card');
assert.equal(buildTalkNextMove(proofDone, today).path, '/share-progress');

const highCraving = {
  ...proofDone,
  profile: { ...proofDone.profile, supportName: 'Brother Mike', supportPhone: '604-555-1234' },
  checkIns: {
    [today]: {
      ...proofDone.checkIns[today],
      craving: 8,
    },
  },
};

assert.equal(buildTalkNextMove(highCraving, today).action, 'rescue');
assert.equal(buildTalkNextMove(highCraving, today).path, '/rescue?chain=1');
assert.match(buildTalkNextMove(highCraving, today).detail, /8\/10/);

const highCravingResolved = {
  ...highCraving,
  checkIns: {
    [today]: {
      ...highCraving.checkIns[today],
      habitsCompleted: ['No alcohol', 'Craving rescue'],
    },
  },
};

assert.equal(buildTalkNextMove(highCravingResolved, today).action, 'victory-card');
assert.equal(buildTalkNextMove(highCravingResolved, today).path, '/share-progress');

console.log('talk next move tests passed');
