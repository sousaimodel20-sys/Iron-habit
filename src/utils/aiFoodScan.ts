export type FoodScanEstimate = {
  name: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  confidence: 'High' | 'Medium' | 'Low';
  estimateNote: string;
  items: string[];
};

export type FoodScanUsage = {
  date: string;
  count: number;
  limit: number;
  remaining: number;
};

const DAILY_SCAN_LIMIT = 3;

const fileHints = [
  {
    tokens: ['chicken', 'rice', 'bowl', 'plate'],
    estimate: {
      name: 'Chicken rice bowl',
      calories: 650,
      proteinGrams: 52,
      carbGrams: 58,
      fatGrams: 18,
      confidence: 'Medium' as const,
      items: ['chicken breast', 'rice', 'vegetables'],
    },
  },
  {
    tokens: ['egg', 'toast', 'breakfast'],
    estimate: {
      name: 'Eggs and toast',
      calories: 430,
      proteinGrams: 25,
      carbGrams: 34,
      fatGrams: 22,
      confidence: 'Medium' as const,
      items: ['eggs', 'toast'],
    },
  },
  {
    tokens: ['shake', 'protein', 'smoothie'],
    estimate: {
      name: 'Protein shake',
      calories: 240,
      proteinGrams: 32,
      carbGrams: 14,
      fatGrams: 6,
      confidence: 'High' as const,
      items: ['protein powder', 'liquid base'],
    },
  },
  {
    tokens: ['salad', 'greens'],
    estimate: {
      name: 'Protein salad',
      calories: 520,
      proteinGrams: 38,
      carbGrams: 26,
      fatGrams: 28,
      confidence: 'Low' as const,
      items: ['greens', 'lean protein', 'dressing'],
    },
  },
];

const fallbackEstimate = {
  name: 'Reviewed meal estimate',
  calories: 610,
  proteinGrams: 42,
  carbGrams: 52,
  fatGrams: 22,
  confidence: 'Low' as const,
  items: ['visible protein', 'carb source', 'vegetables or sauce'],
};

export const getFoodScanDailyLimit = () => DAILY_SCAN_LIMIT;

export const getFoodScanUsage = (date: string, storage: Pick<Storage, 'getItem'> = localStorage): FoodScanUsage => {
  const raw = storage.getItem(`iron-habit-food-scan-usage-${date}`);
  const count = raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0;
  const remaining = Math.max(0, DAILY_SCAN_LIMIT - count);

  return { date, count, limit: DAILY_SCAN_LIMIT, remaining };
};

export const recordMockFoodScan = (date: string, storage: Pick<Storage, 'getItem' | 'setItem'> = localStorage): FoodScanUsage => {
  const usage = getFoodScanUsage(date, storage);
  const nextCount = Math.min(DAILY_SCAN_LIMIT, usage.count + 1);
  storage.setItem(`iron-habit-food-scan-usage-${date}`, String(nextCount));

  return {
    date,
    count: nextCount,
    limit: DAILY_SCAN_LIMIT,
    remaining: Math.max(0, DAILY_SCAN_LIMIT - nextCount),
  };
};

export const canRunMockFoodScan = (date: string, storage: Pick<Storage, 'getItem'> = localStorage) =>
  getFoodScanUsage(date, storage).remaining > 0;

export const buildMockFoodScanEstimate = (photoName: string): FoodScanEstimate => {
  const normalized = photoName.toLowerCase();
  const matched = fileHints.find((hint) => hint.tokens.some((token) => normalized.includes(token)));
  const estimate = matched?.estimate || fallbackEstimate;

  return {
    ...estimate,
    estimateNote: `${estimate.confidence} confidence mock scan — editable estimate only. Real AI stays off until an API key and spending cap are approved.`,
  };
};
