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
          <p className="eyebrow">Premium habit system</p>
          <h1>Build the version of you that alcohol could not.</h1>
          <p>
            Iron Habit combines sobriety streaks, daily check-ins, gym discipline, and shareable wins into one mobile-first dashboard.
          </p>
          <div className="hero-actions">
            <Link to="/daily-check-in" className="btn btn-primary">Do today’s check-in</Link>
            <Link to="/share-progress" className="btn btn-secondary">Create TikTok card</Link>
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
        <Stat label="sobriety days" value={streak} tone="gold" />
        <Stat label="focus" value="1 day" />
        <Stat label="share format" value="9:16" />
      </div>

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
