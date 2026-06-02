import type { ActiveLoadout, SavedExercise } from './storage';
import { getActiveSplitDay, getSplitFamilyForLoadout, type SplitDayId } from './splitSystem.ts';

export type TrainingHeroSummary = {
  eyebrow: string;
  headline: string;
  planLabel: string;
  activeDay: string;
  totalSets: number;
  exerciseCount: number;
  timeCap: string;
  missionLine: string;
  proofLine: string;
};

export type TrainingProgramCardSummary = {
  split: SplitDayId;
  familyId: string;
  familyLabel: string;
  name: string;
  meta: string;
  accent: 'Today' | 'Next' | 'Base';
  sets: string;
  exercises: string;
  badge?: string;
  path: string;
};

const DEFAULT_PLAN_LABEL = 'PPL';
const DEFAULT_ACTIVE_DAY = 'Push';
const DEFAULT_EXERCISE_COUNT = 6;
const DEFAULT_TOTAL_SETS = 16;
const DEFAULT_TIME_CAP = '45 min';

const getSetTotal = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getTrainingSetTotal = (exercises: SavedExercise[] = []) => exercises.reduce((total, exercise) => total + getSetTotal(exercise.sets), 0);

export const getActiveLoadoutDay = (activeLoadout: ActiveLoadout | null | undefined, date: Pick<Date, 'getDay'> = new Date()) => getActiveSplitDay(activeLoadout, date).name || DEFAULT_ACTIVE_DAY;

const cleanTimeCap = (time: string | undefined) => {
  const clean = (time || '').trim();
  return clean || DEFAULT_TIME_CAP;
};

const getDefaultSetCount = (dayId: SplitDayId) => dayId === 'legs' || dayId === 'lower-a' || dayId === 'lower-b' ? 18 : 16;

const getDefaultExerciseCount = (dayId: SplitDayId) => dayId === 'legs' || dayId === 'lower-a' || dayId === 'lower-b' ? 7 : 6;

const getNextSplit = (split: SplitDayId, splitOrder: SplitDayId[]) => {
  const currentIndex = Math.max(0, splitOrder.indexOf(split));
  return splitOrder[(currentIndex + 1) % splitOrder.length];
};

export const buildTrainingProgramCards = (activeLoadout: ActiveLoadout | null, date: Pick<Date, 'getDay'> = new Date()): TrainingProgramCardSummary[] => {
  const summary = buildTrainingHeroSummary(activeLoadout, date);
  const family = getSplitFamilyForLoadout(activeLoadout);
  const todaySplit = getActiveSplitDay(activeLoadout, date).id;
  const splitOrder = family.days.map((day) => day.id);
  const nextSplit = getNextSplit(todaySplit, splitOrder);

  return family.days.map((day) => {
    const isToday = day.id === todaySplit;
    const isNext = day.id === nextSplit;
    const loadedToday = isToday && Boolean(activeLoadout);
    const defaultSets = getDefaultSetCount(day.id);
    const defaultExercises = getDefaultExerciseCount(day.id);

    return {
      split: day.id,
      familyId: family.id,
      familyLabel: family.shortLabel,
      name: isToday ? `${summary.activeDay} Day` : `${day.name} Day`,
      meta: loadedToday ? activeLoadout?.goal || day.focus : day.focus,
      accent: isToday ? 'Today' : isNext ? 'Next' : 'Base',
      sets: isToday ? `${summary.totalSets} sets` : `${defaultSets} sets`,
      exercises: isToday ? `${summary.exerciseCount} exercises` : `${defaultExercises} exercises`,
      badge: isToday ? 'TODAY' : undefined,
      path: day.path || `/exercise?split=${day.id}`,
    };
  });
};

export const buildTrainingHeroSummary = (activeLoadout: ActiveLoadout | null, date: Pick<Date, 'getDay'> = new Date()): TrainingHeroSummary => {
  const activeDay = getActiveLoadoutDay(activeLoadout, date);
  const planLabel = activeLoadout?.label || DEFAULT_PLAN_LABEL;
  const exerciseCount = activeLoadout?.exercises.length || DEFAULT_EXERCISE_COUNT;
  const totalSets = activeLoadout ? getTrainingSetTotal(activeLoadout.exercises) || DEFAULT_TOTAL_SETS : DEFAULT_TOTAL_SETS;
  const timeCap = cleanTimeCap(activeLoadout?.time);

  if (!activeLoadout) {
    return {
      eyebrow: 'TODAY\'S TRAINING',
      headline: 'Train today',
      planLabel,
      activeDay,
      totalSets,
      exerciseCount,
      timeCap,
      missionLine: 'Start the default push session. Keep it simple, controlled, and logged.',
      proofLine: `Log the work: ${totalSets} sets • ${exerciseCount} moves • ${timeCap}.`,
    };
  }

  return {
    eyebrow: 'LOADED TODAY',
    headline: `${activeDay} day ready`,
    planLabel,
    activeDay,
    totalSets,
    exerciseCount,
    timeCap,
    missionLine: `Open ${planLabel}. Finish the next honest session, then turn it into proof.`,
    proofLine: `Proof target: ${totalSets} sets • ${exerciseCount} moves • ${timeCap}.`,
  };
};
