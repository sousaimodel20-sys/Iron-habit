import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/UI';
import { loadData, saveData, type CompletedLoadout, type FitnessEntry } from '../utils/storage';

const today = () => new Date().toISOString().slice(0, 10);

const setsAsNumber = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

const restSecondsFor = (rest: string) => {
  const lower = rest.toLowerCase();
  if (lower.includes('min') || Number.parseInt(lower, 10) >= 90) return 90;
  if (Number.parseInt(lower, 10) >= 60) return 60;
  return 30;
};

const WorkoutMode = () => {
  const [data, setData] = useState(() => loadData());
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [restRemaining, setRestRemaining] = useState(0);
  const [statusLine, setStatusLine] = useState('Lock in. Clean reps only.');
  const [finished, setFinished] = useState(false);
  const [victoryProof, setVictoryProof] = useState<CompletedLoadout | null>(null);

  const loadout = data.activeLoadout;
  const exercise = loadout?.exercises[exerciseIndex];
  const activeDay = useMemo(() => {
    if (!loadout) return '';
    const dayIndex = new Date().getDay();
    return loadout.days[(dayIndex + 6) % loadout.days.length] || loadout.days[0];
  }, [loadout]);

  const targetSets = exercise ? setsAsNumber(exercise.sets) : 0;
  const doneSets = exercise ? completedSets[exercise.name] || 0 : 0;
  const totalSets = loadout?.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0) || 1;
  const allDoneSets = Object.values(completedSets).reduce((sum, count) => sum + count, 0);
  const progress = Math.min(100, Math.round((allDoneSets / totalSets) * 100));

  useEffect(() => {
    if (restRemaining <= 0) return;
    const timer = window.setTimeout(() => setRestRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [restRemaining]);

  const displayStatus = restRemaining === 0 && statusLine.startsWith('Rest')
    ? 'Rest over. Take the next set.'
    : statusLine;

  if (!loadout || !exercise) {
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <Card className="active-program-card stack-md">
          <span className="tag">No Active Program</span>
          <h1>Save a Coach Loadout first.</h1>
          <p>Generate a PPL, Arnold, dumbbell, or craving-killer plan, then come back here to run it one exercise at a time.</p>
          <Link to="/talk" className="btn btn-primary">Open Coach Loadouts</Link>
        </Card>
      </div>
    );
  }

  const completeSet = () => {
    setCompletedSets((current) => {
      const nextCount = Math.min(targetSets, (current[exercise.name] || 0) + 1);
      const next = { ...current, [exercise.name]: nextCount };

      if (nextCount >= targetSets) {
        setRestRemaining(0);
        setStatusLine('Exercise conquered. Move to the next station.');
      } else {
        const seconds = restSecondsFor(exercise.rest);
        setRestRemaining(seconds);
        setStatusLine(`Rest ${seconds}s. Breathe. Do not negotiate with the old life.`);
      }

      return next;
    });
  };

  const nextExercise = () => {
    setExerciseIndex((current) => Math.min(loadout.exercises.length - 1, current + 1));
    setRestRemaining(0);
    setStatusLine('New exercise. First rep sets the tone.');
  };

  const previousExercise = () => {
    setExerciseIndex((current) => Math.max(0, current - 1));
    setRestRemaining(0);
    setStatusLine('Back one station. Clean up the work.');
  };

  const finishWorkout = () => {
    const minutes = Number.parseInt(loadout.time, 10) || 45;
    const intensity = loadout.level === 'Advanced' ? 'Beast mode' : loadout.level === 'Beginner' ? 'Moderate' : 'Hard';
    const date = today();
    const completedSetCount = Math.max(allDoneSets, totalSets);
    const proof: CompletedLoadout = {
      id: `${Date.now()}`,
      date,
      title: loadout.title,
      label: loadout.label,
      activeDay,
      durationMinutes: minutes,
      intensity,
      exercises: loadout.exercises.map((item) => item.name),
      completedSets: completedSetCount,
      totalSets,
      finisher: loadout.finisher,
      proofCopy: 'Another vote against the old life. Proof logged. The new identity gets stronger.',
    };
    const entry: FitnessEntry = {
      id: proof.id,
      date,
      type: loadout.label,
      durationMinutes: minutes,
      intensity,
      note: `${activeDay}: Completed guided loadout — ${loadout.exercises.map((item) => item.name).join(', ')}. ${loadout.finisher}`,
    };
    const nextData = saveData({
      fitnessEntries: [entry, ...data.fitnessEntries],
      completedLoadouts: [proof, ...data.completedLoadouts],
      latestVictoryProof: proof,
    });
    setData(nextData);
    setVictoryProof(proof);
    setFinished(true);
  };

  if (finished) {
    const proof = victoryProof;
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <section className="workout-complete-card victory-complete-card">
          <span className="talk-kicker">Workout Conquered</span>
          <h1>Proof saved.</h1>
          <p>Another vote against the old life. Proof logged. The new identity gets stronger.</p>
          {proof && (
            <>
              <div className="victory-proof-grid">
                <span><b>{proof.title}</b><small>loadout</small></span>
                <span><b>{proof.activeDay}</b><small>split</small></span>
                <span><b>{proof.durationMinutes}</b><small>minutes</small></span>
                <span><b>{proof.completedSets}</b><small>sets</small></span>
              </div>
              <div className="victory-exercise-list" aria-label="Exercises completed">
                {proof.exercises.map((name) => <span key={name}>{name}</span>)}
              </div>
            </>
          )}
          <div className="workout-progress-ring"><strong>+{proof?.durationMinutes || Number.parseInt(loadout.time, 10) || 45}</strong><span>minutes</span></div>
          <div className="hero-actions">
            <Link to="/fitness-tracker" className="btn btn-ghost">Back to Train</Link>
            <Link to="/share-progress" className="btn btn-primary">Create Victory Card</Link>
            <Link to="/workout-mode" className="btn btn-secondary" onClick={() => {
              setFinished(false);
              setExerciseIndex(0);
              setCompletedSets({});
              setRestRemaining(0);
              setStatusLine('Lock in. Clean reps only.');
            }}>Run Another Loadout</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page warrior-page workout-mode-page stack-lg">
      <section className="workout-session-card">
        <div className="workout-topline">
          <span>{loadout.title}</span>
          <b>{exerciseIndex + 1}/{loadout.exercises.length}</b>
        </div>
        <div className="workout-progress"><i style={{ width: `${progress}%` }} /></div>
        <div className="exercise-demo workout-demo" aria-label={`${exercise.name} demo`}>
          <span>{exercise.icon}</span>
          <i />
        </div>
        <span className="exercise-muscle">{activeDay} • {exercise.muscle} • {exercise.equipment}</span>
        <h1>{exercise.name}</h1>
        <div className="prescription-grid workout-prescription">
          <b>{exercise.sets}<small>sets</small></b>
          <b>{exercise.reps}<small>reps</small></b>
          <b>{exercise.rest}<small>rest</small></b>
        </div>
        <p>{exercise.cue}</p>
        <div className="set-tracker" aria-label="Completed sets">
          {Array.from({ length: targetSets }).map((_, index) => (
            <span key={index} className={index < doneSets ? 'done' : ''}>{index + 1}</span>
          ))}
        </div>
        <div className={`rest-card ${restRemaining > 0 ? 'active' : ''}`}>
          <b>{restRemaining > 0 ? `${restRemaining}s` : `${doneSets}/${targetSets}`}</b>
          <span>{displayStatus}</span>
          {restRemaining > 0 && <button type="button" onClick={() => setRestRemaining(0)}>Skip Rest</button>}
        </div>
        <button
          type="button"
          className="btn btn-primary workout-main-btn"
          onClick={completeSet}
          disabled={doneSets >= targetSets}
        >
          {doneSets >= targetSets ? 'Sets Complete' : 'Complete Set'}
        </button>
        <details className="workout-form-note">
          <summary>Form warning + swap</summary>
          <span><strong>Watch:</strong> {exercise.mistake}</span>
          <span><strong>Swap:</strong> {exercise.swap}</span>
        </details>
      </section>

      <section className="workout-nav-card">
        <button type="button" className="btn btn-ghost" onClick={previousExercise} disabled={exerciseIndex === 0}>Previous</button>
        {exerciseIndex < loadout.exercises.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={nextExercise}>Next Exercise</button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finishWorkout}>Finish + Log Proof</button>
        )}
      </section>
    </div>
  );
};

export default WorkoutMode;
