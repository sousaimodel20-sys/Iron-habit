import type { ActiveLoadout, SavedExercise } from './storage';

export type SplitFamilyId =
  | 'ppl'
  | 'arnold'
  | 'upper-lower'
  | 'full-body'
  | 'bro'
  | 'dumbbell-home'
  | 'conditioning'
  | 'beginner';

export type SplitDayId =
  | 'push'
  | 'pull'
  | 'legs'
  | 'chest-back'
  | 'shoulders-arms'
  | 'upper-a'
  | 'lower-a'
  | 'upper-b'
  | 'lower-b'
  | 'full-body-a'
  | 'full-body-b'
  | 'full-body-c'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'home-upper'
  | 'home-lower'
  | 'home-full-body'
  | 'strength-circuit'
  | 'zone-2'
  | 'hiit-metcon'
  | 'core-mobility'
  | 'foundation-a'
  | 'foundation-b'
  | 'walk-mobility';

export type SplitDay = {
  id: SplitDayId;
  name: string;
  focus: string;
  path?: string;
};

export type SplitFamily = {
  id: SplitFamilyId;
  name: string;
  shortLabel: string;
  fit: string;
  daysPerWeek: string;
  equipment: string;
  goal: string;
  soberAngle: string;
  days: SplitDay[];
};

export const splitFamilies: Record<SplitFamilyId, SplitFamily> = {
  ppl: {
    id: 'ppl',
    name: 'Push Pull Legs',
    shortLabel: 'PPL',
    fit: 'Intermediate gym lifters who want structure and muscle gain.',
    daysPerWeek: '3–6 days/week',
    equipment: 'Gym',
    goal: 'Muscle gain • strength base',
    soberAngle: 'A repeatable daily lane: push, pull, legs, then repeat or recover.',
    days: [
      { id: 'push', name: 'Push', focus: 'Chest • Shoulders • Triceps', path: '/exercise?split=push' },
      { id: 'pull', name: 'Pull', focus: 'Back • Biceps • Rear delts', path: '/exercise?split=pull' },
      { id: 'legs', name: 'Legs', focus: 'Quads • Hamstrings • Calves', path: '/exercise?split=legs' },
    ],
  },
  arnold: {
    id: 'arnold',
    name: 'Arnold Split',
    shortLabel: 'Arnold',
    fit: 'Higher-volume bodybuilding users who like classic physique days.',
    daysPerWeek: '3–6 days/week',
    equipment: 'Gym',
    goal: 'Bodybuilding • hypertrophy',
    soberAngle: 'Big structure and big pump without old-life chaos.',
    days: [
      { id: 'chest-back', name: 'Chest + Back', focus: 'Antagonist upper-body volume' },
      { id: 'shoulders-arms', name: 'Shoulders + Arms', focus: 'Delts • Biceps • Triceps' },
      { id: 'legs', name: 'Legs', focus: 'Quads • Hamstrings • Calves' },
    ],
  },
  'upper-lower': {
    id: 'upper-lower',
    name: 'Upper / Lower',
    shortLabel: 'U/L',
    fit: 'Beginner/intermediate users who want balanced progress.',
    daysPerWeek: '3–4 days/week',
    equipment: 'Gym or dumbbells',
    goal: 'Strength • muscle • recovery',
    soberAngle: 'Simple rhythm, enough recovery, steady receipts.',
    days: [
      { id: 'upper-a', name: 'Upper A', focus: 'Press • Pull • Arms' },
      { id: 'lower-a', name: 'Lower A', focus: 'Squat • Hinge • Core' },
      { id: 'upper-b', name: 'Upper B', focus: 'Volume upper body' },
      { id: 'lower-b', name: 'Lower B', focus: 'Volume lower body' },
    ],
  },
  'full-body': {
    id: 'full-body',
    name: 'Full Body',
    shortLabel: 'Full Body',
    fit: 'Beginners, restarters, and 2–3 day/week testers.',
    daysPerWeek: '2–3 days/week',
    equipment: 'Gym or dumbbells',
    goal: 'Consistency • recomposition',
    soberAngle: 'The safest comeback base: repeatable full-body proof.',
    days: [
      { id: 'full-body-a', name: 'Full Body A', focus: 'Squat • Press • Row' },
      { id: 'full-body-b', name: 'Full Body B', focus: 'Hinge • Pull • Carry' },
      { id: 'full-body-c', name: 'Full Body C', focus: 'Legs • Push • Core' },
    ],
  },
  bro: {
    id: 'bro',
    name: 'Bro Split / Body-Part',
    shortLabel: 'Body Part',
    fit: 'Gym users who like one muscle-group target per session.',
    daysPerWeek: '4–5 days/week',
    equipment: 'Gym',
    goal: 'Hypertrophy • simple focus',
    soberAngle: 'One target, one receipt, no overthinking.',
    days: [
      { id: 'chest', name: 'Chest', focus: 'Chest • Triceps support' },
      { id: 'back', name: 'Back', focus: 'Lats • Rows • Rear delts' },
      { id: 'shoulders', name: 'Shoulders', focus: 'Delts • traps' },
      { id: 'arms', name: 'Arms', focus: 'Biceps • Triceps' },
      { id: 'legs', name: 'Legs', focus: 'Quads • Hamstrings • Calves' },
    ],
  },
  'dumbbell-home': {
    id: 'dumbbell-home',
    name: 'Dumbbell / Home',
    shortLabel: 'Home',
    fit: 'No-gym testers with dumbbells, bodyweight, or limited space.',
    daysPerWeek: '3–5 days/week',
    equipment: 'Dumbbells • bodyweight',
    goal: 'Low-barrier muscle • consistency',
    soberAngle: 'No gym cannot become no proof.',
    days: [
      { id: 'home-upper', name: 'Home Upper', focus: 'Push • Row • Shoulders' },
      { id: 'home-lower', name: 'Home Lower', focus: 'Squat • Hinge • Carry' },
      { id: 'home-full-body', name: 'Home Full Body', focus: 'Total body density' },
      { id: 'strength-circuit', name: 'Conditioning', focus: 'Sweat • carries • core' },
    ],
  },
  conditioning: {
    id: 'conditioning',
    name: 'Conditioning / Fat Loss',
    shortLabel: 'Conditioning',
    fit: 'Users chasing fat loss, energy, and craving control.',
    daysPerWeek: '3–6 days/week',
    equipment: 'Bodyweight • dumbbells • cardio',
    goal: 'Fat loss • stress outlet',
    soberAngle: 'Use sweat as the pressure valve before cravings get loud.',
    days: [
      { id: 'strength-circuit', name: 'Strength Circuit', focus: 'Muscle-preserving circuits' },
      { id: 'zone-2', name: 'Zone 2 / Walk', focus: 'Low-stress cardio' },
      { id: 'hiit-metcon', name: 'HIIT / Metcon', focus: 'Short hard conditioning' },
      { id: 'core-mobility', name: 'Core + Mobility', focus: 'Trunk • breathing • recovery' },
    ],
  },
  beginner: {
    id: 'beginner',
    name: 'Beginner Sober Strength',
    shortLabel: 'Beginner',
    fit: 'New sobriety, low confidence, or first month back training.',
    daysPerWeek: '2–4 days/week',
    equipment: 'Bodyweight • dumbbells • gym optional',
    goal: 'Routine • confidence • safe base',
    soberAngle: 'Small honest sessions that rebuild trust with yourself.',
    days: [
      { id: 'foundation-a', name: 'Foundation A', focus: 'Squat • Push • Walk' },
      { id: 'foundation-b', name: 'Foundation B', focus: 'Hinge • Pull • Core' },
      { id: 'walk-mobility', name: 'Walk / Mobility', focus: 'Recovery • nervous system' },
      { id: 'home-full-body', name: 'Optional Full Body', focus: 'Light total-body proof' },
    ],
  },
};

export const defaultSplitFamily = splitFamilies.ppl;

export type SplitExerciseRow = {
  name: string;
  sets: string;
  muscle: string;
};

const pushExercises: SplitExerciseRow[] = [
  { name: 'Barbell Bench Press', sets: '4 × 6–10', muscle: 'Chest • Shoulders • Triceps' },
  { name: 'Incline Dumbbell Press', sets: '3 × 8–12', muscle: 'Upper chest • Front delts' },
  { name: 'Seated Shoulder Press', sets: '3 × 8–12', muscle: 'Delts • Triceps' },
  { name: 'Cable Lateral Raise', sets: '3 × 12–15', muscle: 'Side delts' },
  { name: 'Dips', sets: '3 × 10–15', muscle: 'Chest • Triceps' },
  { name: 'Rope Tricep Pushdown', sets: '3 × 12–15', muscle: 'Triceps' },
];

export const splitExercisePresets: Partial<Record<SplitDayId, SplitExerciseRow[]>> = {
  push: pushExercises,
  pull: [
    { name: 'Weighted Pull-Up', sets: '4 × 5–8', muscle: 'Lats • Biceps' },
    { name: 'Seated Cable Row', sets: '4 × 8–12', muscle: 'Mid back • Rear delts' },
    { name: 'One-Arm Dumbbell Row', sets: '3 × 10/side', muscle: 'Lats • Core' },
    { name: 'Face Pull', sets: '3 × 12–15', muscle: 'Rear delts • Upper back' },
    { name: 'Barbell Curl', sets: '3 × 10–12', muscle: 'Biceps' },
    { name: 'Hammer Curl', sets: '2 × 12–15', muscle: 'Biceps • Forearms' },
  ],
  legs: [
    { name: 'Hack Squat', sets: '4 × 8–12', muscle: 'Quads • Glutes' },
    { name: 'Romanian Deadlift', sets: '4 × 8–10', muscle: 'Hamstrings • Glutes' },
    { name: 'Leg Press', sets: '3 × 10–15', muscle: 'Quads • Glutes' },
    { name: 'Walking Lunge', sets: '3 × 10/side', muscle: 'Legs • Balance' },
    { name: 'Calf Raise', sets: '4 × 12–20', muscle: 'Calves' },
    { name: 'Plank', sets: '3 × 30–45 sec', muscle: 'Core' },
  ],
  'chest-back': [
    { name: 'Bench Press', sets: '4 × 6–8', muscle: 'Chest • Triceps' },
    { name: 'Seated Cable Row', sets: '4 × 8–10', muscle: 'Back • Rear delts' },
    { name: 'Incline Dumbbell Press', sets: '3 × 8–12', muscle: 'Upper chest' },
    { name: 'Lat Pulldown', sets: '3 × 10–12', muscle: 'Lats • Biceps' },
    { name: 'Dumbbell Pullover', sets: '3 × 12', muscle: 'Chest • Lats' },
    { name: 'Face Pull', sets: '3 × 12–15', muscle: 'Rear delts' },
  ],
  'shoulders-arms': [
    { name: 'Seated Shoulder Press', sets: '4 × 6–10', muscle: 'Shoulders • Triceps' },
    { name: 'Cable Lateral Raise', sets: '4 × 12–15', muscle: 'Side delts' },
    { name: 'Face Pull', sets: '3 × 12–15', muscle: 'Rear delts' },
    { name: 'Barbell Curl', sets: '3 × 10–12', muscle: 'Biceps' },
    { name: 'Rope Tricep Pushdown', sets: '3 × 12–15', muscle: 'Triceps' },
    { name: 'Farmer Carry', sets: '3 × 30 sec', muscle: 'Grip • Core' },
  ],
  'upper-a': [
    { name: 'Barbell Bench Press', sets: '4 × 5–8', muscle: 'Chest • Triceps' },
    { name: 'Weighted Pull-Up', sets: '4 × 5–8', muscle: 'Lats • Biceps' },
    { name: 'Seated Shoulder Press', sets: '3 × 8–10', muscle: 'Shoulders' },
    { name: 'Seated Cable Row', sets: '3 × 10–12', muscle: 'Back' },
    { name: 'Cable Lateral Raise', sets: '3 × 12–15', muscle: 'Side delts' },
    { name: 'Barbell Curl', sets: '2 × 10–12', muscle: 'Biceps' },
  ],
  'lower-a': [
    { name: 'Leg Press', sets: '4 × 8–12', muscle: 'Quads • Glutes' },
    { name: 'Romanian Deadlift', sets: '4 × 8–10', muscle: 'Hamstrings' },
    { name: 'Barbell Hip Thrust', sets: '3 × 8–12', muscle: 'Glutes' },
    { name: 'Walking Lunge', sets: '3 × 10/side', muscle: 'Legs • Balance' },
    { name: 'Plank', sets: '3 × 30–45 sec', muscle: 'Core' },
    { name: 'Farmer Carry', sets: '3 × 30 sec', muscle: 'Grip • Core' },
  ],
  'upper-b': [
    { name: 'Incline Dumbbell Press', sets: '4 × 8–10', muscle: 'Upper chest • Front delts' },
    { name: 'Seated Cable Row', sets: '4 × 8–12', muscle: 'Back • Biceps' },
    { name: 'Smith Machine Overhead Press', sets: '3 × 8–10', muscle: 'Shoulders • Triceps' },
    { name: 'Lat Pulldown', sets: '3 × 10–12', muscle: 'Lats • Biceps' },
    { name: 'Face Pull', sets: '3 × 12–15', muscle: 'Rear delts • Upper back' },
    { name: 'Rope Tricep Pushdown', sets: '2 × 12–15', muscle: 'Triceps' },
  ],
  'lower-b': [
    { name: 'Hack Squat', sets: '4 × 8–12', muscle: 'Quads • Glutes' },
    { name: 'Barbell Hip Thrust', sets: '4 × 8–12', muscle: 'Glutes • Hamstrings' },
    { name: 'Romanian Deadlift', sets: '3 × 8–10', muscle: 'Hamstrings • Glutes' },
    { name: 'Leg Press', sets: '3 × 12–15', muscle: 'Quads' },
    { name: 'Calf Raise', sets: '4 × 12–20', muscle: 'Calves' },
    { name: 'Plank', sets: '3 × 30–45 sec', muscle: 'Core' },
  ],
};

const parsePrescription = (sets: string) => {
  const [setText, repText] = sets.split('×').map((part) => part.trim());
  return {
    sets: Number.parseInt(setText, 10).toString(),
    reps: repText || '8–12',
  };
};

const presetToSavedExercise = (exercise: SplitExerciseRow): SavedExercise => {
  const prescription = parsePrescription(exercise.sets);
  return {
    name: exercise.name,
    muscle: exercise.muscle,
    equipment: 'Gym',
    sets: prescription.sets,
    reps: prescription.reps,
    rest: exercise.name.toLowerCase().includes('carry') || exercise.name.toLowerCase().includes('plank') ? '45 sec' : '75 sec',
    cue: 'Own the rep, control the tempo, and keep the proof honest.',
    mistake: 'Do not rush sloppy reps just to finish the card.',
    swap: 'Use the closest machine, dumbbell, or bodyweight variation you can perform cleanly.',
    icon: '◆',
  };
};

export const getSplitDayExerciseRows = (dayId: SplitDayId): SplitExerciseRow[] => splitExercisePresets[dayId] || pushExercises;

export const savedExercisesToSplitRows = (exercises: SavedExercise[] = []): SplitExerciseRow[] => exercises.map((exercise) => ({
  name: exercise.name,
  sets: `${exercise.sets} × ${exercise.reps}`,
  muscle: exercise.muscle,
}));

export const getExerciseRowsForSplit = (
  activeLoadout: ActiveLoadout | null | undefined,
  selectedDayId: SplitDayId,
): SplitExerciseRow[] => {
  if (activeLoadout) return savedExercisesToSplitRows(getWorkoutExercisesForSplit(activeLoadout, selectedDayId));
  return getSplitDayExerciseRows(selectedDayId);
};

export const getWorkoutExercisesForSplit = (activeLoadout: ActiveLoadout, selectedDayId: SplitDayId): SavedExercise[] => {
  const presetRows = splitExercisePresets[selectedDayId];
  if (presetRows?.length) return presetRows.map(presetToSavedExercise);
  return activeLoadout.exercises;
};

export const getSplitDayById = (splitId: string, preferredFamilyId?: SplitFamilyId): { family: SplitFamily; day: SplitDay } => {
  const preferredFamily = preferredFamilyId ? splitFamilies[preferredFamilyId] : undefined;
  const preferredDay = preferredFamily?.days.find((day) => day.id === splitId);
  if (preferredFamily && preferredDay) return { family: preferredFamily, day: preferredDay };

  for (const family of Object.values(splitFamilies)) {
    const day = family.days.find((candidate) => candidate.id === splitId);
    if (day) return { family, day };
  }

  return { family: defaultSplitFamily, day: defaultSplitFamily.days[0] };
};

export const getDayRotationIndex = (date: Pick<Date, 'getDay'>, dayCount: number) => {
  if (dayCount <= 0) return 0;
  const zeroBasedWeekday = (date.getDay() + 6) % 7;
  return zeroBasedWeekday % dayCount;
};

export const normalizeSplitFamilyId = (raw = ''): SplitFamilyId => {
  const text = raw.toLowerCase();
  if (/arnold|chest.*back|shoulders.*arms/.test(text)) return 'arnold';
  if (/upper.*lower|lower.*upper|upper-lower/.test(text)) return 'upper-lower';
  if (/bro|body.?part|chest day|arm day/.test(text)) return 'bro';
  if (/dumbbell|home|bodyweight|no.?equipment/.test(text)) return 'dumbbell-home';
  if (/conditioning|fat.?loss|cut|circuit|hiit|zone 2/.test(text)) return 'conditioning';
  if (/beginner|foundation|sober strength|starter/.test(text)) return 'beginner';
  if (/full.?body|3.?day/.test(text)) return 'full-body';
  return 'ppl';
};

export const getSplitFamilyForLoadout = (activeLoadout: ActiveLoadout | null | undefined): SplitFamily => {
  const explicit = activeLoadout?.splitFamilyId;
  if (explicit && splitFamilies[explicit]) return splitFamilies[explicit];
  if (!activeLoadout) return defaultSplitFamily;
  return splitFamilies[normalizeSplitFamilyId(`${activeLoadout.templateId} ${activeLoadout.label} ${activeLoadout.title}`)];
};

const normalizeDayText = (day: string) => day.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export const matchSplitDay = (family: SplitFamily, dayName: string): SplitDay => {
  const clean = normalizeDayText(dayName);
  const direct = family.days.find((day) => normalizeDayText(day.name) === clean || clean.includes(normalizeDayText(day.name)));
  if (direct) return direct;

  if (family.id === 'ppl') {
    if (clean.includes('pull')) return family.days.find((day) => day.id === 'pull') || family.days[0];
    if (clean.includes('leg')) return family.days.find((day) => day.id === 'legs') || family.days[0];
    return family.days.find((day) => day.id === 'push') || family.days[0];
  }

  if (family.id === 'upper-lower') {
    if (clean.includes('lower')) {
      return family.days.find((day) => day.id === (clean.includes('volume') ? 'lower-b' : 'lower-a')) || family.days[1] || family.days[0];
    }
    if (clean.includes('upper')) {
      return family.days.find((day) => day.id === (clean.includes('volume') ? 'upper-b' : 'upper-a')) || family.days[0];
    }
  }

  return family.days[0];
};

export const getActiveSplitDay = (activeLoadout: ActiveLoadout | null | undefined, date: Pick<Date, 'getDay'> = new Date()): SplitDay => {
  const family = getSplitFamilyForLoadout(activeLoadout);
  const explicit = activeLoadout?.activeDayId ? family.days.find((day) => day.id === activeLoadout.activeDayId) : undefined;
  if (explicit) return explicit;

  const days = activeLoadout?.days || [];
  const rotatedDay = days[getDayRotationIndex(date, days.length)] || days[0] || family.days[0].name;
  return matchSplitDay(family, rotatedDay);
};

export const getWorkoutSplitSelection = (
  activeLoadout: ActiveLoadout | null | undefined,
  splitId?: string | null,
): { family: SplitFamily; day: SplitDay } => {
  const family = getSplitFamilyForLoadout(activeLoadout);
  const cleanSplitId = (splitId || '').trim();

  if (cleanSplitId) return getSplitDayById(cleanSplitId, family.id);

  return { family, day: getActiveSplitDay(activeLoadout) };
};
