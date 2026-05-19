import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../components/UI';
import { loadData, saveData, type FitnessEntry } from '../utils/storage';

const today = () => new Date().toISOString().slice(0, 10);

const setsAsNumber = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

const WorkoutMode = () => {
  const [data, setData] = useState(() => loadData());
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState(false);

  const loadout = data.activeLoadout;
  const exercise = loadout?.exercises[exerciseIndex];
  const activeDay = useMemo(() => {
    if (!loadout) return '';
    const dayIndex = new Date().getDay();
    return loadout.days[(dayIndex + 6) % loadout.days.length] || loadout.days[0];
  }, [loadout]);

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

  const targetSets = setsAsNumber(exercise.sets);
  const doneSets = completedSets[exercise.name] || 0;
  const totalSets = loadout.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0);
  const allDoneSets = Object.values(completedSets).reduce((sum, count) => sum + count, 0);
  const progress = Math.min(100, Math.round((allDoneSets / totalSets) * 100));

  const completeSet = () => {
    setCompletedSets((current) => ({
      ...current,
      [exercise.name]: Math.min(targetSets, doneSets + 1),
    }));
  };

  const nextExercise = () => {
    setExerciseIndex((current) => Math.min(loadout.exercises.length - 1, current + 1));
  };

  const previousExercise = () => {
    setExerciseIndex((current) => Math.max(0, current - 1));
  };

  const finishWorkout = () => {
    const minutes = Number.parseInt(loadout.time, 10) || 45;
    const entry: FitnessEntry = {
      id: `${Date.now()}`,
      date: today(),
      type: loadout.label,
      durationMinutes: minutes,
      intensity: loadout.level === 'Advanced' ? 'Beast mode' : loadout.level === 'Beginner' ? 'Moderate' : 'Hard',
      note: `${activeDay}: Completed guided loadout — ${loadout.exercises.map((item) => item.name).join(', ')}. ${loadout.finisher}`,
    };
    const nextData = saveData({ fitnessEntries: [entry, ...data.fitnessEntries] });
    setData(nextData);
    setFinished(true);
  };

  if (finished) {
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <section className="workout-complete-card">
          <span className="talk-kicker">Workout Complete</span>
          <h1>Proof saved.</h1>
          <p>Another vote against the old life. Training logged to your proof stack.</p>
          <div className="workout-progress-ring"><strong>+{Number.parseInt(loadout.time, 10) || 45}</strong><span>minutes</span></div>
          <div className="hero-actions">
            <Link to="/fitness-tracker" className="btn btn-primary">Back to Train</Link>
            <Link to="/share-progress" className="btn btn-ghost">Victory Card</Link>
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
        <Button onClick={completeSet} disabled={doneSets >= targetSets}>
          {doneSets >= targetSets ? 'Sets Complete' : 'Complete Set'}
        </Button>
        <details className="workout-form-note">
          <summary>Form warning + swap</summary>
          <span><strong>Watch:</strong> {exercise.mistake}</span>
          <span><strong>Swap:</strong> {exercise.swap}</span>
        </details>
      </section>

      <section className="workout-nav-card">
        <Button variant="ghost" onClick={previousExercise} disabled={exerciseIndex === 0}>Previous</Button>
        {exerciseIndex < loadout.exercises.length - 1 ? (
          <Button onClick={nextExercise}>Next Exercise</Button>
        ) : (
          <Button onClick={finishWorkout}>Finish + Log Proof</Button>
        )}
      </section>
    </div>
  );
};

export default WorkoutMode;
