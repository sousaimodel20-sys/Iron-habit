import { formatLocalDateKey } from './date.ts';
import type { FavoriteMeal, IronHabitData, MealEntry, MealSource, MealType } from './storage';

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

const favoriteIdForName = (name: string) => {
  const slug = cleanName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `favorite-${slug || 'meal'}`;
};

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

export const buildManualMealEntry = (input: MealEntryInput): MealEntry =>
  buildMealEntry({
    ...input,
    source: 'manual',
    estimateNote: input.estimateNote || 'Manual food entry.',
  });

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

export const buildFavoriteMeal = (input: MealEntryInput | MealEntry, createdAt = new Date().toISOString()): FavoriteMeal => {
  const name = cleanName(input.name);

  return {
    id: input.id && !input.id.startsWith('meal-') && !input.id.startsWith('manual-') ? input.id : favoriteIdForName(name),
    mealType: input.mealType || 'custom',
    name,
    calories: toPositiveNumber(input.calories),
    proteinGrams: toPositiveNumber(input.proteinGrams),
    carbGrams: toPositiveNumber(input.carbGrams),
    fatGrams: toPositiveNumber(input.fatGrams),
    createdAt,
  };
};

export const addFavoriteMeal = (favorites: FavoriteMeal[], favorite: FavoriteMeal) => {
  const existing = favorites.some((entry) => entry.id === favorite.id);
  return existing
    ? favorites.map((entry) => (entry.id === favorite.id ? favorite : entry))
    : [favorite, ...favorites];
};

export const removeFavoriteMeal = (favorites: FavoriteMeal[], favoriteId: string) =>
  favorites.filter((entry) => entry.id !== favoriteId);

export const buildMealEntryFromFavorite = (favorite: FavoriteMeal, date = formatLocalDateKey(), createdAt = new Date().toISOString()): MealEntry =>
  buildMealEntry({
    id: `meal-${date}-${createdAt}`,
    date,
    mealType: favorite.mealType,
    name: favorite.name,
    calories: favorite.calories,
    proteinGrams: favorite.proteinGrams,
    carbGrams: favorite.carbGrams,
    fatGrams: favorite.fatGrams,
    source: 'quick-add',
    createdAt,
    estimateNote: 'Added from saved favorite.',
  });
