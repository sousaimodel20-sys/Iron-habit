import { useState } from 'react';
import { Button, Card, Field, PageHeader, Stat } from '../components/UI';
import { getTodayKey, loadData, saveData, type CheckIn } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';

const defaultHabits = ['No alcohol', 'Gym / movement', 'Protein meal', 'Meditation', 'Read / learn', 'Sleep routine'];

const DailyCheckIn = () => {
  const today = getTodayKey();
  const initialCheckIn = loadData().checkIns[today];
  const [selectedHabits, setSelectedHabits] = useState<string[]>(initialCheckIn?.habitsCompleted || []);
  const [sober, setSober] = useState(initialCheckIn?.sober ?? true);
  const [mood, setMood] = useState(initialCheckIn?.mood || 'Focused');
  const [craving, setCraving] = useState(initialCheckIn?.craving || 1);
  const [note, setNote] = useState(initialCheckIn?.note || '');
  const [savedCheckIn, setSavedCheckIn] = useState<CheckIn | null>(initialCheckIn || null);
  const [streak, setStreak] = useState(calculateSobrietyStreak());


  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) => (prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]));
  };

  const handleSave = () => {
    const data = loadData();
    const entry: CheckIn = { date: today, sober, mood, craving, note, habitsCompleted: selectedHabits };
    const next = saveData({ checkIns: { ...data.checkIns, [today]: entry } });
    setSavedCheckIn(next.checkIns[today]);
    setStreak(calculateSobrietyStreak());
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Lock In" title="Don’t negotiate with the old life.">
        Record the sober win, rate the craving, and use the rescue protocol when your brain starts bargaining.
      </PageHeader>

      <div className="stats-grid">
        <Stat label="current streak" value={`${streak}d`} tone="gold" />
        <Stat label="habits today" value={`${selectedHabits.length}/${defaultHabits.length}`} />
        <Stat label="craving" value={`${craving}/10`} />
      </div>

      <Card className="rescue-card stack-sm">
        <span className="tag danger-tag">Craving Rescue</span>
        <h2>10 minutes. No decisions.</h2>
        <p>Cravings lie in short bursts. Run this protocol before you do anything else.</p>
        <div className="rescue-steps">
          <span><b>01</b> Drink cold water</span>
          <span><b>02</b> Walk outside</span>
          <span><b>03</b> Eat protein</span>
          <span><b>04</b> Text someone safe</span>
        </div>
        <p className="quote">“Don’t trade your future for a ten-minute feeling.”</p>
      </Card>

      <Card className="stack-md">
        <div className="segmented">
          <button className={sober ? 'active' : ''} onClick={() => setSober(true)}>Sober today</button>
          <button className={!sober ? 'active danger' : ''} onClick={() => setSober(false)}>Reset / slipped</button>
        </div>

        <Field label="Mood">
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            {['Focused', 'Strong', 'Calm', 'Restless', 'Low', 'Grateful'].map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>

        <Field label={`Craving level: ${craving}/10`}>
          <input type="range" min="0" max="10" value={craving} onChange={(e) => setCraving(Number(e.target.value))} />
        </Field>

        <div>
          <span className="field-title">Protective habits completed</span>
          <div className="chip-grid">
            {defaultHabits.map((habit) => (
              <button key={habit} className={`chip ${selectedHabits.includes(habit) ? 'selected' : ''}`} onClick={() => toggleHabit(habit)}>
                {selectedHabits.includes(habit) ? '✓ ' : ''}{habit}
              </button>
            ))}
          </div>
        </div>

        <Field label="Note to future you">
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="What helped today? What are you proud of?" rows={4} />
        </Field>

        <Button onClick={handleSave}>Save today’s win</Button>
        {savedCheckIn && <p className="success-msg">Saved for {savedCheckIn.date}. Keep the chain alive.</p>}
      </Card>
    </div>
  );
};

export default DailyCheckIn;
