import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/UI';
import { loadData, saveData, type CompletedLoadout, type FitnessEntry } from '../utils/storage';

const today = () => new Date().toISOString().slice(0, 10);

const setsAsNumber = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

const WorkoutMode = () => {
  const [data, setData] = useState(() => loadData());
  const [finished, setFinished] = useState(false);
  const [victoryProof, setVictoryProof] = useState<CompletedLoadout | null>(null);

  const loadout = data.activeLoadout;
  const activeDay = useMemo(() => {
    if (!loadout) return '';
    const dayIndex = new Date().getDay();
    return loadout.days[(dayIndex + 6) % loadout.days.length] || loadout.days[0];
  }, [loadout]);

  if (!loadout) {
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <Card className="active-program-card stack-md">
          <span className="tag">No Active Routine</span>
          <h1>Save a split first.</h1>
          <p>Generate a PPL, Arnold, dumbbell, or craving-killer routine, then come back here to view the full plan.</p>
          <Link to="/talk" className="btn btn-primary">Open Coach Loadouts</Link>
        </Card>
      </div>
    );
  }

  const totalSets = loadout.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0);

  const logRoutineComplete = () => {
    const minutes = Number.parseInt(loadout.time, 10) || 45;
    const intensity = loadout.level === 'Advanced' ? 'Beast mode' : loadout.level === 'Beginner' ? 'Moderate' : 'Hard';
    const date = today();
    const proof: CompletedLoadout = {
      id: `${Date.now()}`,
      date,
      title: loadout.title,
      label: loadout.label,
      activeDay,
      durationMinutes: minutes,
      intensity,
      exercises: loadout.exercises.map((item) => item.name),
      completedSets: totalSets,
      totalSets,
      finisher: loadout.finisher,
      proofCopy: 'Routine completed. Proof logged. Receipts beat promises.',
    };
    const entry: FitnessEntry = {
      id: proof.id,
      date,
      type: loadout.label,
      durationMinutes: minutes,
      intensity,
      note: `${activeDay}: ${loadout.exercises.map((item) => item.name).join(', ')}. ${loadout.finisher}`,
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
          <span className="talk-kicker">Routine Logged</span>
          <h1>Proof saved.</h1>
          <p>Routine completed. Proof logged. Receipts beat promises.</p>
          {proof && (
            <>
              <div className="victory-proof-grid">
                <span><b>{proof.title}</b><small>routine</small></span>
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
            <button type="button" className="btn btn-secondary" onClick={() => setFinished(false)}>View Routine Again</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page warrior-page workout-mode-page stack-lg">
      <section className="routine-sheet-card stack-md">
        <div className="active-program-head">
          <div>
            <span className="tag">Routine Sheet</span>
            <h1>{loadout.title}</h1>
            <p>{loadout.goal} • {loadout.level} • {loadout.time}</p>
          </div>
          <strong>{activeDay}</strong>
        </div>

        <div className="split-strip" aria-label="Weekly split">
          {loadout.days.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>

        <div className="routine-summary-grid">
          <span><b>{loadout.exercises.length}</b><small>exercises</small></span>
          <span><b>{totalSets}</b><small>total sets</small></span>
          <span><b>{loadout.time}</b><small>target time</small></span>
        </div>
      </section>

      <section className="routine-exercise-list" aria-label="Routine exercises">
        {loadout.exercises.map((exercise, index) => (
          <article className="routine-exercise-row" key={exercise.name}>
            <div className="routine-exercise-index">{index + 1}</div>
            <div>
              <span className="exercise-muscle">{exercise.muscle} • {exercise.equipment}</span>
              <h2>{exercise.name}</h2>
              <div className="prescription-grid workout-prescription">
                <b>{exercise.sets}<small>sets</small></b>
                <b>{exercise.reps}<small>reps</small></b>
                <b>{exercise.rest}<small>rest</small></b>
              </div>
              <details className="workout-form-note">
                <summary>Form cue + swap</summary>
                <span><strong>Cue:</strong> {exercise.cue}</span>
                <span><strong>Watch:</strong> {exercise.mistake}</span>
                <span><strong>Swap:</strong> {exercise.swap}</span>
              </details>
            </div>
          </article>
        ))}
      </section>

      <Card className="workout-nav-card routine-log-card">
        <div>
          <span className="tag">Finish</span>
          <h2>Done with the routine?</h2>
          <p>Log it once. No set-by-set babysitting.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={logRoutineComplete}>Log Routine Complete</button>
      </Card>
    </div>
  );
};

export default WorkoutMode;
