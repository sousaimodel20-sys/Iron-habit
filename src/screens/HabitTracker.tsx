import { useState, useEffect } from 'react';
import { saveData, loadData } from '../utils/storage';
import { Button, Card } from '../components/UI';

interface Habit {
  id: string;
  title: string;
}

const HabitTracker = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  useEffect(() => {
    const data = loadData();
    if (data.habits) {
      setHabits(data.habits);
    }
  }, []);

  const addHabit = () => {
    if (!newHabitTitle.trim()) return;
    const habit: Habit = { id: Date.now().toString(), title: newHabitTitle.trim() };
    const updatedHabits = [...habits, habit];
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
    setNewHabitTitle('');
  };

  const deleteHabit = (id: string) => {
    const updatedHabits = habits.filter((h) => h.id !== id);
    setHabits(updatedHabits);
    saveData({ habits: updatedHabits });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Habit Tracker</h1>
      <Card>
        <div className="mb-4 flex">
          <input
            type="text"
            placeholder="New habit title"
            value={newHabitTitle}
            onChange={(e) => setNewHabitTitle(e.target.value)}
            className="flex-grow px-3 py-2 border rounded mr-2"
          />
          <Button onClick={addHabit}>Add</Button>
        </div>
        <ul>
          {habits.map((habit) => (
            <li key={habit.id} className="mb-2 flex justify-between items-center">
              <span>{habit.title}</span>
              <Button onClick={() => deleteHabit(habit.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default HabitTracker;
