import assert from 'node:assert/strict';
import { buildTrainingHeroSummary } from '../src/utils/trainingSummary.ts';

const noLoadout = buildTrainingHeroSummary(null);
assert.equal(noLoadout.eyebrow, 'TODAY\'S TRAINING');
assert.equal(noLoadout.headline, 'Train today');
assert.equal(noLoadout.planLabel, 'PPL');
assert.equal(noLoadout.activeDay, 'Push');
assert.equal(noLoadout.totalSets, 16);
assert.equal(noLoadout.exerciseCount, 6);
assert.equal(noLoadout.timeCap, '45 min');
assert.ok(noLoadout.missionLine.includes('Start the default push session'));
assert.ok(noLoadout.proofLine.includes('Log the work'));

const activeLoadout = {
  id: 'loadout-1',
  templateId: 'classic-ppl',
  title: 'Classic Strength Reset',
  label: 'PPL Reset',
  goal: 'Build sober strength',
  time: '52 min',
  level: 'Intermediate',
  days: ['Pull'],
  intent: 'Keep promises under stress',
  finisher: 'Walk five minutes and breathe',
  createdAt: '2026-06-01T12:00:00.000Z',
  exercises: [
    { name: 'Pull-up', muscle: 'Back', equipment: 'Bar', sets: '4 × 6', reps: '6', rest: '90 sec', cue: 'Chest tall', mistake: 'Swinging', swap: 'Pulldown', icon: 'pull' },
    { name: 'Row', muscle: 'Back', equipment: 'Cable', sets: '3 × 10', reps: '10', rest: '75 sec', cue: 'Elbows back', mistake: 'Shrugging', swap: 'DB row', icon: 'row' },
    { name: 'Curl', muscle: 'Biceps', equipment: 'DB', sets: '2 × 12', reps: '12', rest: '60 sec', cue: 'Control', mistake: 'Momentum', swap: 'Cable curl', icon: 'curl' },
  ],
};

const loaded = buildTrainingHeroSummary(activeLoadout);
assert.equal(loaded.eyebrow, 'LOADED TODAY');
assert.equal(loaded.headline, 'Pull day ready');
assert.equal(loaded.planLabel, 'PPL Reset');
assert.equal(loaded.activeDay, 'Pull');
assert.equal(loaded.totalSets, 9);
assert.equal(loaded.exerciseCount, 3);
assert.equal(loaded.timeCap, '52 min');
assert.ok(loaded.missionLine.includes('Open PPL Reset'));
assert.ok(loaded.proofLine.includes('3 moves'));

console.log('training summary tests passed');
