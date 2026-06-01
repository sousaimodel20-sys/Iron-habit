import type { ActiveLoadout, SavedExercise } from './storage';

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

const cleanTimeCap = (time: string | undefined) => {
  const clean = (time || '').trim();
  return clean || DEFAULT_TIME_CAP;
};

export const buildTrainingHeroSummary = (activeLoadout: ActiveLoadout | null): TrainingHeroSummary => {
  const activeDay = activeLoadout?.days?.[0] || DEFAULT_ACTIVE_DAY;
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
