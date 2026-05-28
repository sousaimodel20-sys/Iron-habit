import { Link } from 'react-router-dom';
import { loadData } from '../utils/storage';
import { calculateSobrietyStreak } from '../utils/streaks';

const coachImage = '/mockup-assets/helmet-coach.svg';
const splitImage = '/mockup-assets/split-coach.svg';
const benchImage = '/mockup-assets/train-bench.svg';
const mealImage = '/mockup-assets/meal-bowl.svg';

const splits = [
  { name: 'Push / Pull / Legs', meta: 'Classic 6 day split', accent: 'Chest • Back • Legs', days: '6 days', path: '/exercise?split=ppl', image: splitImage },
  { name: 'Upper / Lower', meta: '4 day balanced split', accent: 'Strength + balance', days: '4 days', path: '/exercise?split=upper-lower', image: benchImage },
  { name: 'Bro Split', meta: 'Chest / Back / Arms / Legs', accent: 'High volume pump', days: '5 days', path: '/exercise?split=bro', image: splitImage },
  { name: 'Full Body', meta: 'Total body 3x per week', accent: 'Beginner base', days: '3 days', path: '/exercise?split=full-body', image: benchImage },
  { name: 'Athletic', meta: 'Strength + conditioning', accent: 'Explosive work', days: '5 days', path: '/exercise?split=athletic', image: splitImage },
  { name: 'Calisthenics', meta: 'Bodyweight strength', accent: 'No excuses', days: '4 days', path: '/exercise?split=calisthenics', image: splitImage },
  { name: 'Recovery', meta: 'Low impact, heal & rebuild', accent: 'Mobility + zone 2', days: '3 days', path: '/exercise?split=recovery', image: mealImage },
  { name: 'Custom Split', meta: 'Build your own week', accent: 'Pick muscles', days: 'Custom', path: '/exercise?split=custom', image: splitImage },
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
  { type: 'AA', name: 'Official AA meeting search', meta: 'Use saved city / map source', tag: 'Verified source link' },
  { type: 'NA', name: 'Official NA meeting search', meta: 'Search nearby recovery groups', tag: 'Verified source link' },
  { type: 'SMART', name: 'SMART Recovery finder', meta: 'Online + local meetings', tag: 'Verified source link' },
  { type: 'MAP', name: 'Maps recovery support search', meta: 'No fake addresses shown', tag: 'Location bridge' },
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

function MediaTile({ label, tall = false, src }: { label: string; tall?: boolean; src?: string }) {
  return (
    <div className={tall ? 'ih-media ih-media-tall' : 'ih-media'}>
      {src ? <img className="ih-media-photo" src={src} alt="" /> : <div className="ih-media-grid" />}
      <div className="ih-media-shade" />
      <div className="ih-play">▶</div>
      <span>{label}</span>
    </div>
  );
}

export function WelcomeSplash() {
  return (
    <section className="ih-page ih-splash">
      <PhoneStatus />
      <HelmetCoach />
      <div className="ih-logo-block">
        <span>IRON</span>
        <b>HABIT</b>
      </div>
      <p className="ih-splash-copy">PUT THE HELMET ON.<br />TALK TO THE APP.<br />LOCK IN TODAY.</p>
      <Link to="/onboarding" className="ih-primary ih-wide">🎙 TALK TO START <small>Your AI coach is ready.</small></Link>
    </section>
  );
}

export function OnboardingFlow() {
  return (
    <section className="ih-page ih-flow">
      <PhoneStatus />
      <BrandHeader step="1 OF 8" />
      <div className="ih-card ih-question">
        <h1>WHERE ARE YOU BUILDING FROM?</h1>
        <p>Your city / support area helps us find you the right support.</p>
        <label className="ih-input"><span>⌕</span><input placeholder="Enter your city" defaultValue="" /></label>
        <h3>What’s your recovery baseline?</h3>
        <div className="ih-chip-grid"><button>Just Starting</button><button>A Few Days</button><button>Weeks</button><button>Months+</button></div>
      </div>
      <div className="ih-card ih-question">
        <h1>YOUR BASICS. LET’S LOCK IT IN.</h1>
        <p>This helps us build your personal plan.</p>
        {['Height -- cm', 'Weight -- kg', 'Age --', 'Gender Select'].map((field) => <div className="ih-field" key={field}>{field}</div>)}
      </div>
      <div className="ih-card ih-question">
        <h1>WHAT’S YOUR TARGET?</h1>
        <p>We’ll build your plan around it.</p>
        {['🔥 Fat Loss — Burn fat. Get lean.', '💪 Muscle Gain — Build muscle. Get strong.', '⚔ Both — Recomp. Best of both.'].map((item) => <button className="ih-option" key={item}>{item}</button>)}
      </div>
      <div className="ih-card ih-question">
        <h1>YOUR TRAINING LEVEL?</h1>
        <p>Be honest. This keeps you safe and progressing.</p>
        {['Beginner — New to training', 'Intermediate — Some experience', 'Advanced — Trained for a while', 'Elite — Very experienced'].map((item) => <button className="ih-option" key={item}>{item}</button>)}
      </div>
      <div className="ih-card ih-complete">
        <div><h1>ALL SET. LET’S BUILD YOU.</h1><p>Your plan is loading. Let’s get to work.</p></div>
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
  const missions = ['Morning Check-in', 'Push Workout', 'Hit Protein Goal', '10k Steps', 'Night Reflection'];
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <HelmetCoach />
      <div className="ih-dashboard-hero">
        <small>TODAY’S MISSION</small>
        <h1>{day} <span>DAYS SOBER</span></h1>
        <b>⚔ IRON PHASE II</b>
      </div>
      <div className="ih-stat-grid four">
        <StatCard label="Discipline" value="78%" tone="green" />
        <StatCard label="Train" value="3/4" tone="red" />
        <StatCard label="Fuel" value="78%" tone="amber" />
        <StatCard label="Mind" value="2/3" tone="blue" />
      </div>
      <div className="ih-card">
        <h2>TODAY’S ORDERS</h2>
        {missions.map((mission, index) => <div className="ih-mission" key={mission}><span>{index + 1}</span>{mission}<b>{index < 2 ? '✓' : index === 2 ? '185 / 220g' : index === 3 ? '6,432 / 10k' : '○'}</b></div>)}
      </div>
      <Link to="/talk" className="ih-primary ih-wide">🎙 TALK TO IRON</Link>
    </section>
  );
}

export function TalkPage() {
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-card ih-ai-card"><HelmetCoach small /><div><small>IRON AI COACH</small><h1>Talk to the app. Lock in the next move.</h1><p>Commands route your training, meetings, fuel, rescue, and proof.</p></div></div>
      <label className="ih-command"><textarea defaultValue="I live in Burnaby BC. I’m 5'10, 200 lbs, 30, want fat loss and muscle, beginner, full gym." /></label>
      <div className="ih-chip-grid talk">
        {['I’m craving', 'Build workout', 'Find meetings', 'Log meal', 'Log workout', 'Make proof card', 'What’s my next move?'].map((chip) => <button key={chip}>{chip}</button>)}
      </div>
      <div className="ih-card ih-success">
        <h2>HELMET ON. PLAN LOADED.</h2>
        <p>Meetings, Train, Rescue, Today, Fuel, and Proof are wired around your baseline.</p>
        <div className="ih-action-row"><Link to="/today">Enter Today</Link><Link to="/meetings">View Meetings</Link><Link to="/train">Start Routine</Link></div>
      </div>
    </section>
  );
}

export function MeetingsPage() {
  const { supportLocation } = useMockData();
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-hero-split"><div><h1>FIND SUPPORT. YOU DON’T DO THIS ALONE.</h1><p>Meetings near {supportLocation}. Change location anytime.</p></div><HelmetCoach small /></div>
      <div className="ih-tabs"><b>ALL</b><span>AA</span><span>NA</span><span>SMART</span><span>OTHER</span></div>
      <div className="ih-list">
        {meetings.map((meeting) => <a className="ih-meeting" href={`https://www.google.com/search?q=${encodeURIComponent(meeting.name + ' near ' + supportLocation)}`} key={meeting.name} target="_blank" rel="noreferrer"><i>{meeting.type}</i><div><strong>{meeting.name}</strong><small>{meeting.meta}</small></div><em>{meeting.tag}</em></a>)}
      </div>
      <div className="ih-card ih-note">Verified local meeting feed is not connected yet. This screen uses official source/search links only — no fake addresses.</div>
      <a className="ih-secondary ih-wide" href="https://www.aa.org/find-aa" target="_blank" rel="noreferrer">VIEW ONLINE MEETINGS</a>
    </section>
  );
}

export function TrainPage() {
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-title-row"><div><h1>TRAIN</h1><b>REBUILD MODE</b></div><span className="ih-icon-button">◎</span></div>
      <div className="ih-tabs"><b>SPLITS</b><span>PROGRAM</span><span>HISTORY</span></div>
      <div className="ih-list">
        {splits.map((split) => <Link className="ih-split" to={split.path} key={split.name}><MediaTile label="GIF" src={split.image} /><div><strong>{split.name}</strong><small>{split.meta}</small><ProgressBar pct={split.name === 'Recovery' ? 45 : 70} /></div><em>{split.days}</em><b>›</b></Link>)}
      </div>
      <Link className="ih-secondary ih-wide" to="/exercise?split=custom">⚒ CUSTOM SPLIT BUILDER</Link>
    </section>
  );
}

export function ExerciseDetail() {
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader back />
      <div className="ih-workout-head"><HelmetCoach small /><div><h1>PUSH DAY</h1><p>Chest • Shoulders • Triceps</p></div></div>
      <div className="ih-stat-grid four"><StatCard label="MIN" value="45" /><StatCard label="SETS" value="16" /><StatCard label="REPS" value="8-12" /><StatCard label="CAL" value="~480" /></div>
      <h2>EXERCISES</h2>
      <div className="ih-list">{exercises.map((exercise, index) => <Link className="ih-exercise" to="/workout-mode" key={exercise.name}><MediaTile label="DEMO" src={benchImage} /><div><strong>{index + 1} {exercise.name}</strong><small>{exercise.sets}</small><em>{exercise.muscle}</em></div><b>▶</b></Link>)}</div>
      <div className="ih-card"><h2>BARBELL BENCH PRESS</h2><MediaTile label="DEMO GIF / VIDEO AREA" tall src={benchImage} /><div className="ih-tabs"><b>DEMO</b><span>MUSCLES</span><span>CUES</span></div><ul className="ih-cues"><li>Grip slightly wider than shoulders.</li><li>Retract shoulder blades.</li><li>Lower bar to mid-chest.</li><li>Press up fast. No ego.</li></ul><div className="ih-muscles">Target muscles: Chest, front delts, triceps</div></div>
      <Link to="/workout-mode" className="ih-primary ih-wide">START WORKOUT</Link>
    </section>
  );
}

export function WorkoutLogger() {
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader back />
      <div className="ih-title-row"><div><h1>PUSH DAY</h1><b>37:24</b></div><span className="ih-icon-button">Ⅱ</span></div>
      <h2>Incline Dumbbell Press</h2><p>Set 2 of 3</p>
      <MediaTile label="ACTIVE DEMO GIF / VIDEO" tall src={benchImage} />
      <div className="ih-logger"><div><button>−</button><span><small>REPS</small><strong>10</strong></span><button>+</button></div><div><button>−</button><span><small>WEIGHT</small><strong>45</strong></span><button>+</button></div></div>
      <button className="ih-primary ih-wide">LOG SET ✓</button>
      <div className="ih-card ih-upnext"><small>UP NEXT</small><strong>Seated Shoulder Press</strong><span>3 × 8–12</span></div>
    </section>
  );
}

export function FuelPage() {
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-title-row"><div><h1>IRON FUEL</h1><b>NUTRITION DASHBOARD</b></div><span className="ih-ring-score">78%</span></div>
      <div className="ih-card">{macroRows.map((row) => <div className="ih-macro" key={row.label}><div><strong>{row.label}</strong><span>{row.value}</span></div><ProgressBar pct={row.pct} tone={row.tone} /></div>)}</div>
      <div className="ih-card"><h2>TODAY’S MEALS</h2>{['Breakfast — 3 eggs, oats, banana', 'Lunch — Chicken rice bowl', 'Post Workout — Whey shake + fruit', 'Dinner — Salmon, sweet potato'].map((meal) => <div className="ih-meal" key={meal}>{meal}<b>✓</b></div>)}<button className="ih-primary ih-wide">+ ADD MEAL</button></div>
      <div className="ih-card"><h2>MEAL SCAN</h2><MediaTile label="CAMERA / MEAL IMAGE" tall src={mealImage} /><div className="ih-stat-grid four"><StatCard label="CAL" value="650" /><StatCard label="PROTEIN" value="52g" /><StatCard label="CARBS" value="48g" /><StatCard label="FAT" value="21g" /></div><button className="ih-primary ih-wide">ADD TO LOG</button><button className="ih-secondary ih-wide">SCAN ANOTHER</button></div>
      <div className="ih-card"><h2>AI MEAL IDEAS</h2>{['High Protein Chicken Bowl', 'Steak & Rice', 'Turkey Wrap', 'Protein Pancakes'].map((meal) => <div className="ih-meal" key={meal}>{meal}<span>Protein-first</span></div>)}</div>
      <div className="ih-card ih-danger"><h2>CRAVING HITTING HARD?</h2><p>Use food as fuel. Beat the urge.</p>{['High Protein Shake', 'Greek Yogurt + Berries', 'Banana + Peanut Butter', 'Beef Jerky', 'Electrolytes'].map((item) => <div className="ih-meal" key={item}>{item}<b>›</b></div>)}<button className="ih-primary ih-wide">I ATE SOMETHING</button></div>
    </section>
  );
}

export function RescuePage() {
  return (
    <section className="ih-page ih-rescue-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-card ih-danger"><HelmetCoach small /><h1>CRAVING HITTING HARD?</h1><p>This is not a negotiation. Start the chain. Use food, breath, support, and meetings.</p><button className="ih-primary ih-wide">I’M ABOUT TO DRINK</button></div>
      <div className="ih-card"><h2>10-MINUTE RESCUE PROTOCOL</h2>{['Drink water / electrolytes', 'Eat protein or fruit', 'Breathe 4-7-8 for 3 rounds', 'Text safe person', 'Find a meeting', 'Make proof when you survive it'].map((step, index) => <div className="ih-mission" key={step}><span>{index + 1}</span>{step}<b>○</b></div>)}</div>
      <div className="ih-action-row"><Link to="/meetings">Find Meetings</Link><Link to="/fuel">Nutrition Rescue</Link><Link to="/proof">Make Proof</Link></div>
      <button className="ih-secondary ih-wide">I SLIPPED — RESTART WITHOUT SHAME</button>
    </section>
  );
}

export function ProofPage() {
  const { day } = useMockData();
  return (
    <section className="ih-page">
      <PhoneStatus />
      <BrandHeader />
      <div className="ih-title-row"><div><h1>PROOF VAULT</h1><b>VICTORY CARDS</b></div><span className="ih-icon-button">◇</span></div>
      <div className="ih-proof-grid">
        <div className="ih-proof-card hero"><HelmetCoach small /><small>SOBER STREAK</small><h2>{day} DAYS SOBER</h2><p>Still here. Still building.</p></div>
        <div className="ih-proof-card"><small>WORKOUT VICTORY</small><h2>PUSH DAY CONQUERED</h2><p>16 sets • 45 min • Proof stacked.</p></div>
        <div className="ih-proof-card"><small>CRAVING RESCUE</small><h2>10/10 SURVIVED</h2><p>The urge lost. The receipt stays.</p></div>
        <div className="ih-proof-card"><small>MILESTONE</small><h2>IRON PHASE II</h2><p>Discipline becoming identity.</p></div>
      </div>
      <div className="ih-card"><h2>9:16 SHARE PREVIEW</h2><div className="ih-share-preview"><HelmetCoach small /><strong>IRON HABIT</strong><span>{day} DAYS SOBER</span><p>Proof over promises.</p></div><div className="ih-action-row"><button>Make Victory Card</button><button>Share Proof</button><button>Download Card</button></div></div>
    </section>
  );
}
