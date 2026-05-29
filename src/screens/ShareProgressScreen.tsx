import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadData, type IronHabitData } from '../utils/storage';
import ShareableProgressCard, { type VictoryTemplate } from '../components/ShareableProgressCard';
import { Button, Card } from '../components/UI';
import { calculateSobrietyStreak } from '../utils/streaks';
import { formatLocalDateKey } from '../utils/date';
import { getCravingReceiptByDate, getCravingReceipts, getProofById } from '../utils/proofReceipts';
import { BrandHeader, HelmetCoach, StatCard } from './IronHabitMockup';

const templates: { id: VictoryTemplate; label: string; description: string }[] = [
  { id: 'comeback', label: 'Comeback', description: 'Sober transformation energy.' },
  { id: 'discipline', label: 'Discipline', description: 'Gym/recovery lock-in proof.' },
  { id: 'receipts', label: 'Receipts', description: 'Stats-first proof card.' },
  { id: 'craving', label: 'Craving Destroyed', description: 'Urge survived, streak protected.' },
  { id: 'milestone', label: 'Milestone', description: '7/14/30/60/90/365 day celebration.' },
  { id: 'transformation', label: 'Transformation', description: 'Body, macros, streak, and identity.' },
  { id: 'weekly', label: 'Weekly Boss', description: 'Seven-day receipt wall.' },
];

const hooks: Record<VictoryTemplate, string[]> = {
  comeback: [
    'POV: you chose the new life again.',
    'Nobody saw the battle. The proof still counts.',
    'This is what sober momentum looks like.',
  ],
  discipline: [
    'I did not negotiate with myself today.',
    'The old me wanted comfort. I chose discipline.',
    'One clean rep. One clean day. Repeat.',
  ],
  receipts: [
    'Proof beats promises.',
    'Here are the receipts from the comeback.',
    'I stopped talking about change and started logging it.',
  ],
  craving: [
    'Craving hit. I did not fold.',
    'The urge said drink. I chose ten minutes.',
    'Recovery is winning one wave at a time.',
  ],
  milestone: [
    'Milestone unlocked. The old life lost another round.',
    'I used to count drinks. Now I count sober days.',
    'This is what the comeback looks like when nobody claps yet.',
  ],
  transformation: [
    'Sober body. Clear mind. New life.',
    'The transformation started when I stopped escaping.',
    'I am not just losing weight. I am building proof.',
  ],
  weekly: [
    'This week tried me. I brought receipts.',
    'Weekly boss battle: cleared.',
    'Seven days of proof beats one day of motivation.',
  ],
};

const hashtags: Record<VictoryTemplate, string> = {
  comeback: '#IronHabit #SoberFitness #Comeback #RecoveryTok #GymTok',
  discipline: '#IronHabit #Discipline #SoberGym #LockIn #FitnessTok',
  receipts: '#IronHabit #ProofBeatsPromises #RecoveryTok #SoberLife #GymProof',
  craving: '#IronHabit #CravingDestroyed #SoberLife #RecoveryTok #OneDayAtATime',
  milestone: '#IronHabit #SoberMilestone #RecoveryTok #SoberFitness #Comeback',
  transformation: '#IronHabit #SoberTransformation #FitnessJourney #RecoveryTok #GymTok',
  weekly: '#IronHabit #WeeklyReceipts #SoberFitness #Discipline #RecoveryTok',
};

const getRecentDateKeys = (count: number) => Array.from({ length: count }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index - count + 1);
  return formatLocalDateKey(date);
});

const templateIds = templates.map((item) => item.id);
const isVictoryTemplate = (value: string | null): value is VictoryTemplate => Boolean(value && templateIds.includes(value as VictoryTemplate));

const heroTitles: Record<VictoryTemplate, string> = {
  comeback: 'Make the comeback visible.',
  discipline: 'Turn discipline into proof.',
  receipts: 'Turn today\'s win into content.',
  craving: 'Turn the urge into proof.',
  milestone: 'Turn the milestone into a launch moment.',
  transformation: 'Turn the body change into content.',
  weekly: 'Turn the week into a boss battle recap.',
};

const ShareProgressScreen = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const routeTemplate = searchParams.get('template');
  const template: VictoryTemplate = isVictoryTemplate(routeTemplate) ? routeTemplate : 'comeback';
  const [data, setData] = useState<IronHabitData>(loadData());
  const [streak, setStreak] = useState(calculateSobrietyStreak());
  const [hookIndex, setHookIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const refresh = () => {
      setData(loadData());
      setStreak(calculateSobrietyStreak());
    };
    refresh();
    window.addEventListener('iron-habit-data-updated', refresh);
    return () => window.removeEventListener('iron-habit-data-updated', refresh);
  }, []);

  const chooseTemplate = (nextTemplate: VictoryTemplate) => {
    setHookIndex(0);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('template', nextTemplate);
    setSearchParams(nextParams);
  };

  const routeProofId = searchParams.get('proof');
  const routeWorkoutProof = routeProofId ? getProofById(data.completedLoadouts, routeProofId) : null;
  const workoutProof = routeWorkoutProof || data.latestVictoryProof;
  const sortedWorkoutProofs = [...data.completedLoadouts].sort((a, b) => a.date.localeCompare(b.date));
  const firstWorkoutProof = sortedWorkoutProofs[0];
  const isFirstVictoryShare = template === 'receipts'
    && Boolean(workoutProof)
    && Boolean(firstWorkoutProof)
    && workoutProof?.id === firstWorkoutProof?.id
    && data.completedLoadouts.length === 1;
  const latestCheckIn = Object.values(data.checkIns).sort((a, b) => b.date.localeCompare(a.date))[0];
  const cravingReceiptDate = searchParams.get('receipt');
  const routeCravingReceipt = cravingReceiptDate ? getCravingReceiptByDate(data.checkIns, cravingReceiptDate) : null;
  const latestCravingReceipt = routeCravingReceipt || getCravingReceipts(data.checkIns, 1)[0];
  const cravingProofReady = Boolean(latestCravingReceipt);
  const recentDays = getRecentDateKeys(7);
  const weeklyMinutes = data.fitnessEntries
    .filter((entry) => recentDays.includes(entry.date))
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const weeklySoberDays = recentDays.filter((date) => data.checkIns[date]?.sober).length;
  const milestoneDays = [7, 14, 30, 60, 90, 365];
  const currentMilestone = [...milestoneDays].reverse().find((days) => streak >= days) || 7;
  const nextMilestone = milestoneDays.find((days) => days > streak);
  const milestoneLabel = currentMilestone >= 365 ? 'one-year sober launch moment' : `${currentMilestone}-day sober milestone`;
  const activeProofLabel = template === 'craving'
    ? cravingProofReady
      ? `Craving proof ready: ${latestCravingReceipt?.craving ?? 0}/10 urge faced on ${latestCravingReceipt?.date} and streak protected.`
      : 'Craving Card preview ready. Open Rescue first to save a real craving receipt.'
    : template === 'receipts' && workoutProof
      ? `Selected receipt: ${workoutProof.title} • ${workoutProof.durationMinutes} minutes • ${workoutProof.completedSets}/${workoutProof.totalSets} sets.`
      : template === 'weekly'
        ? `Weekly receipts ready: ${weeklySoberDays} sober check-ins and ${weeklyMinutes} training minutes this week.`
        : template === 'milestone'
          ? `Milestone card ready: ${milestoneLabel}${nextMilestone ? `, ${nextMilestone - streak} days from the next share moment.` : '.'}`
        : template === 'transformation'
          ? `Transformation proof ready: ${data.bodyProfile.weightLbs || 'body stats'} and ${streak} sober days.`
          : 'No workout proof saved yet. You can still post streak, craving, transformation, or weekly proof — then stack a stronger workout card after Train.';

  const captions: Record<VictoryTemplate, string> = useMemo(() => ({
    comeback: workoutProof
      ? `${workoutProof.title} conquered: ${workoutProof.durationMinutes} min, ${workoutProof.completedSets} sets. Another vote against the old life. ${hashtags.comeback}`
      : `Day ${streak}. Sober, training, and rebuilding brick by brick. ${hashtags.comeback}`,
    discipline: workoutProof
      ? `Proof logged: ${workoutProof.activeDay}, ${workoutProof.exercises.length} exercises, ${workoutProof.completedSets} sets. I did not negotiate today. ${hashtags.discipline}`
      : `I did not negotiate with the old life today. Day ${streak} locked in. ${hashtags.discipline}`,
    receipts: workoutProof
      ? `Receipts: ${workoutProof.label}, ${workoutProof.durationMinutes} minutes, ${workoutProof.completedSets} sets completed. Proof beats promises. ${hashtags.receipts}`
      : `Proof beats promises: ${streak} days sober, ${data.fitnessEntries.length} workouts logged, ${data.habits.length} habits stacked. ${hashtags.receipts}`,
    craving: `Craving hit${latestCravingReceipt?.craving ? ` at ${latestCravingReceipt.craving}/10` : ''}. I did not bargain with it. I protected the streak and stayed in command. ${hashtags.craving}`,
    milestone: currentMilestone >= 365
      ? `One year ago I got sober. Today I am launching the app I wish I had on day one. Day ${streak} proof is real. ${hashtags.milestone}`
      : `${currentMilestone} days sober. I used to count drinks. Now I count proof. The comeback is getting visible. ${hashtags.milestone}`,
    transformation: `${data.bodyProfile.weightLbs ? `${data.bodyProfile.weightLbs} lb today` : `Day ${streak} sober`}${data.bodyProfile.goalWeightLbs ? `, goal ${data.bodyProfile.goalWeightLbs}` : ''}. This is not just fitness. This is the new life getting visible. ${hashtags.transformation}`,
    weekly: `Weekly receipts: ${weeklySoberDays} sober check-ins, ${weeklyMinutes} training minutes, and another boss battle against the old pattern. ${hashtags.weekly}`,
  }), [currentMilestone, data.bodyProfile.goalWeightLbs, data.bodyProfile.weightLbs, data.fitnessEntries.length, data.habits.length, latestCravingReceipt?.craving, streak, weeklyMinutes, weeklySoberDays, workoutProof]);

  const hook = hooks[template][hookIndex % hooks[template].length];
  const videoIdea = template === 'craving'
    ? 'Film: close-up of timer/water bottle → shoes on → quick walk or pushups → screenshot the Victory Card.'
    : template === 'milestone'
      ? 'Film: sober day counter → quick gym/walk proof → milestone card screenshot → founder line on screen.'
    : template === 'weekly'
      ? 'Film: scroll through the week’s receipts → gym clip → final Victory Card screenshot.'
      : template === 'transformation'
        ? 'Film: mirror check or meal prep → macro target → sober streak → Victory Card.'
        : 'Film: gym set or app proof screen → point to the saved receipt → end with the Victory Card.';
  const postIdea = `HOOK: ${hook}\n\nCAPTION: ${captions[template]}\n\nVIDEO IDEA: ${videoIdea}\n\nHASHTAGS: ${hashtags[template]}`;

  const copyText = async (text: string, success: string) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopyStatus(success);
    } catch {
      setCopyStatus('Copy blocked. Press and hold the text to copy.');
    }
  };

  const rotateTemplate = () => {
    const index = templates.findIndex((item) => item.id === template);
    chooseTemplate(templates[(index + 1) % templates.length].id);
  };

  return (
    <div className="page ih-page ih-real-share share-progress-page stack-lg content-studio-page">
      <BrandHeader step="SHARE" />

      <section className="ih-card ih-ai-card ih-real-share-hero" aria-label="Iron Habit TikTok Proof Pack">
        <HelmetCoach small />
        <div>
          <small>TIKTOK PROOF PACK</small>
          <h1>{heroTitles[template]}</h1>
          <p>Choose a proof angle, download a 9:16 Victory Card, then copy a hook, caption, hashtags, and video idea.</p>
        </div>
      </section>

      <div className="ih-stat-grid four ih-real-share-stat-grid" aria-label="Share proof snapshot">
        <StatCard label="Streak" value={`${streak}`} sub="days sober" tone="green" />
        <StatCard label="Week" value={`${weeklyMinutes}m`} sub="training" tone="red" />
        <StatCard label="Urge" value={`${latestCheckIn?.craving ?? 0}/10`} sub="latest" tone="amber" />
        <StatCard label="Template" value={template.toUpperCase().slice(0, 7)} sub="angle" tone="blue" />
      </div>

      <Card className="victory-proof-brief content-studio-hero stack-sm">
        <span className="tag danger-tag">Content Studio</span>
        <h2>{heroTitles[template]}</h2>
        <p>{activeProofLabel}</p>
        <div className="proof-angle-strip">
          <span>{streak} day streak</span>
          <span>{weeklyMinutes}m this week</span>
          <span>{latestCheckIn?.craving ?? 0}/10 latest urge</span>
        </div>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#victory-card-preview">Preview Card</a>
          <a className="btn btn-secondary" href="#post-idea">Post Idea</a>
          <a className="btn btn-ghost" href="#founder-launch-copy">Founder Launch Copy</a>
          {cravingProofReady && <Button variant="danger" onClick={() => chooseTemplate('craving')}>Make Craving Victory Card</Button>}
          {template === 'craving' && !cravingProofReady && (
            <>
              <Link className="btn btn-danger" to="/rescue">Save Craving Proof First</Link>
              <Link className="btn btn-secondary" to="/rescue">Open Rescue now</Link>
            </>
          )}
        </div>
      </Card>

      <Card id="founder-launch-copy" className="stack-sm founder-launch-card">
        <span className="tag danger-tag">Founder launch script</span>
        <h2>One year ago I got sober. Today I’m launching the app I wish I had on day one.</h2>
        <p>
          Use this when the app needs to make sense in the first 10 seconds: it is not a generic habit tracker — it is sober fitness proof for cravings, training, and visible comeback moments.
        </p>
        <div className="post-idea-box">
          <strong>Launch caption</strong>
          <span>One year ago I got sober. Today I’m launching Iron Habit — the sober fitness app I wish I had on day one. Check in, survive cravings, train, save proof, and turn the comeback into receipts. #IronHabit #SoberFitness #RecoveryTok</span>
        </div>
        <div className="proof-angle-strip">
          <span>0–3s: sober founder hook</span>
          <span>3–7s: craving → rescue → proof</span>
          <span>7–10s: Victory Card screenshot</span>
        </div>
        <div className="button-row">
          <Button variant="secondary" onClick={() => copyText('One year ago I got sober. Today I’m launching Iron Habit — the sober fitness app I wish I had on day one. Check in, survive cravings, train, save proof, and turn the comeback into receipts. #IronHabit #SoberFitness #RecoveryTok', 'Founder launch caption copied.')}>Copy founder caption</Button>
          <Button variant="ghost" onClick={() => chooseTemplate('milestone')}>Open milestone card</Button>
        </div>
      </Card>

      {isFirstVictoryShare && workoutProof && (
        <Card className="victory-proof-brief stack-sm first-victory-share-cue">
          <span className="tag danger-tag">First public proof card</span>
          <h2>Your first receipt is ready to post.</h2>
          <p>
            This is the first training proof in the vault: {workoutProof.title}, {workoutProof.durationMinutes} minutes,
            {` ${workoutProof.completedSets}/${workoutProof.totalSets}`} sets. Copy the hook, save the 9:16 card, then stack the next receipt.
          </p>
          <div className="proof-angle-strip">
            <span>1st victory receipt</span>
            <span>{workoutProof.activeDay}</span>
            <span>{workoutProof.durationMinutes}m locked</span>
          </div>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#post-idea">Copy caption next</a>
            <a className="btn btn-secondary" href="#victory-card-preview">Download card</a>
            <Link className="btn btn-ghost" to="/talk?command=post-first-card">Tell Talk it’s posted</Link>
          </div>
        </Card>
      )}

      <Card className="stack-sm">
        <span className="tag">Choose proof angle</span>
        <div className="template-grid proof-template-grid">
          {templates.map((item) => (
            <button
              key={item.id}
              className={`template-option ${template === item.id ? 'selected' : ''}`}
              onClick={() => chooseTemplate(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <div id="victory-card-preview">
        <ShareableProgressCard data={data} streak={streak} template={template} cravingReceipt={latestCravingReceipt} selectedProof={workoutProof} />
      </div>

      <Card id="post-idea" className="stack-sm tiktok-post-card">
        <span className="tag danger-tag">TikTok post generator</span>
        <h2>{hook}</h2>
        <p className="caption-box">{captions[template]}</p>
        <div className="post-idea-box">
          <strong>Video idea</strong>
          <span>{videoIdea}</span>
        </div>
        <div className="post-idea-box">
          <strong>Hashtags</strong>
          <span>{hashtags[template]}</span>
        </div>
        <div className="button-row">
          <Button variant="secondary" onClick={() => copyText(captions[template], 'Caption copied.')}>Copy caption</Button>
          <Button variant="secondary" onClick={() => copyText(postIdea, 'Full post idea copied.')}>Copy post idea</Button>
          <Button variant="ghost" onClick={() => setHookIndex((value) => value + 1)}>Rotate hook</Button>
          <Button variant="ghost" onClick={rotateTemplate}>Rotate template</Button>
        </div>
        {copyStatus && <p className="success-msg">{copyStatus}</p>}
      </Card>

      <Card className="stack-sm victory-next-card">
        <span className="tag">Next proof loop</span>
        <h2>Stack another receipt.</h2>
        <p>Post the proof, then go back to Train or Rescue. The identity loop is: stay sober, move, save proof, make the win visible.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/train">Open Train</Link>
          <Link className="btn btn-danger" to="/rescue">Open Rescue</Link>
        </div>
      </Card>
    </div>
  );
};

export default ShareProgressScreen;
