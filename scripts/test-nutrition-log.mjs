import assert from 'node:assert/strict';
import { buildManualMealEntry, buildMealEntry, getMealsForDate, removeMealEntry, sumMealsForDate, upsertMealEntry } from '../src/utils/nutritionLog.ts';

const breakfast = buildMealEntry({
  id: 'meal-breakfast',
  date: '2026-05-30',
  mealType: 'breakfast',
  name: '  Eggs and rice  ',
  calories: '520',
  proteinGrams: '36',
  carbGrams: '48',
  fatGrams: '18',
  source: 'scan',
  createdAt: '2026-05-30T08:00:00.000Z',
  estimateNote: 'Editable estimate; reviewed before logging.',
});

assert.equal(breakfast.name, 'Eggs and rice');
assert.equal(breakfast.calories, 520);
assert.equal(breakfast.proteinGrams, 36);
assert.equal(breakfast.source, 'scan');
assert.equal(breakfast.estimateNote, 'Editable estimate; reviewed before logging.');

const snack = buildMealEntry({
  id: 'meal-snack',
  date: '2026-05-30',
  mealType: 'snack',
  name: 'Greek yogurt',
  calories: 180.4,
  proteinGrams: 20.2,
  carbGrams: 12.2,
  fatGrams: 2.1,
  source: 'quick-add',
  createdAt: '2026-05-30T12:00:00.000Z',
});

const tomorrow = buildMealEntry({
  id: 'meal-tomorrow',
  date: '2026-05-31',
  name: 'Tomorrow prep',
  calories: 400,
  proteinGrams: 30,
  carbGrams: 40,
  fatGrams: 12,
  createdAt: '2026-05-31T08:00:00.000Z',
});

const data = { mealEntries: [breakfast, snack, tomorrow] };

assert.deepEqual(getMealsForDate(data, '2026-05-30').map((meal) => meal.id), ['meal-snack', 'meal-breakfast']);
assert.deepEqual(sumMealsForDate(data, '2026-05-30'), {
  calories: 700,
  proteinGrams: 56,
  carbGrams: 60,
  fatGrams: 20,
  mealCount: 2,
});
assert.deepEqual(sumMealsForDate({ mealEntries: [] }, '2026-05-30'), {
  calories: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  mealCount: 0,
});

const updatedSnack = { ...snack, calories: 210 };
assert.deepEqual(upsertMealEntry([breakfast, snack], updatedSnack).map((meal) => meal.calories), [520, 210]);
assert.deepEqual(upsertMealEntry([breakfast], snack).map((meal) => meal.id), ['meal-snack', 'meal-breakfast']);
assert.deepEqual(removeMealEntry([breakfast, snack], 'meal-breakfast').map((meal) => meal.id), ['meal-snack']);

const clamped = buildMealEntry({
  name: '',
  calories: -10,
  proteinGrams: 'not a number',
  carbGrams: 12,
  fatGrams: 4,
  createdAt: '2026-05-30T12:00:00.000Z',
  date: '2026-05-30',
});

assert.equal(clamped.name, 'Reviewed fuel estimate');
assert.equal(clamped.calories, 0);
assert.equal(clamped.proteinGrams, 0);
assert.equal(clamped.mealType, 'custom');
assert.equal(clamped.source, 'manual');

const manualDinner = buildManualMealEntry({
  id: 'manual-dinner',
  date: '2026-05-30',
  mealType: 'dinner',
  name: '  Chicken bowl  ',
  calories: '640',
  proteinGrams: '54',
  carbGrams: '58',
  fatGrams: '16',
  createdAt: '2026-05-30T18:00:00.000Z',
});

assert.equal(manualDinner.source, 'manual');
assert.equal(manualDinner.mealType, 'dinner');
assert.equal(manualDinner.name, 'Chicken bowl');
assert.equal(manualDinner.estimateNote, 'Manual food entry.');
assert.equal(manualDinner.calories, 640);

console.log('nutrition log tests passed');
