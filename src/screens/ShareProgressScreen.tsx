import { useEffect, useState } from 'react';
import { loadData, type IronHabitData } from '../utils/storage';
import ShareableProgressCard, { type VictoryTemplate } from '../components/ShareableProgressCard';
import { Button, Card, PageHeader } from '../components/UI';
import { calculateSobrietyStreak } from '../utils/streaks';

const templates: { id: VictoryTemplate; label: string; description: string }[] = [
  { id: 'comeback', label: 'Comeback', description: 'Sober transformation energy.' },
  { id: 'discipline', label: 'Discipline', description: 'Gym/recovery lock-in proof.' },
  { id: 'receipts', label: 'Receipts', description: 'Stats-first proof card.' },
];

const ShareProgressScreen = () => {
  const [data, setData] = useState<IronHabitData>(loadData());
  const [streak, setStreak] = useState(calculateSobrietyStreak());
  const [template, setTemplate] = useState<VictoryTemplate>('comeback');
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const refresh = () => {
      setData(loadData());
      setStreak(calculateSobrietyStreak());
    };
    refresh();
    window.addEventListener('iron-habit-data-updated', refresh);
    return () => window.removeEventListener('iron-habit-data-updated', refresh);
  }, []);

  const workoutProof = data.latestVictoryProof;
  const captions: Record<VictoryTemplate, string> = {
    comeback: workoutProof
      ? `${workoutProof.title} conquered: ${workoutProof.durationMinutes} min, ${workoutProof.completedSets} sets. Another vote against the old life. #IronHabit #SoberFitness #WorkoutProof`
      : `Day ${streak}. Sober, training, and rebuilding brick by brick. #IronHabit #SoberFitness #Comeback`,
    discipline: workoutProof
      ? `Proof logged: ${workoutProof.activeDay}, ${workoutProof.exercises.length} exercises, ${workoutProof.completedSets} sets. I did not negotiate today. #Discipline #SoberGym #IronHabit`
      : `I did not negotiate with the old life today. Day ${streak} locked in. #Discipline #SoberGym #IronHabit`,
    receipts: workoutProof
      ? `Receipts: ${workoutProof.label}, ${workoutProof.durationMinutes} minutes, ${workoutProof.completedSets} sets completed. Proof beats promises. #RecoveryTok #IronHabit`
      : `Proof beats promises: ${streak} days sober, ${data.fitnessEntries.length} workouts logged, ${data.habits.length} habits stacked. #RecoveryTok #IronHabit`,
  };
  const caption = captions[template];

  const copyCaption = async () => {
    try {
      await navigator.clipboard?.writeText(caption);
      setCopyStatus('Caption copied.');
    } catch {
      setCopyStatus('Copy blocked. Press and hold the caption to copy.');
    }
  };

  return (
    <div className="page stack-lg">
      <PageHeader eyebrow="Victory Card" title={workoutProof ? 'Make the workout proof visible.' : 'Make the comeback visible.'}>
        {workoutProof
          ? 'Your latest finished loadout is ready as a 9:16 proof card for sober-fitness content.'
          : 'Pick a 9:16 card style, download it, and copy a caption built for sober-fitness content.'}
      </PageHeader>

      <Card className="stack-sm">
        <span className="tag">Card template</span>
        <div className="template-grid">
          {templates.map((item) => (
            <button
              key={item.id}
              className={`template-option ${template === item.id ? 'selected' : ''}`}
              onClick={() => setTemplate(item.id)}
            >
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <ShareableProgressCard data={data} streak={streak} template={template} />

      <Card className="stack-sm">
        <h2>Caption starter</h2>
        <p className="caption-box">{caption}</p>
        <div className="button-row">
          <Button variant="secondary" onClick={copyCaption}>Copy caption</Button>
          <Button variant="ghost" onClick={() => setTemplate(template === 'comeback' ? 'discipline' : template === 'discipline' ? 'receipts' : 'comeback')}>
            Rotate template
          </Button>
        </div>
        {copyStatus && <p className="success-msg">{copyStatus}</p>}
      </Card>
    </div>
  );
};

export default ShareProgressScreen;
