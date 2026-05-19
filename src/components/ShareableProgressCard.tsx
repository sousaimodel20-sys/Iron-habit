import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from './UI';
import type { IronHabitData } from '../utils/storage';
import { formatMoney, formatNumber, getTransformationMetrics } from '../utils/transformation';

const ShareableProgressCard = ({ data, streak }: { data: IronHabitData; streak: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState('');
  const totalMinutes = data.fitnessEntries.reduce((sum, entry) => sum + entry.durationMinutes, 0);
  const latestMood = Object.values(data.checkIns).at(-1)?.mood || 'Locked in';
  const metrics = getTransformationMetrics(data, streak);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = 'iron-habit-progress.png';
      link.href = dataUrl;
      link.click();
      setStatus('Progress card downloaded.');
    } catch (err) {
      console.error('Failed to generate image', err);
      setStatus('Download failed. Try screenshotting the card.');
    }
  };

  return (
    <section className="share-wrap">
      <div ref={cardRef} className="share-card">
        <div className="share-glow" />
        <p className="share-kicker">IRON HABIT</p>
        <h2>{data.profile.name || 'I'} stayed sober and showed up.</h2>
        <div className="share-day">
          <strong>{streak}</strong>
          <span>day sober streak</span>
        </div>
        <div className="share-metrics">
          <span><b>{data.habits.length}</b> habits</span>
          <span><b>{data.fitnessEntries.length}</b> workouts</span>
          <span><b>{totalMinutes}</b> min</span>
        </div>
        <div className="share-proof-strip">
          <span>{formatMoney(metrics.moneySaved)} saved</span>
          <span>{formatNumber(metrics.drinksSkipped)} drinks skipped</span>
        </div>
        <p className="share-why">{data.profile.why || 'Build a body and life I am proud of.'}</p>
        <footer>
          <span>#{latestMood.replaceAll(' ', '')}</span>
          <span>#SoberFitness</span>
        </footer>
      </div>
      <Button onClick={handleDownload}>Download 9:16 progress card</Button>
      {status && <p className="success-msg">{status}</p>}
    </section>
  );
};

export default ShareableProgressCard;
