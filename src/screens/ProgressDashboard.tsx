import { useState, useEffect } from 'react';
import { loadData } from '../utils/storage';
import MilestoneBadge from '../components/MilestoneBadge';
import { calculateSobrietyStreak } from '../utils/streaks';
import { Card } from '../components/UI';

const milestones = [
  { title: '3 Days', days: 3 },
  { title: '7 Days', days: 7 },
  { title: '30 Days', days: 30 },
  { title: '90 Days', days: 90 },
];

const ProgressDashboard = () => {
  const [streak, setStreak] = useState(0);
  const [habits, setHabits] = useState([]);
  const [fitnessEntries, setFitnessEntries] = useState([]);

  useEffect(() => {
    const data = loadData();
    setHabits(data.habits || []);
    setFitnessEntries(data.fitnessEntries || []);
    setStreak(calculateSobrietyStreak());
  }, []);

  // Calculate habit completion count
  const habitCompletionCount = habits.length;
  const fitnessActivityCount = fitnessEntries.length;

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Progress Dashboard</h1>
      <Card>
        <p className="mb-2 font-semibold">Sobriety Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
        <p className="mb-2">Total Habits Tracked: {habitCompletionCount}</p>
        <p className="mb-2">Total Fitness Activities Logged: {fitnessActivityCount}</p>
        <div className="flex flex-wrap justify-center">
          {milestones.map(({ title, days }) => (
            <MilestoneBadge key={days} title={title} achieved={streak >= days} />
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressDashboard;
