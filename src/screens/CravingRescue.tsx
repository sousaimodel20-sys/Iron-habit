import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/UI';
import { getTodayKey, loadData, saveData, type CheckIn } from '../utils/storage';
import { buildMeetingsPath, buildSupportSmsHref, buildSupportTelHref, getMeetingsCtaLabel, getSupportContactLabel, getSupportLocation, hasSupportContact } from '../utils/support';

const protocol = [
  'Put the drink plan on pause. Say: “I only need to win ten minutes.”',
  'Cold water. Slow sips. Bring your body back online.',
  'Box breathing: inhale 4, hold 4, exhale 6.',
  'Walk outside or change rooms. Break the loop.',
  'Protein or real food. Do not negotiate hungry.',
  'Text someone safe: “I’m riding out a craving.”',
];

const appendNote = (current: string, next: string) => [current, next].filter(Boolean).join(' | ');

type RescueOutcome = 'idle' | 'win' | 'slip';

const CravingRescue = () => {
  const [searchParams] = useSearchParams();
  const chainMode = searchParams.get('chain') === '1';
  const data = loadData();
  const profile = data.profile;
  const supportLocation = getSupportLocation(profile);
  const meetingsPath = buildMeetingsPath(profile);
  const meetingsLabel = getMeetingsCtaLabel(profile);
  const supportReady = hasSupportContact(profile);
  const supportContactLabel = getSupportContactLabel(profile);
  const supportCallHref = buildSupportTelHref(profile);
  const supportTextMessage = chainMode
    ? 'I need support right now. I am in a high-craving moment and staying sober for the next 10 minutes.'
    : 'I’m riding out a craving. Can you check in with me?';
  const supportActions = supportReady ? (
    <>
      <a className="btn btn-danger" href={supportCallHref}>Call {supportContactLabel}</a>
      <a className="btn btn-ghost" href={buildSupportSmsHref(profile, supportTextMessage)}>Text {supportContactLabel}</a>
    </>
  ) : (
    <Link to="/setup-profile" className="btn btn-ghost">Set support contact</Link>
  );
  const initialChainStatus = supportReady
    ? `Emergency support chain live. Text ${supportContactLabel}, check the map, and win the next ten minutes.`
    : 'Emergency support chain live. Set a support contact, check the map, and win the next ten minutes.';
  const chainSupportSummary = supportReady
    ? `${supportContactLabel} is the first human handoff${supportLocation ? ` • meetings near ${supportLocation}` : ''}.`
    : 'No safe person saved yet. Lock one in after this wave so the chain is ready next time.';
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [running, setRunning] = useState(chainMode);
  const [mode, setMode] = useState<'steady' | 'emergency' | 'slip'>(chainMode ? 'emergency' : 'steady');
  const [status, setStatus] = useState(chainMode ? initialChainStatus : '');
  const [outcome, setOutcome] = useState<RescueOutcome>('idle');
  const todayKey = getTodayKey();
  const todayCheckIn = data.checkIns[todayKey];
  const chainOpenedFromTalk = Boolean(todayCheckIn?.note?.toLowerCase().includes('talk') || todayCheckIn?.note?.toLowerCase().includes('about to drink'));
  const chainSavedBrief = chainOpenedFromTalk
    ? 'Talk saved this as a 10/10 emergency.'
    : 'Iron Habit opened this from your high-craving check-in.';
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  useEffect(() => {
    if (!running || secondsLeft <= 0) return undefined;

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, secondsLeft]);

  const saveRescueCheckIn = (updates: Partial<CheckIn>, message: string) => {
    const current = loadData();
    const existing = current.checkIns[todayKey];
    const nextCheckIn: CheckIn = {
      date: todayKey,
      sober: updates.sober ?? existing?.sober ?? true,
      mood: updates.mood ?? existing?.mood ?? 'Fighting',
      craving: updates.craving ?? existing?.craving ?? 8,
      habitsCompleted: updates.habitsCompleted ?? existing?.habitsCompleted ?? [],
      note: appendNote(existing?.note || '', updates.note || ''),
    };

    saveData({ checkIns: { ...current.checkIns, [todayKey]: nextCheckIn } });
    setStatus(message);
  };

  useEffect(() => {
    if (!chainMode || todayCheckIn?.note?.includes('Emergency support chain opened')) return;
    const chainKey = `iron-habit-chain-${todayKey}`;
    if (window.sessionStorage.getItem(chainKey) === '1') return;
    window.sessionStorage.setItem(chainKey, '1');
    const current = loadData();
    const existing = current.checkIns[todayKey];
    const nextCheckIn: CheckIn = {
      date: todayKey,
      sober: existing?.sober ?? true,
      mood: 'Emergency rescue',
      craving: Math.max(existing?.craving ?? 0, 10),
      habitsCompleted: Array.from(new Set([...(existing?.habitsCompleted || []), 'No alcohol', 'Emergency support chain'])),
      note: appendNote(existing?.note || '', `Emergency support chain opened from ${chainOpenedFromTalk ? 'Talk' : 'high-craving route'}.`),
    };
    saveData({ checkIns: { ...current.checkIns, [todayKey]: nextCheckIn } });
  }, [chainMode, chainOpenedFromTalk, todayCheckIn?.note, todayKey]);

  const rescueStepMessage = useMemo(() => {
    if (outcome === 'win') return 'Win state: stack proof, keep the day sober, and move to the next right action.';
    if (outcome === 'slip') return 'Restart state: stop the bleed, then rebuild the next 24 hours without shame.';
    if (mode === 'emergency') return 'Emergency state: lock in human support and let the 10-minute clock do the work.';
    return running ? 'The only job is to finish the 10-minute clock.' : 'Press start, then do the next 10 minutes exactly as written.';
  }, [mode, outcome, running]);

  const start = () => {
    setOutcome('idle');
    setSecondsLeft(600);
    setRunning(true);
    setStatus('Ten-minute rescue started. Do not negotiate until the clock hits zero.');
  };

  const startEmergency = () => {
    setMode('emergency');
    setOutcome('idle');
    setSecondsLeft(600);
    setRunning(true);
    saveRescueCheckIn(
      { sober: todayCheckIn?.sober ?? true, mood: 'Emergency rescue', craving: 10, note: 'Emergency rescue started: I am about to drink.' },
      'Emergency state saved. Win the next ten minutes only.',
    );
  };

  const logRescueWin = () => {
    const current = loadData();
    const currentCheckIn = current.checkIns[todayKey];
    const facedCraving = Math.max(currentCheckIn?.craving ?? 3, mode === 'emergency' ? 10 : 3);
    setRunning(false);
    setOutcome('win');
    saveRescueCheckIn(
      {
        sober: true,
        mood: mode === 'emergency' ? 'Emergency survived' : 'Rescue win',
        craving: facedCraving,
        habitsCompleted: Array.from(new Set([...(currentCheckIn?.habitsCompleted || []), 'No alcohol', 'Craving rescue'])),
        note: mode === 'emergency'
          ? 'Emergency rescue win logged: 10/10 craving wave passed without drinking.'
          : 'Rescue win logged: craving wave passed without drinking.',
      },
      mode === 'emergency'
        ? 'Emergency win logged. Make the 10/10 Craving Card while the proof is fresh.'
        : 'Rescue win logged. Proof beats the old loop.',
    );
  };

  const makeCravingCard = () => {
    const currentCraving = loadData().checkIns[todayKey]?.craving ?? 0;
    setOutcome('win');
    saveRescueCheckIn(
      { sober: true, mood: 'Craving defeated', craving: Math.max(currentCraving, mode === 'emergency' ? 10 : 7), note: 'Craving Victory Card created from Rescue.' },
      'Craving proof saved. Turn it into a Victory Card.',
    );
  };

  const logSlip = () => {
    setMode('slip');
    setOutcome('slip');
    setRunning(false);
    saveRescueCheckIn(
      { sober: false, mood: 'Restarting', craving: 6, note: 'Slip logged without shame. Restart plan opened.' },
      'Slip logged. No shame spiral — restart the next right action.',
    );
  };

  const setRestartDate = () => {
    const current = loadData();
    saveData({ profile: { ...current.profile, sobrietyDate: todayKey } });
    setStatus('Comeback restart date set to today. The next right action starts now.');
  };

  const reset = () => {
    setRunning(false);
    setSecondsLeft(600);
    setMode('steady');
    setOutcome('idle');
    setStatus('');
  };

  return (
    <div className="page rescue-page stack-lg">
      <PageHeader eyebrow="Rescue" title={mode === 'emergency' ? 'Do not drink for ten minutes.' : mode === 'slip' ? 'No shame. Restart clean.' : 'Craving protocol. No bargaining.'}>
        {mode === 'slip'
          ? 'A slip is data, not identity. Stop the spiral, reset the environment, and stack the next right action.'
          : 'Ten minutes to interrupt the old pattern and protect the comeback you are building.'}
      </PageHeader>

      <Card className={`rescue-card emergency-rescue-card stack-md ${mode === 'emergency' ? 'is-emergency' : ''}`}>
        <div className="rescue-head">
          <span className="tag danger-tag">{mode === 'emergency' ? 'I am about to drink' : 'Emergency lock-in'}</span>
          <span className="rescue-clock">{minutes}:{seconds}</span>
        </div>

        <p className="rescue-support-note rescue-hero-note">{rescueStepMessage}</p>

        <div className="breath-ring" aria-label="Breathing guide">
          <span>{secondsLeft === 0 ? 'Clear' : running ? 'Breathe' : 'Start'}</span>
        </div>

        <div className="rescue-actions primary-rescue-actions">
          {!chainMode && <Button variant="danger" onClick={startEmergency}>I’m about to drink</Button>}
          <Button onClick={start}>{running ? 'Restart 10 minutes' : 'Start 10-minute rescue'}</Button>
          {supportActions}
        </div>

        {chainMode && (
          <div className="rescue-chain-panel">
            <span className="tag danger-tag">Emergency support chain</span>
            <div className="rescue-chain-brief">
              <strong>{chainSavedBrief}</strong>
              <span>{chainSupportSummary}</span>
            </div>
            <p className="rescue-support-note">Do the next three moves in order. No bargaining, no scrolling, no waiting for motivation.</p>
            <div className="rescue-chain-steps" aria-label="Emergency chain checklist">
              <span><b>1</b>Stay on this 10-minute timer.</span>
              <span><b>2</b>{supportReady ? `Text or call ${supportContactLabel}.` : 'Set a safe person after the timer.'}</span>
              <span><b>3</b>{supportLocation ? `Move toward meetings near ${supportLocation} or a safer room.` : 'Move toward a meeting search or safer room.'}</span>
            </div>
            <div className="rescue-actions rescue-chain-actions">
              {supportReady ? (
                <>
                  <a className="btn btn-danger" href={buildSupportSmsHref(profile, supportTextMessage)}>Text {supportContactLabel}</a>
                  <a className="btn btn-secondary" href={supportCallHref}>Call {supportContactLabel}</a>
                </>
              ) : (
                <Link to="/setup-profile?focus=support" className="btn btn-secondary">Set support contact</Link>
              )}
              <Link to={meetingsPath} className="btn btn-ghost">{meetingsLabel}</Link>
            </div>
          </div>
        )}

        {!chainMode && (
          <div className="rescue-actions">
            <Link to={meetingsPath} className="btn btn-secondary">{meetingsLabel}</Link>
          </div>
        )}

        <div className="rescue-actions">
          <Button variant="secondary" onClick={logRescueWin}>I made it through</Button>
          <Link to={`/share-progress?template=craving&receipt=${todayKey}`} className="btn btn-primary" onClick={makeCravingCard}>Make Craving Card</Link>
          <Button variant="ghost" onClick={logSlip}>I slipped — restart</Button>
          <Button variant="secondary" onClick={reset}>Reset timer</Button>
        </div>

        {secondsLeft === 0 && outcome !== 'win' && <p className="success-msg">You made it through the wave. Log the rescue win.</p>}
        {status && <p className="success-msg">{status}</p>}
      </Card>

      {outcome !== 'idle' && (
        <Card className={`rescue-outcome-card stack-md ${outcome === 'win' ? 'is-win' : 'is-slip'}`}>
          <span className="tag">{outcome === 'win' ? (mode === 'emergency' ? 'Emergency proof ready' : 'Rescue win') : 'Restart now'}</span>
          <h2>{outcome === 'win' ? (mode === 'emergency' ? 'Emergency chain survived.' : 'You just beat the urge.') : 'No shame. Restart the next 24 hours.'}</h2>
          <p>{outcome === 'win' ? (mode === 'emergency' ? 'Talk saved the 10/10 moment. You stayed sober. Convert this into a Craving Card or Proof Vault receipt before the win fades.' : 'Treat this as proof. Lock the win, keep the streak alive, and move to the next right action.') : 'Stop the bleed, reset the day, and use the proof loop to start clean.'}</p>
          <div className="rescue-actions">
            {outcome === 'win' ? (
              <>
                <Link to="/check-in" className="btn btn-secondary">Open check-in</Link>
                <Link to={`/share-progress?template=craving&receipt=${todayKey}`} className="btn btn-primary" onClick={makeCravingCard}>{mode === 'emergency' ? 'Make 10/10 Craving Card' : 'Make Craving Card'}</Link>
                <Link to="/proof" className="btn btn-ghost">Open Proof Vault</Link>
              </>
            ) : (
              <>
                <Button variant="danger" onClick={setRestartDate}>Set comeback restart date</Button>
                <Link to="/check-in" className="btn btn-secondary">Open check-in</Link>
                <Link to={meetingsPath} className="btn btn-ghost">{meetingsLabel}</Link>
              </>
            )}
          </div>
          <div className="rescue-actions">{supportActions}</div>
        </Card>
      )}

      {mode === 'slip' && (
        <Card className="slip-restart-card stack-md">
          <span className="tag danger-tag">Shame-free restart</span>
          <h2>The rule: stop the bleed.</h2>
          <div className="rescue-steps">
            <span><b>01</b>Pour it out or leave the location.</span>
            <span><b>02</b>Drink water and eat real food.</span>
            <span><b>03</b>Text one safe person the truth.</span>
            <span><b>04</b>Set the next 24-hour comeback.</span>
          </div>
          <div className="rescue-actions">
            <Button variant="danger" onClick={setRestartDate}>Set comeback restart date</Button>
            <Link to="/check-in" className="btn btn-secondary">Open check-in</Link>
          </div>
        </Card>
      )}

      {!chainMode && <Card className="stack-sm">
        <span className="tag">10-minute protocol</span>
        <div className="rescue-steps">
          {protocol.map((step, index) => (
            <span key={step}><b>{String(index + 1).padStart(2, '0')}</b>{step}</span>
          ))}
        </div>
      </Card>}

      <Card className="reason-card">
        <span>Reason to stay in command</span>
        <strong>{profile.transformationGoal || profile.why || 'Lean, sober, strong, and consistent.'}</strong>
        <small className="rescue-support-note">{supportLocation ? `Support base locked to ${supportLocation}.` : 'Support base not set yet.'} Update it from Meetings if you need a different area.</small>
        <small className="rescue-support-note">Remember: win the next 10 minutes, then decide again.</small>
        {supportReady ? (
          <div className="hero-actions" style={{ marginTop: '0.25rem' }}>
            {supportActions}
          </div>
        ) : (
          <small className="rescue-support-note">Add a safe-person phone on Setup so Rescue can text the right human in one tap.</small>
        )}
        <small className="rescue-support-note">If you might hurt yourself or someone else, contact local emergency services now. Iron Habit is support, not emergency care.</small>
      </Card>
    </div>
  );
};

export default CravingRescue;
