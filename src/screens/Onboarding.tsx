import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Field, PageHeader } from '../components/UI';
import { getTodayKey, loadData, replaceData, saveData, type IronHabitData, type Profile } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';

const Onboarding = () => {
  const [profile, setProfile] = useState<Profile>(loadData().profile);
  const [saved, setSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const data = loadData();
  const streak = calculateSobrietyStreak();
  const todayKey = getTodayKey();
  const todayCheckIn = data.checkIns[todayKey];
  const trainedToday = data.fitnessEntries.some((entry) => entry.date === todayKey);
  const nextStep = !todayCheckIn ? {
    label: 'Step 1',
    title: 'Lock in now',
    copy: 'No shame. No spiral. Just an honest check-in. Protect today first.',
    to: '/daily-check-in',
  } : !trainedToday ? {
    label: 'Step 2',
    title: 'Move your body',
    copy: 'Walk, lift, stretch, sweat — any clean rep counts.',
    to: '/fitness-tracker',
  } : {
    label: 'Step 3',
    title: 'Check your proof',
    copy: 'You showed up. See the receipts and keep the chain alive.',
    to: '/progress-dashboard',
  };


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

  const makeBackupJson = () => {
    const data = loadData();
    return JSON.stringify({
      app: 'iron-habit',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    }, null, 2);
  };

  const exportBackup = () => {
    const blob = new Blob([makeBackupJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iron-habit-backup-${getTodayKey()}.json`;
    link.target = '_blank';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setBackupStatus('Backup downloaded. Keep it somewhere safe.');
  };

  const copyBackup = async () => {
    try {
      await navigator.clipboard?.writeText(makeBackupJson());
      setBackupStatus('Backup JSON copied. Paste it into Notes or a file.');
    } catch {
      setBackupStatus('Copy blocked. Use Download backup instead.');
    }
  };

  const importBackup = async (file?: File) => {
    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as { data?: IronHabitData } | IronHabitData;
      const incoming = 'data' in parsed && parsed.data ? parsed.data : parsed;
      const next = replaceData(incoming as IronHabitData);
      setProfile(next.profile);
      setSaved(true);
      setBackupStatus('Backup restored. Progress is back on this device.');
    } catch {
      setBackupStatus('Restore failed. Choose a valid Iron Habit backup file.');
    }
  };

  return (
    <div className="page stack-lg">
      <section className="mission-flow-card">
        <div className="mission-status">
          <span className="tag">Today’s mission</span>
          <strong>{streak === 1 ? 'Day 1 protected' : `${streak} days protected`}</strong>
          <p>Stay sober. Move your body. Keep the promise small enough to win.</p>
        </div>

        <div className="next-action-card">
          <span>{nextStep.label}</span>
          <h1>{nextStep.title}</h1>
          <p>{nextStep.copy}</p>
          <div className="hero-actions">
            <Link to={nextStep.to} className="btn btn-primary">Start this step</Link>
            <Link to="/craving-rescue" className="btn btn-danger">I need Rescue</Link>
          </div>
        </div>

      </section>

      <Card className="today-grid command-card daily-flow">
        <span className="tag">Daily flow</span>
        <h2>Do these in order. No wandering.</h2>
        <div className="mission-list mission-steps">
          <Link to="/daily-check-in" className={todayCheckIn ? 'step-done' : 'step-active'}><b>{todayCheckIn ? 'DONE' : '01'}</b><span>Lock In</span><small>Record sober status, mood, craving, and one honest note.</small></Link>
          <Link to="/fitness-tracker" className={trainedToday ? 'step-done' : todayCheckIn ? 'step-active' : ''}><b>{trainedToday ? 'DONE' : '02'}</b><span>Train</span><small>Walk, lift, stretch, sweat — anything counts.</small></Link>
          <Link to="/habit-tracker"><b>03</b><span>Stack</span><small>Water, protein, sleep, peace. Keep the basics clean.</small></Link>
          <Link to="/progress-dashboard"><b>04</b><span>Proof</span><small>See the receipts and your next milestone.</small></Link>
        </div>
      </Card>

      <div className="support-grid">
        <Link to="/craving-rescue" className="support-card rescue-now">
          <b>SOS Rescue</b>
          <span>Craving? Don’t think. Start the 10-minute protocol.</span>
        </Link>
        <Link to="/share-progress" className="support-card">
          <b>Victory Card</b>
          <span>When the day is earned, make the 9:16 comeback card.</span>
        </Link>
      </div>


      <details className="collapse-card card">
        <summary>
          <span>
            <b>Setup & profile</b>
            <small>Start date, why, transformation metrics</small>
          </span>
        </summary>
        <div className="stack-md collapse-body">
          <PageHeader eyebrow="Setup" title="Make it yours">
            Add your start date and reason why. This stays on your device with localStorage.
          </PageHeader>

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
        </div>
      </details>

      <details className="collapse-card card backup-card">
        <summary>
          <span>
            <b>Backup & restore</b>
            <small>Export or restore local progress</small>
          </span>
        </summary>
        <div className="stack-sm collapse-body">
          <span className="tag">Progress backup</span>
          <h2>Save the receipts outside the browser.</h2>
          <p>Export your local Iron Habit data as a JSON backup, or restore it onto this device later.</p>
          <div className="button-row">
            <Button variant="secondary" onClick={exportBackup}>Download backup</Button>
            <Button variant="ghost" onClick={copyBackup}>Copy backup JSON</Button>
            <label className="btn btn-ghost file-restore">
              Restore backup
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => importBackup(event.target.files?.[0])}
              />
            </label>
          </div>
          {backupStatus && <p className="success-msg">{backupStatus}</p>}
        </div>
      </details>
    </div>
  );
};

export default Onboarding;
