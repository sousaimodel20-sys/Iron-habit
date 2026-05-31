import { formatLocalDateKey } from './date.ts';
import type { IronHabitData, MealEntry, MealSource, MealType } from './storage';

export type MealTotals = {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  mealCount: number;
};

export type MealEntryInput = {
  id?: string;
  date?: string;
  mealType?: MealType;
  name: string;
  calories: number | string;
  proteinGrams: number | string;
  carbGrams: number | string;
  fatGrams: number | string;
  source?: MealSource;
  createdAt?: string;
  photoName?: string;
  estimateNote?: string;
};

const toPositiveNumber = (value: number | string) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.round(numeric);
};

const cleanName = (name: string) => name.trim() || 'Reviewed fuel estimate';

export const emptyMealTotals = (): MealTotals => ({
  calories: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  mealCount: 0,
});

export const getMealsForDate = (data: Pick<IronHabitData, 'mealEntries'>, date = formatLocalDateKey()) =>
  [...(data.mealEntries || [])]
    .filter((meal) => meal.date === date)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const sumMealsForDate = (data: Pick<IronHabitData, 'mealEntries'>, date = formatLocalDateKey()): MealTotals =>
  getMealsForDate(data, date).reduce<MealTotals>((totals, meal) => ({
    calories: totals.calories + meal.calories,
    proteinGrams: totals.proteinGrams + meal.proteinGrams,
    carbGrams: totals.carbGrams + meal.carbGrams,
    fatGrams: totals.fatGrams + meal.fatGrams,
    mealCount: totals.mealCount + 1,
  }), emptyMealTotals());

export const buildMealEntry = (input: MealEntryInput): MealEntry => {
  const createdAt = input.createdAt || new Date().toISOString();
  const date = input.date || formatLocalDateKey();
  const name = cleanName(input.name);

  return {
    id: input.id || `meal-${date}-${createdAt}`,
    date,
    mealType: input.mealType || 'custom',
    name,
    calories: toPositiveNumber(input.calories),
    proteinGrams: toPositiveNumber(input.proteinGrams),
    carbGrams: toPositiveNumber(input.carbGrams),
    fatGrams: toPositiveNumber(input.fatGrams),
    source: input.source || 'manual',
    createdAt,
    ...(input.photoName ? { photoName: input.photoName } : {}),
    ...(input.estimateNote ? { estimateNote: input.estimateNote } : {}),
  };
};

export const upsertMealEntry = (entries: MealEntry[], meal: MealEntry) => {
  const existing = entries.some((entry) => entry.id === meal.id);
  return existing
    ? entries.map((entry) => (entry.id === meal.id ? meal : entry))
    : [meal, ...entries];
};

export const removeMealEntry = (entries: MealEntry[], mealId: string) =>
  entries.filter((entry) => entry.id !== mealId);
