import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Field, PageHeader } from '../components/UI';
import { formatLocalDateKey } from '../utils/date';
import { computeDailyMissionState } from '../utils/dailyMission';
import { calculateMacroTargets, formatHeight } from '../utils/nutrition';
import { defaultData, getTodayKey, loadData, replaceData, saveData, type ActiveLoadout, type BodyProfile, type CheckIn, type CompletedLoadout, type FitnessEntry, type IronHabitData, type Profile } from '../utils/storage';
import { buildSupportSmsHref, hasSupportContact } from '../utils/support';
import { calculateSobrietyStreak } from '../utils/streaks';

const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<Profile>(loadData().profile);
  const [bodyProfile, setBodyProfile] = useState<BodyProfile>(loadData().bodyProfile);
  const [celebratedMilestones, setCelebratedMilestones] = useState<number[]>(loadData().celebratedMilestones);
  const [saved, setSaved] = useState(false);
  const [backupStatus, setBackupStatus] = useState('');
  const [setupOpen, setSetupOpen] = useState(() => {
    const current = loadData().profile;
    return searchParams.get('focus') === 'support'
      || window.location.pathname === '/setup-profile'
      || !current.name.trim()
      || !current.sobrietyDate.trim()
      || current.why.trim() === defaultData.profile.why.trim()
      || !current.supportName.trim()
      || !current.supportPhone.trim();
  });
  const setupSectionRef = useRef<HTMLDetailsElement | null>(null);
  const supportSectionRef = useRef<HTMLDivElement | null>(null);
  const data = loadData();
  const todayKey = getTodayKey();
  const activeLoadout = data.activeLoadout;
  const latestProof = data.latestVictoryProof;
  const missionState = computeDailyMissionState(data, todayKey);
  const { todayCheckIn, trainedToday, primaryMission, missionSteps, nextBestMove, heroTag, proofAction, completionLabel } = missionState;
  const baselineChecklist = [
    { label: 'Name or nickname', ready: Boolean(profile.name.trim()) },
    { label: 'Sobriety start date', ready: Boolean(profile.sobrietyDate.trim()) },
    { label: 'Why / goal', ready: profile.why.trim() !== defaultData.profile.why.trim() },
    { label: 'Support contact', ready: Boolean(profile.supportName.trim() && profile.supportPhone.trim()) },
  ];
  const needsSetup = ![
    { ready: Boolean(data.profile.name.trim()) },
    { ready: Boolean(data.profile.sobrietyDate.trim()) },
    { ready: data.profile.why.trim() !== defaultData.profile.why.trim() },
    { ready: Boolean(data.profile.supportName.trim() && data.profile.supportPhone.trim()) },
  ].every((item) => item.ready);
  const displayDay = Math.max(1, calculateSobrietyStreak());
  const workoutDays = new Set(data.fitnessEntries.map((entry) => entry.date)).size;
  const xp = Math.min(5000, (displayDay * 75) + (data.fitnessEntries.length * 120) + (Object.keys(data.checkIns).length * 80));
  const xpMax = 5000;
  const xpPercent = Math.round((xp / xpMax) * 100);
  const craving = todayCheckIn?.craving ?? 2;
  const highCraving = craving >= 7;
  const rescuePath = highCraving ? '/rescue?chain=1' : '/rescue';
  const moodStability = todayCheckIn ? 'Stable' : 'Locked';
  const macroTargets = calculateMacroTargets(bodyProfile);
  const cravingDefense = highCraving ? 'High urge: start emergency chain.' : craving >= 4 ? 'Medium urge: breathe, walk, hydrate.' : 'Low urge: stay ahead of it.';
  const proteinTarget = macroTargets ? `${macroTargets.proteinGrams}g protein` : 'Set body stats for protein target';
  const shareVictoryCardPath = latestProof ? `/share-progress?template=receipts&proof=${latestProof.id}` : '/share-progress?template=receipts';
  const shareableMilestones = [7, 14, 30, 60, 90, 365];
  const todayMilestone = shareableMilestones.find((days) => days === displayDay);
  const showMilestoneShare = Boolean(todayMilestone && !celebratedMilestones.includes(todayMilestone) && !needsSetup);

  // Milestone badges
  const getMilestoneInfo = () => {
    if (displayDay >= 365) return { milestone: '365+', label: 'Legend', emoji: '👑', color: 'gold' };
    if (displayDay >= 90) return { milestone: '90+', label: 'Master', emoji: '⚡', color: 'platinum' };
    if (displayDay >= 30) return { milestone: '30+', label: 'Warrior', emoji: '🔥', color: 'crimson' };
    if (displayDay >= 7) return { milestone: '7+', label: 'Undefeated', emoji: '💪', color: 'bronze' };
    return null;
  };
  const milestoneInfo = getMilestoneInfo();

  const missions = [
    {
      label: 'Workout Goal',
      detail: activeLoadout ? `Run ${activeLoadout.title}` : 'Generate Coach Loadout',
      done: trainedToday,
      to: activeLoadout ? '/workout-mode' : '/talk',
    },
    { label: 'Recovery Goal', detail: '10-minute check-in', done: Boolean(todayCheckIn), to: '/check-in' },
    {
      label: 'Proof Goal',
      detail: latestProof ? 'Create Victory Card' : 'Stack first proof',
      done: Boolean(latestProof?.date === todayKey),
      to: latestProof ? '/share-progress' : '/train',
    },
    { label: 'Emergency Plan', detail: highCraving ? 'Start emergency chain' : 'Rescue one tap away', done: craving < 4, to: rescuePath },
  ];
  const weeklyBossCleared = missions.filter((mission) => mission.done).length;
  const weeklyBossPercent = Math.round((weeklyBossCleared / missions.length) * 100);
  const supportReady = hasSupportContact(profile);
  const demoProofReady = Boolean(activeLoadout && latestProof && Object.keys(data.checkIns).length >= 7);
  const launchSteps = [
    { step: '1', title: 'Open baseline setup', detail: 'Add your name, why, sobriety start date, and support contact.' },
    { step: '2', title: 'Save the first check-in', detail: 'Lock in mood, craving, and sober status before the day gets loud.' },
    { step: '3', title: 'Use Talk or Rescue', detail: 'Route commands to meetings, proof, training, and emergency help.' },
  ];

  useEffect(() => {
    if (searchParams.get('focus') !== 'support' && window.location.pathname !== '/setup-profile') return;

    const frame = window.requestAnimationFrame(() => {
      setSetupOpen(true);
      window.requestAnimationFrame(() => {
        const target = searchParams.get('focus') === 'support' ? supportSectionRef.current : setupSectionRef.current;
        target?.scrollIntoView({ behavior: 'smooth', block: searchParams.get('focus') === 'support' ? 'center' : 'start' });
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [searchParams]);

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

  const openSetup = () => {
    setSetupOpen(true);
    window.requestAnimationFrame(() => {
      setupSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
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

  const celebrateMilestone = () => {
    if (!todayMilestone) return;

    const nextCelebrated = Array.from(new Set([...loadData().celebratedMilestones, todayMilestone]));
    setCelebratedMilestones(nextCelebrated);
    saveData({ celebratedMilestones: nextCelebrated });
  };

  const loadDemoBaseline = () => {
    const now = new Date();
    const dateKey = (offset: number) => {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      return formatLocalDateKey(date);
    };
    const soberStart = dateKey(-46);
    const createdAt = now.toISOString();
    const demoProfile: Profile = {
      ...profile,
      name: 'Iron Warrior',
      sobrietyDate: soberStart,
      why: 'Discipline today. Freedom tomorrow.',
      focus: 'sobriety-strength-discipline',
      transformationGoal: 'Lean, sober, strong, and consistent.',
      supportLocation: 'Vancouver, BC',
      supportName: 'Brother Mike',
      supportPhone: '604-555-1234',
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
      updatedAt: createdAt,
    };
    const demoLoadout: ActiveLoadout = {
      id: `demo-loadout-${now.getTime()}`,
      templateId: 'ppl',
      title: '20-Min Sober Strength Loadout',
      label: 'Push Pull Legs',
      goal: 'Build muscle and stay locked in',
      time: '20 min',
      level: 'Intermediate',
      days: ['Push', 'Pull', 'Legs'],
      intent: 'Demo-ready sober strength routine',
      finisher: '2-minute incline walk breathing reset',
      createdAt,
      exercises: [
        { name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells', sets: '2', reps: '8–10', rest: '90 sec', cue: 'Shoulders packed, press with control.', mistake: 'Do not bounce or flare elbows hard.', swap: 'Push-ups or machine press.', icon: '▲' },
        { name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', sets: '2', reps: '10–12', rest: '75 sec', cue: 'Pull elbows to ribs.', mistake: 'Do not turn it into a curl.', swap: 'Assisted pull-up or row.', icon: '↓' },
        { name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbell', sets: '2', reps: '10–12', rest: '75 sec', cue: 'Brace, sit between the hips.', mistake: 'Do not collapse knees in.', swap: 'Leg press.', icon: '◆' },
      ],
    };
    const demoCheckIns: Record<string, CheckIn> = [-6, -5, -4, -3, -2, -1, 0].reduce((acc, offset) => {
      const date = dateKey(offset);
      acc[date] = {
        date,
        sober: true,
        mood: offset === 0 ? 'Locked in' : offset === -2 ? 'Tested but steady' : 'Disciplined',
        craving: offset === -2 ? 6 : offset === 0 ? 2 : 3,
        note: offset === 0 ? 'Demo proof: checked in, trained, and stayed sober.' : 'Stacked another clean day.',
        habitsCompleted: ['Drink water before coffee', 'Move for 20+ minutes'],
      };
      return acc;
    }, {} as Record<string, CheckIn>);
    const demoFitnessEntries: FitnessEntry[] = [
      { id: `demo-fitness-${dateKey(-3)}`, date: dateKey(-3), type: 'Full-body strength', durationMinutes: 38, intensity: 'Hard', note: 'Routine complete — cravings dropped after training.' },
      { id: `demo-fitness-${dateKey(0)}`, date: dateKey(0), type: demoLoadout.title, durationMinutes: 22, intensity: 'Hard', note: '20-minute sober strength loadout conquered.' },
    ];
    const demoProof: CompletedLoadout = {
      id: `demo-proof-${now.getTime()}`,
      date: dateKey(0),
      title: demoLoadout.title,
      label: demoLoadout.label,
      activeDay: 'Push Day',
      durationMinutes: 22,
      intensity: 'Hard',
      exercises: demoLoadout.exercises.map((exercise) => exercise.name),
      completedSets: 6,
      totalSets: 6,
      finisher: demoLoadout.finisher,
      proofCopy: 'Day 47 sober. 20-minute strength loadout complete. Craving lost, proof stacked.',
    };

    setProfile(demoProfile);
    setBodyProfile(demoBodyProfile);
    setCelebratedMilestones([]);
    saveData({
      profile: demoProfile,
      bodyProfile: demoBodyProfile,
      checkIns: demoCheckIns,
      fitnessEntries: demoFitnessEntries,
      activeLoadout: demoLoadout,
      completedLoadouts: [demoProof],
      latestVictoryProof: demoProof,
      celebratedMilestones: [],
    });
    setSaved(true);
    setBackupStatus('Full demo mode loaded: Day 47 streak, weekly check-ins, active routine, workout proof, Victory Card data, and Brother Mike support contact.');
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
      setCelebratedMilestones(next.celebratedMilestones);
      setSaved(true);
      setBackupStatus('Backup restored. Progress is back on this device.');
    } catch {
      setBackupStatus('Restore failed. Choose a valid Iron Habit backup file.');
    }
  };

  return (
    <div className="page warrior-page stack-lg">
      <section className="warrior-hero">
        <div className="hero-tag-bar">{heroTag}</div>
        {milestoneInfo && <div className="hero-milestone">{milestoneInfo.emoji} {milestoneInfo.label} UNLOCKED</div>}
        <div className="hero-top-bar">
          <div className="hero-left">
            <span className="hero-day">DAY {displayDay}</span>
            <h1>SOBER</h1>
          </div>
          <Link to={rescuePath} className="btn btn-danger btn-hero-rescue">
            🆘 {highCraving ? 'Emergency Chain' : 'Rescue'}
          </Link>
        </div>
        <p className="hero-why">{nextBestMove}</p>
      </section>

      {needsSetup && (
        <section className="card first-user-card stack-sm">
          <span className="tag danger-tag">First launch</span>
          <h2>Get to a working baseline in one setup block.</h2>
          <p>Finish the baseline first: name, sobriety start date, why, and a real support contact. Then Today, check-ins, Talk, Train, and Rescue can personalize the next move.</p>
          <div className="launch-step-strip" aria-label="First launch steps">
            {launchSteps.map((item) => (
              <div key={item.step} className="launch-step">
                <span>{item.step}</span>
                <b>{item.title}</b>
                <small>{item.detail}</small>
              </div>
            ))}
          </div>
          <div className="baseline-checklist" aria-label="Baseline checklist">
            {baselineChecklist.map((item) => (
              <div key={item.label} className={`baseline-check ${item.ready ? 'baseline-check-ready' : ''}`}>
                <b>{item.ready ? '✓' : '•'}</b>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={openSetup}>Open baseline setup</button>
            <Link to="/setup-profile?focus=support" className="btn btn-secondary">Add support contact</Link>
          </div>
        </section>
      )}

      {(backupStatus.includes('Full demo mode loaded') || demoProofReady) && (
        <section className="card stack-sm demo-next-card">
          <span className="tag danger-tag">{backupStatus.includes('Full demo mode loaded') ? 'Demo loaded' : 'Demo proof ready'}</span>
          <h2>Show the proof loop fast.</h2>
          <p>{supportReady ? `${profile.supportName} support contact, ` : ''}Day {displayDay} proof, training receipts, and Victory Card data are loaded. Jump straight to the strongest demo moment.</p>
          <div className="hero-actions">
            <Link to="/share-progress" className="btn btn-primary">Open Victory Card</Link>
            <Link to="/workout-mode" className="btn btn-secondary">View Routine</Link>
            <Link to="/proof" className="btn btn-secondary">Proof Stack</Link>
            <Link to="/rescue?chain=1" className="btn btn-danger">Demo Emergency Chain</Link>
          </div>
        </section>
      )}

      {showMilestoneShare && todayMilestone && (
        <section className="card stack-sm milestone-share-card">
          <span className="tag danger-tag">Milestone unlocked</span>
          <h2>Day {todayMilestone} sober — share the receipt.</h2>
          <p>This is not just a streak. It is evidence that the old loop lost today. Turn it into a Victory Card while the win is fresh.</p>
          <div className="mission-brief-grid">
            <div><span>Receipt</span><strong>Day {todayMilestone}</strong></div>
            <div><span>Angle</span><strong>Comeback proof</strong></div>
            <div><span>Status</span><strong>Undefeated</strong></div>
          </div>
          <div className="hero-actions">
            <Link to="/share-progress?template=milestone" className="btn btn-primary" onClick={celebrateMilestone}>Make Milestone Card</Link>
            <Link to="/proof" className="btn btn-secondary" onClick={celebrateMilestone}>Open Proof Stack</Link>
            <button type="button" className="btn btn-ghost" onClick={celebrateMilestone}>Hide for now</button>
          </div>
        </section>
      )}

      {needsSetup ? (
        <section className="card stack-sm setup-lock-card">
          <span className="tag danger-tag">Today locked</span>
          <h2>Unlock the full dashboard after baseline setup.</h2>
          <p>Today stays simple until you save name, sobriety start date, why, and a safe person to text.</p>
          <div className="mission-brief-grid">
            {baselineChecklist.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.ready ? 'Ready' : 'Missing'}</strong>
              </div>
            ))}
          </div>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={openSetup}>Open baseline setup</button>
            <Link to={rescuePath} className="btn btn-danger">{highCraving ? 'Start Emergency Chain' : 'Open Rescue'}</Link>
          </div>
        </section>
      ) : (
        <>
          {primaryMission.stage === 'complete' ? (
            <section className="card command-card sober-mission-card mission-complete-card stack-sm">
              <div className="section-title-row mission-title-row">
                <span className="tag">Mission complete</span>
                <b>{completionLabel}</b>
              </div>
              <h2>{primaryMission.title}</h2>
              <p>{nextBestMove}</p>
              <div className="mission-brief-grid">
                <div><span>Streak</span><strong>Day {displayDay}</strong></div>
                <div><span>Proof action</span><strong>Share Victory Card</strong></div>
                <div><span>Next loop</span><strong>Tell Talk it’s posted</strong></div>
              </div>
              <div className="mission-complete-next stack-sm" aria-label="Today post-card next move">
                <span className="tag danger-tag">Next decision</span>
                <h3>Proof posted? Debrief it before the day gets loud.</h3>
                <p>Talk will help you stack a second receipt, protect today, or reopen the Proof Vault without hunting through the app.</p>
              </div>
              <div className="hero-actions">
                <Link to={shareVictoryCardPath} className="btn btn-primary">Share Victory Card</Link>
                <Link to="/talk?command=post-first-card" className="btn btn-secondary">Tell Talk it’s posted</Link>
                <Link to="/talk?command=second-receipt" className="btn btn-secondary">Stack Second Receipt</Link>
                <Link to={rescuePath} className="btn btn-danger">{highCraving ? 'Emergency Chain' : 'Rescue'}</Link>
              </div>
            </section>
          ) : (
            <section className="card command-card sober-mission-card stack-sm">
              <div className="section-title-row mission-title-row">
                <span className="tag">Sober Strength Mission</span>
                <b>{completionLabel}</b>
              </div>
              <h2>{primaryMission.title}</h2>
              <p>{primaryMission.detail}</p>
              <div className="mission-step-strip" aria-label="Daily mission steps">
                {missionSteps.map((step) => (
                  <Link to={step.to} key={step.label} className={`${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`.trim()}>
                    <b>{step.done ? '✓' : '•'}</b>
                    <span>{step.label}</span>
                  </Link>
                ))}
              </div>
              <div className="mission-brief-grid">
                <div><span>Craving defense</span><strong>{cravingDefense}</strong></div>
                <div><span>Fuel target</span><strong>{proteinTarget}</strong></div>
                <div><span>Proof action</span><strong>{proofAction}</strong></div>
              </div>
              <div className="hero-actions">
                <Link to={primaryMission.to} className="btn btn-primary">{primaryMission.cta}</Link>
                <Link to="/talk" className="btn btn-secondary">Talk Command</Link>
                <Link to={rescuePath} className="btn btn-danger">{highCraving ? 'Emergency Chain' : 'Rescue'}</Link>
                <Link to="/settings" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>⚙️ Settings</Link>
              </div>
            </section>
          )}

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
        </>
      )}

      <details
        id="setup-profile"
        ref={setupSectionRef}
        className="collapse-card card warrior-collapse"
        open={setupOpen}
        onToggle={(event) => setSetupOpen(event.currentTarget.open)}
      >
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

          <div ref={supportSectionRef} className="card support-contact-card stack-sm">
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
            {needsSetup && <Button variant="secondary" onClick={loadDemoBaseline}>Load demo mode</Button>}
            <Button variant="ghost" onClick={quickStart}>Save starter draft</Button>
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
