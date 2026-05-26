import type { ActiveLoadout } from './storage';

export const createStarterLoadout = (): ActiveLoadout => {
  const now = new Date();
  return {
    id: `starter-loadout-${now.getTime()}`,
    templateId: 'starter-sober-strength',
    title: '20-Min Sober Strength Loadout',
    label: 'Push Pull Legs',
    goal: 'Build muscle and stay locked in',
    time: '20',
    level: 'Intermediate',
    days: ['Push', 'Pull', 'Legs'],
    intent: 'Starter sober strength routine',
    finisher: '2-minute incline walk breathing reset',
    createdAt: now.toISOString(),
    exercises: [
      {
        name: 'Incline Dumbbell Press',
        muscle: 'Chest',
        equipment: 'Dumbbells',
        sets: '2',
        reps: '8–10',
        rest: '90 sec',
        cue: 'Shoulders packed, press with control.',
        mistake: 'Do not bounce or flare elbows hard.',
        swap: 'Push-ups or machine press.',
        icon: '▲',
      },
      {
        name: 'Lat Pulldown',
        muscle: 'Back',
        equipment: 'Cable',
        sets: '2',
        reps: '10–12',
        rest: '75 sec',
        cue: 'Pull elbows to ribs.',
        mistake: 'Do not turn it into a curl.',
        swap: 'Assisted pull-up or row.',
        icon: '↓',
      },
      {
        name: 'Goblet Squat',
        muscle: 'Legs',
        equipment: 'Dumbbell',
        sets: '2',
        reps: '10–12',
        rest: '75 sec',
        cue: 'Brace, sit between the hips.',
        mistake: 'Do not collapse knees in.',
        swap: 'Leg press.',
        icon: '◆',
      },
    ],
  };
};
