import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/UI';
import { loadData, saveData, type CompletedLoadout, type FitnessEntry } from '../utils/storage';
import { createStarterLoadout } from '../utils/starterLoadout';
import { computeDailyMissionState } from '../utils/dailyMission';
import { calculateSobrietyStreak } from '../utils/streaks';
import { formatLocalDateKey } from '../utils/date';

const today = () => formatLocalDateKey();

const setsAsNumber = (sets: string) => {
  const parsed = Number.parseInt(sets, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
};

const WorkoutMode = () => {
  const [data, setData] = useState(() => loadData());
  const [finished, setFinished] = useState(false);
  const [victoryProof, setVictoryProof] = useState<CompletedLoadout | null>(null);

  const loadout = data.activeLoadout;
  const [setProof, setSetProof] = useState<Record<string, number>>({});
  const activeDay = useMemo(() => {
    if (!loadout) return '';
    const dayIndex = new Date().getDay();
    return loadout.days[(dayIndex + 6) % loadout.days.length] || loadout.days[0];
  }, [loadout]);
  const missionState = computeDailyMissionState(data, today());
  const missionRouteLabel = missionState.primaryMission.stage === 'check-in'
    ? 'Daily Check-In'
    : missionState.primaryMission.stage === 'build-loadout'
      ? 'Workout Mode'
      : missionState.primaryMission.stage === 'train'
        ? 'Workout Mode'
        : missionState.primaryMission.stage === 'proof'
          ? 'Proof'
          : 'Victory Card';

  const startStarterLoadout = () => {
    if (loadout) return;
    const nextLoadout = createStarterLoadout();
    const nextData = saveData({ activeLoadout: nextLoadout });
    setData(nextData);
  };

  if (!loadout) {
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <Card className="command-card sober-mission-card stack-sm">
          <div className="section-title-row mission-title-row">
            <span className="tag">Sober Strength Mission</span>
            <b>{missionState.completionLabel}</b>
          </div>
          <h2>{missionState.primaryMission.title}</h2>
          <p>{missionState.nextBestMove}</p>
          <div className="mission-step-strip" aria-label="Daily mission steps">
            {missionState.missionSteps.map((step) => (
              <Link to={step.to} key={step.label} className={`${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`.trim()}>
                <b>{step.done ? '✓' : '•'}</b>
                <span>{step.label}</span>
              </Link>
            ))}
          </div>
          <div className="mission-brief-grid">
            <div><span>Proof action</span><strong>{missionState.proofAction}</strong></div>
            <div><span>Next move</span><strong>{missionState.primaryMission.cta}</strong></div>
            <div><span>Route</span><strong>{missionRouteLabel}</strong></div>
          </div>
          <div className="hero-actions">
            <Link to={missionState.primaryMission.to} className="btn btn-primary">{missionState.primaryMission.cta}</Link>
            <Link to="/rescue" className="btn btn-danger">Open Rescue</Link>
          </div>
        </Card>

        <Card className="active-program-card stack-md">
          <span className="tag">No Active Routine</span>
          <h1>Start a starter loadout in one tap.</h1>
          <p>Use the 20-minute sober strength starter, jump into Workout Mode, and stack proof before you build custom splits.</p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={startStarterLoadout}>Start Starter Loadout</button>
            <Link to="/talk" className="btn btn-secondary">Open Coach Loadouts</Link>
          </div>
        </Card>
      </div>
    );
  }

  const todayKey = today();
  const isFirstVictoryProof = Boolean(data.checkIns[todayKey]) && data.completedLoadouts.length === 0 && !data.latestVictoryProof;
  const totalSets = loadout.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0);
  const completedSets = loadout.exercises.reduce((sum, item) => sum + Math.min(setProof[item.name] || 0, setsAsNumber(item.sets)), 0);
  const progressPercent = Math.round((completedSets / totalSets) * 100);
  const allSetsDone = completedSets >= totalSets;

  const toggleSet = (exerciseName: string, setNumber: number) => {
    setSetProof((current) => {
      const currentDone = current[exerciseName] || 0;
      return { ...current, [exerciseName]: currentDone >= setNumber ? setNumber - 1 : setNumber };
    });
  };

  const logRoutineComplete = () => {
    const minutes = Number.parseInt(loadout.time, 10) || 45;
    const intensity = loadout.level === 'Advanced' ? 'Beast mode' : loadout.level === 'Beginner' ? 'Moderate' : 'Hard';
    const date = today();
    const soberDay = Math.max(1, calculateSobrietyStreak());
    const proof: CompletedLoadout = {
      id: `${Date.now()}`,
      date,
      title: loadout.title,
      label: loadout.label,
      activeDay,
      durationMinutes: minutes,
      intensity,
      exercises: loadout.exercises.map((item) => item.name),
      completedSets: allSetsDone ? totalSets : Math.max(completedSets, totalSets),
      totalSets,
      finisher: loadout.finisher,
      proofCopy: `Day ${soberDay} sober. ${loadout.title} conquered: ${totalSets} sets, ${minutes} minutes. Receipts beat promises.`,
    };
    const entry: FitnessEntry = {
      id: proof.id,
      date,
      type: loadout.label,
      durationMinutes: minutes,
      intensity,
      note: `${activeDay}: ${loadout.exercises.map((item) => item.name).join(', ')}. ${loadout.finisher}`,
    };
    const nextData = saveData({
      fitnessEntries: [entry, ...data.fitnessEntries],
      completedLoadouts: [proof, ...data.completedLoadouts],
      latestVictoryProof: proof,
    });
    setData(nextData);
    setVictoryProof(proof);
    setFinished(true);
  };

  if (finished) {
    const proof = victoryProof;
    return (
      <div className="page warrior-page workout-mode-page stack-lg">
        <Card className="command-card sober-mission-card stack-sm">
          <div className="section-title-row mission-title-row">
            <span className="tag">Sober Strength Mission</span>
            <b>{missionState.completionLabel}</b>
          </div>
          <h2>{missionState.primaryMission.title}</h2>
          <p>{missionState.nextBestMove}</p>
          <div className="mission-step-strip" aria-label="Daily mission steps">
            {missionState.missionSteps.map((step) => (
              <Link to={step.to} key={step.label} className={`${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`.trim()}>
                <b>{step.done ? '✓' : '•'}</b>
                <span>{step.label}</span>
              </Link>
            ))}
          </div>
          <div className="mission-brief-grid">
            <div><span>Proof action</span><strong>{missionState.proofAction}</strong></div>
            <div><span>Next move</span><strong>{missionState.primaryMission.cta}</strong></div>
            <div><span>Route</span><strong>{missionRouteLabel}</strong></div>
          </div>
          <div className="hero-actions">
            <Link to={missionState.primaryMission.to} className="btn btn-primary">{missionState.primaryMission.cta}</Link>
            <Link to="/proof" className="btn btn-secondary">Open Proof Stack</Link>
          </div>
        </Card>

        <section className="workout-complete-card victory-complete-card">
          <span className="talk-kicker">Workout Conquered</span>
          <h1>Proof saved.</h1>
          <p>{proof?.proofCopy || 'Another vote against the old life. Proof logged. The new identity gets stronger.'}</p>
          {proof && (
            <>
              <div className="victory-proof-grid">
                <span><b>{proof.title}</b><small>routine</small></span>
                <span><b>{proof.activeDay}</b><small>split</small></span>
                <span><b>{proof.durationMinutes}</b><small>minutes</small></span>
                <span><b>{proof.completedSets}</b><small>sets</small></span>
              </div>
              <div className="victory-exercise-list" aria-label="Exercises completed">
                {proof.exercises.map((name) => <span key={name}>{name}</span>)}
              </div>
            </>
          )}
          <div className="workout-progress-ring"><strong>+{proof?.durationMinutes || Number.parseInt(loadout.time, 10) || 45}</strong><span>minutes</span></div>
          <div className="hero-actions">
            <Link to="/proof" className="btn btn-secondary">Open Proof Stack</Link>
            <Link to={proof ? `/share-progress?template=receipts&proof=${proof.id}` : '/share-progress'} className="btn btn-primary">Build Victory Card</Link>
            <Link to="/train" className="btn btn-ghost">Back to Train</Link>
            <button type="button" className="btn btn-ghost" onClick={() => setFinished(false)}>View Routine Again</button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page warrior-page workout-mode-page stack-lg">
      <Card className="command-card sober-mission-card stack-sm">
        <div className="section-title-row mission-title-row">
          <span className="tag">Sober Strength Mission</span>
          <b>{missionState.completionLabel}</b>
        </div>
        <h2>{missionState.primaryMission.title}</h2>
        <p>{missionState.nextBestMove}</p>
        <div className="mission-step-strip" aria-label="Daily mission steps">
          {missionState.missionSteps.map((step) => (
            <Link to={step.to} key={step.label} className={`${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`.trim()}>
              <b>{step.done ? '✓' : '•'}</b>
              <span>{step.label}</span>
            </Link>
          ))}
        </div>
        <div className="mission-brief-grid">
          <div><span>Proof action</span><strong>{missionState.proofAction}</strong></div>
          <div><span>Next move</span><strong>{missionState.primaryMission.cta}</strong></div>
          <div><span>Route</span><strong>{missionRouteLabel}</strong></div>
        </div>
        <div className="hero-actions">
          <Link to={missionState.primaryMission.to} className="btn btn-primary">{missionState.primaryMission.cta}</Link>
          <Link to="/proof" className="btn btn-secondary">Open Proof Stack</Link>
          <Link to="/rescue" className="btn btn-danger">Open Rescue</Link>
        </div>
      </Card>

      <section className="routine-sheet-card stack-md">
        <div className="active-program-head">
          <div>
            <span className="tag">Routine Sheet</span>
            <h1>{loadout.title}</h1>
            <p>{loadout.goal} • {loadout.level} • {loadout.time}</p>
          </div>
          <strong>{activeDay}</strong>
        </div>

        <div className="split-strip" aria-label="Weekly split">
          {loadout.days.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
        </div>

        <div className="routine-summary-grid">
          <span><b>{loadout.exercises.length}</b><small>exercises</small></span>
          <span><b>{completedSets}/{totalSets}</b><small>sets done</small></span>
          <span><b>{loadout.time}</b><small>target time</small></span>
        </div>
        <div className="workout-progress-card" aria-label="Workout progress">
          <div><span>Workout proof</span><b>{progressPercent}%</b></div>
          <i><em style={{ width: `${progressPercent}%` }} /></i>
          <p>{allSetsDone ? 'All sets checked. Finish and make the Victory Card.' : 'Tap each set as you complete it. Finish unlocks when the work is checked.'}</p>
        </div>
        {isFirstVictoryProof && (
          <div className="first-victory-cue" aria-label="First Victory Card cue">
            <span className="tag">First Victory Card</span>
            <h2>Finish this routine to create your first training receipt.</h2>
            <p>Your check-in is already locked. Complete the sets, tap Finish + Make Proof, then Iron Habit builds the Victory Card from this exact session.</p>
            <div className="first-proof-steps" aria-label="First training proof path">
              <div><strong>✓</strong><span>Check-in saved</span></div>
              <div><strong>2</strong><span>Finish routine</span></div>
              <div><strong>3</strong><span>Build Victory Card</span></div>
            </div>
          </div>
        )}
      </section>

      <section className="routine-exercise-list" aria-label="Routine exercises">
        {loadout.exercises.map((exercise, index) => (
          <article className="routine-exercise-row" key={exercise.name}>
            <div className="routine-exercise-index">{index + 1}</div>
            <div>
              <span className="exercise-muscle">{exercise.muscle} • {exercise.equipment}</span>
              <h2>{exercise.name}</h2>
              <div className="prescription-grid workout-prescription">
                <b>{exercise.sets}<small>sets</small></b>
                <b>{exercise.reps}<small>reps</small></b>
                <b>{exercise.rest}<small>rest</small></b>
              </div>
              <div className="set-check-grid" aria-label={`${exercise.name} set checklist`}>
                {Array.from({ length: setsAsNumber(exercise.sets) }, (_, setIndex) => {
                  const setNumber = setIndex + 1;
                  const done = (setProof[exercise.name] || 0) >= setNumber;
                  return (
                    <button
                      key={`${exercise.name}-set-${setNumber}`}
                      type="button"
                      className={done ? 'set-check done' : 'set-check'}
                      onClick={() => toggleSet(exercise.name, setNumber)}
                    >
                      {done ? '✓' : setNumber}
                    </button>
                  );
                })}
              </div>
              <details className="workout-form-note">
                <summary>Form cue + swap</summary>
                <span><strong>Cue:</strong> {exercise.cue}</span>
                <span><strong>Watch:</strong> {exercise.mistake}</span>
                <span><strong>Swap:</strong> {exercise.swap}</span>
              </details>
            </div>
          </article>
        ))}
      </section>

      <Card className="workout-nav-card routine-log-card">
        <div>
          <span className="tag">Finish</span>
          <h2>{isFirstVictoryProof ? 'First training proof is ready to lock.' : 'Done with the routine?'}</h2>
          <p>{allSetsDone ? (isFirstVictoryProof ? 'All sets checked. Finish now and this becomes your first Victory Card receipt.' : 'All sets checked. Proof is ready for the Victory Card.') : `${totalSets - completedSets} sets left. Check them off to unlock proof.`}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={logRoutineComplete} disabled={!allSetsDone}>Finish + Make Proof</button>
      </Card>
    </div>
  );
};

export default WorkoutMode;
