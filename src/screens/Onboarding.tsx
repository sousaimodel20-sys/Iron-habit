import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, PageHeader, Stat } from '../components/UI';
import { getTodayKey, loadData, saveData, type Profile } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';

const Onboarding = () => {
  const [profile, setProfile] = useState<Profile>(loadData().profile);
  const [saved, setSaved] = useState(false);
  const streak = calculateSobrietyStreak();


  const update = (key: keyof Profile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSave = () => {
    saveData({ profile });
    setSaved(true);
  };

  const quickStart = () => {
    const next = {
      ...profile,
      sobrietyDate: profile.sobrietyDate || getTodayKey(),
      why: profile.why || 'I want discipline, health, and freedom.',
    };
    setProfile(next);
    saveData({ profile: next });
    setSaved(true);
  };

  return (
    <div className="page stack-lg">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Sober fitness command center</p>
          <h1>Day by day. Rep by rep. Rebuild yourself.</h1>
          <p>
            Iron Habit is for sober momentum: lock in today, train your body, stack discipline, and turn progress into proof.
          </p>
          <div className="mission-panel">
            <span>Today’s Mission</span>
            <strong>Stay sober • Move iron • Eat clean • Protect peace</strong>
          </div>
          <div className="hero-actions">
            <Link to="/daily-check-in" className="btn btn-primary">Lock in today</Link>
            <Link to="/fitness-tracker" className="btn btn-secondary">Log training</Link>
          </div>
        </div>
        <div className="phone-preview" aria-label="Iron Habit preview card">
          <span className="phone-notch" />
          <p>Current streak</p>
          <strong>{streak}</strong>
          <span>days locked in</span>
          <div className="mini-bars"><i /><i /><i /><i /></div>
        </div>
      </section>

      <div className="stats-grid">
        <Stat label="days undefeated" value={streak} tone="gold" />
        <Stat label="mission" value="today" />
        <Stat label="mindset" value="locked" />
        <Stat label="victory card" value="9:16" />
      </div>

      <Card className="today-grid">
        <h2>Today’s Mission</h2>
        <div className="mission-list">
          <Link to="/daily-check-in"><b>01</b><span>Stay sober</span><small>Record the win before the day gets loud.</small></Link>
          <Link to="/fitness-tracker"><b>02</b><span>Train the body</span><small>Move, lift, sweat, walk — earn momentum.</small></Link>
          <Link to="/habit-tracker"><b>03</b><span>Stack discipline</span><small>Protect sleep, protein, water, and peace.</small></Link>
          <Link to="/share-progress"><b>04</b><span>Claim proof</span><small>Turn the day into a victory card.</small></Link>
        </div>
      </Card>

      <PageHeader eyebrow="Setup" title="Make it yours">
        Add your start date and reason why. This stays on your device with localStorage.
      </PageHeader>

      <Card className="stack-md">
        <Field label="Name or nickname">
          <input value={profile.name} onChange={(e) => update('name', e.target.value)} placeholder="Joshua" />
        </Field>
        <Field label="Sobriety start date">
          <input type="date" value={profile.sobrietyDate} onChange={(e) => update('sobrietyDate', e.target.value)} />
        </Field>
        <Field label="Your why">
          <textarea value={profile.why} onChange={(e) => update('why', e.target.value)} rows={4} />
        </Field>
        <Field label="Main focus">
          <select value={profile.focus} onChange={(e) => update('focus', e.target.value)}>
            <option value="sobriety-strength-discipline">Sobriety + strength + discipline</option>
            <option value="mental-clarity">Mental clarity</option>
            <option value="fitness-transformation">Fitness transformation</option>
            <option value="new-life">New life build</option>
          </select>
        </Field>
        <div className="metric-input-grid">
          <Field label="Old average drink cost">
            <input inputMode="decimal" value={profile.averageDrinkCost} onChange={(e) => update('averageDrinkCost', e.target.value)} placeholder="8" />
          </Field>
          <Field label="Old drinks per drinking day">
            <input inputMode="decimal" value={profile.drinksPerDay} onChange={(e) => update('drinksPerDay', e.target.value)} placeholder="4" />
          </Field>
          <Field label="Calories per drink">
            <input inputMode="numeric" value={profile.caloriesPerDrink} onChange={(e) => update('caloriesPerDrink', e.target.value)} placeholder="150" />
          </Field>
        </div>
        <Field label="Transformation goal">
          <input value={profile.transformationGoal} onChange={(e) => update('transformationGoal', e.target.value)} placeholder="Lean, sober, strong, and consistent." />
        </Field>
        <div className="button-row">
          <Button onClick={handleSave}>Save profile</Button>
          <Button variant="ghost" onClick={quickStart}>Quick start today</Button>
        </div>
        {saved && <p className="success-msg">Saved. Your Iron Habit baseline is locked in.</p>}
      </Card>
    </div>
  );
};

export default Onboarding;
