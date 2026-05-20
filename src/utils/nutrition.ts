import type { BodyProfile } from './storage';

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

export type MacroTargets = {
  bmr: number;
  maintenanceCalories: number;
  targetCalories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  goalLabel: string;
};

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

export const hasBodyProfile = (profile: BodyProfile) =>
  Boolean(Number(profile.weightLbs) && Number(profile.heightInches) && Number(profile.age));

export const calculateMacroTargets = (profile: BodyProfile): MacroTargets | null => {
  const weightLbs = Number(profile.weightLbs);
  const heightInches = Number(profile.heightInches);
  const age = Number(profile.age);

  if (!weightLbs || !heightInches || !age) return null;

  const weightKg = weightLbs * 0.453592;
  const heightCm = heightInches * 2.54;
  const sexAdjustment = profile.sex.toLowerCase().startsWith('f') ? -161 : 5;
  const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + sexAdjustment);
  const maintenance = Math.round(bmr * (activityMultipliers[profile.activityLevel] || activityMultipliers.moderate));

  const goal = profile.bodyGoal || 'recomposition';
  const pace = profile.pace || 'steady';
  const calorieShift = goal === 'cut-fat'
    ? pace === 'aggressive' ? -650 : -450
    : goal === 'build-muscle'
      ? 225
      : goal === 'maintain'
        ? 0
        : -150;

  const targetCalories = roundTo(Math.max(1400, maintenance + calorieShift), 25);
  const proteinMultiplier = goal === 'build-muscle' || goal === 'cut-fat' ? 0.95 : 0.85;
  const proteinGrams = roundTo(weightLbs * proteinMultiplier, 5);
  const fatGrams = roundTo(weightLbs * 0.35, 5);
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;
  const carbGrams = Math.max(50, roundTo((targetCalories - proteinCalories - fatCalories) / 4, 5));

  const goalLabel = goal === 'cut-fat'
    ? pace === 'aggressive' ? 'aggressive fat loss' : 'steady fat loss'
    : goal === 'build-muscle'
      ? 'lean muscle gain'
      : goal === 'maintain'
        ? 'maintenance'
        : 'recomposition';

  return {
    bmr,
    maintenanceCalories: roundTo(maintenance, 25),
    targetCalories,
    proteinGrams,
    carbGrams,
    fatGrams,
    goalLabel,
  };
};

export const formatHeight = (heightInches: string) => {
  const inches = Number(heightInches);
  if (!inches) return 'not set';
  return `${Math.floor(inches / 12)}'${inches % 12}"`;
};
