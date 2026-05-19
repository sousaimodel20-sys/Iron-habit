import { useMemo, useState } from 'react';
import { Button, Card, Field, PageHeader, Stat } from '../components/UI';
import { loadData, saveData, type FitnessEntry } from '../utils/storage';

const activityTypes = ['Gym', 'Walk', 'Run', 'Mobility', 'Boxing', 'Yoga'];
const intensities = ['Easy', 'Moderate', 'Hard', 'Beast mode'];

const FitnessTracker = () => {
  const [entries, setEntries] = useState<FitnessEntry[]>(() => loadData().fitnessEntries);
  const [type, setType] = useState(activityTypes[0]);
  const [duration, setDuration] = useState(45);
  const [intensity, setIntensity] = useState(intensities[1]);
  const [note, setNote] = useState('');


  const totalMinutes = useMemo(() => entries.reduce((sum, entry) => sum + entry.durationMinutes, 0), [entries]);
  const thisWeek = useMemo(() => entries.slice(0, 7).length, [entries]);

  const persist = (next: FitnessEntry[]) => {
    setEntries(next);
    saveData({ fitnessEntries: next });
  };

  const addEntry = () => {
    const entry: FitnessEntry = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      type,
      durationMinutes: Math.max(1, duration),
      intensity,
      note: note.trim(),
    };
    persist([entry, ...entries]);
    setNote('');
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

      <Card className="stack-md">
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
        <Button onClick={addEntry}>Log workout</Button>
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
