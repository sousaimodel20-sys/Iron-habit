import { useEffect, useMemo, useState } from 'react';
import MilestoneBadge from '../components/MilestoneBadge';
import { Card, PageHeader, Stat } from '../components/UI';
import { loadData, type IronHabitData } from '../utils/storage';
import { calculateSobrietyStreak, getCompletionRate } from '../utils/streaks';
import { formatMoney, formatNumber, getTransformationMetrics } from '../utils/transformation';

const milestones = [3, 7, 14, 30, 60, 90, 180, 365];

const ProgressDashboard = () => {
  const [data, setData] = useState<IronHabitData>(loadData());
  const [streak, setStreak] = useState(calculateSobrietyStreak());

  useEffect(() => {
    const refresh = () => {
      setData(loadData());
      setStreak(calculateSobrietyStreak());
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
  const metrics = getTransformationMetrics(data, streak);

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
      </Card>
    </div>
  );
};

export default ProgressDashboard;
