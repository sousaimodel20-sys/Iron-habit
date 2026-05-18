import { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Card } from '../components/UI';

const ShareableProgressCard = ({ streak, habitsCount, fitnessCount }: { streak: number; habitsCount: number; fitnessCount: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (cardRef.current === null) {
      return;
    }

    toPng(cardRef.current)
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = 'iron-habit-progress.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err: any) => {
        console.error('Failed to generate image', err);
      });
  };

  return (
    <Card ref={cardRef} className="p-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white text-center">
      <h2 className="text-xl font-bold mb-2">My Iron Habit Progress</h2>
      <p className="mb-1">Sobriety Streak: {streak} day{streak !== 1 ? 's' : ''}</p>
      <p className="mb-1">Habits Tracked: {habitsCount}</p>
      <p className="mb-4">Fitness Activities Logged: {fitnessCount}</p>
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-white text-blue-600 font-semibold rounded hover:bg-gray-200 transition"
      >
        Download Progress Card
      </button>
    </Card>
  );
};

export default ShareableProgressCard;
