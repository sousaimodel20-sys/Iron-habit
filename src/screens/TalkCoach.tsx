import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loadData, saveData, type ActiveLoadout } from '../utils/storage';

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
  'I need a meeting',
  'Build me a workout',
  'Start my workout',
  'I’m craving',
  'Show my proof',
  'Make a Victory Card',
  'Log check-in',
];

const TalkCoach = () => {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('ppl');
  const [goal, setGoal] = useState(goals[0]);
  const [time, setTime] = useState(times[2]);
  const [level, setLevel] = useState(levels[1]);
  const [message, setMessage] = useState('Tell Iron Habit what you need.');
  const [savedMessage, setSavedMessage] = useState('');
  const [commandReply, setCommandReply] = useState('Talk is your command layer. Ask for meetings, workouts, rescue, proof, or check-in.');

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

  const handleCommand = (rawCommand = message) => {
    const command = rawCommand.toLowerCase();
    setMessage(rawCommand);

    if (/(meeting|meetings|aa|na|group|support)/.test(command)) {
      setCommandReply('Opening Meetings. Human support beats white-knuckling.');
      navigate('/meetings');
      return;
    }

    if (/(start|begin).*(workout|training|lift)|workout.*(start|begin)/.test(command)) {
      const activeLoadout = loadData().activeLoadout;
      if (activeLoadout) {
        setCommandReply('Opening Workout Mode. Clean reps. No bargaining.');
        navigate('/workout-mode');
      } else {
        setCommandReply('No active loadout yet. Building your workout loadout first.');
        setSelectedId('ppl');
        setMessage('Build me a workout');
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
      setCommandReply('Opening Rescue. Ten minutes. No bargaining.');
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
      navigate('/profile');
      return;
    }

    if (/(check.?in|mood|sober today)/.test(command)) {
      setCommandReply('Opening check-in. Log the win before the day gets loud.');
      navigate('/daily-check-in');
      return;
    }

    setCommandReply('I can route you to meetings, rescue, workouts, check-in, proof, or Victory Cards. Try a quick command.');
  };

  return (
    <div className="page warrior-page talk-page loadout-page stack-lg">
      <section className="talk-hero loadout-hero">
        <div className="talk-orb loadout-orb" aria-label="Coach Loadouts">
          <span />
        </div>
        <span className="talk-kicker">Talk Command</span>
        <h1>Tell Iron Habit what you need.</h1>
        <p>Meetings, workouts, rescue, check-ins, proof, and Victory Cards. Talk routes the app for you.</p>
      </section>

      <section className="loadout-console command-console">
        <label htmlFor="coach-message">Command Iron Habit</label>
        <textarea
          id="coach-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          placeholder="Example: I need a meeting, build me a workout, I’m craving..."
        />
        <div className="hero-actions command-actions">
          <button className="btn btn-primary" type="button" onClick={() => handleCommand()}>Run Command</button>
          <Link to="/rescue" className="btn btn-danger">Rescue</Link>
        </div>
        <div className="command-chip-grid" aria-label="Quick commands">
          {quickCommands.map((command) => (
            <button key={command} type="button" onClick={() => handleCommand(command)}>{command}</button>
          ))}
        </div>
        <p className="command-reply">{commandReply}</p>
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
          <Link to="/fitness-tracker" className="btn btn-ghost">View in Train</Link>
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
          <Link to="/fitness-tracker" className="btn btn-primary">Log Training</Link>
          <button className="btn btn-secondary" onClick={saveLoadout}>Save Program</button>
          <Link to="/craving-rescue" className="btn btn-ghost">Open Rescue</Link>
        </div>
      </section>
    </div>
  );
};

export default TalkCoach;
