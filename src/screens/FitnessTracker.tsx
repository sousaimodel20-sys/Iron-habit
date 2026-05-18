import { useState, useEffect } from 'react';
import { saveData, loadData } from '../utils/storage';
import { Button, Card } from '../components/UI';

interface FitnessEntry {
  id: string;
  date: string;
  type: string;
  durationMinutes: number;
}

const activityTypes = ['Walking', 'Running', 'Cycling', 'Gym', 'Yoga'];

const FitnessTracker = () => {
  const [fitnessEntries, setFitnessEntries] = useState<FitnessEntry[]>([]);
  const [selectedType, setSelectedType] = useState(activityTypes[0]);
  const [duration, setDuration] = useState<number>(30);

  useEffect(() => {
    const data = loadData();
    if (data.fitnessEntries) {
      setFitnessEntries(data.fitnessEntries);
    }
  }, []);

  const addEntry = () => {
    const entry: FitnessEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      type: selectedType,
      durationMinutes: duration,
    };

    const updatedEntries = [...fitnessEntries, entry];
    setFitnessEntries(updatedEntries);
    saveData({ fitnessEntries: updatedEntries });
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = fitnessEntries.filter((e) => e.id !== id);
    setFitnessEntries(updatedEntries);
    saveData({ fitnessEntries: updatedEntries });
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Fitness Tracker</h1>
      <Card>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Activity Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            {activityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
        </div>
        <Button onClick={addEntry}>Add Entry</Button>
      </Card>
      <ul className="mt-6">
        {fitnessEntries.map((entry) => (
          <li
            key={entry.id}
            className="mb-2 flex justify-between items-center p-2 border rounded"
          >
            <div>
              {entry.date}: {entry.type} for {entry.durationMinutes} min
            </div>
            <Button onClick={() => deleteEntry(entry.id)}>Delete</Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FitnessTracker;
