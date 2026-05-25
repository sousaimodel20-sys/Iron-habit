import { formatLocalDateKey } from './date';

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

export type SavedExercise = {
  name: string;
  muscle: string;
  equipment: string;
  sets: string;
  reps: string;
  rest: string;
  cue: string;
  mistake: string;
  swap: string;
  icon: string;
};

export type ActiveLoadout = {
  id: string;
  templateId: string;
  title: string;
  label: string;
  goal: string;
  time: string;
  level: string;
  days: string[];
  intent: string;
  finisher: string;
  exercises: SavedExercise[];
  createdAt: string;
};

export type CompletedLoadout = {
  id: string;
  date: string;
  title: string;
  label: string;
  activeDay: string;
  durationMinutes: number;
  intensity: string;
  exercises: string[];
  completedSets: number;
  totalSets: number;
  finisher: string;
  proofCopy: string;
};

export type Profile = {
  name: string;
  sobrietyDate: string;
  why: string;
  focus: string;
  averageDrinkCost: string;
  drinksPerDay: string;
  caloriesPerDrink: string;
  transformationGoal: string;
  supportLocation: string;
  supportName: string;
  supportPhone: string;
};

export type BodyProfile = {
  sex: string;
  age: string;
  heightInches: string;
  weightLbs: string;
  goalWeightLbs: string;
  activityLevel: string;
  trainingDaysPerWeek: string;
  bodyGoal: string;
  pace: string;
  updatedAt: string;
};

export type IronHabitData = {
  profile: Profile;
  bodyProfile: BodyProfile;
  checkIns: Record<string, CheckIn>;
  habits: Habit[];
  fitnessEntries: FitnessEntry[];
  activeLoadout: ActiveLoadout | null;
  completedLoadouts: CompletedLoadout[];
  latestVictoryProof: CompletedLoadout | null;
};

const STORAGE_KEY = 'iron-habit-data';

const today = () => formatLocalDateKey();

export const defaultData: IronHabitData = {
  profile: {
    name: '',
    sobrietyDate: today(),
    why: 'Build a body and life I am proud of.',
    focus: 'sobriety-strength-discipline',
    averageDrinkCost: '8',
    drinksPerDay: '4',
    caloriesPerDrink: '150',
    transformationGoal: 'Lean, sober, strong, and consistent.',
    supportLocation: '',
    supportName: '',
    supportPhone: '',
  },
  bodyProfile: {
    sex: '',
    age: '',
    heightInches: '',
    weightLbs: '',
    goalWeightLbs: '',
    activityLevel: 'moderate',
    trainingDaysPerWeek: '4',
    bodyGoal: 'recomposition',
    pace: 'steady',
    updatedAt: '',
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
  activeLoadout: null,
  completedLoadouts: [],
  latestVictoryProof: null,
};

export const loadData = (): IronHabitData => {
  if (typeof localStorage === 'undefined') return defaultData;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<IronHabitData>;

    return {
      profile: { ...defaultData.profile, ...(parsed.profile || {}) },
      bodyProfile: { ...defaultData.bodyProfile, ...(parsed.bodyProfile || {}) },
      checkIns: parsed.checkIns || {},
      habits: parsed.habits || defaultData.habits,
      fitnessEntries: parsed.fitnessEntries || [],
      activeLoadout: parsed.activeLoadout || null,
      completedLoadouts: parsed.completedLoadouts || [],
      latestVictoryProof: parsed.latestVictoryProof || null,
    };
  } catch {
    return defaultData;
  }
};

export const saveData = (updates: Partial<IronHabitData>) => {
  const current = loadData();
  const merged: IronHabitData = {
    ...current,
    ...updates,
    profile: { ...current.profile, ...(updates.profile || {}) },
    bodyProfile: { ...current.bodyProfile, ...(updates.bodyProfile || {}) },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.dispatchEvent(new Event('iron-habit-data-updated'));
  return merged;
};

export const replaceData = (data: IronHabitData) => {
  const merged: IronHabitData = {
    ...defaultData,
    ...data,
    profile: { ...defaultData.profile, ...(data.profile || {}) },
    bodyProfile: { ...defaultData.bodyProfile, ...(data.bodyProfile || {}) },
    checkIns: data.checkIns || {},
    habits: data.habits || defaultData.habits,
    fitnessEntries: data.fitnessEntries || [],
    activeLoadout: data.activeLoadout || null,
    completedLoadouts: data.completedLoadouts || [],
    latestVictoryProof: data.latestVictoryProof || null,
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
