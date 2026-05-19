import { useState } from 'react';
import { Button, Card, Field, PageHeader } from '../components/UI';
import { loadData, saveData, type Habit } from '../utils/storage';

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>(() => loadData().habits);
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [cadence, setCadence] = useState('Daily');


  const persist = (next: Habit[]) => {
    setHabits(next);
    saveData({ habits: next });
  };

  const addHabit = () => {
    if (!title.trim()) return;
    const habit: Habit = {
      id: `${Date.now()}`,
      title: title.trim(),
      why: why.trim() || 'This supports the person I am becoming.',
      cadence,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    persist([habit, ...habits]);
    setTitle('');
    setWhy('');
  };

  const deleteHabit = (id: string) => persist(habits.filter((habit) => habit.id !== id));

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Discipline Stack" title="Build systems stronger than urges.">
        Track the repeatable actions that make sobriety easier and confidence automatic.
      </PageHeader>

      <Card className="stack-md">
        <Field label="New habit">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meal prep after work" />
        </Field>
        <Field label="Why it matters">
          <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Keeps me fueled and away from old routines" />
        </Field>
        <Field label="Cadence">
          <select value={cadence} onChange={(e) => setCadence(e.target.value)}>
            <option>Daily</option>
            <option>Training days</option>
            <option>Weekdays</option>
            <option>Weekly</option>
          </select>
        </Field>
        <Button onClick={addHabit}>Add habit</Button>
      </Card>

      <section className="list-stack">
        {habits.map((habit) => (
          <Card key={habit.id} className="list-card">
            <div>
              <span className="tag">{habit.cadence}</span>
              <h3>{habit.title}</h3>
              <p>{habit.why}</p>
            </div>
            <Button variant="ghost" onClick={() => deleteHabit(habit.id)}>Remove</Button>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default HabitTracker;
