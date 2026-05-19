import { useEffect, useMemo, useState } from 'react';
import MilestoneBadge from '../components/MilestoneBadge';
import { Card, PageHeader, Stat } from '../components/UI';
import { loadData, type IronHabitData } from '../utils/storage';
import { calculateSobrietyStreak, getCompletionRate } from '../utils/streaks';
import { formatMoney, formatNumber, getTransformationMetrics } from '../utils/transformation';

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
  return date.toISOString().slice(0, 10);
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
  const activeDays = new Set(data.fitnessEntries.map((entry) => entry.date)).size;
  const soberRate = checkIns.length ? Math.round((soberCheckIns / checkIns.length) * 100) : 0;
  const firstCheckIn = checkIns
    .map((entry) => new Date(`${entry.date}T12:00:00`).getTime())
    .sort((a, b) => a - b)[0];
  const daysTracked = firstCheckIn ? Math.max(1, Math.ceil((todayTime - firstCheckIn) / dayMs) + 1) : 0;

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
      </Card>
    </div>
  );
};

export default ProgressDashboard;
