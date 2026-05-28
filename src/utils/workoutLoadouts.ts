const mediaBase = '/exercise-media';

export type Exercise = {
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
  mediaUrl?: string;
  mediaAlt?: string;
};

export type Loadout = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  days: string[];
  intent: string;
  finisher: string;
  exercises: Exercise[];
};

const img = (path: string) => `${mediaBase}/${path}`;

const exercise = (
  item: Omit<Exercise, 'mediaAlt'> & { mediaAlt?: string },
): Exercise => ({
  ...item,
  mediaAlt: item.mediaAlt || `${item.name} exercise demo image`,
});

export const loadouts: Loadout[] = [
  {
    id: 'full-body',
    label: 'Full Body',
    title: '3-Day Full Body Base',
    subtitle: 'The safest beginner/intermediate split: train everything 2–3 times weekly without living in the gym.',
    days: ['Full Body A', 'Rest / Walk', 'Full Body B', 'Rest / Meeting', 'Full Body C', 'Zone 2', 'Recovery'],
    intent: 'Build the base: squat, press, pull, hinge, carry. Simple enough to repeat when life gets loud.',
    finisher: '8-minute incline walk. Leave with proof, not exhaustion.',
    exercises: [
      exercise({ name: 'Goblet Squat', muscle: 'Quads • Glutes', equipment: 'Dumbbell', sets: '3', reps: '10–12', rest: '75 sec', cue: 'Chest tall, elbows inside knees, own the depth.', mistake: 'Do not fold forward or let knees cave.', swap: 'Leg press', icon: '⬟', mediaUrl: img('Goblet_Squat/0.jpg') }),
      exercise({ name: 'Dumbbell Bench Press', muscle: 'Chest • Triceps', equipment: 'Dumbbells', sets: '3', reps: '8–12', rest: '90 sec', cue: 'Shoulder blades pinned. Press smooth.', mistake: 'Do not flare elbows high.', swap: 'Push-up', icon: '▰', mediaUrl: img('Dumbbell_Bench_Press/0.jpg') }),
      exercise({ name: 'Seated Cable Row', muscle: 'Back • Biceps', equipment: 'Cable', sets: '3', reps: '10–12', rest: '75 sec', cue: 'Pull elbows back and pause.', mistake: 'Do not yank with your lower back.', swap: 'One-arm dumbbell row', icon: '◈', mediaUrl: img('Seated_Cable_Rows/0.jpg') }),
      exercise({ name: 'Romanian Deadlift', muscle: 'Hamstrings • Glutes', equipment: 'Barbell', sets: '3', reps: '8–10', rest: '2 min', cue: 'Hinge. Stretch. Stand tall.', mistake: 'Do not round your spine.', swap: 'Dumbbell RDL', icon: '⬢', mediaUrl: img('Romanian_Deadlift/0.jpg') }),
    ],
  },
  {
    id: 'ppl',
    label: 'Push Pull Legs',
    title: 'PPL Mass Loadout',
    subtitle: 'A 3- or 6-day sober-fitness split built for size, strength, and daily structure.',
    days: ['Push', 'Pull', 'Legs', 'Push Volume', 'Pull Volume', 'Legs + Core', 'Recovery / Meeting'],
    intent: 'Build muscle without overthinking. Show up, move iron, protect the streak.',
    finisher: '10-minute incline walk. Breathe through the craving before it becomes a vote.',
    exercises: [
      exercise({ name: 'Incline Dumbbell Press', muscle: 'Chest • Front delts', equipment: 'Dumbbells', sets: '4', reps: '8–10', rest: '90 sec', cue: 'Shoulders pinned. Control the negative. Press like proof.', mistake: 'Do not flare elbows high.', swap: 'Machine chest press', icon: '◆', mediaUrl: img('Incline_Dumbbell_Press/0.jpg') }),
      exercise({ name: 'Seated Shoulder Press', muscle: 'Shoulders • Triceps', equipment: 'Dumbbells', sets: '3', reps: '8–12', rest: '90 sec', cue: 'Brace ribs down and drive straight overhead.', mistake: 'Do not arch your back to steal reps.', swap: 'Landmine press', icon: '▲', mediaUrl: img('Seated_Dumbbell_Press/0.jpg') }),
      exercise({ name: 'Lat Pulldown', muscle: 'Lats • Biceps', equipment: 'Cable', sets: '4', reps: '10–12', rest: '75 sec', cue: 'Pull elbows to pockets. Chest tall.', mistake: 'Do not yank with your lower back.', swap: 'Assisted pull-up', icon: '▼', mediaUrl: img('Full_Range-Of-Motion_Lat_Pulldown/0.jpg') }),
      exercise({ name: 'Romanian Deadlift', muscle: 'Hamstrings • Glutes', equipment: 'Barbell', sets: '3', reps: '8–10', rest: '2 min', cue: 'Hinge. Stretch. Stand tall. No ego.', mistake: 'Do not round your spine.', swap: 'Dumbbell RDL', icon: '⬢', mediaUrl: img('Romanian_Deadlift/0.jpg') }),
    ],
  },
  {
    id: 'upper-lower',
    label: 'Upper / Lower',
    title: '4-Day Upper Lower Strength Split',
    subtitle: 'High-value structure for strength and muscle: upper body twice, lower body twice, recovery built in.',
    days: ['Upper Strength', 'Lower Strength', 'Rest', 'Upper Volume', 'Lower Volume', 'Walk + Core', 'Recovery'],
    intent: 'Simple weekly rhythm. Heavy enough to progress, spaced enough to recover.',
    finisher: 'Two rounds: sled push or farmer carry, then 60 seconds calm breathing.',
    exercises: [
      exercise({ name: 'Barbell Bench Press', muscle: 'Chest • Triceps', equipment: 'Barbell', sets: '4', reps: '5–8', rest: '2 min', cue: 'Feet planted, shoulder blades locked, smooth power.', mistake: 'Do not bounce off the chest.', swap: 'Dumbbell bench press', icon: '▰', mediaUrl: img('Barbell_Bench_Press_-_Medium_Grip/0.jpg') }),
      exercise({ name: 'Weighted Pull Up', muscle: 'Lats • Biceps', equipment: 'Pull-up bar', sets: '4', reps: '5–8', rest: '2 min', cue: 'Ribs down, pull chest toward bar.', mistake: 'Do not half-rep with a loose shoulder.', swap: 'Lat pulldown', icon: '▼', mediaUrl: img('Weighted_Pull_Ups/0.jpg') }),
      exercise({ name: 'Leg Press', muscle: 'Quads • Glutes', equipment: 'Machine', sets: '4', reps: '8–12', rest: '2 min', cue: 'Control the bottom, drive through the platform.', mistake: 'Do not lock knees hard at the top.', swap: 'Goblet squat', icon: '⬟', mediaUrl: img('Leg_Press/0.jpg') }),
      exercise({ name: 'Barbell Hip Thrust', muscle: 'Glutes • Hamstrings', equipment: 'Barbell', sets: '3', reps: '8–12', rest: '90 sec', cue: 'Chin tucked, ribs down, squeeze at lockout.', mistake: 'Do not overarch your lower back.', swap: 'Glute bridge', icon: '⬢', mediaUrl: img('Barbell_Hip_Thrust/0.jpg') }),
    ],
  },
  {
    id: 'bro',
    label: 'Body Part Split',
    title: '5-Day Body Part Builder',
    subtitle: 'Classic chest/back/legs/shoulders/arms split for focused hypertrophy and simple gym days.',
    days: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Optional Cardio', 'Recovery'],
    intent: 'One target per day. Chase quality volume without turning the week into chaos.',
    finisher: 'One pump set for the target muscle, then leave before junk volume takes over.',
    exercises: [
      exercise({ name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', sets: '4', reps: '6–10', rest: '2 min', cue: 'Press with control and own every rep.', mistake: 'Do not turn every set into a max.', swap: 'Machine chest press', icon: '▰', mediaUrl: img('Barbell_Bench_Press_-_Medium_Grip/0.jpg') }),
      exercise({ name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', sets: '4', reps: '8–12', rest: '90 sec', cue: 'Pause with shoulder blades squeezed.', mistake: 'Do not rock your torso.', swap: 'Chest-supported row', icon: '◈', mediaUrl: img('Seated_Cable_Rows/0.jpg') }),
      exercise({ name: 'Hack Squat', muscle: 'Quads', equipment: 'Machine', sets: '4', reps: '8–12', rest: '2 min', cue: 'Sink into strong depth and drive.', mistake: 'Do not cave knees inward.', swap: 'Leg press', icon: '⬟', mediaUrl: img('Hack_Squat/0.jpg') }),
      exercise({ name: 'Barbell Curl', muscle: 'Biceps', equipment: 'Barbell', sets: '3', reps: '10–12', rest: '60 sec', cue: 'Elbows still, squeeze hard.', mistake: 'Do not swing from the hips.', swap: 'Dumbbell curl', icon: '✦', mediaUrl: img('Barbell_Curl/0.jpg') }),
    ],
  },
  {
    id: 'arnold',
    label: 'Arnold Split',
    title: 'Arnold Armor Loadout',
    subtitle: 'Chest/back, shoulders/arms, legs — repeated for a high-volume comeback build.',
    days: ['Chest + Back', 'Shoulders + Arms', 'Legs', 'Chest + Back', 'Shoulders + Arms', 'Legs', 'Recovery / Mobility'],
    intent: 'Classic volume. Big pump. Big structure. No room for old-life chaos.',
    finisher: 'Pose-down pump: 2 rounds curls, pushdowns, lateral raises. Earn the mirror check.',
    exercises: [
      exercise({ name: 'Bench Press', muscle: 'Chest • Triceps', equipment: 'Barbell', sets: '4', reps: '6–8', rest: '2 min', cue: 'Feet planted. Shoulder blades locked. Smooth power.', mistake: 'Do not bounce off the chest.', swap: 'Dumbbell bench', icon: '▰', mediaUrl: img('Barbell_Bench_Press_-_Medium_Grip/0.jpg') }),
      exercise({ name: 'Seated Cable Row', muscle: 'Back • Rear delts', equipment: 'Cable', sets: '4', reps: '8–10', rest: '90 sec', cue: 'Drive elbows back and pause for proof.', mistake: 'Do not shrug every rep.', swap: 'One-arm DB row', icon: '◈', mediaUrl: img('Seated_Cable_Rows/0.jpg') }),
      exercise({ name: 'Lateral Raise', muscle: 'Side delts', equipment: 'Dumbbells', sets: '4', reps: '12–15', rest: '45 sec', cue: 'Lead with elbows. Stop at shoulder height.', mistake: 'Do not swing from the hips.', swap: 'Cable lateral raise', icon: '✦', mediaUrl: img('Cable_Seated_Lateral_Raise/0.jpg') }),
      exercise({ name: 'Hack Squat', muscle: 'Quads • Glutes', equipment: 'Machine', sets: '4', reps: '8–12', rest: '2 min', cue: 'Full depth you can own. Drive through the platform.', mistake: 'Do not cave knees inward.', swap: 'Goblet squat', icon: '⬟', mediaUrl: img('Hack_Squat/0.jpg') }),
    ],
  },
  {
    id: 'powerbuilding',
    label: 'Powerbuilding',
    title: 'Strength + Size Powerbuilding Split',
    subtitle: 'Heavy compounds first, hypertrophy accessories second — for lifters who want strength and visible proof.',
    days: ['Squat Focus', 'Bench Focus', 'Rest', 'Deadlift Focus', 'Press + Back', 'Pump + Arms', 'Recovery'],
    intent: 'Earn numbers and shape. Heavy sets stay clean; accessories build the armor.',
    finisher: 'Three easy sets of carries or rows. Leave stronger, not reckless.',
    exercises: [
      exercise({ name: 'Barbell Deadlift', muscle: 'Posterior chain', equipment: 'Barbell', sets: '3', reps: '3–5', rest: '3 min', cue: 'Brace, push the floor, lock out tall.', mistake: 'Do not pull with a rounded back.', swap: 'Trap bar deadlift', icon: '⬢', mediaUrl: img('Barbell_Deadlift/0.jpg') }),
      exercise({ name: 'Barbell Bench Press', muscle: 'Chest • Triceps', equipment: 'Barbell', sets: '4', reps: '4–6', rest: '2–3 min', cue: 'Consistent setup every rep.', mistake: 'Do not chase grinder reps alone.', swap: 'Dumbbell bench press', icon: '▰', mediaUrl: img('Barbell_Bench_Press_-_Medium_Grip/0.jpg') }),
      exercise({ name: 'Smith Machine Overhead Press', muscle: 'Shoulders', equipment: 'Machine', sets: '3', reps: '6–8', rest: '2 min', cue: 'Brace ribs down, press overhead.', mistake: 'Do not turn it into an incline press.', swap: 'Dumbbell shoulder press', icon: '▲', mediaUrl: img('Smith_Machine_Overhead_Shoulder_Press/0.jpg') }),
      exercise({ name: 'Face Pull', muscle: 'Rear delts • Upper back', equipment: 'Cable', sets: '3', reps: '12–15', rest: '60 sec', cue: 'Pull toward forehead, elbows high.', mistake: 'Do not shrug and rush.', swap: 'Band face pull', icon: '✦', mediaUrl: img('Face_Pull/0.jpg') }),
    ],
  },
  {
    id: 'dumbbell',
    label: 'Dumbbells Only',
    title: 'Home Gym Discipline Loadout',
    subtitle: 'A practical hypertrophy plan when all you have is dumbbells and discipline.',
    days: ['Upper A', 'Lower A', 'Walk + Core', 'Upper B', 'Lower B', 'Pump Circuit', 'Recovery'],
    intent: 'No machines, no excuses. Build the body with what is in front of you.',
    finisher: '5-minute farmer carry or suitcase hold. Grip the new life tighter.',
    exercises: [
      exercise({ name: 'Goblet Squat', muscle: 'Quads • Glutes', equipment: 'Dumbbell', sets: '4', reps: '10–15', rest: '75 sec', cue: 'Chest proud. Elbows inside knees. Own the depth.', mistake: 'Do not fold forward.', swap: 'Split squat', icon: '⬟', mediaUrl: img('Goblet_Squat/0.jpg') }),
      exercise({ name: 'One-Arm Row', muscle: 'Back • Biceps', equipment: 'Dumbbell', sets: '4', reps: '10/side', rest: '60 sec', cue: 'Pull elbow to hip and pause.', mistake: 'Do not twist your torso.', swap: 'Band row', icon: '◈', mediaUrl: img('Bent_Over_One-Arm_Long_Bar_Row/0.jpg') }),
      exercise({ name: 'Floor Press', muscle: 'Chest • Triceps', equipment: 'Dumbbells', sets: '4', reps: '8–12', rest: '75 sec', cue: 'Triceps touch floor, then drive.', mistake: 'Do not crash elbows down.', swap: 'Push-up', icon: '▰', mediaUrl: img('Dumbbell_Floor_Press/0.jpg') }),
      exercise({ name: 'Farmer Carry', muscle: 'Grip • Core', equipment: 'Dumbbells', sets: '5', reps: '30 sec', rest: '30 sec', cue: 'Stand tall. Walk like you are not going back.', mistake: 'Do not lean side to side.', swap: 'Suitcase carry', icon: '▮', mediaUrl: img('Farmers_Walk/0.jpg') }),
    ],
  },
  {
    id: 'bodyweight',
    label: 'Bodyweight',
    title: 'No-Equipment Discipline Split',
    subtitle: 'Push, legs, pull-substitute, core, and conditioning when the gym is not available.',
    days: ['Push + Core', 'Legs', 'Walk / Mobility', 'Upper Pull Substitutes', 'Conditioning', 'Core + Stretch', 'Recovery'],
    intent: 'No gym cannot become no proof. Move the body you are rebuilding.',
    finisher: '10-minute walk outside or stairs. Change state before cravings gain momentum.',
    exercises: [
      exercise({ name: 'Push-Up', muscle: 'Chest • Triceps', equipment: 'Bodyweight', sets: '4', reps: '8–15', rest: '60 sec', cue: 'Straight line, controlled chest drop, press the floor away.', mistake: 'Do not sag hips.', swap: 'Incline push-up', icon: '✚', mediaUrl: img('Push_Up_to_Side_Plank/0.jpg') }),
      exercise({ name: 'Chair Squat', muscle: 'Quads • Glutes', equipment: 'Bodyweight', sets: '4', reps: '12–20', rest: '60 sec', cue: 'Tap the chair, stand tall, breathe.', mistake: 'Do not collapse knees inward.', swap: 'Split squat', icon: '⬟', mediaUrl: img('Chair_Squat/0.jpg') }),
      exercise({ name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: '3', reps: '30–45 sec', rest: '45 sec', cue: 'Brace as if taking a punch.', mistake: 'Do not let hips sag.', swap: 'Dead bug', icon: '▬', mediaUrl: img('Plank/0.jpg') }),
      exercise({ name: 'Walking Lunge', muscle: 'Legs • Balance', equipment: 'Bodyweight', sets: '3', reps: '10/side', rest: '60 sec', cue: 'Step long, front foot rooted, stand tall.', mistake: 'Do not slam the back knee.', swap: 'Reverse lunge', icon: '↗', mediaUrl: img('Bodyweight_Walking_Lunge/0.jpg') }),
    ],
  },
  {
    id: 'glute-legs',
    label: 'Glute / Legs',
    title: 'Lower Body Armor Split',
    subtitle: 'Lower-body focused structure for glutes, quads, hamstrings, athletic legs, and core.',
    days: ['Glutes + Hamstrings', 'Upper Maintenance', 'Quads + Calves', 'Recovery', 'Glutes Volume', 'Core + Walk', 'Recovery'],
    intent: 'Build the lower-body engine. Strength, posture, confidence, proof.',
    finisher: 'Five minutes incline walk or sled. Legs done, head clear.',
    exercises: [
      exercise({ name: 'Barbell Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', sets: '4', reps: '8–12', rest: '90 sec', cue: 'Ribs down, squeeze hard at lockout.', mistake: 'Do not overarch lower back.', swap: 'Glute bridge', icon: '⬢', mediaUrl: img('Barbell_Hip_Thrust/0.jpg') }),
      exercise({ name: 'Romanian Deadlift', muscle: 'Hamstrings • Glutes', equipment: 'Barbell', sets: '3', reps: '8–10', rest: '2 min', cue: 'Hinge until hamstrings stretch, stand tall.', mistake: 'Do not bend knees into a squat.', swap: 'Dumbbell RDL', icon: '⬢', mediaUrl: img('Romanian_Deadlift/0.jpg') }),
      exercise({ name: 'Leg Press', muscle: 'Quads • Glutes', equipment: 'Machine', sets: '4', reps: '10–15', rest: '90 sec', cue: 'Controlled depth, strong drive.', mistake: 'Do not let hips roll off pad.', swap: 'Goblet squat', icon: '⬟', mediaUrl: img('Leg_Press/0.jpg') }),
      exercise({ name: 'Hack Squat', muscle: 'Quads', equipment: 'Machine', sets: '3', reps: '8–12', rest: '2 min', cue: 'Stay planted and drive evenly.', mistake: 'Do not chase depth you cannot own.', swap: 'Split squat', icon: '⬟', mediaUrl: img('Hack_Squat/0.jpg') }),
    ],
  },
  {
    id: 'conditioning',
    label: 'Conditioning',
    title: 'Cut + Conditioning Split',
    subtitle: 'Strength maintenance plus circuits, carries, and cardio for fat loss without chaos.',
    days: ['Upper Strength', 'Conditioning', 'Lower Strength', 'Zone 2', 'Full Body Circuit', 'Walk + Mobility', 'Recovery'],
    intent: 'Burn stress, keep muscle, protect sobriety. Sweat is the pressure valve.',
    finisher: 'EMOM 8: push-ups minute one, air squats minute two. Stop clean.',
    exercises: [
      exercise({ name: 'Farmer Carry', muscle: 'Grip • Core • Conditioning', equipment: 'Dumbbells', sets: '6', reps: '30 sec', rest: '30 sec', cue: 'Tall posture. Short powerful steps.', mistake: 'Do not lean or rush sloppy.', swap: 'Suitcase carry', icon: '▮', mediaUrl: img('Farmers_Walk/0.jpg') }),
      exercise({ name: 'Push-Up', muscle: 'Chest • Conditioning', equipment: 'Bodyweight', sets: '5', reps: '8–12', rest: '30 sec', cue: 'Clean reps only. Leave one in reserve.', mistake: 'Do not chase failure.', swap: 'Incline push-up', icon: '✚', mediaUrl: img('Push_Up_to_Side_Plank/0.jpg') }),
      exercise({ name: 'Goblet Squat', muscle: 'Legs • Conditioning', equipment: 'Dumbbell', sets: '5', reps: '10–15', rest: '45 sec', cue: 'Breathe, brace, stand tall.', mistake: 'Do not collapse form as fatigue rises.', swap: 'Chair squat', icon: '⬟', mediaUrl: img('Goblet_Squat/0.jpg') }),
      exercise({ name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: '3', reps: '45 sec', rest: '30 sec', cue: 'Still body, calm mind.', mistake: 'Do not hold your breath.', swap: 'Dead bug', icon: '▬', mediaUrl: img('Plank/0.jpg') }),
    ],
  },
  {
    id: 'craving',
    label: 'Craving Killer',
    title: '10-Minute Craving Destroyer',
    subtitle: 'No-decision emergency workout for when your head gets loud.',
    days: ['Water', 'Move', 'Breathe', 'Text', 'Eat Protein', 'Walk Outside', 'Check In'],
    intent: 'You are not training for PRs. You are interrupting the spiral.',
    finisher: 'Cold water on face, one honest text, then open Rescue if the urge is still high.',
    exercises: [
      exercise({ name: 'Push-Up Ladder', muscle: 'Chest • Mindset', equipment: 'Bodyweight', sets: '5', reps: '5–10', rest: '30 sec', cue: 'Clean reps. Win the next minute.', mistake: 'Do not chase failure.', swap: 'Incline push-up', icon: '✚', mediaUrl: img('Push_Up_to_Side_Plank/0.jpg') }),
      exercise({ name: 'Air Squat', muscle: 'Legs • Breath', equipment: 'Bodyweight', sets: '4', reps: '15', rest: '30 sec', cue: 'Drop, stand, breathe. Keep moving.', mistake: 'Do not rush sloppy reps.', swap: 'Sit-to-stand', icon: '⬣', mediaUrl: img('Chair_Squat/0.jpg') }),
      exercise({ name: 'Plank Hold', muscle: 'Core • Control', equipment: 'Bodyweight', sets: '3', reps: '30 sec', rest: '30 sec', cue: 'Brace like the old life is trying to push in.', mistake: 'Do not let hips sag.', swap: 'Dead bug', icon: '▬', mediaUrl: img('Plank/0.jpg') }),
      exercise({ name: 'Outside Walk', muscle: 'Recovery • Nervous system', equipment: 'Shoes', sets: '1', reps: '10 min', rest: 'None', cue: 'Change environment. Call someone if it spikes.', mistake: 'Do not isolate indoors.', swap: 'Stairs', icon: '↗' }),
    ],
  },
  {
    id: 'recovery-mobility',
    label: 'Recovery / Mobility',
    title: 'Recovery Day Mobility Split',
    subtitle: 'A low-intensity plan for sore days, stressful days, and streak-protection days.',
    days: ['Mobility', 'Walk', 'Stretch', 'Core', 'Zone 2', 'Meeting / Support', 'Rest'],
    intent: 'Recovery is not quitting. It is how the next strong day stays possible.',
    finisher: 'Five slow breaths, then text or check in if the day is getting loud.',
    exercises: [
      exercise({ name: 'Plank', muscle: 'Core', equipment: 'Bodyweight', sets: '3', reps: '20–40 sec', rest: '45 sec', cue: 'Calm brace, calm breathing.', mistake: 'Do not strain through pain.', swap: 'Dead bug', icon: '▬', mediaUrl: img('Plank/0.jpg') }),
      exercise({ name: 'Chair Squat', muscle: 'Hips • Knees', equipment: 'Bodyweight', sets: '3', reps: '10', rest: '45 sec', cue: 'Smooth reps, warm joints.', mistake: 'Do not rush.', swap: 'Box squat', icon: '⬟', mediaUrl: img('Chair_Squat/0.jpg') }),
      exercise({ name: 'Face Pull', muscle: 'Posture • Upper back', equipment: 'Cable/Band', sets: '3', reps: '12–15', rest: '45 sec', cue: 'Open the chest and squeeze rear delts.', mistake: 'Do not shrug.', swap: 'Band pull-apart', icon: '✦', mediaUrl: img('Face_Pull/0.jpg') }),
      exercise({ name: 'Outside Walk', muscle: 'Nervous system', equipment: 'Shoes', sets: '1', reps: '20 min', rest: 'None', cue: 'Easy pace. Let the body downshift.', mistake: 'Do not turn recovery into punishment.', swap: 'Bike easy', icon: '↗' }),
    ],
  },
];

export const detectLoadoutId = (raw: string, fallbackId: string, goal?: string) => {
  const text = raw.toLowerCase();
  if (/crav|urge|emergency/.test(text) || goal === 'Kill a craving') return 'craving';
  if (/arnold|chest.*back|shoulders.*arms/.test(text)) return 'arnold';
  if (/upper.*lower|lower.*upper|4[ -]?day/.test(text)) return 'upper-lower';
  if (/bro split|body part|chest day|arm day|5[ -]?day/.test(text)) return 'bro';
  if (/powerbuild|strength.*size|deadlift|squat focus|bench focus/.test(text)) return 'powerbuilding';
  if (/bodyweight|no equipment|calisthenic/.test(text)) return 'bodyweight';
  if (/glute|legs? focused|lower body|booty/.test(text)) return 'glute-legs';
  if (/conditioning|fat loss|cutting|circuit|hiit/.test(text)) return 'conditioning';
  if (/recovery|mobility|sore|stretch/.test(text)) return 'recovery-mobility';
  if (/dumbbell|home gym|home/.test(text)) return 'dumbbell';
  if (/full body|beginner|3[ -]?day/.test(text)) return 'full-body';
  if (/push|pull|legs|ppl/.test(text)) return 'ppl';
  return fallbackId;
};

export const getLoadoutById = (id: string) => loadouts.find((item) => item.id === id) || loadouts[0];
