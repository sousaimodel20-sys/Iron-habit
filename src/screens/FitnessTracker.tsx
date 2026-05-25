import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, PageHeader, Stat } from '../components/UI';
import { loadData, saveData, type ActiveLoadout, type CompletedLoadout, type FitnessEntry } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';
import { formatLocalDateKey } from '../utils/date';

const activityTypes = ['Gym', 'Walk', 'Run', 'Mobility', 'Boxing', 'Yoga'];
const intensities = ['Easy', 'Moderate', 'Hard', 'Beast mode'];

const FitnessTracker = () => {
  const [entries, setEntries] = useState<FitnessEntry[]>(() => loadData().fitnessEntries);
  const [activeLoadout, setActiveLoadout] = useState<ActiveLoadout | null>(() => loadData().activeLoadout);
  const [completedLoadouts, setCompletedLoadouts] = useState<CompletedLoadout[]>(() => loadData().completedLoadouts);
  const [type, setType] = useState(activityTypes[0]);
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState(intensities[1]);
  const [note, setNote] = useState('');
  const [quickProof, setQuickProof] = useState<CompletedLoadout | null>(null);
  const [manualProof, setManualProof] = useState<CompletedLoadout | null>(null);


  const totalMinutes = useMemo(() => entries.reduce((sum, entry) => sum + entry.durationMinutes, 0), [entries]);
  const thisWeek = useMemo(() => entries.slice(0, 7).length, [entries]);
  const activeDay = useMemo(() => {
    if (!activeLoadout) return '';
    const dayIndex = new Date().getDay();
    return activeLoadout.days[(dayIndex + 6) % activeLoadout.days.length] || activeLoadout.days[0];
  }, [activeLoadout]);

  const persist = (next: FitnessEntry[]) => {
    setEntries(next);
    saveData({ fitnessEntries: next });
  };

  const addEntry = () => {
    const date = formatLocalDateKey();
    const minutes = Math.max(1, duration);
    const soberDay = Math.max(1, calculateSobrietyStreak());
    const entry: FitnessEntry = {
      id: `${Date.now()}`,
      date,
      type,
      durationMinutes: minutes,
      intensity,
      note: note.trim(),
    };
    const proof: CompletedLoadout = {
      id: entry.id,
      date,
      title: `${type} Training Proof`,
      label: type,
      activeDay: 'Train Anyway',
      durationMinutes: minutes,
      intensity,
      exercises: [type],
      completedSets: 1,
      totalSets: 1,
      finisher: note.trim() || 'Manual training proof logged.',
      proofCopy: `Day ${soberDay} sober. ${type} conquered: ${minutes} minutes, ${intensity.toLowerCase()} intensity. Receipts beat promises.`,
    };
    const nextEntries = [entry, ...entries];
    const nextCompletedLoadouts = [proof, ...completedLoadouts];
    setEntries(nextEntries);
    setCompletedLoadouts(nextCompletedLoadouts);
    setManualProof(proof);
    saveData({ fitnessEntries: nextEntries, completedLoadouts: nextCompletedLoadouts, latestVictoryProof: proof });
    setNote('');
  };

  const logActiveLoadout = () => {
    if (!activeLoadout) return;

    const minutes = Number.parseInt(activeLoadout.time, 10) || 45;
    const intensityValue = activeLoadout.level === 'Advanced' ? 'Beast mode' : activeLoadout.level === 'Beginner' ? 'Moderate' : 'Hard';
    const date = formatLocalDateKey();
    const soberDay = Math.max(1, calculateSobrietyStreak());
    const totalSets = activeLoadout.exercises.reduce((sum, exercise) => sum + (Number.parseInt(exercise.sets, 10) || 3), 0);
    const proof: CompletedLoadout = {
      id: `${Date.now()}`,
      date,
      title: activeLoadout.title,
      label: activeLoadout.label,
      activeDay,
      durationMinutes: minutes,
      intensity: intensityValue,
      exercises: activeLoadout.exercises.map((exercise) => exercise.name),
      completedSets: totalSets,
      totalSets,
      finisher: activeLoadout.finisher,
      proofCopy: `Day ${soberDay} sober. ${activeLoadout.title} quick-completed: ${totalSets} sets, ${minutes} minutes. Proof stacked.`,
    };
    const entry: FitnessEntry = {
      id: proof.id,
      date,
      type: activeLoadout.label,
      durationMinutes: minutes,
      intensity: intensityValue,
      note: `${activeDay}: ${activeLoadout.exercises.map((exercise) => exercise.name).join(', ')}. ${activeLoadout.finisher}`,
    };

    const nextEntries = [entry, ...entries];
    const nextCompletedLoadouts = [proof, ...completedLoadouts];
    setEntries(nextEntries);
    setCompletedLoadouts(nextCompletedLoadouts);
    setQuickProof(proof);
    saveData({ fitnessEntries: nextEntries, completedLoadouts: nextCompletedLoadouts, latestVictoryProof: proof });
  };

  const clearActiveLoadout = () => {
    setActiveLoadout(null);
    saveData({ activeLoadout: null });
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Training Log" title="Train like you’re rebuilding your life.">
        Log training sessions and show proof that your new habits are changing your body and mind.
      </PageHeader>

      <div className="stats-grid">
        <Stat label="sessions" value={entries.length} />
        <Stat label="minutes" value={totalMinutes} tone="gold" />
        <Stat label="recent logs" value={thisWeek} />
      </div>

      {activeLoadout ? (
        <Card className="active-program-card stack-md">
          <div className="active-program-head">
            <div>
              <span className="tag">Active Program</span>
              <h2>{activeLoadout.title}</h2>
              <p>{activeLoadout.goal} • {activeLoadout.level} • {activeLoadout.time}</p>
            </div>
            <strong>{activeDay}</strong>
          </div>
          <div className="split-strip" aria-label="Saved weekly split">
            {activeLoadout.days.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
          </div>
          <div className="active-exercise-list">
            {activeLoadout.exercises.map((exercise) => (
              <span key={exercise.name}><b>{exercise.name}</b>{exercise.sets}×{exercise.reps}</span>
            ))}
          </div>
          <div className="hero-actions">
            <Link to="/workout-mode" className="btn btn-primary">View Routine</Link>
            <Button variant="secondary" onClick={logActiveLoadout}>Quick Complete</Button>
            <Button variant="ghost" onClick={clearActiveLoadout}>Clear</Button>
          </div>
        </Card>
      ) : (
        <Card className="active-program-card stack-sm">
          <span className="tag">No Active Program</span>
          <h2>Generate your next loadout with Coach.</h2>
          <p>Save a PPL, Arnold, dumbbell, or craving-killer plan and it will appear here.</p>
          <Link to="/talk" className="btn btn-primary">Open Coach Loadouts</Link>
        </Card>
      )}

      {quickProof && (
        <Card className="workout-complete-card victory-complete-card stack-md">
          <span className="tag danger-tag">Quick proof saved</span>
          <h2>{quickProof.title} conquered.</h2>
          <p>{quickProof.proofCopy}</p>
          <div className="victory-proof-grid">
            <span><b>{quickProof.durationMinutes}</b><small>minutes</small></span>
            <span><b>{quickProof.completedSets}</b><small>sets</small></span>
            <span><b>{quickProof.activeDay}</b><small>split</small></span>
            <span><b>{quickProof.exercises.length}</b><small>moves</small></span>
          </div>
          <div className="hero-actions">
            <Link to={`/share-progress?template=receipts&proof=${quickProof.id}`} className="btn btn-primary">Make Victory Card</Link>
            <Link to="/proof" className="btn btn-secondary">View Proof Stack</Link>
            <Button variant="ghost" onClick={() => setQuickProof(null)}>Hide</Button>
          </div>
        </Card>
      )}

      <Card className="proof-stack-card stack-md">
        <div className="section-title-row">
          <span>Proof Stack</span>
          <b>{completedLoadouts.length} loadouts conquered</b>
        </div>
        {completedLoadouts.length > 0 ? (
          <div className="completed-loadout-list">
            {completedLoadouts.slice(0, 3).map((proof) => (
              <article key={proof.id}>
                <div>
                  <span>{proof.date} • {proof.activeDay}</span>
                  <h3>{proof.title}</h3>
                  <p>{proof.durationMinutes} min • {proof.completedSets} sets • {proof.exercises.length} exercises</p>
                </div>
                <Link
                  to={`/share-progress?template=receipts&proof=${proof.id}`}
                  className="btn btn-ghost"
                  onClick={() => saveData({ latestVictoryProof: proof })}
                >
                  Victory Card
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p>No completed routine proof yet. View the routine, train it, then stack the first receipt.</p>
        )}
        <div className="hero-actions">
          {activeLoadout && <Link to="/workout-mode" className="btn btn-primary">View Active Routine</Link>}
          <Link to="/talk" className="btn btn-secondary">Open Coach Loadouts</Link>
        </div>
      </Card>

      <Card className="stack-md training-log-card">
        <div className="checkin-card-head">
          <div>
            <span className="tag">Train Anyway</span>
            <h2>Log movement even without a saved routine.</h2>
            <p>A walk, lift, run, or mobility session still counts as proof that you protected today.</p>
          </div>
          {manualProof && <span className="save-badge">Proof saved</span>}
        </div>

        <Field label="Activity">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {activityTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Duration minutes">
          <input type="number" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </Field>
        <Field label="Intensity">
          <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
            {intensities.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Session note">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Push day. Felt strong. No cravings after." />
        </Field>
        <div className="checkin-save-row">
          <Button onClick={addEntry}>Log training proof</Button>
          <Link to="/daily-check-in" className="btn btn-secondary">Check in next</Link>
        </div>
        {manualProof && (
          <div className="success-msg stack-sm">
            <strong>{manualProof.title} saved for {manualProof.date}.</strong>
            <span>{manualProof.proofCopy}</span>
            <div className="hero-actions">
              <Link to={`/share-progress?template=receipts&proof=${manualProof.id}`} className="btn btn-primary">Make Victory Card</Link>
              <Link to="/proof" className="btn btn-secondary">View Proof Stack</Link>
            </div>
          </div>
        )}
      </Card>

      <section className="list-stack">
        {entries.map((entry) => (
          <Card key={entry.id} className="list-card">
            <div>
              <span className="tag">{entry.date} • {entry.intensity}</span>
              <h3>{entry.type} — {entry.durationMinutes} min</h3>
              {entry.note && <p>{entry.note}</p>}
            </div>
            <Button variant="ghost" onClick={() => persist(entries.filter((item) => item.id !== entry.id))}>Remove</Button>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default FitnessTracker;
