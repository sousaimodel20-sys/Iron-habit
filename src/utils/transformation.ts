import type { IronHabitData } from './storage';

const numberFrom = (value: string, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

export const getTransformationMetrics = (data: IronHabitData, streak: number) => {
  const drinkCost = numberFrom(data.profile.averageDrinkCost, 8);
  const drinksPerDay = numberFrom(data.profile.drinksPerDay, 4);
  const caloriesPerDrink = numberFrom(data.profile.caloriesPerDrink, 150);
  const workouts = data.fitnessEntries.length;
  const trainingMinutes = data.fitnessEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const moneySaved = Math.round(streak * drinksPerDay * drinkCost);
  const caloriesAvoided = Math.round(streak * drinksPerDay * caloriesPerDrink);
  const drinksSkipped = Math.round(streak * drinksPerDay);
  const trainingHours = Math.round((trainingMinutes / 60) * 10) / 10;

  return {
    drinkCost,
    drinksPerDay,
    caloriesPerDrink,
    workouts,
    trainingMinutes,
    trainingHours,
    moneySaved,
    caloriesAvoided,
    drinksSkipped,
  };
};

export const formatMoney = (value: number) => `$${value.toLocaleString()}`;
export const formatNumber = (value: number) => value.toLocaleString();
