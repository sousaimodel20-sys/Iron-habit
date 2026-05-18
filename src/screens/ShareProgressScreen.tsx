import { useState, useEffect } from 'react';
import { loadData } from '../utils/storage';
import ShareableProgressCard from '../components/ShareableProgressCard';
import { calculateSobrietyStreak } from '../utils/streaks';

const ShareProgressScreen = () => {
  const [streak, setStreak] = useState(0);
  const [habitsCount, setHabitsCount] = useState(0);
  const [fitnessCount, setFitnessCount] = useState(0);

  useEffect(() => {
    const data = loadData();
    setHabitsCount((data.habits || []).length);
    setFitnessCount((data.fitnessEntries || []).length);
    setStreak(calculateSobrietyStreak());
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Share Your Progress</h1>
      <ShareableProgressCard streak={streak} habitsCount={habitsCount} fitnessCount={fitnessCount} />
    </div>
  );
};

export default ShareProgressScreen;
