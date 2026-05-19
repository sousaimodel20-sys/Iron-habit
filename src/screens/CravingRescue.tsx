import { useEffect, useState } from 'react';
import { Button, Card, PageHeader } from '../components/UI';
import { loadData } from '../utils/storage';

const protocol = [
  'Cold water. Slow sips. Bring your body back online.',
  'Box breathing: inhale 4, hold 4, exhale 6.',
  'Walk outside or change rooms. Break the loop.',
  'Protein or real food. Do not negotiate hungry.',
  'Text someone safe: “I’m riding out a craving.”',
];

const CravingRescue = () => {
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [running, setRunning] = useState(false);
  const profile = loadData().profile;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  const start = () => {
    setSecondsLeft(600);
    setRunning(true);
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(600);
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Rescue" title="Craving protocol. No bargaining.">
        Ten minutes to interrupt the old pattern and protect the comeback you are building.
      </PageHeader>

      <Card className="rescue-card stack-md">
        <div className="rescue-head">
          <span className="tag danger-tag">Emergency lock-in</span>
          <span className="rescue-clock">{minutes}:{seconds}</span>
        </div>

        <div className="breath-ring" aria-label="Breathing guide">
          <span>{secondsLeft === 0 ? 'Clear' : running ? 'Breathe' : 'Start'}</span>
        </div>

        <div className="rescue-actions">
          <Button onClick={start}>{running ? 'Restart 10 minutes' : 'Start 10-minute rescue'}</Button>
          <Button variant="secondary" onClick={reset}>Reset</Button>
          <a className="btn btn-ghost" href="sms:?body=I%27m%20riding%20out%20a%20craving.%20Can%20you%20check%20in%20with%20me%3F">Text support</a>
        </div>

        {secondsLeft === 0 && <p className="success-msg">You made it through the wave. Log the win on Lock In.</p>}
      </Card>

      <Card className="stack-sm">
        <span className="tag">Rescue steps</span>
        <div className="rescue-steps">
          {protocol.map((step, index) => (
            <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
          ))}
        </div>
      </Card>

      <Card className="reason-card">
        <span>Reason to stay in command</span>
        <strong>{profile.transformationGoal || profile.why || 'Lean, sober, strong, and consistent.'}</strong>
      </Card>
    </div>
  );
};

export default CravingRescue;
