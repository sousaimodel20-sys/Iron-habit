import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  buildEmergencyCommandCheckIn,
  EMERGENCY_SUPPORT_SMS,
  emergencyRescuePath,
  isEmergencySupportCommand,
  wantsEmergencyMeetings,
  wantsEmergencySupportCall,
  wantsEmergencySupportText,
} from '../utils/emergencySupportChain';
import { calculateMacroTargets, formatHeight } from '../utils/nutrition';
import { isCravingRescueReceipt } from '../utils/proofReceipts';
import { buildSupportSmsHref, buildSupportTelHref, getSupportContactLabel, hasSupportContact } from '../utils/support';
import { createStarterLoadout } from '../utils/starterLoadout';
import { calculateSobrietyStreak } from '../utils/streaks';
import { getTodayKey, loadData, saveData, type ActiveLoadout, type BodyProfile, type CheckIn, type CompletedLoadout, type FitnessEntry } from '../utils/storage';
import { buildTalkNextMove } from '../utils/talkNextMove';

type WebSpeechRecognitionResultEvent = {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
    };
  };
};

type WebSpeechRecognitionErrorEvent = { error: string };

type WebSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: WebSpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: WebSpeechRecognitionResultEvent) => void) | null;
  start: () => void;
  stop: () => void;
};

type WebSpeechRecognitionConstructor = new () => WebSpeechRecognition;

type VoiceWindow = Window & {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
  webkitSpeechRecognition?: WebSpeechRecognitionConstructor;
};

type Loadout = {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  days: string[];
  intent: string;
  finisher: string;
  exercises: Exercise[];
};

type Exercise = {
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

const loadouts: Loadout[] = [
  {
    id: 'ppl',
    label: 'Push Pull Legs',
    title: 'PPL Mass Loadout',
    subtitle: 'A 6-day sober-fitness split built for size, strength, and daily structure.',
    days: ['Push', 'Pull', 'Legs', 'Push Volume', 'Pull Volume', 'Legs + Core', 'Recovery / Meeting'],
    intent: 'Build muscle without overthinking. Show up, move iron, protect the streak.',
    finisher: '10-minute incline walk. Breathe through the craving before it becomes a vote.',
    exercises: [
      { name: 'Incline Dumbbell Press', muscle: 'Chest • Front delts', equipment: 'Dumbbells', sets: '4', reps: '8–10', rest: '90 sec', cue: 'Shoulders pinned. Control the negative. Press like proof.', mistake: 'Do not flare elbows high.', swap: 'Machine chest press', icon: '◆' },
      { name: 'Seated Shoulder Press', muscle: 'Shoulders • Triceps', equipment: 'Dumbbells', sets: '3', reps: '8–12', rest: '90 sec', cue: 'Brace ribs down and drive straight overhead.', mistake: 'Do not arch your back to steal reps.', swap: 'Landmine press', icon: '▲' },
      { name: 'Lat Pulldown', muscle: 'Lats • Biceps', equipment: 'Cable', sets: '4', reps: '10–12', rest: '75 sec', cue: 'Pull elbows to pockets. Chest tall.', mistake: 'Do not yank with your lower back.', swap: 'Assisted pull-up', icon: '▼' },
      { name: 'Romanian Deadlift', muscle: 'Hamstrings • Glutes', equipment: 'Barbell', sets: '3', reps: '8–10', rest: '2 min', cue: 'Hinge. Stretch. Stand tall. No ego.', mistake: 'Do not round your spine.', swap: 'Dumbbell RDL', icon: '⬢' },
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
      { name: 'Bench Press', muscle: 'Chest • Triceps', equipment: 'Barbell', sets: '4', reps: '6–8', rest: '2 min', cue: 'Feet planted. Shoulder blades locked. Smooth power.', mistake: 'Do not bounce off the chest.', swap: 'Dumbbell bench', icon: '▰' },
      { name: 'Chest-Supported Row', muscle: 'Back • Rear delts', equipment: 'Machine', sets: '4', reps: '8–10', rest: '90 sec', cue: 'Drive elbows back and pause for proof.', mistake: 'Do not shrug every rep.', swap: 'One-arm DB row', icon: '◈' },
      { name: 'Lateral Raise', muscle: 'Side delts', equipment: 'Dumbbells', sets: '4', reps: '12–15', rest: '45 sec', cue: 'Lead with elbows. Stop at shoulder height.', mistake: 'Do not swing from the hips.', swap: 'Cable lateral raise', icon: '✦' },
      { name: 'Hack Squat', muscle: 'Quads • Glutes', equipment: 'Machine', sets: '4', reps: '8–12', rest: '2 min', cue: 'Full depth you can own. Drive through the platform.', mistake: 'Do not cave knees inward.', swap: 'Goblet squat', icon: '⬟' },
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
      { name: 'Push-Up Ladder', muscle: 'Chest • Mindset', equipment: 'Bodyweight', sets: '5', reps: '5–10', rest: '30 sec', cue: 'Clean reps. Win the next minute.', mistake: 'Do not chase failure.', swap: 'Incline push-up', icon: '✚' },
      { name: 'Air Squat', muscle: 'Legs • Breath', equipment: 'Bodyweight', sets: '4', reps: '15', rest: '30 sec', cue: 'Drop, stand, breathe. Keep moving.', mistake: 'Do not rush sloppy reps.', swap: 'Sit-to-stand', icon: '⬣' },
      { name: 'Plank Hold', muscle: 'Core • Control', equipment: 'Bodyweight', sets: '3', reps: '30 sec', rest: '30 sec', cue: 'Brace like the old life is trying to push in.', mistake: 'Do not let hips sag.', swap: 'Dead bug', icon: '▬' },
      { name: 'Outside Walk', muscle: 'Recovery • Nervous system', equipment: 'Shoes', sets: '1', reps: '10 min', rest: 'None', cue: 'Change environment. Call someone if it spikes.', mistake: 'Do not isolate indoors.', swap: 'Stairs', icon: '↗' },
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
      { name: 'Goblet Squat', muscle: 'Quads • Glutes', equipment: 'Dumbbell', sets: '4', reps: '10–15', rest: '75 sec', cue: 'Chest proud. Elbows inside knees. Own the depth.', mistake: 'Do not fold forward.', swap: 'Split squat', icon: '⬟' },
      { name: 'One-Arm Row', muscle: 'Back • Biceps', equipment: 'Dumbbell', sets: '4', reps: '10/side', rest: '60 sec', cue: 'Pull elbow to hip and pause.', mistake: 'Do not twist your torso.', swap: 'Band row', icon: '◈' },
      { name: 'Floor Press', muscle: 'Chest • Triceps', equipment: 'Dumbbells', sets: '4', reps: '8–12', rest: '75 sec', cue: 'Triceps touch floor, then drive.', mistake: 'Do not crash elbows down.', swap: 'Push-up', icon: '▰' },
      { name: 'Farmer Carry', muscle: 'Grip • Core', equipment: 'Dumbbells', sets: '5', reps: '30 sec', rest: '30 sec', cue: 'Stand tall. Walk like you are not going back.', mistake: 'Do not lean side to side.', swap: 'Suitcase carry', icon: '▮' },
    ],
  },
];

const goals = ['Build muscle', 'Cut fat', 'Get stronger', 'Kill a craving'];
const times = ['20 min', '35 min', '50 min', '75 min'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const quickCommands = [
  'I need help now',
  'I need a meeting',
  'I’m about to drink text my support person',
  'Open rescue and text my support person',
  'Set support contact Brother Mike 604-555-1234',
  'Set support area Burnaby, BC',
  'Text my support person',
  'Build me a workout',
  'Start my workout',
  'I’m craving',
  'Show my proof',
  'Make a Victory Card',
  'Log check-in',
  'I trained 45 min hard',
  'Still sober craving 2/10 and I trained 45 min hard',
  'I survived a craving',
  'I slipped but I’m restarting today',
  'Next best move',
  'Log body stats',
  'Set fat loss macros',
];

const parseHeightInches = (command: string) => {
  const feetMatch = command.match(/(\d)\s*(?:ft|foot|feet|'|’)(?:\s*(\d{1,2})\s*(?:in|inch|inches|"|”)?\b)?/i);
  if (feetMatch) return String((Number(feetMatch[1]) * 12) + Number(feetMatch[2] || 0));
  const inchesMatch = command.match(/(\d{2,3})\s*(?:in|inch|inches)\b/i);
  return inchesMatch?.[1];
};

const parseBodyProfileFromCommand = (rawCommand: string, current: BodyProfile): BodyProfile => {
  const command = rawCommand.toLowerCase();
  const weight = command.match(/(?:weigh|weight|i'?m|im|am)\s*(\d{2,3})\s*(?:lb|lbs|pounds)?\b/i)?.[1];
  const goalWeight = command.match(/(?:goal weight|target weight|goal|target|to)\s*(\d{2,3})\s*(?:lb|lbs|pounds)?\b/i)?.[1];
  const age = command.match(/(?:age|i'?m|im|am)\s*(\d{2})\s*(?:years old|yo|y\/o|years)?\b/i)?.[1]
    || command.match(/(?:^|,|\s)(\d{2})(?:\s*(?:years old|yo|y\/o|years))?(?=,|$|\s)/i)?.[1];
  const trainingDays = command.match(/(?:train|training|lift|lifting|gym)\s*(\d)\s*(?:days|x|times)?/i)?.[1];
  const height = parseHeightInches(command);
  const sex = /\b(female|woman|girl)\b/.test(command) ? 'female' : /\b(male|man|guy|boy)\b/.test(command) ? 'male' : current.sex;
  const bodyGoal = /(cut|fat loss|lose fat|burn fat|shred)/.test(command)
    ? 'cut-fat'
    : /(bulk|build muscle|gain muscle|muscle gain|lean bulk)/.test(command)
      ? 'build-muscle'
      : /(maintain|maintenance)/.test(command)
        ? 'maintain'
        : /(recomp|recomposition)/.test(command)
          ? 'recomposition'
          : current.bodyGoal;
  const pace = /(aggressive|fast|hard cut)/.test(command) ? 'aggressive' : /(lean bulk|bulk)/.test(command) ? 'lean' : current.pace || 'steady';
  const activityLevel = /(sedentary|desk job)/.test(command)
    ? 'sedentary'
    : /(light|walk)/.test(command)
      ? 'light'
      : /(very active|active job|labor|labour|athlete)/.test(command)
        ? 'active'
        : current.activityLevel || 'moderate';

  return {
    ...current,
    sex,
    age: age || current.age,
    heightInches: height || current.heightInches,
    weightLbs: weight || current.weightLbs,
    goalWeightLbs: goalWeight || current.goalWeightLbs,
    trainingDaysPerWeek: trainingDays || current.trainingDaysPerWeek,
    bodyGoal,
    pace,
    activityLevel,
    updatedAt: new Date().toISOString(),
  };
};

const parseCravingLevel = (command: string, fallback = 2) => {
  const match = command.match(/(?:craving|urge|crave)\D*(10|[0-9])/i) || command.match(/\b(10|[0-9])\s*\/\s*10\b/);
  return match ? Math.max(0, Math.min(10, Number(match[1]))) : fallback;
};

const parseDurationMinutes = (command: string, fallback = 45) => {
  const match = command.match(/(\d{1,3})\s*(?:min|minutes|mins)\b/i);
  return match ? Math.max(1, Number(match[1])) : fallback;
};

const extractMeetingLocation = (command: string) => {
  const locationMatch = command.match(/(?:meetings?|aa|na|support|group)(?:\s+(?:near|in|around|at))\s+(.+)/i)
    || command.match(/(?:find|show|need|open)\s+(?:me\s+)?(?:meetings?|aa|na|support|group)(?:\s+(?:near|in|around|at))?\s+(.+)/i);
  const cleaned = locationMatch?.[1]
    ?.trim()
    .replace(/\b(?:because|cause)\b.*$/i, '')
    .replace(/\b(?:i\s*(?:am|'m)\s+about\s+to\s+drink|i\s+need\s+help|i'?m\s+craving.*)$/i, '')
    .replace(/[.?!]+$/, '')
    .trim();
  return cleaned;
};

const extractSupportPhone = (command: string) => {
  const match = command.match(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{10,15})/);
  return match?.[0]?.trim() || '';
};

const normalizeSupportName = (value: string) => value
  .split(/\s+/)
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
  .join(' ')
  .trim();

const extractSupportName = (command: string) => {
  const phone = extractSupportPhone(command);
  const withoutPhone = phone ? command.replace(phone, ' ') : command;
  const withoutPrefix = withoutPhone
    .replace(/^(?:set|save|update|add|make)\s+/i, '')
    .replace(/(?:my\s+)?(?:safe|support|recovery)\s+(?:person|contact)\s*(?:is|to|as)?\s*/i, '')
    .replace(/\b(?:phone|number|at)\b.*$/i, '')
    .replace(/[,:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizeSupportName(withoutPrefix);
};

const extractSupportBase = (command: string) => {
  const match = command.match(/(?:support\s+(?:base|area|location)|recovery\s+area)(?:\s+(?:is|to|as|in))?\s+(.+)/i);
  return match?.[1]?.trim().replace(/[.?!]+$/, '') || '';
};

const inferMood = (command: string) => {
  if (/(low|sad|depressed|tired|rough)/.test(command)) return 'Low';
  if (/(restless|anxious|antsy|stressed)/.test(command)) return 'Restless';
  if (/(calm|peaceful)/.test(command)) return 'Calm';
  if (/(grateful|thankful)/.test(command)) return 'Grateful';
  if (/(strong|good|great|locked)/.test(command)) return 'Strong';
  return 'Focused';
};

const makeCheckInFromCommand = (rawCommand: string, sober: boolean): CheckIn => {
  const command = rawCommand.toLowerCase();
  return {
    date: getTodayKey(),
    sober,
    mood: inferMood(command),
    craving: parseCravingLevel(command, sober ? 2 : 8),
    note: rawCommand,
    habitsCompleted: sober ? ['No alcohol'] : [],
  };
};

const makeTrainingEntryFromCommand = (rawCommand: string): FitnessEntry => {
  const command = rawCommand.toLowerCase();
  const type = /(walk|steps)/.test(command) ? 'Walk' : /(run|jog)/.test(command) ? 'Run' : /(mobility|stretch)/.test(command) ? 'Mobility' : 'Gym';
  const intensity = /(hard|heavy|beast|intense)/.test(command) ? 'Hard' : /(easy|light)/.test(command) ? 'Easy' : 'Moderate';
  return {
    id: `${Date.now()}`,
    date: getTodayKey(),
    type,
    durationMinutes: parseDurationMinutes(command, 45),
    intensity,
    note: rawCommand,
  };
};

const makeTalkTrainingProof = (entry: FitnessEntry): CompletedLoadout => {
  const soberDay = Math.max(1, calculateSobrietyStreak());
  return {
    id: entry.id,
    date: entry.date,
    title: `${entry.type} Command Proof`,
    label: entry.type,
    activeDay: 'Talk Command',
    durationMinutes: entry.durationMinutes,
    intensity: entry.intensity,
    exercises: [entry.type],
    completedSets: 1,
    totalSets: 1,
    finisher: entry.note || 'Training proof logged from Talk.',
    proofCopy: `Day ${soberDay} sober. ${entry.type} command logged: ${entry.durationMinutes} minutes, ${entry.intensity.toLowerCase()} intensity. Proof stacked from Talk.`,
  };
};

const appendCommandNote = (existingNote: string | undefined, rawCommand: string) => [existingNote, rawCommand].filter(Boolean).join('\n');

const TalkCoach = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('ppl');
  const [goal, setGoal] = useState(goals[0]);
  const [time, setTime] = useState(times[2]);
  const [level, setLevel] = useState(levels[1]);
  const [message, setMessage] = useState('Tell Iron Habit what you need.');
  const [savedMessage, setSavedMessage] = useState('');
  const [commandReply, setCommandReply] = useState('Talk is your command layer. Ask for meetings, workouts, rescue, proof, or check-in.');
  const [bodyProfile, setBodyProfile] = useState(() => loadData().bodyProfile);
  const [dataSnapshot, setDataSnapshot] = useState(() => loadData());
  const [voiceStatus, setVoiceStatus] = useState('Voice ready on supported browsers. Typed command always works.');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);
  const macroTargets = useMemo(() => calculateMacroTargets(bodyProfile), [bodyProfile]);
  const voiceSupported = typeof window !== 'undefined' && Boolean((window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition);
  const supportProfile = dataSnapshot.profile;
  const supportReady = hasSupportContact(supportProfile);
  const supportLabel = getSupportContactLabel(supportProfile);

  useEffect(() => {
    const refreshData = () => setDataSnapshot(loadData());
    refreshData();
    window.addEventListener('iron-habit-data-updated', refreshData);
    window.addEventListener('storage', refreshData);
    return () => {
      window.removeEventListener('iron-habit-data-updated', refreshData);
      window.removeEventListener('storage', refreshData);
    };
  }, []);

  const todayKey = getTodayKey();
  const todaysCheckIn = dataSnapshot.checkIns[todayKey];
  const trainedToday = dataSnapshot.fitnessEntries.some((entry) => entry.date === todayKey);
  const talkNextMove = buildTalkNextMove(dataSnapshot, todayKey);
  const proofReadyToday = dataSnapshot.completedLoadouts.some((entry) => entry.date === todayKey)
    || dataSnapshot.latestVictoryProof?.date === todayKey;
  const talkProof = dataSnapshot.latestVictoryProof?.date === todayKey ? dataSnapshot.latestVictoryProof : null;
  const talkCravingReceipt = todaysCheckIn && isCravingRescueReceipt(todaysCheckIn) ? todaysCheckIn : null;

  const detectedId = useMemo(() => {
    const lower = message.toLowerCase();
    if (lower.includes('arnold')) return 'arnold';
    if (lower.includes('crav') || goal === 'Kill a craving') return 'craving';
    if (lower.includes('dumbbell') || lower.includes('home')) return 'dumbbell';
    if (lower.includes('push') || lower.includes('pull') || lower.includes('legs') || lower.includes('ppl')) return 'ppl';
    return selectedId;
  }, [goal, message, selectedId]);

  const loadout = useMemo(() => loadouts.find((item) => item.id === detectedId) ?? loadouts[0], [detectedId]);

  const coachLine = useMemo(() => {
    if (detectedId === 'arnold') return 'Arnold split detected. High volume, clean form, no ego lifting.';
    if (detectedId === 'craving') return 'Craving protocol detected. We are interrupting the spiral before it gets a vote.';
    if (detectedId === 'dumbbell') return 'Dumbbell-only constraint detected. No machines needed.';
    return 'Loadout generated. Save it, run it, then log the proof.';
  }, [detectedId]);

  const saveLoadout = () => {
    const activeLoadout: ActiveLoadout = {
      id: `${Date.now()}`,
      templateId: loadout.id,
      title: loadout.title,
      label: loadout.label,
      goal,
      time,
      level,
      days: loadout.days,
      intent: loadout.intent,
      finisher: loadout.finisher,
      exercises: loadout.exercises,
      createdAt: new Date().toISOString(),
    };

    saveData({ activeLoadout });
    setSavedMessage(`${loadout.title} saved to Train.`);
  };

  const seedStarterLoadout = () => {
    const activeLoadout = createStarterLoadout();
    saveData({ activeLoadout });
    return activeLoadout;
  };

  const saveCravingCommandState = (rawCommand: string, fallback = 7, emergency = false) => {
    const data = loadData();
    const today = getTodayKey();
    const existing = data.checkIns[today];
    const nextCheckIn = emergency
      ? buildEmergencyCommandCheckIn({ existing, rawCommand, todayKey: today, fallbackCraving: fallback })
      : {
          ...(existing || makeCheckInFromCommand(rawCommand, true)),
          date: today,
          sober: existing?.sober ?? true,
          craving: parseCravingLevel(rawCommand.toLowerCase(), existing?.craving ?? fallback),
          note: existing?.note ? `${existing.note}\n${rawCommand}` : rawCommand,
        };
    saveData({
      checkIns: {
        ...data.checkIns,
        [today]: nextCheckIn,
      },
    });
    return {
      profile: data.profile,
      cravingLevel: nextCheckIn.craving,
    };
  };

  const handleCommand = (rawCommand = message) => {
    const command = rawCommand.toLowerCase();
    setMessage(rawCommand);

    if (/(next best|what should i do|next move|today'?s move)/.test(command)) {
      const nextMove = buildTalkNextMove(loadData(), getTodayKey());
      if (nextMove.action === 'seed-workout') {
        const starterLoadout = seedStarterLoadout();
        setCommandReply(`Next move: starter loadout seeded. Opening ${starterLoadout.title} in Workout Mode.`);
        navigate('/workout-mode');
        return;
      }
      setCommandReply(nextMove.reply);
      navigate(nextMove.path);
      return;
    }

    if (/(survived|made it through|beat|handled|got through).*(craving|urge)|craving.*(passed|over|survived)/.test(command)) {
      const data = loadData();
      const today = getTodayKey();
      const existing = data.checkIns[today];
      const facedCraving = Math.max(existing?.craving ?? parseCravingLevel(command, 7), 3);
      const entry: CheckIn = {
        date: today,
        sober: true,
        mood: 'Rescue win',
        craving: facedCraving,
        habitsCompleted: Array.from(new Set([...(existing?.habitsCompleted || []), 'No alcohol', 'Craving rescue'])),
        note: appendCommandNote(existing?.note, rawCommand),
      };
      saveData({ checkIns: { ...data.checkIns, [today]: entry } });
      setCommandReply(`Rescue win saved. ${entry.craving}/10 craving survived, sober proof stacked. Craving Card is ready.`);
      return;
    }

    if (isEmergencySupportCommand(command)) {
      const { profile, cravingLevel } = saveCravingCommandState(rawCommand, 10, true);
      const supportName = getSupportContactLabel(profile);

      if (wantsEmergencyMeetings(command)) {
        const location = extractMeetingLocation(rawCommand) || profile.supportLocation;
        setCommandReply(location
          ? `Emergency logged at ${cravingLevel}/10. Opening meetings for ${location}. Human support now, not later.`
          : `Emergency logged at ${cravingLevel}/10. Opening meetings now. Human support now, not later.`);
        navigate(location ? `/meetings?q=${encodeURIComponent(location)}` : '/meetings');
        return;
      }

      if (!hasSupportContact(profile)) {
        setCommandReply(`Emergency logged at ${cravingLevel}/10. Opening Rescue. Add a support contact so Talk can text the right person.`);
        navigate(emergencyRescuePath);
        return;
      }

      if (wantsEmergencySupportCall(command)) {
        setCommandReply(`Emergency logged at ${cravingLevel}/10. Opening Rescue and calling ${supportName} now.`);
        navigate(emergencyRescuePath);
        window.setTimeout(() => {
          window.location.href = buildSupportTelHref(profile);
        }, 150);
        return;
      }

      if (wantsEmergencySupportText(command) || /\b(help now|support now|about to drink|going to drink|gonna drink|might drink|close to drinking)\b/.test(command)) {
        setCommandReply(`Emergency logged at ${cravingLevel}/10. Opening Rescue and texting ${supportName} now.`);
        navigate(emergencyRescuePath);
        window.setTimeout(() => {
          window.location.href = buildSupportSmsHref(profile, EMERGENCY_SUPPORT_SMS);
        }, 150);
        return;
      }

      setCommandReply(`Emergency logged at ${cravingLevel}/10. Opening the support chain now.`);
      navigate(emergencyRescuePath);
      return;
    }

    if (/(support\s+(?:base|area|location)|recovery\s+area)/.test(command)) {
      const location = extractSupportBase(rawCommand);
      if (!location) {
        setCommandReply('Tell me the support area too. Example: “Set support area Burnaby, BC.”');
        return;
      }
      const current = loadData();
      saveData({ profile: { ...current.profile, supportLocation: location } });
      setCommandReply(`Support area saved as ${location}. Meetings and Rescue will reuse it.`);
      return;
    }

    if (/(text|message|sms).*(support|safe person|contact)|(?:support|safe person|contact).*(text|message|sms)/.test(command)) {
      const profile = loadData().profile;
      if (!hasSupportContact(profile)) {
        setCommandReply('No support contact saved yet. Opening Setup so you can lock one in.');
        navigate('/setup-profile');
        return;
      }
      setCommandReply(`Opening SMS to ${getSupportContactLabel(profile)} now.`);
      window.location.href = buildSupportSmsHref(profile, 'I need support right now. Can you check in with me for the next 10 minutes?');
      return;
    }

    if (/(support contact|support person|safe person|recovery contact)/.test(command) && /(set|save|update|add|change|my .* is)/.test(command)) {
      const current = loadData();
      const supportPhone = extractSupportPhone(rawCommand) || current.profile.supportPhone;
      const supportName = extractSupportName(rawCommand) || current.profile.supportName;
      const supportLocation = extractSupportBase(rawCommand) || current.profile.supportLocation;

      if (!supportPhone && !supportName) {
        setCommandReply('Tell me the contact name and phone. Example: “Set support contact Brother Mike 604-555-1234.”');
        return;
      }

      saveData({
        profile: {
          ...current.profile,
          supportName,
          supportPhone,
          supportLocation,
        },
      });

      setCommandReply(`Support contact saved: ${supportName || 'safe person'}${supportPhone ? ` • ${supportPhone}` : ''}${supportLocation ? ` • ${supportLocation}` : ''}.`);
      return;
    }

    if (/(slipped|relapsed|drank|reset sober|reset streak)/.test(command)) {
      const data = loadData();
      const entry = makeCheckInFromCommand(rawCommand, false);
      saveData({ checkIns: { ...data.checkIns, [entry.date]: { ...entry, note: appendCommandNote(data.checkIns[entry.date]?.note, rawCommand) } } });
      setCommandReply('Slip logged without shame. Open Rescue, reset the next decision, and get back in command.');
      navigate('/rescue');
      return;
    }

    if (/(trained|worked out|workout done|lifted|gym done|log workout|log training)/.test(command) && /(check.?in|mood|sober today|still sober|craving|urge|crave)/.test(command)) {
      const data = loadData();
      const checkIn = makeCheckInFromCommand(rawCommand, true);
      const training = makeTrainingEntryFromCommand(rawCommand);
      const proof = makeTalkTrainingProof(training);
      saveData({
        checkIns: { ...data.checkIns, [checkIn.date]: checkIn },
        fitnessEntries: [training, ...data.fitnessEntries],
        completedLoadouts: [proof, ...data.completedLoadouts],
        latestVictoryProof: proof,
      });
      setCommandReply(`Saved both: sober check-in craving ${checkIn.craving}/10 + ${training.durationMinutes} min ${training.type}. Victory proof is ready.`);
      return;
    }

    if (/(check.?in|mood|sober today|log today|still sober)/.test(command)) {
      const data = loadData();
      const entry = makeCheckInFromCommand(rawCommand, true);
      saveData({ checkIns: { ...data.checkIns, [entry.date]: entry } });
      setCommandReply(`Check-in saved: ${entry.mood}, craving ${entry.craving}/10, sober today.`);
      return;
    }

    if (/(trained|worked out|workout done|lifted|gym done|log workout|log training)/.test(command)) {
      const data = loadData();
      const entry = makeTrainingEntryFromCommand(rawCommand);
      const proof = makeTalkTrainingProof(entry);
      saveData({
        fitnessEntries: [entry, ...data.fitnessEntries],
        completedLoadouts: [proof, ...data.completedLoadouts],
        latestVictoryProof: proof,
      });
      setCommandReply(`Training logged: ${entry.type}, ${entry.durationMinutes} min, ${entry.intensity}. Victory proof is ready.`);
      return;
    }

    if (/(body|weight|weigh|height|macro|calorie|protein|carb|fat loss|cut|bulk|recomp)/.test(command)) {
      const nextProfile = parseBodyProfileFromCommand(rawCommand, loadData().bodyProfile);
      const targets = calculateMacroTargets(nextProfile);
      saveData({ bodyProfile: nextProfile });
      setBodyProfile(nextProfile);
      if (targets) {
        setCommandReply(`Body logged. Target ${targets.targetCalories} cal • ${targets.proteinGrams}g protein • ${targets.carbGrams}g carbs • ${targets.fatGrams}g fat for ${targets.goalLabel}.`);
      } else {
        setCommandReply('Body log started. Tell me weight, height, age, sex, goal, and training days to calculate macros. Example: 200 lb, 5\'10, 30, male, cut fat, train 5 days.');
      }
      return;
    }

    if (/(meeting|meetings|aa|na|group|support)/.test(command)) {
      const location = extractMeetingLocation(rawCommand);
      const savedLocation = loadData().profile.supportLocation;
      const nextLocation = location || savedLocation;
      setCommandReply(location
        ? `Opening Meetings for ${location}. Human support beats white-knuckling.`
        : savedLocation
          ? `Opening Meetings for your saved support base: ${savedLocation}. Human support beats white-knuckling.`
          : 'Opening Meetings. Human support beats white-knuckling.');
      navigate(nextLocation ? `/meetings?q=${encodeURIComponent(nextLocation)}` : '/meetings');
      return;
    }

    if (/(start|begin).*(workout|training|lift)|workout.*(start|begin)/.test(command)) {
      const activeLoadout = loadData().activeLoadout;
      if (activeLoadout) {
        setCommandReply('Opening Workout Mode. Clean reps. No bargaining.');
        navigate('/workout-mode');
      } else {
        const starterLoadout = seedStarterLoadout();
        setCommandReply(`No active loadout yet. Starter loadout seeded. Opening ${starterLoadout.title}.`);
        navigate('/workout-mode');
      }
      return;
    }

    if (/(workout|training|lift|ppl|push|pull|legs|arnold|dumbbell|split)/.test(command)) {
      const nextId = command.includes('arnold') ? 'arnold' : command.includes('dumbbell') ? 'dumbbell' : command.includes('crav') ? 'craving' : 'ppl';
      setSelectedId(nextId);
      setCommandReply('Building your workout loadout. Save it, run it, then log proof.');
      return;
    }

    if (/(craving|urge|relapse|drink|emergency)/.test(command)) {
      const { cravingLevel } = saveCravingCommandState(rawCommand, 7);
      setCommandReply(`Craving logged at ${cravingLevel}/10. Opening Rescue. Ten minutes. No bargaining.`);
      navigate('/rescue');
      return;
    }

    if (/(victory|share|card)/.test(command)) {
      setCommandReply('Opening Victory Card. Make the proof visible.');
      navigate('/share-progress');
      return;
    }

    if (/(proof|progress|streak|stats)/.test(command)) {
      setCommandReply('Showing proof. Receipts beat promises.');
      navigate('/proof');
      return;
    }

    if (/(check.?in|mood|sober today)/.test(command)) {
      setCommandReply('Opening check-in. Log the win before the day gets loud.');
      navigate('/check-in');
      return;
    }

    setCommandReply('I can route you to meetings, rescue, workouts, check-in, proof, support contact, or Victory Cards. Try a quick command.');
  };

  const startVoiceCommand = () => {
    if (!voiceSupported) {
      setVoiceStatus('Voice is not supported in this browser yet. Type the command and run it.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      setVoiceStatus('Voice stopped.');
      return;
    }

    const voiceWindow = window as VoiceWindow;
    const Recognition = voiceWindow.SpeechRecognition || voiceWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setListening(true);
      setVoiceStatus('Listening. Say: “I trained 45 minutes” or “I’m craving 8/10.”');
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      setVoiceStatus(`Voice blocked or failed: ${event.error}. Typed command still works.`);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript.trim();
      if (!transcript) {
        setVoiceStatus('I did not catch that. Try again or type it.');
        return;
      }
      setVoiceStatus(`Heard: “${transcript}”`);
      handleCommand(transcript);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setVoiceStatus('Voice could not start. Type the command and run it.');
    }
  };

  return (
    <div className="page warrior-page talk-page loadout-page stack-lg">
      <section className="talk-hero loadout-hero">
        <div className="talk-orb loadout-orb" aria-label="Coach Loadouts">
          <span />
        </div>
        <span className="talk-kicker">Talk Command</span>
        <h1>Talk to Iron Habit.</h1>
        <p>Tap voice or type. Meetings, workouts, rescue, check-ins, proof, macros, and training logs route from here.</p>
      </section>

      <section className="coach-card command-mission-card">
        <div className="coach-head">
          <span>Today’s command stack</span>
          <b>{todaysCheckIn ? 'Check-in done' : 'Check-in open'} • {trainedToday ? 'Training done' : 'Training open'} • {proofReadyToday ? 'Proof ready' : 'Proof open'}</b>
        </div>
        <span className="mission-label">{talkNextMove.label}</span>
        <h2>{talkNextMove.title}</h2>
        <p>{talkNextMove.detail}</p>
        <div className="proof-grid mini-proof macro-grid" aria-label="Talk state snapshot">
          <div><strong>{todaysCheckIn ? `${todaysCheckIn.craving}/10` : 'Open'}</strong><span>craving</span></div>
          <div><strong>{supportReady ? 'Ready' : 'Missing'}</strong><span>safe person</span></div>
          <div><strong>{dataSnapshot.activeLoadout ? 'Loaded' : 'Starter'}</strong><span>workout</span></div>
          <div><strong>{talkNextMove.status}</strong><span>next</span></div>
        </div>
        <div className="hero-actions command-actions">
          <button className="btn btn-primary" type="button" onClick={() => handleCommand('Next best move')}>Do Next Move</button>
          <button className="btn btn-secondary" type="button" onClick={() => handleCommand('I trained today')}>Log Training</button>
        </div>
      </section>

      <section className="coach-card talk-safety-rail stack-sm">
        <div className="coach-head">
          <span>Craving safety rail</span>
          <b>{supportReady ? 'Safe person ready' : 'Add safe person'}</b>
        </div>
        <h2>If the urge spikes, do not negotiate.</h2>
        <p>Talk will save the emergency check-in first, open the 10-minute Rescue chain, then hand off to your support contact or meetings.</p>
        <div className="hero-actions command-actions">
          <button className="btn btn-danger" type="button" onClick={() => handleCommand('I am about to drink text my support person')}>Start emergency chain</button>
          {supportReady ? (
            <>
              <a className="btn btn-secondary" href={buildSupportTelHref(supportProfile)}>Call {supportLabel}</a>
              <a className="btn btn-ghost" href={buildSupportSmsHref(supportProfile, EMERGENCY_SUPPORT_SMS)}>Text {supportLabel}</a>
            </>
          ) : (
            <Link to="/setup-profile" className="btn btn-secondary">Set support contact</Link>
          )}
          <button className="btn btn-ghost" type="button" onClick={() => handleCommand('I need a meeting')}>Find a meeting</button>
        </div>
      </section>

      <section className="loadout-console command-console">
        <label htmlFor="coach-message">Command Iron Habit</label>
        <textarea
          id="coach-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Example: I trained 45 min hard, still sober craving 2/10, or I’m 200 lb, 5'10, 30, male, cut fat"
        />
        <div className="hero-actions command-actions">
          <button className={`btn ${listening ? 'btn-danger' : 'btn-secondary'} voice-command-btn`} type="button" onClick={startVoiceCommand}>
            {listening ? 'Listening… tap to stop' : '🎙 Talk Command'}
          </button>
          <button className="btn btn-primary" type="button" onClick={() => handleCommand()}>Run Typed Command</button>
          <Link to="/rescue" className="btn btn-danger">Rescue</Link>
        </div>
        <p className="voice-status">{voiceStatus}</p>
        <div className="command-chip-grid" aria-label="Quick commands">
          {quickCommands.map((command) => (
            <button key={command} type="button" onClick={() => handleCommand(command)}>{command}</button>
          ))}
        </div>
        <p className="command-reply">{commandReply}</p>
        {talkProof && (
          <div className="talk-proof-reward stack-sm" aria-label="Talk proof saved">
            <span className="tag">Talk proof saved</span>
            <h3>{talkProof.title}</h3>
            <p>{talkProof.proofCopy}</p>
            <div className="hero-actions command-actions">
              <Link to="/share-progress" className="btn btn-primary">Make Victory Card</Link>
              <Link to="/proof" className="btn btn-secondary">View Proof Stack</Link>
            </div>
          </div>
        )}
        {talkCravingReceipt && (
          <div className="talk-proof-reward stack-sm" aria-label="Talk craving receipt saved">
            <span className="tag">Craving receipt saved</span>
            <h3>{talkCravingReceipt.craving}/10 urge survived</h3>
            <p>Rescue win logged for today. No alcohol, craving rescue, proof stacked.</p>
            <div className="hero-actions command-actions">
              <Link to={`/share-progress?template=craving&receipt=${talkCravingReceipt.date}`} className="btn btn-danger">Make Craving Card</Link>
              <Link to="/proof" className="btn btn-secondary">View Proof Vault</Link>
            </div>
          </div>
        )}
      </section>

      <section className="coach-card body-target-card stack-sm">
        <div className="coach-head">
          <span>Support Contact</span>
          <b>{supportReady ? 'Locked in' : 'Missing'}</b>
        </div>
        <h2>{supportReady ? supportLabel : 'Add your safe person to Talk.'}</h2>
        <p>
          {supportReady
            ? `${supportProfile.supportPhone || 'Phone saved'} • ${supportProfile.supportLocation || 'Support base ready'}`
            : 'Try: “Set support contact Brother Mike 604-555-1234” or “Set support area Burnaby, BC.”'}
        </p>
        <div className="hero-actions command-actions">
          {supportReady ? (
            <a className="btn btn-secondary" href={buildSupportSmsHref(supportProfile, 'I need support right now. Can you check in with me for the next 10 minutes?')}>Text {supportLabel}</a>
          ) : (
            <Link to="/setup-profile" className="btn btn-secondary">Set support contact</Link>
          )}
          <button className="btn btn-ghost" type="button" onClick={() => handleCommand('Set support area Burnaby, BC')}>Set support area</button>
        </div>
      </section>

      <section className="coach-card body-target-card stack-sm">
        <div className="coach-head">
          <span>Body + Macro Targets</span>
          <b>{bodyProfile.bodyGoal.replace('-', ' ')}</b>
        </div>
        {macroTargets ? (
          <>
            <div className="proof-grid mini-proof macro-grid">
              <div><strong>{macroTargets.targetCalories}</strong><span>daily calories</span></div>
              <div><strong>{macroTargets.proteinGrams}g</strong><span>protein</span></div>
              <div><strong>{macroTargets.carbGrams}g</strong><span>carbs</span></div>
              <div><strong>{macroTargets.fatGrams}g</strong><span>fat</span></div>
            </div>
            <p>{bodyProfile.weightLbs} lb • {formatHeight(bodyProfile.heightInches)} • maintenance ~{macroTargets.maintenanceCalories} cal. Talk can update this anytime.</p>
          </>
        ) : (
          <p>Tell Talk your body stats to unlock calories and macros: “I’m 200 lb, 5'10, 30, male, cut fat, train 5 days.”</p>
        )}
      </section>

      <section className="loadout-console">
        <label>Coach Loadout settings</label>
        <div className="loadout-control-grid">
          <select value={goal} onChange={(event) => setGoal(event.target.value)} aria-label="Goal">
            {goals.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={time} onChange={(event) => setTime(event.target.value)} aria-label="Time">
            {times.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={level} onChange={(event) => setLevel(event.target.value)} aria-label="Level">
            {levels.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </section>

      <section className="talk-mode-grid loadout-tabs" aria-label="Loadout templates">
        {loadouts.map((mode) => (
          <button
            key={mode.id}
            className={detectedId === mode.id ? 'selected' : ''}
            onPointerDown={() => {
              setSelectedId(mode.id);
              setMessage(mode.id === 'craving' ? 'I have a craving. Build me a craving killer workout.' : `Make me a ${mode.label} split.`);
            }}
            onClick={() => {
              setSelectedId(mode.id);
              setMessage(mode.id === 'craving' ? 'I have a craving. Build me a craving killer workout.' : `Make me a ${mode.label} split.`);
            }}
          >
            {mode.label}
          </button>
        ))}
      </section>

      <section className="coach-card loadout-summary">
        <div className="coach-head">
          <span>{coachLine}</span>
          <b>{level} • {time}</b>
        </div>
        <h2>{loadout.title}</h2>
        <p>{loadout.subtitle}</p>
        <div className="split-strip" aria-label="Weekly split">
          {loadout.days.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>
        <div className="loadout-objective">
          <b>Mission intent</b>
          <span>{loadout.intent}</span>
        </div>
        {savedMessage && <p className="success-msg">{savedMessage}</p>}
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={saveLoadout}>Save This Loadout</button>
          <Link to="/train" className="btn btn-ghost">View in Train</Link>
        </div>
      </section>

      <section className="exercise-stack" aria-label="Exercise cards">
        {loadout.exercises.map((exercise) => (
          <article className="exercise-card" key={exercise.name}>
            <div className="exercise-demo" aria-label={`${exercise.name} demo placeholder`}>
              <span>{exercise.icon}</span>
              <i />
            </div>
            <div className="exercise-copy">
              <span className="exercise-muscle">{exercise.muscle} • {exercise.equipment}</span>
              <h3>{exercise.name}</h3>
              <div className="prescription-grid">
                <b>{exercise.sets}<small>sets</small></b>
                <b>{exercise.reps}<small>reps</small></b>
                <b>{exercise.rest}<small>rest</small></b>
              </div>
              <p>{exercise.cue}</p>
              <details>
                <summary>Form warning + swap</summary>
                <span><strong>Watch:</strong> {exercise.mistake}</span>
                <span><strong>Swap:</strong> {exercise.swap}</span>
              </details>
            </div>
          </article>
        ))}
      </section>

      <section className="safety-card loadout-finish">
        <b>Finisher</b>
        <span>{loadout.finisher}</span>
        <div className="hero-actions">
          <Link to="/train" className="btn btn-primary">Log Training</Link>
          <button className="btn btn-secondary" onClick={saveLoadout}>Save Program</button>
          <Link to="/rescue" className="btn btn-ghost">Open Rescue</Link>
        </div>
      </section>
    </div>
  );
};

export default TalkCoach;
