import { type CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, PageHeader } from '../components/UI';
import { getTodayKey, loadData, replaceData, saveData, type IronHabitData, type Profile } from '../utils/storage';

const Onboarding = () => {
  const [profile, setProfile] = useState<Profile>(loadData().profile);
  const [saved, setSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const data = loadData();
  const todayKey = getTodayKey();
  const todayCheckIn = data.checkIns[todayKey];
  const trainedToday = data.fitnessEntries.some((entry) => entry.date === todayKey);
  const displayDay = 47;
  const xp = 3450;
  const xpMax = 5000;
  const xpPercent = Math.round((xp / xpMax) * 100);
  const craving = todayCheckIn?.craving ?? 2;
  const moodStability = todayCheckIn ? 'Stable' : 'Locked';

  const missions = [
    { label: 'Workout Goal', detail: 'Push Day', done: trainedToday, to: '/fitness-tracker' },
    { label: 'Recovery Goal', detail: '10-minute check-in', done: Boolean(todayCheckIn), to: '/daily-check-in' },
    { label: 'Hydration Goal', detail: '6 / 8 glasses', done: false, to: '/habit-tracker' },
    { label: 'Journal Goal', detail: 'Write 10 minutes', done: Boolean(todayCheckIn?.note), to: '/daily-check-in' },
  ];

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
      why: profile.why || 'Discipline today. Freedom tomorrow.',
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
    <div className="page warrior-page stack-lg">
      <section className="warrior-hero">
        <div className="warrior-topline">
          <span>Warrior Mode</span>
          <b>Live Combat Dashboard</b>
        </div>

        <div className="warrior-ring-wrap">
          <div className="warrior-ring" style={{ '--ring-progress': `${displayDay * 5}deg` } as CSSProperties}>
            <div className="helmet-core" aria-label="warrior emblem">
              <span className="helmet-plume" />
              <span className="helmet-face">Λ</span>
            </div>
          </div>
        </div>

        <div className="warrior-day-copy">
          <span>DAY {displayDay}</span>
          <h1>SOBER</h1>
          <p>Discipline today. Freedom tomorrow.</p>
        </div>
      </section>

      <section className="xp-card">
        <div className="xp-head">
          <span>XP SYSTEM</span>
          <strong>LEVEL 12</strong>
        </div>
        <div className="xp-bar" aria-label="XP progress">
          <i style={{ width: `${xpPercent}%` }} />
        </div>
        <div className="xp-foot">
          <b>{xp.toLocaleString()} / {xpMax.toLocaleString()} XP</b>
          <span>Every sober day levels up your character.</span>
        </div>
      </section>

      <section className="warrior-stats-grid">
        <div><span>Sober Streak</span><strong>{displayDay} days</strong></div>
        <div><span>Workout Streak</span><strong>15 days</strong></div>
        <div><span>Mood Stability</span><strong>{moodStability}</strong></div>
        <div><span>Craving Level</span><strong>{craving}/10</strong></div>
      </section>

      <section className="missions-card">
        <div className="section-title-row">
          <span>Today’s Missions</span>
          <b>{missions.filter((mission) => mission.done).length}/{missions.length}</b>
        </div>
        <div className="warrior-mission-list">
          {missions.map((mission) => (
            <Link to={mission.to} key={mission.label} className={mission.done ? 'mission-complete' : ''}>
              <span className="mission-checkbox">{mission.done ? '✓' : ''}</span>
              <span>
                <b>{mission.label}</b>
                <small>{mission.detail}</small>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="boss-card">
        <div>
          <span>Weekly Boss Battle</span>
          <h2>Beat Last Week</h2>
          <p>Outwork the old version. Win the week before it wins you.</p>
        </div>
        <div className="boss-progress">
          <strong>64%</strong>
          <div><i /></div>
          <small>4 / 7 battles cleared</small>
        </div>
      </section>

      <details className="collapse-card card warrior-collapse">
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

      <details className="collapse-card card backup-card warrior-collapse">
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
