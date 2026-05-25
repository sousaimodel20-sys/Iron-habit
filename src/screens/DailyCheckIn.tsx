import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, PageHeader, Stat } from '../components/UI';
import { getTodayKey, loadData, saveData, type CheckIn, type Profile } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';
import { buildSupportSmsHref, getSupportContactLabel, hasSupportContact } from '../utils/support';

const defaultHabits = ['No alcohol', 'Gym / movement', 'Protein meal', 'Meditation', 'Read / learn', 'Sleep routine'];
const moodOptions = ['Focused', 'Strong', 'Calm', 'Restless', 'Low', 'Grateful'];

const getCravingCue = (level: number) => {
  if (level >= 8) return 'Emergency mode: open Rescue and text your safe person.';
  if (level >= 5) return 'High alert: walk, hydrate, eat protein, and do not negotiate.';
  if (level >= 3) return 'Stay ahead of it: stack one protective habit now.';
  return 'Low urge: keep the chain alive and protect the next hour.';
};

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
  const [rescueActive, setRescueActive] = useState(false);
  const [rescueSeconds, setRescueSeconds] = useState(600);
  const [profile, setProfile] = useState<Profile>(() => loadData().profile);
  const supportReady = hasSupportContact(profile);
  const supportContactLabel = getSupportContactLabel(profile);
  const supportLocation = profile.supportLocation || 'Vancouver, BC';
  const rescueMinutes = Math.floor(rescueSeconds / 60);
  const rescueRemainder = String(rescueSeconds % 60).padStart(2, '0');
  const cravingCue = getCravingCue(craving);

  useEffect(() => {
    const refreshProfile = () => setProfile(loadData().profile);
    window.addEventListener('iron-habit-data-updated', refreshProfile);
    return () => window.removeEventListener('iron-habit-data-updated', refreshProfile);
  }, []);

  useEffect(() => {
    if (!rescueActive || rescueSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setRescueSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [rescueActive, rescueSeconds]);

  const startRescue = () => {
    setRescueSeconds(600);
    setRescueActive(true);
  };

  const resetRescue = () => {
    setRescueActive(false);
    setRescueSeconds(600);
  };

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
        <div className="rescue-head">
          <span className="tag danger-tag">Craving Rescue</span>
          <span className="rescue-clock">{rescueMinutes}:{rescueRemainder}</span>
        </div>
        <h2>{rescueSeconds === 0 ? 'Urge survived. You stayed in command.' : '10 minutes. No decisions.'}</h2>
        <p>Cravings lie in short bursts. Run the protocol before you text, buy, pour, or bargain.</p>

        <div className="breath-ring" aria-label="Breathing guide">
          <span>{rescueActive ? 'Breathe' : 'Ready'}</span>
        </div>

        <div className="rescue-steps">
          <span><b>01</b> Drink cold water</span>
          <span><b>02</b> Walk outside</span>
          <span><b>03</b> Eat protein</span>
          <span><b>04</b> Text someone safe</span>
        </div>

        <div className="rescue-actions">
          <Button onClick={startRescue}>{rescueActive ? 'Restart timer' : 'Start rescue timer'}</Button>
          <Button variant="secondary" onClick={resetRescue}>Reset</Button>
          {supportReady ? (
            <a className="btn btn-ghost" href={buildSupportSmsHref(profile, `I’m at ${craving}/10 craving and staying sober right now. Can you check in with me for 10 minutes?`)}>Text {supportContactLabel}</a>
          ) : (
            <Link className="btn btn-ghost" to="/setup-profile">Set support contact</Link>
          )}
          <Link className="btn btn-secondary" to="/rescue">Open full Rescue</Link>
        </div>

        <div className="rescue-actions">
          <Link className="btn btn-secondary" to={`/meetings?q=${encodeURIComponent(supportLocation)}`}>Find meetings near {supportLocation}</Link>
        </div>

        <div className="reason-card">
          <span>Remember the mission</span>
          <strong>{profile.transformationGoal || profile.why || 'Lean, sober, strong, and consistent.'}</strong>
        </div>
        <p className="quote">“Don’t trade your future for a ten-minute feeling.”</p>
      </Card>

      <Card className="stack-md">
        <div className="checkin-card-head">
          <div>
            <span className="tag">Today’s Check-In</span>
            <h2>Lock the sober win before the day gets loud.</h2>
            <p>Three fast signals: sober status, craving level, and the habits that protected you.</p>
          </div>
          {savedCheckIn && <span className="save-badge">Saved today</span>}
        </div>

        <div className="segmented">
          <button className={sober ? 'active' : ''} onClick={() => setSober(true)}>Sober today</button>
          <button className={!sober ? 'active danger' : ''} onClick={() => setSober(false)}>Reset / slipped</button>
        </div>

        <div>
          <span className="field-title">Mood right now</span>
          <div className="mood-chip-grid" role="group" aria-label="Mood right now">
            {moodOptions.map((item) => (
              <button key={item} className={`chip ${mood === item ? 'selected' : ''}`} onClick={() => setMood(item)}>
                {mood === item ? '✓ ' : ''}{item}
              </button>
            ))}
          </div>
        </div>

        <Field label={`Craving level: ${craving}/10`}>
          <input type="range" min="0" max="10" value={craving} onChange={(e) => setCraving(Number(e.target.value))} />
          <div className="range-label-row" aria-hidden="true">
            <span>0 calm</span>
            <span>5 alert</span>
            <span>10 rescue</span>
          </div>
          <p className={`craving-cue ${craving >= 8 ? 'danger' : craving >= 5 ? 'warning' : ''}`}>{cravingCue}</p>
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

        <div className="checkin-save-row">
          <Button onClick={handleSave}>Save today’s check-in</Button>
          <Link className="btn btn-secondary" to="/train">Train next</Link>
        </div>
        {savedCheckIn && <p className="success-msg">Saved for {savedCheckIn.date}. Keep the chain alive. Next move: train, proof, or Rescue if the urge spikes.</p>}
      </Card>
    </div>
  );
};

export default DailyCheckIn;
