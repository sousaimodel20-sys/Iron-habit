import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from './UI';
import type { IronHabitData } from '../utils/storage';
import { formatMoney, formatNumber, getTransformationMetrics } from '../utils/transformation';
import { calculateMacroTargets } from '../utils/nutrition';
import { formatLocalDateKey } from '../utils/date';
import { getCravingReceiptByDate, getCravingReceipts } from '../utils/proofReceipts';
import type { CheckIn } from '../utils/storage';

export type VictoryTemplate = 'comeback' | 'discipline' | 'receipts' | 'craving' | 'transformation' | 'weekly';

type TemplateCopy = { kicker: string; headline: string; footer: string };

const templateCopy: Record<VictoryTemplate, TemplateCopy> = {
  comeback: {
    kicker: 'COMEBACK CARD',
    headline: 'stayed sober and showed up.',
    footer: '#SoberFitness',
  },
  discipline: {
    kicker: 'DISCIPLINE RECEIPT',
    headline: 'chose discipline over the old life.',
    footer: '#LockIn',
  },
  receipts: {
    kicker: 'PROOF CARD',
    headline: 'turned recovery into receipts.',
    footer: '#ProofBeatsPromises',
  },
  craving: {
    kicker: 'CRAVING DESTROYED',
    headline: 'felt the urge and did not fold.',
    footer: '#CravingDestroyed',
  },
  transformation: {
    kicker: 'TRANSFORMATION CARD',
    headline: 'is building the body and life.',
    footer: '#TransformationTok',
  },
  weekly: {
    kicker: 'WEEKLY BOSS BATTLE',
    headline: 'stacked another week of receipts.',
    footer: '#WeeklyReceipts',
  },
};

const getRecentDateKeys = (count: number) => Array.from({ length: count }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index - count + 1);
  return formatLocalDateKey(date);
});

const ShareableProgressCard = ({
  data,
  streak,
  template = 'comeback',
  cravingReceipt = null,
  selectedProof = null,
}: {
  data: IronHabitData;
  streak: number;
  template?: VictoryTemplate;
  cravingReceipt?: CheckIn | null;
  selectedProof?: IronHabitData['latestVictoryProof'];
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const totalMinutes = data.fitnessEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const latestCheckIn = Object.values(data.checkIns).sort((a, b) => b.date.localeCompare(a.date))[0];
  const latestCravingReceipt = cravingReceipt || getCravingReceipts(data.checkIns, 1)[0];
  const cravingReceiptDate = latestCravingReceipt ? getCravingReceiptByDate(data.checkIns, latestCravingReceipt.date) : null;
  const latestMood = latestCheckIn?.mood || 'Locked in';
  const cravingMood = cravingReceiptDate?.mood || latestCravingReceipt?.mood || latestMood;
  const latestCraving = latestCheckIn?.craving ?? 0;
  const receiptCraving = cravingReceiptDate?.craving ?? latestCravingReceipt?.craving ?? latestCraving;
  const metrics = getTransformationMetrics(data, streak);
  const copy = templateCopy[template];
  const firstName = data.profile.name || 'I';
  const workoutProof = selectedProof || data.latestVictoryProof;
  const macros = calculateMacroTargets(data.bodyProfile);
  const recentDays = getRecentDateKeys(7);
  const weeklyMinutes = data.fitnessEntries
    .filter((entry) => recentDays.includes(entry.date))
    .reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const weeklyCheckIns = recentDays.filter((date) => data.checkIns[date]).length;
  const weeklySoberDays = recentDays.filter((date) => data.checkIns[date]?.sober).length;
  const weeklyLoadouts = data.completedLoadouts.filter((proof) => recentDays.includes(proof.date)).length;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setStatus('Building Victory Card image…');

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `iron-habit-${template}-day-${streak}.png`;
      link.href = dataUrl;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      await new Promise((resolve) => window.setTimeout(resolve, 0));
      link.remove();
      setStatus('Victory card downloaded. If it did not open, take a screenshot of the card preview.');
    } catch (err) {
      console.error('Failed to generate image', err);
      try {
        await navigator.clipboard?.writeText(cardText);
        setStatus('Download blocked. Card text copied instead.');
      } catch {
        setStatus('Download blocked. Copy the card text below or screenshot the card preview.');
      }
    }
  };

  const headline = workoutProof && ['comeback', 'discipline', 'receipts'].includes(template)
    ? `${workoutProof.title} conquered.`
    : `${firstName} ${copy.headline}`;

  const cardText = template === 'craving'
    ? `${headline}\n${receiptCraving || 10}/10 urge faced • Day ${streak} sober • ${cravingMood}\nCraving hit. I did not bargain. Opened Rescue. Stayed in command.\n#IronHabit ${copy.footer}`
    : template === 'weekly'
      ? `${headline}\n${weeklySoberDays} sober check-ins • ${weeklyMinutes} training minutes • ${weeklyLoadouts} routine conquests\nWeekly Boss Battle receipts. Proof beats promises.\n#IronHabit ${copy.footer}`
      : template === 'transformation'
        ? `${headline}\nDay ${streak} sober • ${data.bodyProfile.weightLbs || '—'} lb now • ${macros?.proteinGrams || '—'}g protein\n${data.profile.transformationGoal || 'Lean, sober, strong, and consistent.'}\n#IronHabit ${copy.footer}`
        : workoutProof
          ? `${headline}\n${workoutProof.durationMinutes} minutes • ${workoutProof.completedSets}/${workoutProof.totalSets} sets • ${workoutProof.exercises.length} exercises\n${workoutProof.proofCopy}\n#IronHabitProof ${copy.footer}`
          : `${headline}\nDay ${streak} sober • ${data.fitnessEntries.length} workouts • ${totalMinutes} minutes logged\n${data.profile.why || 'Build a body and life I am proud of.'}\n${copy.footer}`;

  const copyCardText = async () => {
    try {
      await navigator.clipboard?.writeText(cardText);
      setStatus('Victory Card text copied.');
    } catch {
      setStatus('Copy blocked. Open the card text fallback below and press-and-hold to copy it.');
    }
  };

  return (
    <section className="share-wrap">
      <div ref={cardRef} className={`share-card template-${template}`}>
        <div className="share-glow" />
        <p className="share-kicker">{workoutProof && ['comeback', 'discipline', 'receipts'].includes(template) ? 'WORKOUT VICTORY CARD' : copy.kicker}</p>
        <h2>{headline}</h2>
        {template === 'craving' ? (
          <>
            <div className="share-day workout-proof-day">
              <strong>{receiptCraving || '10'}</strong>
              <span>urge faced / 10</span>
            </div>
            <div className="share-metrics">
              <span><b>{streak}</b> sober days</span>
              <span><b>{cravingMood}</b> mood</span>
              <span><b>10</b> min rule</span>
            </div>
            <div className="share-proof-strip">
              <span>Craving hit. I did not bargain.</span>
              <span>Opened Rescue. Stayed in command.</span>
            </div>
            <p className="share-why">The urge passed. The proof stayed.</p>
          </>
        ) : template === 'transformation' ? (
          <>
            <div className="share-day workout-proof-day">
              <strong>{data.bodyProfile.weightLbs || streak}</strong>
              <span>{data.bodyProfile.weightLbs ? `lb now → ${data.bodyProfile.goalWeightLbs || 'goal'}` : 'days sober'}</span>
            </div>
            <div className="share-metrics">
              <span><b>{streak}</b> sober</span>
              <span><b>{data.bodyProfile.trainingDaysPerWeek || 4}</b> train/wk</span>
              <span><b>{macros?.proteinGrams || '—'}</b> protein</span>
            </div>
            <div className="share-proof-strip">
              <span>{formatMoney(metrics.moneySaved)} saved</span>
              <span>{formatNumber(metrics.drinksSkipped)} drinks skipped</span>
            </div>
            <p className="share-why">{data.profile.transformationGoal || 'Lean, sober, strong, and consistent.'}</p>
          </>
        ) : template === 'weekly' ? (
          <>
            <div className="share-day workout-proof-day">
              <strong>{weeklySoberDays}</strong>
              <span>sober check-ins this week</span>
            </div>
            <div className="share-metrics">
              <span><b>{weeklyMinutes}</b> min</span>
              <span><b>{weeklyCheckIns}</b> check-ins</span>
              <span><b>{weeklyLoadouts}</b> conquests</span>
            </div>
            <div className="share-proof-strip">
              <span>Weekly Boss Battle receipts</span>
              <span>Proof beats promises.</span>
            </div>
            <p className="share-why">One week. One receipt wall. Still building.</p>
          </>
        ) : workoutProof ? (
          <>
            <div className="share-day workout-proof-day">
              <strong>{workoutProof.completedSets}</strong>
              <span>sets completed</span>
            </div>
            <div className="share-metrics">
              <span><b>{workoutProof.durationMinutes}</b> minutes</span>
              <span><b>{workoutProof.exercises.length}</b> exercises</span>
              <span><b>{workoutProof.date}</b> date</span>
            </div>
            <div className="share-proof-strip">
              <span>{workoutProof.activeDay} • {workoutProof.label}</span>
              <span>{workoutProof.proofCopy}</span>
            </div>
            <p className="share-why">Another vote against the old life. Proof beats promises.</p>
          </>
        ) : (
          <>
            <div className="share-day">
              <strong>{streak}</strong>
              <span>day sober streak</span>
            </div>
            <div className="share-metrics">
              <span><b>{data.habits.length}</b> habits</span>
              <span><b>{data.fitnessEntries.length}</b> workouts</span>
              <span><b>{totalMinutes}</b> min</span>
            </div>
            <div className="share-proof-strip">
              <span>{formatMoney(metrics.moneySaved)} saved</span>
              <span>{formatNumber(metrics.drinksSkipped)} drinks skipped</span>
            </div>
            <p className="share-why">{data.profile.why || 'Build a body and life I am proud of.'}</p>
          </>
        )}
        <footer>
          <span>{template === 'craving' ? `#${cravingMood.replaceAll(' ', '')}` : workoutProof ? '#IronHabitProof' : `#${latestMood.replaceAll(' ', '')}`}</span>
          <span>{copy.footer}</span>
        </footer>
      </div>
      <div className="button-row share-card-actions">
        <Button onClick={handleDownload}>Download {template} card</Button>
        <Button variant="secondary" onClick={copyCardText}>Copy card text</Button>
      </div>
      <details className="share-card-text-fallback">
        <summary>Card text fallback</summary>
        <pre>{cardText}</pre>
      </details>
      {status && <p className="success-msg">{status}</p>}
    </section>
  );
};

export default ShareableProgressCard;
