import type { IronHabitData } from './storage';

export type TalkNextMoveAction = 'check-in' | 'rescue' | 'workout' | 'seed-workout' | 'proof' | 'victory-card';

export type TalkNextMove = {
  label: string;
  title: string;
  detail: string;
  command: string;
  reply: string;
  path: string;
  action: TalkNextMoveAction;
  status: string;
};

const hasTrainingToday = (data: IronHabitData, todayKey: string) => data.fitnessEntries.some((entry) => entry.date === todayKey);

const hasWorkoutProofToday = (data: IronHabitData, todayKey: string) => data.completedLoadouts.some((entry) => entry.date === todayKey)
  || data.latestVictoryProof?.date === todayKey;

const hasSupportContact = (data: IronHabitData) => Boolean(data.profile.supportName?.trim() || data.profile.supportPhone?.trim());

export const buildTalkNextMove = (data: IronHabitData, todayKey: string): TalkNextMove => {
  const todaysCheckIn = data.checkIns[todayKey];
  const trainedToday = hasTrainingToday(data, todayKey);
  const proofToday = hasWorkoutProofToday(data, todayKey);
  const supportReady = hasSupportContact(data);

  if (todaysCheckIn && todaysCheckIn.craving >= 7) {
    return {
      label: 'Rescue first',
      title: supportReady ? 'Open the rescue chain now' : 'Open Rescue and add human backup',
      detail: supportReady
        ? `Craving is logged at ${todaysCheckIn.craving}/10. Start the 10-minute chain and use your safe person before training or proof.`
        : `Craving is logged at ${todaysCheckIn.craving}/10. Start Rescue now, then save a support contact so the next spike has a human handoff.`,
      command: 'I need help now',
      reply: `Next move: craving is ${todaysCheckIn.craving}/10, so Rescue comes first. Opening the support chain now.`,
      path: '/rescue?chain=1',
      action: 'rescue',
      status: `Craving ${todaysCheckIn.craving}/10`,
    };
  }

  if (!todaysCheckIn) {
    return {
      label: 'First move',
      title: 'Log today’s check-in',
      detail: 'Give Talk the sober status, mood, and craving level first. The rest of the day routes from that truth.',
      command: 'Log check-in',
      reply: 'Next move: log today’s check-in. Opening it now.',
      path: '/check-in',
      action: 'check-in',
      status: 'Check-in open',
    };
  }

  if (!trainedToday) {
    if (data.activeLoadout) {
      return {
        label: 'Next rep',
        title: 'Run today’s workout',
        detail: `${data.activeLoadout.title} is loaded. Start the session, keep it clean, then log proof.`,
        command: 'Start my workout',
        reply: 'Next move: run today’s routine. Opening Workout Mode.',
        path: '/workout-mode',
        action: 'workout',
        status: 'Training open',
      };
    }

    return {
      label: 'Build structure',
      title: 'Seed a starter loadout',
      detail: 'Check-in is done, but Train has no plan yet. Talk can create a starter routine and open Workout Mode.',
      command: 'Start my workout',
      reply: 'Next move: starter loadout seeded. Opening Workout Mode.',
      path: '/workout-mode',
      action: 'seed-workout',
      status: 'No loadout',
    };
  }

  if (!proofToday) {
    return {
      label: 'Proof',
      title: 'Make the work visible',
      detail: 'Check-in and training are stacked. Open Proof so the win becomes a receipt, not just a memory.',
      command: 'Show my proof',
      reply: 'Next move: show proof and make the win visible. Opening Proof.',
      path: '/proof',
      action: 'proof',
      status: 'Proof open',
    };
  }

  return {
    label: 'Share the win',
    title: 'Make a Victory Card',
    detail: 'Today has check-in, training, and proof. Turn the streak into something shareable.',
    command: 'Make a Victory Card',
    reply: 'Next move: Victory Card. Share the proof without overexplaining.',
    path: '/share-progress',
    action: 'victory-card',
    status: 'Daily loop complete',
  };
};
