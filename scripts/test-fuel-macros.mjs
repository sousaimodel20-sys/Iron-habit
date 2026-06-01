import assert from 'node:assert/strict';
import { calculateMacroTargets, hasBodyProfile } from '../src/utils/nutrition.ts';

const baseProfile = {
  sex: 'male',
  age: '35',
  heightInches: '70',
  weightLbs: '190',
  goalWeightLbs: '180',
  activityLevel: 'moderate',
  trainingDaysPerWeek: '4',
  bodyGoal: 'recomposition',
  pace: 'steady',
  updatedAt: '2026-05-30T12:00:00.000Z',
};

const target = (overrides = {}) => {
  const result = calculateMacroTargets({ ...baseProfile, ...overrides });
  assert.ok(result, 'expected macro targets');
  return result;
};

const macroCalories = (result) => (result.proteinGrams * 4) + (result.carbGrams * 4) + (result.fatGrams * 9);
const assertMacroCaloriesFit = (result) => {
  assert.ok(
    Math.abs(macroCalories(result) - result.targetCalories) <= 35,
    `macro calories ${macroCalories(result)} should roughly match target ${result.targetCalories}`,
  );
};

assert.equal(hasBodyProfile(baseProfile), true);
assert.equal(hasBodyProfile({ ...baseProfile, weightLbs: '' }), false);
assert.equal(calculateMacroTargets({ ...baseProfile, age: '' }), null);
assert.equal(calculateMacroTargets({ ...baseProfile, heightInches: '0' }), null);

const male = target({ sex: 'male', bodyGoal: 'maintain', pace: 'steady' });
assert.equal(male.bmr, 1803);
assert.equal(male.maintenanceCalories, 2800);
assert.equal(male.targetCalories, 2800);
assert.equal(male.goalLabel, 'maintenance');
assertMacroCaloriesFit(male);

const female = target({ sex: 'female', bodyGoal: 'maintain', pace: 'steady' });
assert.equal(female.bmr, 1637);
assert.equal(female.maintenanceCalories, 2525);
assert.equal(female.targetCalories, 2525);
assert.ok(female.targetCalories < male.targetCalories, 'female BMR branch should lower target for same stats');
assertMacroCaloriesFit(female);

const maleAlias = target({ sex: 'M', bodyGoal: 'maintain', pace: 'steady' });
assert.equal(maleAlias.bmr, male.bmr);
assert.equal(maleAlias.targetCalories, male.targetCalories);

const femaleAlias = target({ sex: 'F', bodyGoal: 'maintain', pace: 'steady' });
assert.equal(femaleAlias.bmr, female.bmr);
assert.equal(femaleAlias.targetCalories, female.targetCalories);

const neutralSex = target({ sex: 'other', bodyGoal: 'maintain', pace: 'steady' });
assert.equal(neutralSex.bmr, 1720);
assert.equal(neutralSex.maintenanceCalories, 2675);
assert.ok(neutralSex.targetCalories < male.targetCalories);
assert.ok(neutralSex.targetCalories > female.targetCalories);
assertMacroCaloriesFit(neutralSex);

const steadyCut = target({ bodyGoal: 'cut-fat', pace: 'steady' });
assert.equal(steadyCut.targetCalories, 2350);
assert.equal(steadyCut.proteinGrams, 180);
assert.equal(steadyCut.goalLabel, 'steady fat loss');
assertMacroCaloriesFit(steadyCut);

const aggressiveCut = target({ bodyGoal: 'cut-fat', pace: 'aggressive' });
assert.equal(aggressiveCut.targetCalories, 2150);
assert.equal(aggressiveCut.goalLabel, 'aggressive fat loss');
assert.ok(aggressiveCut.targetCalories < steadyCut.targetCalories);
assertMacroCaloriesFit(aggressiveCut);

const build = target({ bodyGoal: 'build-muscle', pace: 'steady' });
assert.equal(build.targetCalories, 3025);
assert.equal(build.proteinGrams, 180);
assert.equal(build.goalLabel, 'lean muscle gain');
assert.ok(build.targetCalories > male.targetCalories);
assertMacroCaloriesFit(build);

const recomp = target({ bodyGoal: 'recomposition', pace: 'steady' });
assert.equal(recomp.targetCalories, 2650);
assert.equal(recomp.proteinGrams, 160);
assert.equal(recomp.goalLabel, 'recomposition');
assertMacroCaloriesFit(recomp);

const fallbackActivity = target({ activityLevel: 'unknown', bodyGoal: 'maintain' });
assert.equal(fallbackActivity.maintenanceCalories, 2800);
assert.equal(fallbackActivity.targetCalories, 2800);
assertMacroCaloriesFit(fallbackActivity);

const floor = target({
  sex: 'female',
  age: '70',
  heightInches: '60',
  weightLbs: '100',
  activityLevel: 'sedentary',
  bodyGoal: 'cut-fat',
  pace: 'aggressive',
});
assert.equal(floor.targetCalories, 1400);
assert.ok(floor.carbGrams >= 50, 'carbs should keep a minimum guardrail');
assertMacroCaloriesFit(floor);

console.log('fuel macro tests passed');
