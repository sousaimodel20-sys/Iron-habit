import { type CSSProperties, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Field, PageHeader } from '../components/UI';
import { calculateMacroTargets, formatHeight } from '../utils/nutrition';
import { getTodayKey, loadData, replaceData, saveData, type ActiveLoadout, type BodyProfile, type IronHabitData, type Profile } from '../utils/storage';
import { buildSupportSmsHref, hasSupportContact } from '../utils/support';
import { calculateSobrietyStreak } from '../utils/streaks';

const Onboarding = () => {
  const [profile, setProfile] = useState<Profile>(loadData().profile);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile>(loadData().bodyProfile);
  const [saved, setSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const data = loadData();
  const todayKey = getTodayKey();
  const todayCheckIn = data.checkIns[todayKey];
  const trainedToday = data.fitnessEntries.some((entry) => entry.date === todayKey);
  const activeLoadout = data.activeLoadout;
  const latestProof = data.latestVictoryProof;
  const needsSetup = !profile.name && Object.keys(data.checkIns).length === 0;
  const displayDay = Math.max(1, calculateSobrietyStreak());
  const workoutDays = new Set(data.fitnessEntries.map((entry) => entry.date)).size;
  const xp = Math.min(5000, (displayDay * 75) + (data.fitnessEntries.length * 120) + (Object.keys(data.checkIns).length * 80));
  const xpMax = 5000;
  const xpPercent = Math.round((xp / xpMax) * 100);
  const craving = todayCheckIn?.craving ?? 2;
  const moodStability = todayCheckIn ? 'Stable' : 'Locked';
  const macroTargets = calculateMacroTargets(bodyProfile);
  const missionSteps = [
    { label: 'Check in', done: Boolean(todayCheckIn), to: '/daily-check-in' },
    { label: 'Train', done: trainedToday, to: activeLoadout ? '/workout-mode' : '/talk' },
    { label: 'Proof', done: Boolean(latestProof?.date === todayKey), to: latestProof ? '/share-progress' : '/profile' },
  ];
  const primaryMission = !todayCheckIn
    ? { title: 'Lock today’s check-in', detail: `Day ${displayDay}: name the mood, rate the craving, and protect the streak first.`, to: '/daily-check-in', cta: 'Start Check-In' }
    : !trainedToday
      ? { title: activeLoadout ? `Run ${activeLoadout.title}` : 'Build today’s training loadout', detail: activeLoadout ? 'Open Workout Mode, finish the session, then log the proof.' : 'Let Talk generate the workout, then save it to Train.', to: activeLoadout ? '/workout-mode' : '/talk', cta: activeLoadout ? 'Start Workout' : 'Build Workout' }
      : { title: 'Turn today into proof', detail: 'Training and check-in are stacked. Make the win visible with Proof or a Victory Card.', to: latestProof ? '/share-progress' : '/profile', cta: latestProof ? 'Make Victory Card' : 'Show Proof' };
  const cravingDefense = craving >= 7 ? 'High urge: open Rescue now.' : craving >= 4 ? 'Medium urge: breathe, walk, hydrate.' : 'Low urge: stay ahead of it.';
  const proteinTarget = macroTargets ? `${macroTargets.proteinGrams}g protein` : 'Set body stats for protein target';

  const missions = [
    {
      label: 'Workout Goal',
      detail: activeLoadout ? `Run ${activeLoadout.title}` : 'Generate Coach Loadout',
      done: trainedToday,
      to: activeLoadout ? '/workout-mode' : '/talk',
    },
    { label: 'Recovery Goal', detail: '10-minute check-in', done: Boolean(todayCheckIn), to: '/daily-check-in' },
    {
      label: 'Proof Goal',
      detail: latestProof ? 'Create Victory Card' : 'Stack first proof',
      done: Boolean(latestProof?.date === todayKey),
      to: latestProof ? '/share-progress' : '/fitness-tracker',
    },
    { label: 'Emergency Plan', detail: craving >= 7 ? 'Open Rescue now' : 'Rescue one tap away', done: craving < 4, to: '/rescue' },
  ];
  const weeklyBossCleared = missions.filter((mission) => mission.done).length;
  const weeklyBossPercent = Math.round((weeklyBossCleared / missions.length) * 100);
  const supportReady = hasSupportContact(profile);

  const update = (key: keyof Profile, value: string) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const updateBody = (key: keyof BodyProfile, value: string) => {
    setSaved(false);
    setBodyProfile((current) => ({ ...current, [key]: value, updatedAt: new Date().toISOString() }));
  };

  const handleSave = () => {
    saveData({ profile, bodyProfile });
    setSaved(true);
  };

  const quickStart = () => {
    const next = {
      ...profile,
      sobrietyDate: profile.sobrietyDate || getTodayKey(),
      why: profile.why || 'Discipline today. Freedom tomorrow.',
    };
    setProfile(next);
    saveData({ profile: next, bodyProfile });
    setSaved(true);
  };

  const loadDemoBaseline = () => {
    const demoProfile: Profile = {
      ...profile,
      name: profile.name || 'Iron Warrior',
      sobrietyDate: profile.sobrietyDate || getTodayKey(),
      why: profile.why || 'Discipline today. Freedom tomorrow.',
      focus: profile.focus || 'sobriety-strength-discipline',
      transformationGoal: profile.transformationGoal || 'Lean, sober, strong, and consistent.',
      supportLocation: profile.supportLocation || 'Vancouver, BC',
      supportName: profile.supportName || 'Safe Person',
    };
    const demoBodyProfile: BodyProfile = {
      ...bodyProfile,
      sex: bodyProfile.sex || 'male',
      age: bodyProfile.age || '30',
      heightInches: bodyProfile.heightInches || '70',
      weightLbs: bodyProfile.weightLbs || '200',
      goalWeightLbs: bodyProfile.goalWeightLbs || '185',
      activityLevel: bodyProfile.activityLevel || 'active',
      trainingDaysPerWeek: bodyProfile.trainingDaysPerWeek || '5',
      bodyGoal: bodyProfile.bodyGoal || 'recomposition',
      pace: bodyProfile.pace || 'steady',
      updatedAt: new Date().toISOString(),
    };
    const demoLoadout: ActiveLoadout = {
      id: `demo-loadout-${Date.now()}`,
      templateId: 'ppl',
      title: '20-Min Sober Strength Loadout',
      label: 'Push Pull Legs',
      goal: 'Build muscle and stay locked in',
      time: '20 min',
      level: 'Intermediate',
      days: ['Push', 'Pull', 'Legs'],
      intent: 'Demo-ready sober strength routine',
      finisher: '2-minute incline walk breathing reset',
      createdAt: new Date().toISOString(),
      exercises: [
        { name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells', sets: '2', reps: '8–10', rest: '90 sec', cue: 'Shoulders packed, press with control.', mistake: 'Do not bounce or flare elbows hard.', swap: 'Push-ups or machine press.', icon: '▲' },
        { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', sets: '2', reps: '10–12', rest: '75 sec', cue: 'Pull elbows to ribs.', mistake: 'Do not turn it into a curl.', swap: 'Assisted pull-up or row.', icon: '↓' },
        { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', sets: '2', reps: '10–12', rest: '75 sec', cue: 'Brace, sit between the hips.', mistake: 'Do not collapse knees in.', swap: 'Leg press.', icon: '◆' },
      ],
    };

    setProfile(demoProfile);
    setBodyProfile(demoBodyProfile);
    saveData({ profile: demoProfile, bodyProfile: demoBodyProfile, activeLoadout: demoLoadout });
    setSaved(true);
    setBackupStatus('Demo baseline loaded. Open Train or Workout Mode to show the full proof loop.');
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
      setBodyProfile(next.bodyProfile);
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

      {needsSetup && (
        <section className="card first-user-card stack-sm">
          <span className="tag danger-tag">First launch</span>
          <h2>Lock your baseline before the app asks more from you.</h2>
          <p>Set name, sober start date, goal, and why. Then run today’s check-in and generate your first Coach Loadout.</p>
          <div className="hero-actions">
            <a href="#setup-profile" className="btn btn-primary">Set baseline</a>
            <button type="button" className="btn btn-secondary" onClick={loadDemoBaseline}>Load demo mode</button>
            <Link to="/daily-check-in" className="btn btn-ghost">First check-in</Link>
          </div>
        </section>
      )}

      <section className="card command-card sober-mission-card stack-sm">
        <span className="tag">Sober Strength Mission</span>
        <h2>{primaryMission.title}</h2>
        <p>{primaryMission.detail}</p>
        <div className="mission-step-strip" aria-label="Daily mission steps">
          {missionSteps.map((step) => (
            <Link to={step.to} key={step.label} className={step.done ? 'step-done' : ''}>
              <b>{step.done ? '✓' : '•'}</b>
              <span>{step.label}</span>
            </Link>
          ))}
        </div>
        <div className="mission-brief-grid">
          <div><span>Craving defense</span><strong>{cravingDefense}</strong></div>
          <div><span>Fuel target</span><strong>{proteinTarget}</strong></div>
          <div><span>Proof action</span><strong>{latestProof?.date === todayKey ? 'Victory Card ready' : 'Log visible proof'}</strong></div>
        </div>
        <div className="hero-actions">
          <Link to={primaryMission.to} className="btn btn-primary">{primaryMission.cta}</Link>
          <Link to="/talk" className="btn btn-secondary">Talk Command</Link>
          <Link to="/rescue" className="btn btn-danger">Rescue</Link>
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
        <div><span>Sober Streak</span><strong>{displayDay} {displayDay === 1 ? 'day' : 'days'}</strong></div>
        <div><span>Workout Days</span><strong>{workoutDays}</strong></div>
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
          <strong>{weeklyBossPercent}%</strong>
          <div><i style={{ width: `${weeklyBossPercent}%` }} /></div>
          <small>{weeklyBossCleared} / {missions.length} battles cleared</small>
        </div>
      </section>

      <details id="setup-profile" className="collapse-card card warrior-collapse" open={needsSetup}>
        <summary>
          <span>
            <b>Setup & profile</b>
            <small>Start date, why, transformation metrics</small>
          </span>
        </summary>
        <div className="stack-md collapse-body">
          <PageHeader eyebrow="Setup" title="Lock your sober-fitness baseline">
            Save start date, why, body stats, and goal so Talk, Train, and Proof can personalize the next move.
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

          <div className="card support-contact-card stack-sm">
            <span className="tag">Recovery contact</span>
            <h2>Choose the safe person before the craving shows up.</h2>
            <p>Iron Habit will use this contact for Rescue and Meetings text actions instead of a generic blank SMS sheet.</p>
            <div className="metric-input-grid">
              <Field label="Support contact name">
                <input value={profile.supportName} onChange={(e) => update('supportName', e.target.value)} placeholder="Joshua’s brother" />
              </Field>
              <Field label="Support contact phone">
                <input value={profile.supportPhone} onChange={(e) => update('supportPhone', e.target.value)} placeholder="+16045551234" />
              </Field>
              <Field label="Support area">
                <input value={profile.supportLocation} onChange={(e) => update('supportLocation', e.target.value)} placeholder="Vancouver, BC" />
              </Field>
            </div>
            <p className="support-contact-note">Use a real number you trust. Example format: `+16045551234`.</p>
            <div className="hero-actions">
              {supportReady ? (
                <a className="btn btn-secondary" href={buildSupportSmsHref(profile, 'I’m riding out a craving and need support for the next 10 minutes.')}>Test support text</a>
              ) : (
                <span className="support-contact-note">Add a phone number to unlock one-tap support texts in Rescue and Meetings.</span>
              )}
            </div>
          </div>

          <div className="metric-input-grid">
            <Field label="Current weight">
              <input inputMode="decimal" value={bodyProfile.weightLbs} onChange={(e) => updateBody('weightLbs', e.target.value)} placeholder="200" />
            </Field>
            <Field label="Goal weight">
              <input inputMode="decimal" value={bodyProfile.goalWeightLbs} onChange={(e) => updateBody('goalWeightLbs', e.target.value)} placeholder="185" />
            </Field>
            <Field label="Age">
              <input inputMode="numeric" value={bodyProfile.age} onChange={(e) => updateBody('age', e.target.value)} placeholder="30" />
            </Field>
            <Field label="Height inches">
              <input inputMode="numeric" value={bodyProfile.heightInches} onChange={(e) => updateBody('heightInches', e.target.value)} placeholder="70" />
            </Field>
            <Field label="Sex">
              <select value={bodyProfile.sex} onChange={(e) => updateBody('sex', e.target.value)}>
                <option value="">Choose</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Training days/week">
              <input inputMode="numeric" value={bodyProfile.trainingDaysPerWeek} onChange={(e) => updateBody('trainingDaysPerWeek', e.target.value)} placeholder="5" />
            </Field>
          </div>

          <div className="metric-input-grid">
            <Field label="Body goal">
              <select value={bodyProfile.bodyGoal} onChange={(e) => updateBody('bodyGoal', e.target.value)}>
                <option value="recomposition">Recomposition</option>
                <option value="cut-fat">Cut fat</option>
                <option value="build-muscle">Build muscle</option>
                <option value="maintain">Maintain</option>
              </select>
            </Field>
            <Field label="Activity level">
              <select value={bodyProfile.activityLevel} onChange={(e) => updateBody('activityLevel', e.target.value)}>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="athlete">Athlete</option>
              </select>
            </Field>
            <Field label="Pace">
              <select value={bodyProfile.pace} onChange={(e) => updateBody('pace', e.target.value)}>
                <option value="steady">Steady</option>
                <option value="aggressive">Aggressive</option>
                <option value="lean">Lean gain</option>
              </select>
            </Field>
          </div>

          <div className="card body-target-card stack-sm">
            <span className="tag">Baseline preview</span>
            {macroTargets ? (
              <p>{bodyProfile.weightLbs} lb • {formatHeight(bodyProfile.heightInches)} • {macroTargets.targetCalories} cal • {macroTargets.proteinGrams}g protein.</p>
            ) : (
              <p>Add weight, height, age, and sex here — or tell Talk: “I’m 200 lb, 5'10, 30, male, cut fat.”</p>
            )}
          </div>
          <div className="button-row">
            <Button onClick={handleSave}>Save profile</Button>
            <Button variant="secondary" onClick={loadDemoBaseline}>Load demo mode</Button>
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
