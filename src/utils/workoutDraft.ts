import { formatLocalDateKey } from './date';
import type { ActiveLoadout } from './storage';

export type WorkoutDraft = Record<string, number>;

export const setsAsNumber = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

export const getWorkoutDraftKey = (loadoutTitle?: string) => {
  if (!loadoutTitle) return '';
  return `iron-habit-workout-draft:${formatLocalDateKey()}:${loadoutTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
};

export const loadWorkoutDraft = (loadoutTitle?: string): WorkoutDraft => {
  const key = getWorkoutDraftKey(loadoutTitle);
  if (!key || typeof window === 'undefined') return {};

  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(key) || '{}') as WorkoutDraft;
    return Object.fromEntries(Object.entries(parsed).filter(([, value]) => Number.isFinite(value) && value > 0));
  } catch {
    return {};
  }
};

export const getWorkoutDraftSummary = (loadout?: ActiveLoadout | null) => {
  if (!loadout) {
    return { draft: {}, completedSets: 0, totalSets: 0, hasDraft: false };
  }

  const draft = loadWorkoutDraft(loadout.title);
  const totalSets = loadout.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0);
  const completedSets = loadout.exercises.reduce(
    (sum, item) => sum + Math.min(draft[item.name] || 0, setsAsNumber(item.sets)),
    0,
  );

  return {
    draft,
    completedSets,
    totalSets,
    hasDraft: completedSets > 0 && completedSets < totalSets,
  };
};
