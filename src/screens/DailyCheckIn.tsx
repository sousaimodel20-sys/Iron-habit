// Daily Check-In component
import { useState, useEffect } from 'react';
import { saveData, loadData } from '../utils/storage';
import { Button, Card } from '../components/UI';
import { calculateSobrietyStreak } from '../utils/streaks';

interface CheckInData {
  date: string;
  sober: boolean;
  habitsCompleted: string[];
}

const allHabits = ['No alcohol', 'Exercise', 'Read', 'Meditate'];

const DailyCheckIn = () => {
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [sober, setSober] = useState<boolean>(true);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    const data = loadData();
    const today = new Date().toISOString().slice(0, 10);
    if (data.checkIns && data.checkIns[today]) {
      setCheckInData(data.checkIns[today]);
      setSelectedHabits(data.checkIns[today].habitsCompleted || []);
      setSober(data.checkIns[today].sober);
    }
    const currentStreak = calculateSobrietyStreak();
    setStreak(currentStreak);
  }, []);

  const today = new Date().toISOString().slice(0, 10);

  const toggleHabit = (habit: string) => {
    setSelectedHabits((prev) =>
      prev.includes(habit) ? prev.filter((h) => h !== habit) : [...prev, habit]
    );
  };

  const handleSave = () => {
    const data = loadData();
    if (!data.checkIns) data.checkIns = {};
    data.checkIns[today] = { date: today, sober, habitsCompleted: selectedHabits };
    saveData(data);
    setCheckInData(data.checkIns[today]);
    alert('Daily check-in saved!');
    const currentStreak = calculateSobrietyStreak();
    setStreak(currentStreak);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Daily Check-In</h1>
      <p className="font-semibold mb-2">Current Sobriety Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
      <Card>
        <div className="mb-4">
          <label className="font-semibold">Sober Today?</label>
          <div>
            <label className="mr-4">
              <input
                type="radio"
                name="sober"
                checked={sober === true}
                onChange={() => setSober(true)}
              />{' '}
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="sober"
                checked={sober === false}
                onChange={() => setSober(false)}
              />{' '}
              No
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="font-semibold">Habits Completed</label>
          <div className="flex flex-wrap">
            {allHabits.map((habit) => (
              <label
                key={habit}
                className={`mr-4 mb-2 px-3 py-1 rounded border cursor-pointer ${
                  selectedHabits.includes(habit) ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedHabits.includes(habit)}
                  onChange={() => toggleHabit(habit)}
                />
                {habit}
              </label>
            ))}
          </div>
        </div>
        <Button onClick={handleSave}>Save Check-In</Button>
      </Card>
      {checkInData && (
        <div className="mt-6 p-4 bg-green-100 rounded">
          <p>
            Check-in for <strong>{checkInData.date}</strong> saved.
          </p>
          <p>Sober Today: {checkInData.sober ? 'Yes' : 'No'}</p>
          <p>Habits completed: {checkInData.habitsCompleted.join(', ') || 'None'}</p>
        </div>
      )}
    </div>
  );
};

export default DailyCheckIn;
