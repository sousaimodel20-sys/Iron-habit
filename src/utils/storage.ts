export type CheckIn = {
  date: string;
  sober: boolean;
  mood: string;
  craving: number;
  note: string;
  habitsCompleted: string[];
};

export type Habit = {
  id: string;
  title: string;
  why: string;
  cadence: string;
  createdAt: string;
};

export type FitnessEntry = {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
  intensity: string;
  note: string;
};

export type Profile = {
  name: string;
  sobrietyDate: string;
  why: string;
  focus: string;
};

export type IronHabitData = {
  profile: Profile;
  checkIns: Record<string, CheckIn>;
  habits: Habit[];
  fitnessEntries: FitnessEntry[];
};

const STORAGE_KEY = 'iron-habit-data';

const today = () => new Date().toISOString().slice(0, 10);

export const defaultData: IronHabitData = {
  profile: {
    name: '',
    sobrietyDate: today(),
    why: 'Build a body and life I am proud of.',
    focus: 'sobriety-strength-discipline',
  },
  checkIns: {},
  habits: [
    {
      id: 'default-water',
      title: 'Drink water before coffee',
      why: 'Start the day with control.',
      cadence: 'Daily',
      createdAt: today(),
    },
    {
      id: 'default-gym',
      title: 'Move for 20+ minutes',
      why: 'Earn momentum with the body.',
      cadence: 'Daily',
      createdAt: today(),
    },
  ],
  fitnessEntries: [],
};

export const loadData = (): IronHabitData => {
  if (typeof localStorage === 'undefined') return defaultData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<IronHabitData>;

    return {
      profile: { ...defaultData.profile, ...(parsed.profile || {}) },
      checkIns: parsed.checkIns || {},
      habits: parsed.habits || defaultData.habits,
      fitnessEntries: parsed.fitnessEntries || [],
    };
  } catch {
    return defaultData;
  }
};

export const saveData = (updates: Partial<IronHabitData>) => {
  const merged: IronHabitData = {
    ...loadData(),
    ...updates,
    profile: { ...loadData().profile, ...(updates.profile || {}) },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event('iron-habit-data-updated'));
  return merged;
};

export const resetData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('iron-habit-data-updated'));
};

export const getTodayKey = today;
