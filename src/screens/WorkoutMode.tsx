import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/UI';
import { loadData, saveData, type CompletedLoadout, type FitnessEntry } from '../utils/storage';
import { createStarterLoadout } from '../utils/starterLoadout';
import { computeDailyMissionState } from '../utils/dailyMission';
import { calculateSobrietyStreak } from '../utils/streaks';
import { formatLocalDateKey } from '../utils/date';
import { getWorkoutDraftKey, loadWorkoutDraft, setsAsNumber } from '../utils/workoutDraft';
import { BrandHeader, HelmetCoach, StatCard } from './IronHabitMockup';

const today = () => formatLocalDateKey();

const WorkoutMode = () => {
  const [data, setData] = useState(() => loadData());
  const [finished, setFinished] = useState(false);
  const [victoryProof, setVictoryProof] = useState<CompletedLoadout | null>(null);

  const loadout = data.activeLoadout;
  const [setProof, setSetProof] = useState<Record<string, number>>(() => loadWorkoutDraft(loadData().activeLoadout?.title));
  const workoutDraftKey = useMemo(() => getWorkoutDraftKey(loadout?.title), [loadout?.title]);
  const activeDay = useMemo(() => {
    if (!loadout) return '';
    const dayIndex = new Date().getDay();
    return loadout.days[(dayIndex + 6) % loadout.days.length] || loadout.days[0];
  }, [loadout]);
  const missionState = computeDailyMissionState(data, today());
  const missionRouteLabel = missionState.primaryMission.stage === 'check-in'
    ? 'Daily Check-In'
    : missionState.primaryMission.stage === 'rescue'
      ? 'Emergency Chain'
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

  const todayKey = today();
  const todayProof = loadout ? data.completedLoadouts.find((proof) => proof.date === todayKey) || null : null;
  const isFirstVictoryProof = Boolean(loadout && data.checkIns[todayKey]) && data.completedLoadouts.length === 0 && !data.latestVictoryProof;
  const totalSets = loadout?.exercises.reduce((sum, item) => sum + setsAsNumber(item.sets), 0) || 0;
  const completedSets = loadout?.exercises.reduce((sum, item) => sum + Math.min(setProof[item.name] || 0, setsAsNumber(item.sets)), 0) || 0;
  const progressPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  const allSetsDone = totalSets > 0 && completedSets >= totalSets;
  const hasWorkoutDraft = completedSets > 0 && !allSetsDone;

  useEffect(() => {
    if (!workoutDraftKey || typeof window === 'undefined') return;
    const cleanProof = Object.fromEntries(Object.entries(setProof).filter(([, value]) => value > 0));
    if (Object.keys(cleanProof).length > 0) {
      window.sessionStorage.setItem(workoutDraftKey, JSON.stringify(cleanProof));
      return;
    }
    window.sessionStorage.removeItem(workoutDraftKey);
  }, [setProof, workoutDraftKey]);

  if (!loadout) {
    return (
      <div className="page ih-page ih-real-workout warrior-page workout-mode-page stack-lg">
        <BrandHeader step="WORKOUT" back backTo="/train" />

        <section className="ih-card ih-ai-card ih-real-workout-hero" aria-label="Workout mode starter routine">
          <HelmetCoach small />
          <div>
            <small>WORKOUT MODE</small>
            <h1>No routine loaded.</h1>
            <p>Start the sober-strength starter and turn today into proof.</p>
          </div>
        </section>

        <Card className="command-card sober-mission-card stack-sm ih-real-train-mission">
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
    if (workoutDraftKey && typeof window !== 'undefined') {
      window.sessionStorage.removeItem(workoutDraftKey);
    }
    setData(nextData);
    setVictoryProof(proof);
    setFinished(true);
  };

  if (todayProof && !finished) {
    return (
      <div className="page ih-page ih-real-workout warrior-page workout-mode-page stack-lg">
        <BrandHeader step="PROOF" back backTo="/train" />

        <section className="ih-card ih-ai-card ih-real-workout-hero is-receipt-hero" aria-label="Workout proof already saved">
          <HelmetCoach small />
          <div>
            <small>TODAY'S PROOF</small>
            <h1>Training is already stacked.</h1>
            <p>You already finished today’s work. Build the card or head back to Train.</p>
          </div>
        </section>

        <section className="workout-mode-brief" aria-label="Saved workout proof brief">
          <div>
            <span>Routine</span>
            <strong>{todayProof.title}</strong>
          </div>
          <div>
            <span>Proof</span>
            <strong>{todayProof.completedSets} sets</strong>
          </div>
          <div>
            <span>Time</span>
            <strong>{todayProof.durationMinutes} min</strong>
          </div>
        </section>

        <section className="workout-complete-card victory-complete-card today-proof-card">
          <span className="talk-kicker">Receipt locked</span>
          <p>{todayProof.proofCopy || 'Training proof is saved for today. Receipts beat promises.'}</p>
          <div className="victory-proof-grid">
            <span><b>{todayProof.title}</b><small>routine</small></span>
            <span><b>{todayProof.activeDay}</b><small>split</small></span>
            <span><b>{todayProof.durationMinutes}</b><small>minutes</small></span>
            <span><b>{todayProof.completedSets}</b><small>sets</small></span>
          </div>
          <div className="victory-exercise-list" aria-label="Exercises completed today">
            {todayProof.exercises.map((name) => <span key={name}>{name}</span>)}
          </div>
          <div className="hero-actions workout-receipt-actions">
            <Link to={`/share-progress?template=receipts&proof=${todayProof.id}`} className="btn btn-primary">Build Victory Card</Link>
            <Link to="/proof" className="btn btn-secondary">Open Proof Stack</Link>
            <Link to="/train" className="btn btn-ghost">Back to Train</Link>
          </div>
        </section>
      </div>
    );
  }

  if (finished) {
    const proof = victoryProof;
    return (
      <div className="page ih-page ih-real-workout warrior-page workout-mode-page stack-lg">
        <BrandHeader step="PROOF" back backTo="/train" />

        <section className="ih-card ih-ai-card ih-real-workout-hero is-receipt-hero" aria-label="Workout proof saved">
          <HelmetCoach small />
          <div>
            <small>WORKOUT CONQUERED</small>
            <h1>Proof saved.</h1>
            <p>Receipts beat promises. Build the card or stack the next move.</p>
          </div>
        </section>

        {proof && (
          <section className="workout-mode-brief" aria-label="Saved workout proof brief">
            <div>
              <span>Routine</span>
              <strong>{proof.title}</strong>
            </div>
            <div>
              <span>Proof</span>
              <strong>{proof.completedSets} sets</strong>
            </div>
            <div>
              <span>Time</span>
              <strong>{proof.durationMinutes} min</strong>
            </div>
          </section>
        )}

        <section className="workout-complete-card victory-complete-card">
          <span className="talk-kicker">Receipt locked</span>
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
          <div className="workout-progress-ring"><strong>+{proof?.durationMinutes || Number.parseInt(loadout.time, 10) || 45}</strong><span>minutes logged</span></div>
          <div className="hero-actions workout-receipt-actions">
            <Link to={proof ? `/share-progress?template=receipts&proof=${proof.id}` : '/share-progress'} className="btn btn-primary">Build Victory Card</Link>
            <Link to="/proof" className="btn btn-secondary">Open Proof Stack</Link>
            <Link to="/train" className="btn btn-ghost">Back to Train</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page ih-page ih-real-workout warrior-page workout-mode-page stack-lg">
      <BrandHeader step="ROUTINE" back backTo="/train" />

      <section className="ih-card ih-ai-card ih-real-workout-hero" aria-label="Iron Habit routine sheet">
        <HelmetCoach small />
        <div>
          <small>ROUTINE SHEET</small>
          <h1>Check the work. Stack the proof.</h1>
          <p>{loadout.title} is loaded. Finish when the sets are real.</p>
          <div className="hero-actions workout-mode-hero-actions">
            <Link to="/train" className="btn btn-ghost">Back to Train</Link>
          </div>
        </div>
      </section>

      <section className="workout-mode-brief" aria-label="Workout mode brief">
        <div>
          <span>Today</span>
          <strong>{activeDay}</strong>
        </div>
        <div>
          <span>Work left</span>
          <strong>{Math.max(totalSets - completedSets, 0)} sets</strong>
        </div>
        <div>
          <span>Proof lock</span>
          <strong>{allSetsDone ? 'Ready' : `${progressPercent}%`}</strong>
        </div>
      </section>

      <section className="workout-mission-strip" aria-label="Sober strength mission status">
        <div>
          <span className="tag">Sober Strength</span>
          <strong>{missionState.completionLabel}</strong>
        </div>
        <div className="mission-step-strip compact" aria-label="Daily mission steps">
          {missionState.missionSteps.map((step) => (
            <Link to={step.to} key={step.label} className={`${step.done ? 'step-done' : ''} ${step.active ? 'step-active' : ''}`.trim()}>
              <b>{step.done ? '✓' : '•'}</b>
              <span>{step.label}</span>
            </Link>
          ))}
        </div>
        <Link to="/rescue" className="btn btn-ghost">Open Rescue</Link>
      </section>

      <section className={`workout-finish-dock${allSetsDone ? ' is-proof-ready' : ''}`} aria-label="Workout proof status">
        <div>
          <span>{allSetsDone ? 'Proof ready' : `${Math.max(totalSets - completedSets, 0)} sets left`}</span>
          <strong>{completedSets}/{totalSets} checked</strong>
          <i aria-hidden="true"><em style={{ width: `${progressPercent}%` }} /></i>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={logRoutineComplete}
          disabled={!allSetsDone}
          aria-describedby="finish-proof-status"
          aria-label={allSetsDone ? 'Finish workout and make proof' : `Finish workout locked, ${totalSets - completedSets} sets left`}
        >Finish</button>
      </section>

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

        <div className="ih-stat-grid four ih-real-workout-stat-grid" aria-label="Routine proof snapshot">
          <StatCard label="Moves" value={`${loadout.exercises.length}`} sub="exercises" tone="red" />
          <StatCard label="Sets" value={`${completedSets}/${totalSets}`} sub="checked" tone={allSetsDone ? 'green' : 'amber'} />
          <StatCard label="Target" value={loadout.time} sub="training window" tone="blue" />
          <StatCard label="Proof" value={`${progressPercent}%`} sub="receipt progress" tone="red" />
        </div>
        {hasWorkoutDraft && (
          <div className="workout-draft-strip" aria-label="Saved workout draft">
            <div>
              <span>Progress held on this device</span>
              <strong>{completedSets}/{totalSets} sets checked</strong>
              <p>If you refresh or bounce to another tab, Workout Mode keeps your checked sets until you finish the proof.</p>
            </div>
            <button type="button" onClick={() => setSetProof({})}>Clear checks</button>
          </div>
        )}
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
        {loadout.exercises.map((exercise, index) => {
          const exerciseSetTotal = setsAsNumber(exercise.sets);
          const exerciseSetsDone = Math.min(setProof[exercise.name] || 0, exerciseSetTotal);
          const exerciseComplete = exerciseSetsDone >= exerciseSetTotal;
          const nextSetLabel = exerciseComplete ? 'All sets checked' : `Next set ${exerciseSetsDone + 1}`;

          return (
            <article className={exerciseComplete ? 'routine-exercise-row is-complete' : 'routine-exercise-row'} key={exercise.name}>
              <div className="routine-exercise-index">{exerciseComplete ? '✓' : index + 1}</div>
              {exercise.mediaUrl ? (
                <img className="routine-exercise-demo" src={exercise.mediaUrl} alt={exercise.mediaAlt || `${exercise.name} demo`} loading="lazy" />
              ) : (
                <div className="routine-exercise-demo routine-exercise-demo-placeholder" aria-hidden="true">{exercise.icon}</div>
              )}
              <div>
                <span className="exercise-muscle">{exercise.muscle} • {exercise.equipment}</span>
                <div className="routine-exercise-title-row">
                  <h2>{exercise.name}</h2>
                  <small>{exerciseSetsDone}/{exerciseSetTotal} sets</small>
                </div>
                <div className="prescription-grid workout-prescription">
                  <b>{exercise.sets}<small>sets</small></b>
                  <b>{exercise.reps}<small>reps</small></b>
                  <b>{exercise.rest}<small>rest</small></b>
                </div>
                <div className="set-readiness-note" aria-live="polite">
                  <strong>{nextSetLabel}</strong>
                  <span>{exerciseComplete ? 'Move on steady.' : 'Check it only after the set is real.'}</span>
                </div>
                <div className="set-check-grid" aria-label={`${exercise.name} set checklist`}>
                  {Array.from({ length: exerciseSetTotal }, (_, setIndex) => {
                    const setNumber = setIndex + 1;
                    const done = exerciseSetsDone >= setNumber;
                    return (
                      <button
                        key={`${exercise.name}-set-${setNumber}`}
                        type="button"
                        className={done ? 'set-check done' : 'set-check'}
                        aria-pressed={done}
                        aria-label={`${done ? 'Uncheck' : 'Check'} ${exercise.name} set ${setNumber}`}
                        title={`${done ? 'Uncheck' : 'Check'} set ${setNumber}`}
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
          );
        })}
      </section>

      <Card className={`workout-nav-card routine-log-card${allSetsDone ? ' is-proof-ready' : ''}`}>
        <div>
          <span className="tag">{allSetsDone ? 'Proof ready' : 'Finish'}</span>
          <h2>{isFirstVictoryProof ? 'First training proof is ready to lock.' : 'Done with the routine?'}</h2>
          <p id="finish-proof-status">{allSetsDone ? (isFirstVictoryProof ? 'All sets checked. Finish now and this becomes your first Victory Card receipt.' : 'All sets checked. Proof is ready for the Victory Card.') : `${totalSets - completedSets} sets left. Check them off to unlock proof.`}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={logRoutineComplete}
          disabled={!allSetsDone}
          aria-describedby="finish-proof-status"
          aria-label={allSetsDone ? 'Finish workout and make proof' : `Finish workout locked, ${totalSets - completedSets} sets left`}
        >Finish + Make Proof</button>
      </Card>
    </div>
  );
};

export default WorkoutMode;
