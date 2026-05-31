import { useRef, useState, type CSSProperties, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { loadData, saveData } from '../utils/storage';
import { calculateMacroTargets } from '../utils/nutrition';
import { buildMealEntry, getMealsForDate, removeMealEntry, sumMealsForDate, upsertMealEntry } from '../utils/nutritionLog';
import { calculateSobrietyStreak } from '../utils/streaks';
import { formatLocalDateKey } from '../utils/date';

const coachImage = '/mockup-assets/iron-habit-coach-v2.png';
const benchImage = '/mockup-assets/train-bench.svg';
const mealImage = '/mockup-assets/plate-check-chicken.jpg';
const trainHeroImage = '/mockup-assets/train-reference-hero-left.jpg';
const pushPhoto = '/exercise-media/Barbell_Bench_Press_-_Medium_Grip/0.jpg';
const pullPhoto = '/exercise-media/Seated_Cable_Rows/0.jpg';
const legsPhoto = '/exercise-media/Hack_Squat/0.jpg';

const exercises = [
  { name: 'Barbell Bench Press', sets: '4 × 6–10', muscle: 'Chest • Shoulders • Triceps' },
  { name: 'Incline Dumbbell Press', sets: '3 × 8–12', muscle: 'Upper chest • Front delts' },
  { name: 'Seated Shoulder Press', sets: '3 × 8–12', muscle: 'Delts • Triceps' },
  { name: 'Cable Lateral Raise', sets: '3 × 12–15', muscle: 'Side delts' },
  { name: 'Dips', sets: '3 × 10–15', muscle: 'Chest • Triceps' },
  { name: 'Rope Tricep Pushdown', sets: '3 × 12–15', muscle: 'Triceps' },
];

const meetings = [
  { type: 'A', name: 'Central Austin AA', time: '7:00 PM', distance: '0.8 mi', meta: 'Open Meeting', tag: '' },
  { type: 'A', name: 'Hope & Freedom Group', time: '8:00 PM', distance: '1.4 mi', meta: 'Open Meeting', tag: '' },
  { type: 'NA', name: 'NA Unity Meeting', time: '7:30 PM', distance: '2.1 mi', meta: 'Open Meeting', tag: '' },
  { type: 'S', name: 'SMART Recovery Austin', time: '6:30 PM', distance: '2.3 mi', meta: 'Support Group', tag: '' },
  { type: '✥', name: 'Daily Reflections', time: '7:00 PM', distance: '3.1 mi', meta: 'Open Meeting', tag: '' },
];

const formatNumber = (value: number) => value.toLocaleString();

const formatCompactCalories = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `${value}`;

const clampPct = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const getSetTotal = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mealToneByType = {
  breakfast: { icon: '☼', tone: 'red' },
  lunch: { icon: '☼', tone: 'amber' },
  dinner: { icon: '☾', tone: 'violet' },
  snack: { icon: '▱', tone: 'gold' },
  custom: { icon: '◆', tone: 'red' },
};

type PlateDraft = {
  name: string;
  calories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
  photoName: string;
  estimateNote: string;
};

const starterPlateDraft: PlateDraft = {
  name: 'Chicken, rice and veggies',
  calories: '650',
  proteinGrams: '52',
  carbGrams: '48',
  fatGrams: '21',
  photoName: '',
  estimateNote: 'Editable estimate — review before logging.',
};

const fuelQuickEstimates: PlateDraft[] = [
  {
    name: 'Greek yogurt + berries',
    calories: '280',
    proteinGrams: '28',
    carbGrams: '32',
    fatGrams: '4',
    photoName: '',
    estimateNote: 'Quick estimate — adjust brand/serving before logging.',
  },
  {
    name: 'Eggs + toast',
    calories: '430',
    proteinGrams: '25',
    carbGrams: '34',
    fatGrams: '22',
    photoName: '',
    estimateNote: 'Quick estimate — review portion size before logging.',
  },
  {
    name: 'Protein shake',
    calories: '240',
    proteinGrams: '32',
    carbGrams: '14',
    fatGrams: '6',
    photoName: '',
    estimateNote: 'Quick estimate — adjust milk/powder before logging.',
  },
];

function useMockData() {
  const data = loadData();
  const day = Math.max(1, calculateSobrietyStreak());
  const supportLocation = data.profile.supportLocation.trim() || 'your city';
  const activeProgram = data.activeLoadout?.title || 'Push Day';
  return { data, day, supportLocation, activeProgram };
}

export function PhoneStatus({ visible = false }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <div className="ih-status ih-fuel-status">
      <span>1:46</span>
      <div className="ih-status-right" aria-hidden="true">
        <span className="ih-signal"><i /><i /><i /></span>
        <span className="ih-wifi">⌒</span>
        <span className="ih-battery">46</span>
      </div>
    </div>
  );
}

export function BrandHeader({ step, back = false, backTo = '/today' }: { step?: string; back?: boolean; backTo?: string }) {
  return (
    <>
      <PhoneStatus />
      <div className="ih-header">
        {back ? <Link to={backTo} className="ih-back">←</Link> : <span />}
        <Link to="/today" className="ih-wordmark"><span>IRON</span><b>HABIT</b></Link>
        <span className="ih-step">{step}</span>
      </div>
    </>
  );
}

export function HelmetCoach({ small = false, splash = false }: { small?: boolean; splash?: boolean }) {
  return (
    <div
      className={`ih-coach${small ? ' ih-coach-small' : ''}${splash ? ' ih-coach-splash' : ''}`}
      aria-label="Iron helmet hoodie coach"
    >
      {!splash && (
        <>
          <div className="ih-red-beam left" />
          <div className="ih-red-beam right" />
        </>
      )}
      <img className="ih-coach-photo" src={coachImage} alt="Iron helmet hoodie coach" />
    </div>
  );
}

export function StatCard({ label, value, sub, tone = 'red' }: { label: string; value: string; sub?: string; tone?: string }) {
  return <div className="ih-stat"><span className={`ih-dot ih-${tone}`} /> <small>{label}</small><strong>{value}</strong>{sub && <em>{sub}</em>}</div>;
}

function FuelMetric({ label, icon, tone = 'red', consumed, target, remaining, pct }: { label: string; icon: string; tone?: string; consumed: string; target: string; remaining: string; pct: number }) {
  return (
    <div className={`ih-fuel-metric ih-fuel-tone-${tone}`} style={{ '--fuel-metric-progress': `${clampPct(pct)}%` } as CSSProperties}>
      <div className="ih-fuel-metric-icon" aria-hidden="true">{icon}</div>
      <div className="ih-fuel-metric-label">{label}</div>
      <strong>{consumed}<small>/ {target}</small></strong>
      <p>{remaining}</p>
      <div className="ih-fuel-progress-line">
        <div className="ih-fuel-mini-track"><i /></div>
        <b>{clampPct(pct)}%</b>
      </div>
    </div>
  );
}

function MacroRing({ label, value, target, pct, tone }: { label: string; value: string; target: string; pct: number; tone: string }) {
  return (
    <div className={`ih-macro-ring ih-ring-tone-${tone}`} style={{ '--macro-ring-progress': `${clampPct(pct)}%` } as CSSProperties}>
      <div className="ih-ring-orbit">
        <span>{clampPct(pct)}%</span>
        <strong>{label}</strong>
        <b>{value}</b>
        <small>/ {target}</small>
      </div>
    </div>
  );
}

function MediaTile({ label, tall = false, src, video = false }: { label: string; tall?: boolean; src?: string; video?: boolean }) {
  return (
    <div className={tall ? 'ih-media ih-media-tall' : 'ih-media'}>
      {src ? <img className="ih-media-photo" src={src} alt="" /> : <div className="ih-media-grid" />}
      <div className="ih-media-shade" />
      {video && <div className="ih-play">▶</div>}
      <span>{label}</span>
    </div>
  );
}

export function WelcomeSplash() {
  return (
    <section className="ih-page ih-splash">
      <div className="ih-splash-stage">
        <div className="ih-logo-block ih-real-logo" aria-label="Iron Habit">
          <span>IRON</span>
          <b>HABIT</b>
        </div>
        <HelmetCoach splash />
        <div className="ih-real-splash-preview" aria-label="Today preview">
          <div className="ih-real-preview-top">
            <small>Today</small>
            <strong>Your day</strong>
          </div>
          <div className="ih-real-preview-ring"><span>82</span><small>ready</small></div>
          <div className="ih-real-preview-list">
            <p><b /> Check-in complete</p>
            <p><b /> Upper body · 45 min</p>
            <p><b /> Meeting options nearby</p>
          </div>
        </div>
        <p className="ih-splash-copy">
          A realistic daily plan for staying sober, training, eating well, and proving progress one day at a time.
        </p>
      </div>
      <div className="ih-splash-footer">
        <Link to="/setup-profile" className="ih-primary ih-wide ih-talk-start">
          <span className="ih-talk-start-main">Start your plan</span>
          <small>Set up in under two minutes.</small>
        </Link>
      </div>
    </section>
  );
}

const onboardingSteps = [
  { label: '01 / LOCATION + RECOVERY', title: 'Set your starting point', copy: 'City, nearby support, and where you are in recovery.', body: <><label className="ih-input"><span>⌕</span><input placeholder="Enter your city" defaultValue="" /></label><div className="ih-chip-grid"><button>Day 1</button><button>Few days</button><button>Weeks</button><button>Months+</button></div></> },
  { label: '02 / BODY BASICS', title: 'Add the basics', copy: 'Height, weight, age, and gender help tune training and nutrition.', body: <div className="ih-field-grid">{['Height', 'Weight', 'Age', 'Gender'].map((field) => <div className="ih-field" key={field}>{field}<b>—</b></div>)}</div> },
  { label: '03 / GOAL', title: 'Choose a direction', copy: 'Start simple. You can adjust it later.', body: <>{['Fat loss', 'Build muscle', 'Recomp'].map((item) => <button className="ih-option" key={item}>{item}<small>{item.includes('Recomp') ? 'Get stronger while leaning out.' : item.includes('Fat') ? 'Lose fat with steady habits.' : 'Add size and strength.'}</small></button>)}</> },
  { label: '04 / TRAINING LEVEL', title: 'Match your current level', copy: 'The plan starts at your floor, then progresses.', body: <>{['Beginner', 'Intermediate', 'Advanced', 'Elite'].map((item) => <button className="ih-option" key={item}>{item}<small>{item === 'Beginner' ? 'Build the base safely.' : 'Progression ready.'}</small></button>)}</> },
];

export function OnboardingFlow() {
  return (
    <section className="ih-page ih-flow ih-onboarding-page">
      <BrandHeader step="SETUP" />
      <div className="ih-onboarding-hero">
        <HelmetCoach small />
        <div><small>SETUP</small><h1>Build a plan that fits your day.</h1><p>Training, meals, check-ins, meetings, and proof stay organized around your baseline.</p></div>
      </div>
      {onboardingSteps.map((step) => (
        <div className="ih-card ih-question ih-step-card" key={step.label}>
          <small>{step.label}</small>
          <h1>{step.title}</h1>
          <p>{step.copy}</p>
          {step.body}
        </div>
      ))}
      <div className="ih-card ih-complete ih-final-checklist">
        <div><small>05 / ALL SET</small><h1>ALL SET. LET’S BUILD YOU.</h1><p>Your support base, body profile, routine, and first mission are ready.</p></div>
        <HelmetCoach small />
        {['Profile Created', 'Plan Building', 'Local Support Found', 'Your First Mission Ready'].map((item) => <div className="ih-check" key={item}>✓ {item}</div>)}
      </div>
      <Link to="/today" className="ih-primary ih-wide">ENTER IRON HABIT →</Link>
      <div className="ih-step-dots"><i /><i /><i /><i /><i /></div>
    </section>
  );
}

export function TodayPage() {
  const { data, day } = useMockData();
  const targets = calculateMacroTargets(data.bodyProfile);
  const mealTotals = sumMealsForDate(data);
  const proteinPct = targets ? clampPct((mealTotals.proteinGrams / targets.proteinGrams) * 100) : 0;
  const proteinStatus = targets ? `${formatNumber(mealTotals.proteinGrams)}g / ${formatNumber(targets.proteinGrams)}g` : 'Set baseline';
  const fuelValue = targets ? `${proteinPct}%` : 'Set';
  const fuelSub = targets ? proteinStatus : 'Set baseline';
  const missions = [
    { label: 'Morning check-in', detail: 'Mood, sleep, sober plan.', status: 'Done', done: true },
    { label: 'Push workout', detail: 'Chest, delts, triceps.', status: 'Done', done: true },
    { label: 'Protein target', detail: 'Keep meals steady.', status: proteinStatus },
    { label: 'Steps', detail: 'Move stress through.', status: '6.4k' },
    { label: 'Night reflection', detail: 'Close the loop sober.', status: 'Open' },
  ];
  return (
    <section className="ih-page ih-real-today">
      <BrandHeader />
      <section className="ih-real-today-hero" aria-label="Today mission dashboard">
        <HelmetCoach />
        <div className="ih-dashboard-hero ih-real-dashboard-hero">
          <small>TODAY</small>
          <h1>{day} <span>{day === 1 ? 'DAY SOBER' : 'DAYS SOBER'}</span></h1>
          <b>Daily plan</b>
          <p>Check in, train, fuel, and keep proof moving with one clear day plan.</p>
        </div>
        <div className="ih-action-row ih-real-action-row">
          <Link to="/check-in" className="ih-primary">Check in</Link>
          <Link to="/rescue?chain=1" className="ih-secondary">Rescue</Link>
        </div>
      </section>
      <div className="ih-stat-grid four ih-real-stat-grid">
        <StatCard label="Discipline" value="78%" tone="green" sub="Orders locked" />
        <StatCard label="Train" value="3/4" tone="red" sub="Push week" />
        <StatCard label="Fuel" value={fuelValue} tone="amber" sub={fuelSub} />
        <StatCard label="Mind" value="2/3" tone="blue" sub="Calm reps" />
      </div>
      <div className="ih-card">
        <div className="section-title-row"><div><small>Daily loop</small><h2>Today’s plan</h2></div><b>2 / 5 done</b></div>
        <div className="ih-real-orders-list">
          {missions.map((mission, index) => (
            <div className={`ih-mission ${mission.done ? 'mission-complete' : ''}`.trim()} key={mission.label}>
              <span>{index + 1}</span>
              <div><strong>{mission.label}</strong><small>{mission.detail}</small></div>
              <b>{mission.status}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TalkPage() {
  return (
    <section className="ih-page ih-talk-page">
      <BrandHeader />
      <div className="ih-card ih-ai-card ih-talk-hero">
        <HelmetCoach small />
        <div>
          <small>IRON COMMAND CENTER</small>
          <h1>TALK TO THE APP. LOCK THE NEXT MOVE.</h1>
          <p>One command can preload meetings, training, fuel, rescue, and proof.</p>
        </div>
      </div>
      <label className="ih-command ih-talk-command"><textarea defaultValue="I live in Burnaby BC. I’m 5'10, 200 lbs, 30, want fat loss and muscle, beginner, full gym." /></label>
      <div className="ih-chip-grid talk ih-talk-chip-grid">
        {['I’m craving', 'Build workout', 'Find meetings', 'Log meal', 'Log workout', 'Make proof card', 'What’s my next move?'].map((chip) => <button key={chip}>{chip}</button>)}
      </div>
      <div className="ih-card ih-success ih-talk-loaded-card">
        <small>SETUP RESULT</small>
        <h2>HELMET ON. PLAN LOADED.</h2>
        <p>Today, Train, Fuel, Progress, and emergency Rescue are wired around your baseline.</p>
        <div className="ih-action-row"><Link to="/today">Enter Today</Link><Link to="/meetings">View Meetings</Link><Link to="/train">Start Routine</Link></div>
      </div>
    </section>
  );
}

export function MeetingsPage() {
  const { supportLocation } = useMockData();
  const hasSavedSupportLocation = supportLocation !== 'your city';
  const supportArea = hasSavedSupportLocation ? supportLocation : 'Sample support area';
  const meetingSearchArea = hasSavedSupportLocation ? supportLocation : 'Austin, TX';
  const meetingsSummary = hasSavedSupportLocation ? `Meetings near ${supportArea}` : 'Sample meetings for setup preview';
  return (
    <section className="ih-page ih-meetings-page">
      <BrandHeader />
      <div className="ih-hero-split ih-meetings-hero"><div><small>SUPPORT NEARBY</small><h1>FIND<br />SUPPORT<br />NEARBY</h1><p>{meetingsSummary}</p></div><HelmetCoach small /></div>
      <div className="ih-location-bar"><span>⌖</span><div><small>{hasSavedSupportLocation ? 'Current support area' : 'Sample support area'}</small><strong>{supportArea}</strong></div><Link to="/talk">Change</Link></div>
      <div className="ih-tabs ih-pill-tabs"><b>ALL</b><span>AA</span><span>NA</span><span>SMART</span><span>OTHER</span></div>
      <div className="ih-list">
        {meetings.map((meeting) => <a className="ih-meeting" href={`https://www.google.com/search?q=${encodeURIComponent(meeting.name + ' near ' + meetingSearchArea)}`} key={meeting.name} target="_blank" rel="noreferrer"><i>{meeting.type}</i><div><strong>{meeting.name}</strong><small>{meeting.meta}</small></div><em>{meeting.distance}<small>{meeting.time}</small></em><b>›</b></a>)}
      </div>
      <a className="ih-secondary ih-wide" href="https://www.aa.org/find-aa" target="_blank" rel="noreferrer">Online meeting options</a>
    </section>
  );
}

export function TrainPage() {
  const { data } = useMockData();
  const activeLoadout = data.activeLoadout;
  const activeExercises = activeLoadout?.exercises || [];
  const activeDay = activeLoadout?.days?.[0] || 'Push';
  const totalSets = activeExercises.reduce((total, exercise) => total + getSetTotal(exercise.sets), 0);
  const planLabel = activeLoadout?.label || 'PPL';
  const workoutRows = [
    { name: 'Push Day', meta: 'Chest • Shoulders • Triceps', accent: 'Classic Strength', sets: `${totalSets || 16} sets`, exercises: `${activeExercises.length || 6} exercises`, image: pushPhoto, badge: 'TODAY', path: '/exercise?split=push' },
    { name: 'Pull Day', meta: 'Back • Biceps', accent: 'Classic Strength', sets: '16 sets', exercises: '6 exercises', image: pullPhoto, path: '/exercise?split=pull' },
    { name: 'Legs Day', meta: 'Quads • Hamstrings • Calves', accent: 'Power Base', sets: '18 sets', exercises: '7 exercises', image: legsPhoto, path: '/exercise?split=legs' },
  ];
  const statTiles = [
    { label: 'Split', value: planLabel, sub: activeLoadout ? 'Active' : 'Default', icon: 'split', tone: 'red', to: '/exercise?split=custom' },
    { label: 'Day', value: activeDay, sub: activeLoadout?.level || 'Chest/Delts', icon: 'day', tone: 'orange', to: '/exercise?split=push' },
    { label: 'Sets', value: `${totalSets || 16}`, sub: 'Target', icon: 'sets', tone: 'amber', to: '/workout-mode' },
    { label: 'Exercises', value: `${activeExercises.length || 6}`, sub: activeLoadout ? 'Loaded' : 'Sample', icon: 'exercises', tone: 'green', to: '/exercise?split=push' },
  ];

  return (
    <section className="ih-page ih-real-train ih-reference-train">
      <section className="ih-ref-hero" aria-label="Training hero">
        <div className="ih-ref-hero-art" aria-hidden="true">
          <span />
          <img src={trainHeroImage} alt="" />
        </div>
        <div className="ih-ref-hero-stats" aria-label="Training proof summary">
          <div><span>🔥</span><strong>12</strong><small>Day Streak</small></div>
          <div><span>🏆</span><strong>480</strong><small>Total Points</small></div>
        </div>
        <div className="ih-ref-hero-copy">
          <small>TRAINING</small>
          <h1>Train today</h1>
          <p>Pick the split, open the program, and log the work you actually did.</p>
          <div className="ih-ref-hero-actions">
            <Link to="/workout-mode">START WORKOUT <b>›</b></Link>
            <Link to="/exercise?split=push">VIEW PROGRAM</Link>
          </div>
        </div>
      </section>

      <div className="ih-ref-stat-grid" aria-label="Training summary">
        {statTiles.map((tile) => (
          <Link className="ih-ref-stat-card" to={tile.to} key={tile.label}>
            <span className={`ih-ref-stat-icon ih-ref-${tile.tone} ih-ref-stat-${tile.icon}`} aria-hidden="true" />
            <small>{tile.label}</small>
            <strong>{tile.value}</strong>
            <em>{tile.sub}</em>
            <b>›</b>
          </Link>
        ))}
      </div>

      <nav className="ih-ref-tabs" aria-label="Training sections">
        <Link className="active" to="/train"><span className="ih-ref-tab-icon ih-ref-tab-splits" />SPLITS</Link>
        <Link to="/exercise?split=push"><span className="ih-ref-tab-icon ih-ref-tab-program" />PROGRAM</Link>
        <Link to="/profile"><span className="ih-ref-tab-icon ih-ref-tab-history" />HISTORY</Link>
        <Link to="/progress-dashboard"><span className="ih-ref-tab-icon ih-ref-tab-analytics" />ANALYTICS <b>NEW</b></Link>
      </nav>

      <div className="ih-ref-workout-list">
        {workoutRows.map((workout) => (
          <Link className="ih-ref-workout-card" to={workout.path} key={workout.name}>
            <div className="ih-ref-workout-media">
              <img src={workout.image} alt="" />
              {workout.badge && <span>{workout.badge}</span>}
            </div>
            <div className="ih-ref-workout-copy">
              <strong>{workout.name}</strong>
              <small>{workout.meta}</small>
              <em>{workout.accent}</em>
            </div>
            <div className="ih-ref-workout-meta">
              <span><i className="ih-ref-meta-sets" />{workout.sets}</span>
              <span><i className="ih-ref-meta-exercises" />{workout.exercises}</span>
            </div>
            <span className="ih-ref-play" aria-label={`Start ${workout.name}`}>▶</span>
            <b aria-hidden="true">›</b>
          </Link>
        ))}
      </div>

      <section className="ih-ref-help-card">
        <span className="ih-ref-headset" aria-hidden="true"><i /></span>
        <div>
          <strong>Need help?</strong>
          <small>Our coaching team is here to support you.</small>
        </div>
        <Link to="/rescue?chain=1">GET HELP NOW <b>›</b></Link>
      </section>
    </section>
  );
}

export function ExerciseDetail() {
  return (
    <section className="ih-page ih-mock-train-page ih-exercise-detail-page">
      <BrandHeader back />
      <div className="ih-card ih-workout-head ih-exercise-hero">
        <HelmetCoach small />
        <div><small>PUSH DAY PROGRAM</small><h1>PUSH DAY</h1><p>Chest • Shoulders • Triceps</p></div>
        <b>01</b>
      </div>
      <div className="ih-stat-grid four ih-train-snapshot"><StatCard label="MIN" value="45" sub="Work cap" /><StatCard label="SETS" value="16" sub="Target" /><StatCard label="REPS" value="8-12" sub="Range" /><StatCard label="CAL" value="~480" sub="Burn" /></div>
      <div className="section-title-row"><div><small>PROGRAM SHEET</small><h2>EXERCISES</h2></div><b>6 MOVES</b></div>
      <div className="ih-list ih-exercise-list">{exercises.map((exercise, index) => <Link className="ih-exercise ih-exercise-row" to="/workout-mode" key={exercise.name}><MediaTile label="DEMO" src={benchImage} /><div><strong>{index + 1} {exercise.name}</strong><small>{exercise.sets}</small><em>{exercise.muscle}</em></div><span>{index === 0 ? 'ACTIVE' : 'QUEUE'}</span><b>▶</b></Link>)}</div>
      <div className="ih-card ih-exercise-focus-card"><div className="ih-section-head"><div><small>DEMO DETAIL</small><h2>BARBELL BENCH PRESS</h2></div><b>CHEST</b></div><MediaTile label="DEMO GIF / VIDEO AREA" tall src={benchImage} /><div className="ih-tabs"><b>DEMO</b><span>MUSCLES</span><span>CUES</span></div><ul className="ih-cues"><li>Grip slightly wider than shoulders.</li><li>Retract shoulder blades.</li><li>Lower bar to mid-chest.</li><li>Press up fast. No ego.</li></ul><div className="ih-muscles">Target muscles: Chest, front delts, triceps</div></div>
      <Link to="/workout-mode" className="ih-primary ih-wide">START WORKOUT</Link>
    </section>
  );
}

export function WorkoutLogger() {
  return (
    <section className="ih-page ih-mock-train-page ih-workout-logger-page">
      <BrandHeader back />
      <div className="ih-card ih-logger-hero"><div><small>ACTIVE WORKOUT</small><h1>PUSH DAY</h1><b>37:24</b></div><span className="ih-icon-button">Ⅱ</span></div>
      <div className="ih-active-set-card"><div><small>NOW LOGGING</small><h2>Incline Dumbbell Press</h2><p>Set 2 of 3 • Upper chest focus</p></div><b>02/06</b></div>
      <MediaTile label="ACTIVE DEMO GIF / VIDEO" tall src={benchImage} />
      <div className="ih-logger"><div><button>−</button><span><small>REPS</small><strong>10</strong></span><button>+</button></div><div><button>−</button><span><small>WEIGHT</small><strong>45</strong></span><button>+</button></div></div>
      <button className="ih-primary ih-wide">LOG SET ✓</button>
      <div className="ih-card ih-upnext"><small>UP NEXT</small><strong>Seated Shoulder Press</strong><span>3 × 8–12 • Delts + triceps</span></div>
    </section>
  );
}

export function FuelPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [data, setData] = useState(() => loadData());
  const [plateDraft, setPlateDraft] = useState<PlateDraft | null>(null);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState('Tap scan, review the estimate, then log it.');
  const targets = calculateMacroTargets(data.bodyProfile);
  const hasMacroTargets = Boolean(targets);
  const todayMeals = getMealsForDate(data);
  const mealTotals = sumMealsForDate(data);
  const todayKey = formatLocalDateKey();
  const todayCheckIn = data.checkIns[todayKey];
  const cravingLevel = todayCheckIn?.craving || 0;
  const calorieTarget = targets?.targetCalories || 0;
  const proteinTarget = targets?.proteinGrams || 0;
  const carbTarget = targets?.carbGrams || 0;
  const fatTarget = targets?.fatGrams || 0;
  const caloriePct = calorieTarget ? (mealTotals.calories / calorieTarget) * 100 : 0;
  const proteinPct = proteinTarget ? (mealTotals.proteinGrams / proteinTarget) * 100 : 0;
  const carbPct = carbTarget ? (mealTotals.carbGrams / carbTarget) * 100 : 0;
  const fatPct = fatTarget ? (mealTotals.fatGrams / fatTarget) * 100 : 0;
  const waterConsumed = data.waterLogs?.[todayKey] || 0;
  const waterTarget = 3;
  const waterPct = (waterConsumed / waterTarget) * 100;
  const todayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date());
  const currentHour = new Date().getHours();
  const proteinRemaining = Math.max(0, proteinTarget - mealTotals.proteinGrams);
  const calorieRemaining = Math.max(0, calorieTarget - mealTotals.calories);
  const fuelNudge = cravingLevel >= 7
    ? { label: 'Craving defense', copy: 'High urge logged — hydrate, add protein, then start Rescue if it stays loud.', action: '/rescue?chain=1', cta: 'Open Rescue Chain' }
    : hasMacroTargets && proteinPct < 50
      ? { label: 'Protein low', copy: 'Put real food between you and the urge. Log protein before discipline gets expensive.', action: '', cta: '' }
      : hasMacroTargets && currentHour >= 17 && caloriePct < 45
        ? { label: 'Eat before cravings', copy: 'Calories are light for this late. Eat real food before cravings get loud.', action: '', cta: '' }
        : { label: 'Fuel check', copy: 'Review estimates before logging. These macros guide the rebuild, not medical advice.', action: '', cta: '' };
  const calorieRemainingCopy = hasMacroTargets
    ? fuelNudge.label === 'Eat before cravings'
      ? `${formatNumber(calorieRemaining)} kcal left — eat real food first`
      : `${formatNumber(calorieRemaining)} kcal remaining`
    : 'Set profile to unlock targets';
  const proteinRemainingCopy = hasMacroTargets
    ? `${formatNumber(proteinRemaining)}g left — defense fuel`
    : 'Add body baseline first';
  const formatMacroTarget = (value: number) => hasMacroTargets ? `${formatNumber(value)}g` : 'Set baseline';
  const macroRings = [
    { label: 'Carbs', value: `${formatNumber(mealTotals.carbGrams)}g`, target: formatMacroTarget(carbTarget), pct: carbPct, tone: 'green' },
    { label: 'Protein', value: `${formatNumber(mealTotals.proteinGrams)}g`, target: formatMacroTarget(proteinTarget), pct: proteinPct, tone: 'red' },
    { label: 'Fat', value: `${formatNumber(mealTotals.fatGrams)}g`, target: formatMacroTarget(fatTarget), pct: fatPct, tone: 'amber' },
  ];
  const mealResults = plateDraft ? [
    { label: 'Cal', key: 'calories', value: plateDraft.calories },
    { label: 'Protein', key: 'proteinGrams', value: plateDraft.proteinGrams },
    { label: 'Carbs', key: 'carbGrams', value: plateDraft.carbGrams },
    { label: 'Fat', key: 'fatGrams', value: plateDraft.fatGrams },
  ] : [
    { label: 'Cal', value: '—' },
    { label: 'Protein', value: '—' },
    { label: 'Carbs', value: '—' },
    { label: 'Fat', value: '—' },
  ];

  const updatePlateDraft = (field: keyof PlateDraft, value: string) => {
    setPlateDraft((current) => ({ ...(current || starterPlateDraft), [field]: value }));
  };

  const startEstimate = (photoName = '', draft = starterPlateDraft) => {
    setPlateDraft({ ...draft, photoName });
    setEditingMealId(null);
    setScanStatus(photoName ? `Photo added for review: ${photoName}` : `${draft.name} estimate ready. Review before logging.`);
  };

  const editMeal = (mealId: string) => {
    const meal = todayMeals.find((entry) => entry.id === mealId);
    if (!meal) return;
    setEditingMealId(meal.id);
    setPlateDraft({
      name: meal.name,
      calories: String(meal.calories),
      proteinGrams: String(meal.proteinGrams),
      carbGrams: String(meal.carbGrams),
      fatGrams: String(meal.fatGrams),
      photoName: meal.photoName || '',
      estimateNote: meal.estimateNote || 'Edited from today’s log.',
    });
    setScanStatus(`${meal.name} loaded for correction. Review, then update the log.`);
  };

  const deleteMeal = (mealId: string) => {
    const meal = todayMeals.find((entry) => entry.id === mealId);
    const updated = saveData({ mealEntries: removeMealEntry(data.mealEntries || [], mealId) });
    setData(updated);
    if (editingMealId === mealId) {
      setEditingMealId(null);
      setPlateDraft(null);
    }
    setScanStatus(`${meal?.name || 'Meal'} removed. Totals updated.`);
  };

  const logWater = () => {
    const nextWater = Math.min(waterTarget, Number((waterConsumed + 0.5).toFixed(1)));
    const updated = saveData({ waterLogs: { ...(data.waterLogs || {}), [todayKey]: nextWater } });
    setData(updated);
    setScanStatus(`Water logged: ${nextWater.toFixed(1)}L today.`);
  };

  const handlePlatePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const fileName = event.target.files?.[0]?.name || '';
    startEstimate(fileName);
    event.target.value = '';
  };

  const addPlateToLog = () => {
    if (!plateDraft) return;

    const meal = buildMealEntry({
      name: plateDraft.name,
      calories: plateDraft.calories,
      proteinGrams: plateDraft.proteinGrams,
      carbGrams: plateDraft.carbGrams,
      fatGrams: plateDraft.fatGrams,
      source: 'scan',
      mealType: 'custom',
      id: editingMealId || undefined,
      photoName: plateDraft.photoName,
      estimateNote: plateDraft.estimateNote,
    });
    const updated = saveData({ mealEntries: upsertMealEntry(data.mealEntries || [], meal) });
    setData(updated);
    const wasEditing = Boolean(editingMealId);
    setEditingMealId(null);
    setPlateDraft(null);
    setScanStatus(wasEditing ? 'Meal correction saved. Totals updated.' : 'Reviewed estimate logged. Totals updated.');
  };

  return (
    <section className="ih-page ih-fuel-page">
      <div className="ih-fuel-topbar">
        <div>
          <h1>Fuel</h1>
          <p>Today, {todayLabel} <span aria-hidden="true">⌄</span></p>
        </div>
        <Link to="/profile" className="ih-fuel-chart-button" aria-label="Open progress dashboard">
          <i /><i /><i />
        </Link>
      </div>

      <div className="ih-fuel-dashboard" aria-label="Daily fuel dashboard">
        <FuelMetric
          label="Calories"
          icon="🔥"
          consumed={formatNumber(mealTotals.calories)}
          target={hasMacroTargets ? formatNumber(calorieTarget) : 'Set baseline'}
          remaining={calorieRemainingCopy}
          pct={caloriePct}
        />
        <FuelMetric
          label="Protein"
          icon="⚡"
          consumed={`${formatNumber(mealTotals.proteinGrams)}g`}
          target={hasMacroTargets ? `${formatNumber(proteinTarget)}g` : 'Set baseline'}
          remaining={proteinRemainingCopy}
          pct={proteinPct}
        />
        <FuelMetric
          label="Water"
          icon="💧"
          tone="blue"
          consumed={`${waterConsumed.toFixed(1)}L`}
          target={`${waterTarget.toFixed(1)}L`}
          remaining={`${Math.max(0, waterTarget - waterConsumed).toFixed(1)}L remaining`}
          pct={waterPct}
        />
      </div>

      <div className="ih-fuel-rings" aria-label={hasMacroTargets ? `${formatCompactCalories(calorieTarget)} calorie target macro progress` : 'Macro target setup needed'}>
        <div className="ih-macro-ring-row">
          {macroRings.map((ring) => <MacroRing key={ring.label} {...ring} />)}
        </div>
        {!hasMacroTargets && <Link to="/setup-profile" className="ih-secondary ih-wide">Set body baseline for accurate macros</Link>}
        {(hasMacroTargets || cravingLevel >= 7) && (
          <div className="ih-fuel-nudge" aria-label="Fuel coach nudge">
            <div>
              <small>{fuelNudge.label}</small>
              <p>{fuelNudge.copy}</p>
            </div>
            {fuelNudge.action ? <Link to={fuelNudge.action}>{fuelNudge.cta}</Link> : <button type="button" onClick={() => startEstimate()}>Review estimates</button>}
          </div>
        )}
      </div>

      <div className="ih-plate-check">
        <div className="ih-fuel-section-title">
          <div>
            <small>Plate check</small>
            {plateDraft ? (
              <input
                className="ih-plate-title-input"
                aria-label="Meal estimate name"
                value={plateDraft.name}
                onChange={(event) => updatePlateDraft('name', event.target.value)}
              />
            ) : <h2>Scan item</h2>}
            <p className="ih-plate-note">{scanStatus}</p>
          </div>
          <b>{plateDraft ? 'Review' : 'Estimate'}</b>
        </div>
        <div className="ih-plate-layout">
          <div className="ih-plate-thumb">
            <img src={mealImage} alt="Plate estimate preview" />
            <span />
          </div>
          <div className="ih-plate-side">
            <div className="ih-plate-results">
              {mealResults.map((result) => (
                <div className="ih-plate-result" key={result.label}>
                  {plateDraft && 'key' in result ? (
                    <input
                      aria-label={`${result.label} estimate`}
                      inputMode="numeric"
                      value={result.value}
                      onChange={(event) => updatePlateDraft(result.key as keyof PlateDraft, event.target.value)}
                    />
                  ) : <strong>{result.value}</strong>}
                  <span>{result.label}</span>
                </div>
              ))}
            </div>
            <div className="ih-plate-actions">
              <button className="ih-primary" onClick={addPlateToLog} disabled={!plateDraft}>{editingMealId ? 'Update log' : 'Add to log'} <span aria-hidden="true">+</span></button>
              <button className="ih-secondary" type="button" onClick={() => fileInputRef.current?.click()}>{plateDraft ? 'Scan another' : 'Scan item'} <span aria-hidden="true">⌖</span></button>
            </div>
            <button className="ih-water-log-button" type="button" onClick={logWater}>Log 0.5L water</button>
            <div className="ih-fuel-quick-estimates" aria-label="Quick sober fuel estimates">
              {fuelQuickEstimates.map((estimate) => (
                <button type="button" key={estimate.name} onClick={() => startEstimate('', estimate)}>
                  {estimate.name}
                </button>
              ))}
            </div>
            <input ref={fileInputRef} className="ih-plate-file-input" type="file" accept="image/*" aria-label="Add plate photo for review" onChange={handlePlatePhoto} />
          </div>
        </div>
      </div>

      <div className="ih-meal-history">
        <div className="ih-fuel-section-title">
          <div><small>Logged today</small><h2>Meals</h2></div>
          <b>{todayMeals.length} / 5</b>
        </div>
        <div className="ih-meal-card-grid">
          {todayMeals.length > 0 ? todayMeals.map((meal) => {
            const mealTone = mealToneByType[meal.mealType] || mealToneByType.custom;
            return (
              <article className="ih-compact-meal-card" key={meal.id}>
                <span className={`ih-meal-icon ih-meal-tone-${mealTone.tone}`} aria-hidden="true">{mealTone.icon}</span>
                <div className="ih-compact-meal-copy">
                  <strong>{meal.name}</strong>
                  <p>{formatNumber(meal.calories)} cal • {formatNumber(meal.proteinGrams)}g protein</p>
                </div>
                <span className="ih-meal-state">{meal.source === 'scan' ? 'Reviewed' : 'Logged'}</span>
                <button className="ih-meal-edit" type="button" onClick={() => editMeal(meal.id)} aria-label={`Edit ${meal.name}`}>Edit</button>
                <button className="ih-meal-delete" type="button" onClick={() => deleteMeal(meal.id)} aria-label={`Remove ${meal.name}`}>×</button>
              </article>
            );
          }) : (
            <article className="ih-compact-meal-card is-pending">
              <span className="ih-meal-icon ih-meal-tone-gold" aria-hidden="true">▱</span>
              <div className="ih-compact-meal-copy">
                <strong>No meals logged yet</strong>
                <p>Review an estimate before logging. No fake totals here.</p>
              </div>
              <span className="ih-meal-state">Pending</span>
              <b className="ih-meal-check" />
              <span className="ih-meal-arrow" aria-hidden="true">›</span>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

export function RescuePage() {
  const rescueSteps = [
    { title: 'Hydrate', detail: 'Water + electrolytes. Give the body signal first.', status: '01' },
    { title: 'Protein / fruit', detail: 'Put real fuel between you and the craving.', status: '02' },
    { title: 'Breathe 4-7-8', detail: 'Three rounds. Slow the system down.', status: '03' },
    { title: 'Text safe person', detail: 'Send the chain. Do not isolate.', status: '04' },
    { title: 'Find support', detail: 'Open meetings or official sources nearby.', status: '05' },
    { title: 'Make proof', detail: 'When you win, turn it into a receipt.', status: '✓' },
  ];
  return (
    <section className="ih-page ih-rescue-page">
      <BrandHeader />
      <div className="ih-card ih-danger ih-rescue-hero">
        <div>
          <small>RESCUE DECK</small>
          <h1>CRAVING HITTING HARD?</h1>
          <p>This is not a negotiation. Start the chain. Use food, breath, support, and meetings.</p>
        </div>
        <HelmetCoach small />
        <Link to="/rescue?chain=1" className="ih-primary ih-wide">I’M ABOUT TO DRINK</Link>
      </div>
      <div className="ih-stat-grid four ih-rescue-snapshot">
        <StatCard label="Urge" value="10/10" sub="Peak faced" />
        <StatCard label="Timer" value="10" sub="Minutes" tone="amber" />
        <StatCard label="Chain" value="ON" sub="Human help" tone="green" />
        <StatCard label="Proof" value="Card" sub="After win" tone="blue" />
      </div>
      <div className="ih-card ih-chain-card">
        <div className="ih-section-head"><div><small>EMERGENCY CHAIN</small><h2>DO THESE IN ORDER.</h2></div><b>LIVE</b></div>
        <div className="ih-chain-actions"><Link to="/talk">Text Support</Link><Link to="/meetings">Meetings</Link><Link to="/fuel">Eat Now</Link></div>
      </div>
      <div className="ih-card ih-rescue-protocol"><div className="ih-section-head"><div><small>10-MINUTE PROTOCOL</small><h2>STAY HERE. WIN THIS.</h2></div><b>6 STEPS</b></div>{rescueSteps.map((step) => <div className="ih-mission ih-rescue-step" key={step.title}><span>{step.status}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div><b>○</b></div>)}</div>
      <button className="ih-secondary ih-wide">I SLIPPED — RESTART WITHOUT SHAME</button>
    </section>
  );
}

export function ProofPage() {
  const { day } = useMockData();
  const receipts = [
    { label: 'Sober streak', title: `${day} DAYS SOBER`, meta: 'Still here. Still building.', tone: 'hero' },
    { label: 'Workout victory', title: 'PUSH DAY CONQUERED', meta: '16 sets • 45 min • Proof stacked.', tone: '' },
    { label: 'Craving rescue', title: '10/10 SURVIVED', meta: 'The urge lost. The receipt stays.', tone: 'danger' },
    { label: 'Milestone', title: 'IRON PHASE II', meta: 'Discipline becoming identity.', tone: '' },
  ];
  return (
    <section className="ih-page ih-proof-page">
      <BrandHeader />
      <div className="ih-proof-hero"><div><small>PROOF VAULT</small><h1>VICTORY CARDS</h1><p>Receipts for sober days, workouts, cravings survived, and milestones.</p></div><HelmetCoach small /></div>
      <div className="ih-stat-grid four ih-proof-snapshot"><StatCard label="Sober" value={`${day}`} sub="Days" /><StatCard label="Train" value="16" sub="Sets" tone="red" /><StatCard label="Craving" value="10/10" sub="Beat" tone="amber" /><StatCard label="Cards" value="4" sub="Ready" tone="green" /></div>
      <div className="ih-proof-grid">
        {receipts.map((receipt) => <div className={`ih-proof-card ${receipt.tone}`.trim()} key={receipt.label}>{receipt.tone === 'hero' && <HelmetCoach small />}<small>{receipt.label}</small><h2>{receipt.title}</h2><p>{receipt.meta}</p><span>MAKE CARD ›</span></div>)}
      </div>
      <div className="ih-card ih-share-preview-card"><div className="ih-section-head"><div><small>9:16 SHARE PREVIEW</small><h2>PUBLIC PROOF CARD</h2></div><b>READY</b></div><div className="ih-share-preview"><HelmetCoach small /><strong>IRON HABIT</strong><span>{day} DAYS SOBER</span><p>Proof over promises.</p></div><div className="ih-action-row"><button>Make Victory Card</button><button>Share Proof</button><button>Download Card</button></div></div>
    </section>
  );
}
