import type { ActiveLoadout, CompletedLoadout, CheckIn, FitnessEntry } from './storage';

export type DailyMissionStage = 'check-in' | 'build-loadout' | 'train' | 'proof' | 'complete';

export type DailyMissionInput = {
  checkIns: Record<string, CheckIn>;
  fitnessEntries: FitnessEntry[];
  activeLoadout: ActiveLoadout | null;
  latestVictoryProof: CompletedLoadout | null;
};

export type DailyMissionAction = {
  stage: DailyMissionStage;
  title: string;
  detail: string;
  to: string;
  cta: string;
};

export type DailyMissionStep = {
  label: 'Check in' | 'Train' | 'Proof';
  done: boolean;
  active: boolean;
  to: string;
};

export type DailyMissionState = {
  todayCheckIn: CheckIn | undefined;
  trainedToday: boolean;
  proofDoneToday: boolean;
  primaryMission: DailyMissionAction;
  missionSteps: DailyMissionStep[];
  completionLabel: string;
  nextBestMove: string;
  heroTag: string;
  proofAction: string;
};

export const computeDailyMissionState = (data: DailyMissionInput, todayKey: string): DailyMissionState => {
  const todayCheckIn = data.checkIns[todayKey];
  const trainedToday = data.fitnessEntries.some((entry) => entry.date === todayKey);
  const proofDoneToday = data.latestVictoryProof?.date === todayKey;

  const primaryMission: DailyMissionAction = !todayCheckIn
    ? {
        stage: 'check-in',
        title: "Step 1: Lock today's check-in",
        detail: 'No shame. No spiral. Just an honest check-in. Protect today first.',
        to: '/daily-check-in',
        cta: 'Lock In',
      }
    : !trainedToday
      ? data.activeLoadout
        ? {
            stage: 'train',
            title: `Step 2: Run ${data.activeLoadout.title}`,
            detail: 'Check-in is protected. Move your body and turn discipline into proof.',
            to: '/workout-mode',
            cta: 'Start Workout',
          }
        : {
            stage: 'build-loadout',
            title: 'Step 2: Build today’s training loadout',
            detail: 'Stay sober. Move your body. Keep the promise small enough to win.',
            to: '/train',
            cta: 'Start Starter Loadout',
          }
      : !proofDoneToday
        ? {
            stage: 'proof',
            title: 'Step 3: Stack today’s proof',
            detail: 'Training is done. Save the receipt so the old loop has evidence against it.',
            to: data.latestVictoryProof ? '/share-progress' : '/proof',
            cta: data.latestVictoryProof ? 'Make Victory Card' : 'Open Proof',
          }
        : {
            stage: 'complete',
            title: 'Today is protected. Chain stays alive.',
            detail: 'Check-in, training, and proof are locked. You did what the old version would not do.',
            to: '/share-progress',
            cta: 'Open Victory Card',
          };

  const missionSteps: DailyMissionStep[] = [
    { label: 'Check in', done: Boolean(todayCheckIn), active: primaryMission.stage === 'check-in', to: '/daily-check-in' },
    { label: 'Train', done: trainedToday, active: primaryMission.stage === 'build-loadout' || primaryMission.stage === 'train', to: data.activeLoadout ? '/workout-mode' : '/train' },
    { label: 'Proof', done: proofDoneToday, active: primaryMission.stage === 'proof' || primaryMission.stage === 'complete', to: proofDoneToday || data.latestVictoryProof ? '/share-progress' : '/proof' },
  ];

  const completedCount = missionSteps.filter((step) => step.done).length;
  const completionLabel = `${completedCount}/3 locked`;

  const nextBestMove = primaryMission.stage === 'complete'
    ? 'Today is protected. Open the Victory Card or come back tomorrow and defend the chain again.'
    : primaryMission.detail;

  const heroTag = primaryMission.stage === 'complete'
    ? 'TODAY PROTECTED'
    : primaryMission.stage === 'check-in'
      ? 'ACTION: LOCK IN'
      : primaryMission.stage === 'proof'
        ? 'ACTION: STACK PROOF'
        : 'ACTION: MOVE BODY';

  const proofAction = proofDoneToday
    ? 'Victory Card ready'
    : trainedToday
      ? 'Stack today’s proof'
      : data.latestVictoryProof
        ? 'Open latest receipt'
        : 'Earn first receipt';

  return {
    todayCheckIn,
    trainedToday,
    proofDoneToday,
    primaryMission,
    missionSteps,
    completionLabel,
    nextBestMove,
    heroTag,
    proofAction,
  };
};
