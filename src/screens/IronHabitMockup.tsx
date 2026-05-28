import { Link } from 'react-router-dom';
import { loadData } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';

const coachImage = '/mockup-assets/ref-splash-coach.png';
const benchImage = '/mockup-assets/ref-workout-video.png';
const mealImage = '/mockup-assets/ref-meal-plate.png';

const splits = [
  { name: 'Push Day', meta: 'Chest • Shoulders • Triceps', accent: 'Classic strength', days: '▶', path: '/exercise?split=push', image: '/mockup-assets/ref-train-push.png' },
  { name: 'Pull Day', meta: 'Back • Biceps', accent: 'Classic strength', days: '▶', path: '/exercise?split=pull', image: '/mockup-assets/ref-train-pull.png' },
  { name: 'Legs Day', meta: 'Quads • Hamstrings • Calves', accent: 'Power base', days: '▶', path: '/exercise?split=legs', image: '/mockup-assets/ref-train-legs.png' },
  { name: 'Upper Day', meta: 'Chest • Back • Arms', accent: 'Balanced split', days: '▶', path: '/exercise?split=upper', image: '/mockup-assets/ref-train-upper.png' },
  { name: 'Lower Day', meta: 'Legs • Glutes • Calves', accent: 'Lower body', days: '▶', path: '/exercise?split=lower', image: '/mockup-assets/ref-train-lower.png' },
  { name: 'Full Body', meta: 'Total body assault', accent: 'Complete rebuild', days: '▶', path: '/exercise?split=full-body', image: '/mockup-assets/ref-train-full.png' },
];

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

const macroRows = [
  { label: 'Calories', value: '2,140 / 2,800', pct: 76, tone: 'red' },
  { label: 'Protein', value: '185 / 220g', pct: 84, tone: 'green' },
  { label: 'Carbs', value: '140 / 250g', pct: 56, tone: 'amber' },
  { label: 'Fat', value: '52 / 70g', pct: 74, tone: 'orange' },
  { label: 'Water', value: '2.1L / 3.0L', pct: 70, tone: 'blue' },
];

function useMockData() {
  const data = loadData();
  const day = Math.max(1, calculateSobrietyStreak());
  const supportLocation = data.profile.supportLocation.trim() || 'your city';
  const activeProgram = data.activeLoadout?.title || 'Push Day';
  return { data, day, supportLocation, activeProgram };
}

export function PhoneStatus() {
  return (
    <div className="ih-status"><span>9:41</span><span>●●●  5G  ▰</span></div>
  );
}

export function BrandHeader({ step, back = false }: { step?: string; back?: boolean }) {
  return (
    <div className="ih-header">
      {back ? <Link to="/today" className="ih-back">←</Link> : <span />}
      <Link to="/today" className="ih-wordmark">IRON <b>HABIT</b></Link>
      <span className="ih-step">{step}</span>
    </div>
  );
}

export function HelmetCoach({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? 'ih-coach ih-coach-small' : 'ih-coach'} aria-label="Iron helmet hoodie coach">
      <div className="ih-red-beam left" />
      <div className="ih-red-beam right" />
      <img className="ih-coach-photo" src={coachImage} alt="Iron helmet hoodie coach" />
    </div>
  );
}

function ProgressBar({ pct, tone = 'red' }: { pct: number; tone?: string }) {
  return <span className={`ih-progress ih-${tone}`}><i style={{ width: `${pct}%` }} /></span>;
}

export function StatCard({ label, value, sub, tone = 'red' }: { label: string; value: string; sub?: string; tone?: string }) {
  return <div className="ih-stat"><span className={`ih-dot ih-${tone}`} /> <small>{label}</small><strong>{value}</strong>{sub && <em>{sub}</em>}</div>;
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
      <PhoneStatus />
      <div className="ih-splash-stage">
        <HelmetCoach />
        <div className="ih-logo-block" aria-label="Iron Habit">
          <span>IRON</span>
          <b>HABIT</b>
        </div>
        <p className="ih-splash-copy">PUT THE HELMET ON.<br />ONE TALK BUILDS THE APP.<br />LOCK IN TODAY.</p>
      </div>
      <Link to="/onboarding" className="ih-primary ih-wide ih-talk-start">🎙 TALK TO START <small>Your AI coach is ready.</small></Link>
    </section>
  );
}

const onboardingSteps = [
  { label: '01 / CITY + RECOVERY', title: 'WHERE ARE YOU BUILDING FROM?', copy: 'City, meetings base, and sober baseline.', body: <><label className="ih-input"><span>⌕</span><input placeholder="Enter your city" defaultValue="" /></label><div className="ih-chip-grid"><button>Just starting</button><button>Few days</button><button>Weeks</button><button>Months+</button></div></> },
  { label: '02 / BODY BASICS', title: 'YOUR BASICS. LOCK IT IN.', copy: 'Height, weight, age, gender. No fluff.', body: <div className="ih-field-grid">{['Height', 'Weight', 'Age', 'Gender'].map((field) => <div className="ih-field" key={field}>{field}<b>—</b></div>)}</div> },
  { label: '03 / TARGET', title: 'WHAT ARE WE BUILDING?', copy: 'Pick the transformation target.', body: <>{['🔥 Fat Loss', '💪 Muscle', '⚔ Both'].map((item) => <button className="ih-option" key={item}>{item}<small>{item.includes('Both') ? 'Recomp. Strong and lean.' : item.includes('Fat') ? 'Burn fat. Get sharp.' : 'Add size. Add strength.'}</small></button>)}</> },
  { label: '04 / TRAINING LEVEL', title: 'CHOOSE YOUR LEVEL.', copy: 'The plan matches your floor, then raises it.', body: <>{['Beginner', 'Intermediate', 'Advanced', 'Elite'].map((item) => <button className="ih-option" key={item}>{item}<small>{item === 'Beginner' ? 'Build the base safely.' : 'Progression ready.'}</small></button>)}</> },
];

export function OnboardingFlow() {
  return (
    <section className="ih-page ih-flow ih-onboarding-page">
      <PhoneStatus />
      <BrandHeader step="SETUP" />
      <div className="ih-onboarding-hero">
        <HelmetCoach small />
        <div><small>IRON SETUP</small><h1>TALK ONCE. APP PRELOADS.</h1><p>Meetings, Train, Fuel, Today, and Proof get wired around your baseline.</p></div>
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
        {['Profile Created', 'AI Plan Building', 'Local Support Found', 'Your First Mission Ready'].map((item) => <div className="ih-check" key={item}>✓ {item}</div>)}
      </div>
      <Link to="/today" className="ih-primary ih-wide">ENTER IRON HABIT →</Link>
      <div className="ih-step-dots"><i /><i /><i /><i /><i /></div>
    </section>
  );
}

export function TodayPage() {
  const { day } = useMockData();
  const missions = [
    { label: 'Morning Check-in', detail: 'Protect the streak first.', status: '✓', done: true },
    { label: 'Push Workout', detail: 'Chest, delts, triceps.', status: '✓', done: true },
    { label: 'Hit Protein Goal', detail: 'Fuel the rebuild.', status: '185 / 220g' },
    { label: '10k Steps', detail: 'Move the stress out.', status: '6,432 / 10k' },
    { label: 'Night Reflection', detail: 'Close the loop sober.', status: '○' },
  ];
  return (
    <section className="ih-page ih-real-today">
      <PhoneStatus />
      <BrandHeader />
      <section className="ih-real-today-hero" aria-label="Today mission dashboard">
        <HelmetCoach />
        <div className="ih-dashboard-hero ih-real-dashboard-hero">
          <small>TODAY’S MISSION</small>
          <h1>{day} <span>DAYS SOBER</span></h1>
          <b>⚔ IRON PHASE II</b>
          <p>One day. One body. One mission stack. Follow the orders and keep the proof moving.</p>
        </div>
        <div className="ih-action-row ih-real-action-row">
          <Link to="/talk" className="ih-primary">TALK TO IRON</Link>
          <Link to="/rescue" className="ih-secondary">RESCUE</Link>
        </div>
      </section>
      <div className="ih-stat-grid four ih-real-stat-grid">
        <StatCard label="Discipline" value="78%" tone="green" sub="Orders locked" />
        <StatCard label="Train" value="3/4" tone="red" sub="Push week" />
        <StatCard label="Fuel" value="78%" tone="amber" sub="Protein rising" />
        <StatCard label="Mind" value="2/3" tone="blue" sub="Calm reps" />
      </div>
      <div className="ih-card">
        <div className="section-title-row"><div><small>DAILY COMMAND</small><h2>TODAY’S ORDERS</h2></div><b>2 / 5</b></div>
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
      <Link to="/talk" className="ih-primary ih-wide">🎙 TALK TO IRON</Link>
    </section>
  );
}

export function TalkPage() {
  return (
    <section className="ih-page ih-talk-page">
      <PhoneStatus />
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
        <p>Meetings, Train, Rescue, Today, Fuel, and Proof are wired around your baseline.</p>
        <div className="ih-action-row"><Link to="/today">Enter Today</Link><Link to="/meetings">View Meetings</Link><Link to="/train">Start Routine</Link></div>
      </div>
    </section>
  );
}

export function MeetingsPage() {
  const { supportLocation } = useMockData();
  const supportArea = supportLocation === 'your city' ? 'Austin, TX' : supportLocation;
  return (
    <section className="ih-page ih-meetings-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-hero-split ih-meetings-hero"><div><small>SUPPORT RADAR</small><h1>FIND SUPPORT.<br />YOU DON’T DO<br />THIS ALONE.</h1><p>Meetings near {supportArea}</p></div><HelmetCoach small /></div>
      <div className="ih-location-bar"><span>⌖</span><div><small>Current support area</small><strong>{supportArea}</strong></div><Link to="/talk">Change</Link></div>
      <div className="ih-tabs ih-pill-tabs"><b>ALL</b><span>AA</span><span>NA</span><span>SMART</span><span>OTHER</span></div>
      <div className="ih-list">
        {meetings.map((meeting) => <a className="ih-meeting" href={`https://www.google.com/search?q=${encodeURIComponent(meeting.name + ' near ' + supportArea)}`} key={meeting.name} target="_blank" rel="noreferrer"><i>{meeting.type}</i><div><strong>{meeting.name}</strong><small>{meeting.meta}</small></div><em>{meeting.distance}<small>{meeting.time}</small></em><b>›</b></a>)}
      </div>
      <a className="ih-secondary ih-wide" href="https://www.aa.org/find-aa" target="_blank" rel="noreferrer">VIEW ONLINE MEETINGS</a>
    </section>
  );
}

export function TrainPage() {
  return (
    <section className="ih-page ih-real-train ih-mock-train-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-card ih-ai-card ih-real-train-hero ih-mock-train-hero">
        <HelmetCoach small />
        <div>
          <small>TRAINING DECK</small>
          <h1>TRAIN — REBUILD MODE</h1>
          <p>Pick the split, open the program, log the work. Every set becomes proof.</p>
        </div>
      </div>
      <div className="ih-stat-grid four ih-real-train-stat-grid ih-train-snapshot">
        <StatCard label="Split" value="PPL" sub="Active" />
        <StatCard label="Day" value="Push" sub="Chest/delts" tone="red" />
        <StatCard label="Sets" value="16" sub="Target" tone="amber" />
        <StatCard label="Proof" value="1" sub="Card ready" tone="green" />
      </div>
      <div className="ih-tabs ih-train-tabs"><b>SPLITS</b><span>PROGRAM</span><span>HISTORY</span></div>
      <div className="ih-list ih-train-split-list">
        {splits.map((split) => <Link className="ih-split ih-train-split" to={split.path} key={split.name}><MediaTile label="DEMO" src={split.image} /><div><strong>{split.name}</strong><small>{split.meta}</small><span>{split.accent}</span><ProgressBar pct={split.name === 'Recovery' ? 45 : 70} /></div><em>{split.days}</em><b>›</b></Link>)}
      </div>
      <Link className="ih-secondary ih-wide" to="/exercise?split=custom">⚒ CUSTOM SPLIT BUILDER</Link>
    </section>
  );
}

export function ExerciseDetail() {
  return (
    <section className="ih-page ih-mock-train-page ih-exercise-detail-page">
      <PhoneStatus />
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
      <PhoneStatus />
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
  return (
    <section className="ih-page ih-fuel-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-fuel-hero">
        <div>
          <small>IRON FUEL</small>
          <h1>FUEL THE REBUILD.</h1>
          <p>Calories, macros, hydration, meal scan, and craving nutrition rescue in one native dashboard.</p>
        </div>
        <span className="ih-ring-score">78%</span>
      </div>
      <div className="ih-fuel-snapshot">
        <StatCard label="Cal" value="2.1k" sub="of 2.8k" />
        <StatCard label="Protein" value="185g" sub="target 220" tone="green" />
        <StatCard label="Water" value="2.1L" sub="3.0L goal" tone="blue" />
      </div>
      <div className="ih-card ih-macro-card">
        <div className="ih-section-head"><div><small>MACRO COMMAND</small><h2>TODAY’S TARGETS</h2></div><b>ON TRACK</b></div>
        {macroRows.map((row) => <div className="ih-macro" key={row.label}><div><strong>{row.label}</strong><span>{row.value}</span></div><ProgressBar pct={row.pct} tone={row.tone} /></div>)}
      </div>
      <div className="ih-card ih-meal-scan-card">
        <div className="ih-section-head"><div><small>CAMERA SCAN</small><h2>SCAN THE PLATE</h2></div><b>AI ESTIMATE</b></div>
        <MediaTile label="MEAL IMAGE" tall src={mealImage} />
        <div className="ih-stat-grid four"><StatCard label="CAL" value="650" /><StatCard label="PROTEIN" value="52g" /><StatCard label="CARBS" value="48g" /><StatCard label="FAT" value="21g" /></div>
        <button className="ih-primary ih-wide">ADD TO LOG</button><button className="ih-secondary ih-wide">SCAN ANOTHER</button>
      </div>
      <div className="ih-card ih-fuel-stack">
        <div className="ih-section-head"><div><small>LOGGED TODAY</small><h2>MEAL STACK</h2></div><b>4/5</b></div>
        {['Breakfast — 3 eggs, oats, banana', 'Lunch — Chicken rice bowl', 'Post Workout — Whey shake + fruit', 'Dinner — Salmon, sweet potato'].map((meal) => <div className="ih-meal" key={meal}>{meal}<b>✓</b></div>)}
        <button className="ih-primary ih-wide">+ ADD MEAL</button>
      </div>
      <div className="ih-card ih-ideas-card"><h2>AI MEAL IDEAS</h2>{['High Protein Chicken Bowl', 'Steak & Rice', 'Turkey Wrap', 'Protein Pancakes'].map((meal) => <div className="ih-meal" key={meal}>{meal}<span>Protein-first</span></div>)}</div>
      <div className="ih-card ih-danger ih-nutrition-rescue"><h2>CRAVING HITTING HARD?</h2><p>Use food as fuel. Beat the urge.</p>{['High Protein Shake', 'Greek Yogurt + Berries', 'Banana + Peanut Butter', 'Beef Jerky', 'Electrolytes'].map((item) => <div className="ih-meal" key={item}>{item}<b>›</b></div>)}<button className="ih-primary ih-wide">I ATE SOMETHING</button></div>
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
      <PhoneStatus />
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
      <PhoneStatus />
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
