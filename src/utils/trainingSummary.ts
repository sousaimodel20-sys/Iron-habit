import type { ActiveLoadout, SavedExercise } from './storage';
import { defaultSplitFamily, getActiveSplitDay, getSplitFamilyForLoadout } from './splitSystem.ts';

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
  split: 'push' | 'pull' | 'legs';
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

const splitOrder: TrainingProgramCardSummary['split'][] = defaultSplitFamily.days.map((day) => day.id as TrainingProgramCardSummary['split']);

const splitDefaults: Record<TrainingProgramCardSummary['split'], Omit<TrainingProgramCardSummary, 'accent' | 'badge' | 'path'>> = {
  push: { split: 'push', name: 'Push Day', meta: defaultSplitFamily.days[0].focus, sets: '16 sets', exercises: '6 exercises' },
  pull: { split: 'pull', name: 'Pull Day', meta: defaultSplitFamily.days[1].focus, sets: '16 sets', exercises: '6 exercises' },
  legs: { split: 'legs', name: 'Legs Day', meta: defaultSplitFamily.days[2].focus, sets: '18 sets', exercises: '7 exercises' },
};

const normalizeSplit = (day: string): TrainingProgramCardSummary['split'] => {
  const clean = day.toLowerCase();
  if (clean.includes('pull')) return 'pull';
  if (clean.includes('leg')) return 'legs';
  return 'push';
};

const getNextSplit = (split: TrainingProgramCardSummary['split']) => splitOrder[(splitOrder.indexOf(split) + 1) % splitOrder.length];

export const buildTrainingProgramCards = (activeLoadout: ActiveLoadout | null): TrainingProgramCardSummary[] => {
  const summary = buildTrainingHeroSummary(activeLoadout);
  const family = getSplitFamilyForLoadout(activeLoadout);
  const todaySplit = family.id === 'ppl' ? normalizeSplit(summary.activeDay) : 'push';
  const nextSplit = getNextSplit(todaySplit);

  return splitOrder.map((split) => {
    const defaults = splitDefaults[split];
    const isToday = split === todaySplit;
    const isNext = split === nextSplit;
    const loadedToday = isToday && Boolean(activeLoadout);

    return {
      ...defaults,
      name: isToday ? `${summary.activeDay} Day` : defaults.name,
      meta: loadedToday ? activeLoadout?.goal || defaults.meta : defaults.meta,
      accent: isToday ? 'Today' : isNext ? 'Next' : 'Base',
      sets: isToday ? `${summary.totalSets} sets` : defaults.sets,
      exercises: isToday ? `${summary.exerciseCount} exercises` : defaults.exercises,
      badge: isToday ? 'TODAY' : undefined,
      path: `/exercise?split=${split}`,
    };
  });
};

export const buildTrainingHeroSummary = (activeLoadout: ActiveLoadout | null): TrainingHeroSummary => {
  const activeDay = getActiveLoadoutDay(activeLoadout);
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
