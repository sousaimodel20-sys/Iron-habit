import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MilestoneBadge from '../components/MilestoneBadge';
import { Card, PageHeader, Stat } from '../components/UI';
import { formatLocalDateKey } from '../utils/date';
import { loadData, saveData, type CompletedLoadout, type IronHabitData } from '../utils/storage';
import { calculateSobrietyStreak, getCompletionRate } from '../utils/streaks';
import { formatMoney, formatNumber, getTransformationMetrics } from '../utils/transformation';
import { calculateMacroTargets, formatHeight } from '../utils/nutrition';
import { getCravingReceipts, getLatestProof, getProofStack } from '../utils/proofReceipts';

const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
const milestonePlan = [
  { days: 3, title: 'First wall broken', reward: 'Cravings lost the first round.' },
  { days: 7, title: 'One clean week', reward: 'Sleep, skin, and discipline start changing.' },
  { days: 14, title: 'Two-week lock', reward: 'Momentum becomes identity.' },
  { days: 30, title: '30-day proof', reward: 'You are not trying — you are becoming.' },
  { days: 60, title: 'New baseline', reward: 'Old routines lose their grip.' },
  { days: 90, title: 'Transformation block', reward: 'Body, mind, and schedule look different.' },
  { days: 180, title: 'Half-year iron', reward: 'The comeback is visible.' },
  { days: 365, title: 'One-year legacy', reward: 'A full sober year of proof.' },
];
const dayMs = 24 * 60 * 60 * 1000;

const getDateKey = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return formatLocalDateKey(date);
};

const getDayLabel = (dateKey: string) =>
  new Date(`${dateKey}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3);

const getRecentDays = (count: number) => Array.from({ length: count }, (_, index) => getDateKey(index - count + 1));

const ProgressDashboard = () => {
  const [data, setData] = useState<IronHabitData>(loadData());
  const [streak, setStreak] = useState(calculateSobrietyStreak());
  const [todayTime, setTodayTime] = useState(() => new Date(`${getDateKey(0)}T12:00:00`).getTime());

  useEffect(() => {
    const refresh = () => {
      setData(loadData());
      setStreak(calculateSobrietyStreak());
      setTodayTime(new Date(`${getDateKey(0)}T12:00:00`).getTime());
    };
    refresh();
    window.addEventListener('iron-habit-data-updated', refresh);
    return () => window.removeEventListener('iron-habit-data-updated', refresh);
  }, []);

  const totalMinutes = useMemo(
    () => data.fitnessEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0),
    [data.fitnessEntries],
  );
  const checkIns = Object.values(data.checkIns);
  const soberCheckIns = checkIns.filter((entry) => entry.sober).length;
  const completionRate = getCompletionRate();
  const nextMilestone = milestones.find((days) => days > streak) || 365;
  const nextMilestonePlan = milestonePlan.find((item) => item.days > streak) || milestonePlan.at(-1)!;
  const previousMilestone = [...milestones].reverse().find((days) => days <= streak) || 0;
  const milestoneSpan = Math.max(1, nextMilestonePlan.days - previousMilestone);
  const milestoneProgress = Math.min(100, Math.round(((streak - previousMilestone) / milestoneSpan) * 100));
  const metrics = getTransformationMetrics(data, streak);
  const macroTargets = calculateMacroTargets(data.bodyProfile);
  const todayCheckIn = data.checkIns[getDateKey(0)] || null;
  const supportLocation = data.profile.supportLocation || 'Vancouver, BC';

  const weeklyTraining = useMemo(() => {
    const days = getRecentDays(7);
    return days.map((date) => ({
      date,
      label: getDayLabel(date),
      minutes: data.fitnessEntries
        .filter((entry) => entry.date === date)
        .reduce((sum, entry) => sum + entry.durationMinutes, 0),
    }));
  }, [data.fitnessEntries]);
  const maxTraining = Math.max(30, ...weeklyTraining.map((day) => day.minutes));

  const disciplineHeatmap = useMemo(() => {
    const days = getRecentDays(14);
    return days.map((date) => {
      const checkIn = data.checkIns[date];
      const level = Math.min(4, checkIn?.habitsCompleted.length || 0);
      return { date, level, sober: checkIn?.sober ?? false };
    });
  }, [data.checkIns]);

  const cravingTrend = useMemo(() => {
    const days = getRecentDays(7);
    return days.map((date) => {
      const craving = data.checkIns[date]?.craving ?? 0;
      return { date, label: getDayLabel(date), craving };
    });
  }, [data.checkIns]);

  const weeklyAverageCraving = Math.round(
    cravingTrend.reduce((sum, day) => sum + day.craving, 0) / Math.max(1, cravingTrend.filter((day) => day.craving > 0).length),
  );
  const weeklyMinutes = weeklyTraining.reduce((sum, day) => sum + day.minutes, 0);
  const weeklyWorkoutDays = weeklyTraining.filter((day) => day.minutes > 0).length;
  const weeklyCheckIns = getRecentDays(7).filter((date) => data.checkIns[date]).length;
  const weeklySoberDays = getRecentDays(7).filter((date) => data.checkIns[date]?.sober).length;
  const weeklyHabitBlocks = getRecentDays(7).reduce((sum, date) => sum + (data.checkIns[date]?.habitsCompleted.length || 0), 0);
  const weeklyLoadouts = data.completedLoadouts.filter((proof) => getRecentDays(7).includes(proof.date)).length;
  const cravingReceipts = getCravingReceipts(data.checkIns, 3);
  const latestCravingReceipt = cravingReceipts[0] || null;
  const latestProof = getLatestProof(data.latestVictoryProof, data.completedLoadouts);
  const proofStack = getProofStack(data.completedLoadouts, 5);
  const activeDays = new Set(data.fitnessEntries.map((entry) => entry.date)).size;
  const soberRate = checkIns.length ? Math.round((soberCheckIns / checkIns.length) * 100) : 0;
  const firstCheckIn = checkIns
    .map((entry) => new Date(`${entry.date}T12:00:00`).getTime())
    .sort((a, b) => a - b)[0];
  const daysTracked = firstCheckIn ? Math.max(1, Math.ceil((todayTime - firstCheckIn) / dayMs) + 1) : 0;

  const selectProofForCard = (proof: CompletedLoadout) => {
    const next = saveData({ latestVictoryProof: proof });
    setData(next);
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Proof" title="Proof beats promises.">
        See the scoreboard for sobriety, training, and daily follow-through.
      </PageHeader>

      <div className="scoreboard card">
        <p>{data.profile.name ? `${data.profile.name}'s streak` : 'Current streak'}</p>
        <strong>{streak}</strong>
        <span>days of Iron Habit</span>
        <small>{Math.max(0, nextMilestone - streak)} days until the next badge</small>
      </div>

      <Card className="next-milestone-card stack-sm">
        <span className="tag">Next Target</span>
        <div className="next-target-head">
          <div>
            <h2>{nextMilestonePlan.days} days — {nextMilestonePlan.title}</h2>
            <p>{nextMilestonePlan.reward}</p>
          </div>
          <strong>{milestoneProgress}%</strong>
        </div>
        <div className="target-progress" aria-label="Progress to next milestone">
          <i style={{ width: `${milestoneProgress}%` }} />
        </div>
        <small>{Math.max(0, nextMilestonePlan.days - streak)} sober days left. Stack today, not forever.</small>
      </Card>

      <Card className="proof-vault-card stack-sm">
        <span className="tag">Proof Vault</span>
        <h2>{latestProof ? `${latestProof.title} locked in.` : 'No workout receipt selected yet.'}</h2>
        <p>{latestProof ? latestProof.proofCopy : 'Finish a session, then choose a receipt to turn into a Victory Card.'}</p>
        {latestProof && (
          <div className="proof-grid mini-proof">
            <div><strong>{latestProof.date}</strong><span>date saved</span></div>
            <div><strong>{latestProof.activeDay}</strong><span>split</span></div>
            <div><strong>{latestProof.completedSets}/{latestProof.totalSets}</strong><span>sets</span></div>
            <div><strong>{latestProof.durationMinutes}m</strong><span>proof time</span></div>
          </div>
        )}
        <div className="hero-actions">
          {latestProof ? (
            <Link to={`/share-progress?template=receipts&proof=${latestProof.id}`} className="btn btn-primary">Build Victory Card</Link>
          ) : (
            <Link to="/talk" className="btn btn-primary">Generate Loadout</Link>
          )}
          <Link to="/train" className="btn btn-secondary">Stack More Proof</Link>
        </div>
      </Card>

      {todayCheckIn && (
        <Card className="stack-sm">
          <span className="tag">Today’s Check-In</span>
          <h2>Current sober receipt.</h2>
          <p>
            {todayCheckIn.sober ? 'Sober today and still in command.' : 'Slip noted. Use the proof loop to recover clean.'}
            {' '}
            {todayCheckIn.craving}/10 craving • {todayCheckIn.mood || 'Focused'} mood • {todayCheckIn.habitsCompleted.length} habits stacked.
          </p>
          <div className="proof-grid mini-proof">
            <div><strong>{todayCheckIn.sober ? 'Yes' : 'No'}</strong><span>sober today</span></div>
            <div><strong>{todayCheckIn.craving}/10</strong><span>craving</span></div>
            <div><strong>{todayCheckIn.habitsCompleted.length}</strong><span>habits</span></div>
            <div><strong>{todayCheckIn.note ? '✓' : '—'}</strong><span>note saved</span></div>
          </div>
          <div className="hero-actions">
            <Link to="/daily-check-in" className="btn btn-primary">Open Check-In</Link>
            <Link to="/rescue" className="btn btn-secondary">Open Rescue</Link>
            <Link to={`/meetings?q=${encodeURIComponent(supportLocation)}`} className="btn btn-ghost">Find meetings near {supportLocation}</Link>
          </div>
        </Card>
      )}

      <Card className="stack-sm">
        <span className="tag">Milestone Timeline</span>
        <h2>The comeback map.</h2>
        <div className="milestone-timeline">
          {milestonePlan.map((item) => {
            const achieved = streak >= item.days;
            const current = !achieved && item.days === nextMilestonePlan.days;
            return (
              <div key={item.days} className={`timeline-step ${achieved ? 'achieved' : ''} ${current ? 'current' : ''}`}>
                <span>{achieved ? '✓' : item.days}</span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.reward}</small>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="weekly-proof-card stack-md">
        <div className="section-title-row">
          <span>Weekly Proof</span>
          <b>{weeklyWorkoutDays}/7 training days</b>
        </div>
        <h2>This week’s receipts.</h2>
        <div className="proof-grid mini-proof">
          <div><strong>{weeklySoberDays}</strong><span>sober days checked</span></div>
          <div><strong>{weeklyCheckIns}</strong><span>check-ins logged</span></div>
          <div><strong>{weeklyMinutes}m</strong><span>training minutes</span></div>
          <div><strong>{weeklyHabitBlocks}</strong><span>habit blocks stacked</span></div>
        </div>
        <p>{weeklyLoadouts > 0 ? `${weeklyLoadouts} routine conquest${weeklyLoadouts === 1 ? '' : 's'} logged this week. Proof is stacking.` : 'No routine conquest logged this week yet. Finish one session and make the receipt visible.'}</p>
      </Card>

      <Card className="content-studio-card stack-sm">
        <span className="tag danger-tag">Content Studio</span>
        <h2>Create today’s post.</h2>
        <p>Turn this proof into a TikTok-ready hook, caption, hashtags, video idea, and 9:16 Victory Card.</p>
        <div className="proof-angle-strip" aria-label="TikTok Proof Pack shortcuts">
          <Link to="/share-progress?template=comeback">Comeback</Link>
          <Link to="/share-progress?template=discipline">Workout proof</Link>
          <Link to="/share-progress?template=receipts">Receipts</Link>
          <Link to="/share-progress?template=craving">Craving survival</Link>
          <Link to="/share-progress?template=weekly">Weekly boss</Link>
          <Link to="/share-progress?template=transformation">Transformation</Link>
        </div>
        <div className="hero-actions">
          <Link to="/share-progress" className="btn btn-primary">Open TikTok Proof Pack</Link>
          <Link to="/talk" className="btn btn-secondary">Log More in Talk</Link>
        </div>
      </Card>

      {latestCravingReceipt && (
        <Card className="proof-stack-card stack-md">
          <div className="section-title-row">
            <span>Craving Rescue Receipt</span>
            <b>{latestCravingReceipt.date}</b>
          </div>
          <h2>Urge survived. Streak protected.</h2>
          <p>{latestCravingReceipt.craving}/10 craving faced • mood: {latestCravingReceipt.mood || 'Still in command'}.</p>
          <p>{latestCravingReceipt.note || 'Rescue protocol opened. The urge did not get the final vote.'}</p>
          <div className="hero-actions">
            <Link to={`/share-progress?template=craving&receipt=${latestCravingReceipt.date}`} className="btn btn-danger">Make Craving Card</Link>
            <Link to="/rescue" className="btn btn-secondary">Open Rescue</Link>
          </div>
          {cravingReceipts.length > 1 && (
            <div className="completed-loadout-list compact-receipt-list">
              {cravingReceipts.slice(1).map((receipt) => (
                <article key={receipt.date}>
                  <div>
                    <span>{receipt.date} • {receipt.craving}/10 urge</span>
                    <h3>{receipt.mood || 'Craving defeated'}</h3>
                    <p>{receipt.note || 'Proof stacked from a sober check-in.'}</p>
                  </div>
                  <Link to={`/share-progress?template=craving&receipt=${receipt.date}`} className="btn btn-ghost">Make Card</Link>
                </article>
              ))}
            </div>
          )}
        </Card>
      )}

      {latestProof ? (
        <Card className="proof-stack-card stack-md">
          <div className="section-title-row">
            <span>Latest Proof</span>
            <b>{latestProof.date}</b>
          </div>
          <h2>{latestProof.title}</h2>
          <p>{latestProof.activeDay} • {latestProof.durationMinutes} min • {latestProof.completedSets}/{latestProof.totalSets} sets • {latestProof.exercises.length} exercises conquered.</p>
          <div className="victory-exercise-list">
            {latestProof.exercises.slice(0, 5).map((exercise) => <span key={exercise}>{exercise}</span>)}
          </div>
          <div className="hero-actions">
            <Link to={`/share-progress?template=receipts&proof=${latestProof.id}`} className="btn btn-primary">Build Victory Card</Link>
            <Link to="/train" className="btn btn-secondary">See Train Log</Link>
          </div>
        </Card>
      ) : (
        <Card className="proof-stack-card stack-md">
          <span className="tag">Latest Proof</span>
          <h2>No workout receipt yet.</h2>
          <p>Generate a Coach Loadout, finish the Routine Sheet, then come back here for a Victory Card.</p>
          <div className="hero-actions">
            <Link to="/talk" className="btn btn-primary">Generate Loadout</Link>
            <Link to="/train" className="btn btn-secondary">Open Train</Link>
          </div>
        </Card>
      )}

      {proofStack.length > 0 && (
        <Card className="proof-stack-card stack-md">
          <div className="section-title-row">
            <span>Proof Stack History</span>
            <b>{data.completedLoadouts.length} receipts</b>
          </div>
          <p>Pick any conquered routine and turn that exact receipt into a Victory Card.</p>
          <div className="completed-loadout-list">
            {proofStack.map((proof) => (
              <article key={proof.id}>
                <div>
                  <span>{proof.date} • {proof.activeDay} • {proof.label}</span>
                  <h3>{proof.title}</h3>
                  <p>{proof.durationMinutes} min • {proof.completedSets}/{proof.totalSets} sets • {proof.exercises.length} moves</p>
                </div>
                <Link
                  to={`/share-progress?template=receipts&proof=${proof.id}`}
                  className="btn btn-ghost"
                  onClick={() => selectProofForCard(proof)}
                >
                  Make Card
                </Link>
              </article>
            ))}
          </div>
        </Card>
      )}

      <div className="stats-grid">
        <Stat label="sober check-ins" value={soberCheckIns} tone="gold" />
        <Stat label="active habits" value={data.habits.length} />
        <Stat label="training min" value={totalMinutes} />
        <Stat label="completion" value={`${completionRate}%`} />
      </div>

      <Card className="transformation-card stack-sm">
        <span className="tag">Transformation Scoreboard</span>
        <h2>What the old life did not get.</h2>
        <div className="proof-grid">
          <div><strong>{formatMoney(metrics.moneySaved)}</strong><span>estimated money saved</span></div>
          <div><strong>{formatNumber(metrics.caloriesAvoided)}</strong><span>alcohol calories avoided</span></div>
          <div><strong>{formatNumber(metrics.drinksSkipped)}</strong><span>drinks skipped</span></div>
          <div><strong>{metrics.trainingHours}h</strong><span>training time banked</span></div>
        </div>
        <p className="quote">“{data.profile.transformationGoal || 'Lean, sober, strong, and consistent.'}”</p>
      </Card>

      <Card className="body-target-card stack-sm">
        <div className="section-title-row">
          <span>Body Targets</span>
          <b>{macroTargets ? `${data.bodyProfile.trainingDaysPerWeek || '4'} training days/week` : 'Baseline needed'}</b>
        </div>
        <h2>{macroTargets ? `Macros for ${macroTargets.goalLabel}.` : 'Tell Talk your body stats.'}</h2>
        {macroTargets ? (
          <>
            <div className="proof-grid mini-proof macro-grid">
              <div><strong>{macroTargets.targetCalories}</strong><span>daily calories</span></div>
              <div><strong>{macroTargets.proteinGrams}g</strong><span>protein</span></div>
              <div><strong>{macroTargets.carbGrams}g</strong><span>carbs</span></div>
              <div><strong>{macroTargets.fatGrams}g</strong><span>fat</span></div>
            </div>
            <p>{data.bodyProfile.weightLbs} lb → {data.bodyProfile.goalWeightLbs || 'goal TBD'} lb • {formatHeight(data.bodyProfile.heightInches)} • maintenance ~{macroTargets.maintenanceCalories} cal.</p>
            <div className="hero-actions">
              <Link to="/talk" className="btn btn-secondary">Update in Talk</Link>
              <Link to="/setup-profile" className="btn btn-ghost">Edit baseline</Link>
            </div>
          </>
        ) : (
          <>
            <p>Use Talk: “I’m 200 lb, 5'10, 30, male, cut fat, train 5 days.” Iron Habit will calculate calories, protein, carbs, and fat.</p>
            <div className="hero-actions">
              <Link to="/talk" className="btn btn-primary">Tell Talk Stats</Link>
              <Link to="/setup-profile" className="btn btn-secondary">Open Setup</Link>
            </div>
          </>
        )}
      </Card>

      <Card className="stack-sm">
        <span className="tag">Training Pulse</span>
        <h2>Last 7 days under the bar.</h2>
        <div className="bar-chart" aria-label="Weekly training minutes">
          {weeklyTraining.map((day) => (
            <div className="bar-day" key={day.date}>
              <span>{day.minutes}m</span>
              <i style={{ height: `${Math.max(8, (day.minutes / maxTraining) * 100)}%` }} />
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card className="stack-sm">
        <span className="tag">Discipline Heatmap</span>
        <h2>Fourteen-day consistency proof.</h2>
        <div className="heatmap" aria-label="Recent habit completion heatmap">
          {disciplineHeatmap.map((day) => (
            <span
              key={day.date}
              className={`heat-cell level-${day.level} ${day.sober ? 'sober' : ''}`}
              title={`${day.date}: ${day.level} habit blocks`}
            />
          ))}
        </div>
        <div className="proof-grid mini-proof">
          <div><strong>{activeDays}</strong><span>training days logged</span></div>
          <div><strong>{soberRate}%</strong><span>sober check-in rate</span></div>
          <div><strong>{daysTracked}</strong><span>days tracked</span></div>
          <div><strong>{weeklyAverageCraving}/10</strong><span>avg craving this week</span></div>
        </div>
      </Card>

      <Card className="stack-sm">
        <span className="tag danger-tag">Craving Trend</span>
        <h2>Lower the urge. Raise the proof.</h2>
        <div className="craving-track" aria-label="Weekly craving trend">
          {cravingTrend.map((day) => (
            <div className="craving-dot-wrap" key={day.date}>
              <span className="craving-dot" style={{ bottom: `${day.craving * 9}%` }}>{day.craving}</span>
              <small>{day.label}</small>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2>Milestones</h2>
        <div className="milestone-grid">
          {milestones.map((days) => (
            <MilestoneBadge key={days} title={`${days} days`} achieved={streak >= days} />
          ))}
        </div>
      </Card>

      <Card className="stack-sm">
        <h2>Your why</h2>
        <p className="quote">“{data.profile.why || 'Build a body and life I am proud of.'}”</p>
        <div className="hero-actions">
          {latestProof ? (
            <Link to={`/share-progress?template=receipts&proof=${latestProof.id}`} className="btn btn-primary">Create Victory Card</Link>
          ) : (
            <Link to="/talk" className="btn btn-primary">Generate Loadout</Link>
          )}
          <Link to="/train" className="btn btn-secondary">Stack More Proof</Link>
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
