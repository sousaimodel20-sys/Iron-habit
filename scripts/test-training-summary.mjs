import assert from 'node:assert/strict';
import { buildTrainingHeroSummary, buildTrainingProgramCards, getActiveLoadoutDay } from '../src/utils/trainingSummary.ts';
import { defaultSplitFamily, getSplitDayById, getSplitFamilyForLoadout, splitFamilies } from '../src/utils/splitSystem.ts';

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

const defaultCards = buildTrainingProgramCards(null);
assert.deepEqual(defaultCards.map((card) => card.accent), ['Today', 'Next', 'Base']);
assert.equal(defaultCards[0].name, 'Push Day');
assert.equal(defaultCards[0].badge, 'TODAY');
assert.equal(defaultCards[0].sets, '16 sets');
assert.equal(defaultCards[0].exercises, '6 exercises');
assert.equal(defaultCards[1].meta, 'Back • Biceps • Rear delts');
assert.equal(defaultCards[2].path, '/exercise?split=legs');

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

const rotatingPplLoadout = {
  ...activeLoadout,
  days: ['Push', 'Pull', 'Legs'],
};

assert.equal(getActiveLoadoutDay(rotatingPplLoadout, { getDay: () => 1 }), 'Push');
assert.equal(getActiveLoadoutDay(rotatingPplLoadout, { getDay: () => 2 }), 'Pull');
assert.equal(getActiveLoadoutDay(rotatingPplLoadout, { getDay: () => 3 }), 'Legs');
assert.equal(getActiveLoadoutDay(rotatingPplLoadout, { getDay: () => 0 }), 'Push');
assert.equal(getActiveLoadoutDay({ ...activeLoadout, days: [] }, { getDay: () => 2 }), 'Push');

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

const loadedCards = buildTrainingProgramCards(activeLoadout);
assert.deepEqual(loadedCards.map((card) => card.accent), ['Base', 'Today', 'Next']);
assert.equal(loadedCards[1].name, 'Pull Day');
assert.equal(loadedCards[1].meta, 'Build sober strength');
assert.equal(loadedCards[1].sets, '9 sets');
assert.equal(loadedCards[1].exercises, '3 exercises');
assert.equal(loadedCards[1].badge, 'TODAY');
assert.equal(loadedCards[1].path, '/exercise?split=pull');
assert.equal(loadedCards[2].accent, 'Next');

assert.equal(defaultSplitFamily.id, 'ppl');
assert.deepEqual(defaultSplitFamily.days.map((day) => day.name), ['Push', 'Pull', 'Legs']);
assert.equal(splitFamilies.arnold.days[0].name, 'Chest + Back');
assert.equal(splitFamilies['upper-lower'].days[0].name, 'Upper A');
assert.equal(splitFamilies['full-body'].days[0].name, 'Full Body A');
assert.equal(splitFamilies.bro.days[0].name, 'Chest');
assert.equal(splitFamilies['dumbbell-home'].days[0].name, 'Home Upper');
assert.equal(splitFamilies.conditioning.days[0].name, 'Strength Circuit');
assert.equal(splitFamilies.beginner.days[0].name, 'Foundation A');
assert.equal(getSplitFamilyForLoadout(activeLoadout).id, 'ppl');
assert.equal(getSplitFamilyForLoadout({ ...activeLoadout, templateId: 'arnold', label: 'Arnold Split', title: 'Arnold Armor' }).id, 'arnold');
assert.equal(getActiveLoadoutDay({ ...activeLoadout, templateId: 'upper-lower', label: 'Upper / Lower', title: '4-Day Upper Lower', days: ['Upper Strength', 'Lower Strength'] }, { getDay: () => 2 }), 'Lower A');

const upperLowerCards = buildTrainingProgramCards({
  ...activeLoadout,
  templateId: 'upper-lower',
  label: 'Upper / Lower',
  title: '4-Day Upper Lower',
  days: ['Upper Strength', 'Lower Strength', 'Upper Volume', 'Lower Volume'],
});
assert.equal(upperLowerCards.length, 4);
assert.deepEqual(upperLowerCards.map((card) => card.name), ['Upper A Day', 'Lower A Day', 'Upper B Day', 'Lower B Day']);
assert.deepEqual(upperLowerCards.map((card) => card.accent), ['Today', 'Next', 'Base', 'Base']);
assert.equal(upperLowerCards[0].familyId, 'upper-lower');
assert.equal(upperLowerCards[0].familyLabel, 'U/L');
assert.equal(upperLowerCards[1].path, '/exercise?split=lower-a');
assert.equal(getSplitDayById('lower-a', 'upper-lower').family.id, 'upper-lower');
assert.equal(getSplitDayById('lower-a', 'upper-lower').day.name, 'Lower A');
assert.equal(getSplitDayById('chest-back', 'arnold').family.id, 'arnold');
assert.equal(getSplitDayById('missing-split').day.name, 'Push');

console.log('training summary tests passed');
