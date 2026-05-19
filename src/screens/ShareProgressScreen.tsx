import { useEffect, useState } from 'react';
import { loadData, type IronHabitData } from '../utils/storage';
import ShareableProgressCard from '../components/ShareableProgressCard';
import { Button, Card, PageHeader } from '../components/UI';
import { calculateSobrietyStreak } from '../utils/streaks';

const ShareProgressScreen = () => {
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

  const caption = `Day ${streak}. Sober, training, and rebuilding brick by brick. #IronHabit #SoberFitness #Discipline`;

  const copyCaption = async () => {
    await navigator.clipboard?.writeText(caption);
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Share progress" title="Make the win TikTok-ready.">
        Export a clean vertical progress card and copy a simple caption for short-form content.
      </PageHeader>

      <ShareableProgressCard data={data} streak={streak} />

      <Card className="stack-sm">
        <h2>Caption starter</h2>
        <p className="caption-box">{caption}</p>
        <Button variant="secondary" onClick={copyCaption}>Copy caption</Button>
      </Card>
    </div>
  );
};

export default ShareProgressScreen;
