import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/UI';

const testerChecklist = [
  'Setup: open on your phone, finish setup, or use Setup Profile → Load demo mode for the fastest tour.',
  'Check-in: save today’s mood/sleep/sober plan and confirm Today updates clearly.',
  'Rescue: try the craving chain, then open Meetings from the emergency flow.',
  'Meetings: enter your city, save it, and check that the map/finder handoff makes sense.',
  'Train + Fuel: open the starter routine, finish Workout Mode, then try the mock-only Fuel scan/log flow.',
  'Proof: make a Victory Card and decide if you would share or screenshot it.',
];

const feedbackQuestions = [
  'Where did you get stuck or hesitate?',
  'Which screen felt most useful in a real craving or low-motivation moment?',
  'What one change would make you open Iron Habit again tomorrow?',
];

const demoPath = [
  { label: '0–10s', title: 'Setup → Today', detail: 'Baseline saved, day sober hero, one next mission, Rescue always visible.' },
  { label: '10–25s', title: 'Check-in / Rescue', detail: 'Lock the daily receipt, then show the calm craving flow and safety boundary.' },
  { label: '25–45s', title: 'Talk / Train', detail: 'Ask one plain-English command, load starter training, and finish Workout Mode.' },
  { label: '45–60s', title: 'Proof', detail: 'Open the receipt/Victory Card and copy the founder launch caption.' },
];

const LaunchKit = () => {
  const [copyStatus, setCopyStatus] = useState('');
  const liveUrl = window.location.origin;
  const testerMessage = `Can you test Iron Habit on your phone? ${liveUrl}\n\nTry this path:\n1. Setup: finish setup, or use Setup Profile → Load demo mode for the fastest tour\n2. Check-in: save today’s mood/sleep/sober plan\n3. Rescue: use the craving chain, then open Meetings from Rescue\n4. Meetings: enter your city and check the map/finder handoff\n5. Train + Fuel: open the starter routine, finish Workout Mode, then try mock-only Fuel scan/logging\n6. Proof: make a Victory Card\n\nReply with 3 notes:\n1. Where did you get stuck or hesitate?\n2. Which screen felt most useful in a real craving or low-motivation moment?\n3. What one change would make you open Iron Habit again tomorrow?`;
  const feedbackPrompt = `Iron Habit feedback\n\n1. Where did I get stuck or hesitate?\n\n2. Which screen felt most useful in a real craving or low-motivation moment?\n\n3. What one change would make me open Iron Habit again tomorrow?`;
  const launchCaption = 'One year ago I got sober. Today I’m launching Iron Habit — the sober fitness app I wish I had on day one. Check in, survive cravings, train, save proof, and turn the comeback into receipts. #IronHabit #SoberFitness #RecoveryTok';

  const copyText = async (text: string, success: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(success);
    } catch {
      setCopyStatus('Copy blocked. Press and hold the text and copy manually.');
    }
  };

  return (
    <div className="page launch-kit-page stack-lg">
      <PageHeader eyebrow="Tester launch kit" title="Tester push, install polish, and launch demo in one place.">
        Use this as the final handoff screen before sending Iron Habit to the first 2–5 testers.
      </PageHeader>

      <Card className="stack-sm launch-ready-card">
        <span className="tag danger-tag">Launch ready path</span>
        <h2>Run the one-minute product demo.</h2>
        <p>Keep it customer-facing: Setup → Today → Check-in → Rescue → Talk → Train → Proof. No internal roadmap talk, no feature explaining before the screen earns it.</p>
        <div className="launch-step-strip">
          {demoPath.map((step) => (
            <div className="launch-step" key={step.label}>
              <span>{step.label}</span>
              <b>{step.title}</b>
              <small>{step.detail}</small>
            </div>
          ))}
        </div>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/today">Start demo on Today</Link>
          <Link className="btn btn-secondary" to="/setup-profile">Load demo mode</Link>
          <Link className="btn btn-secondary" to="/talk?command=first-proof">Open Talk proof path</Link>
          <Link className="btn btn-secondary" to="/share-progress#founder-launch-copy">Founder copy</Link>
        </div>
      </Card>

      <Card className="stack-sm install-trust-card">
        <span className="tag">PWA + trust polish</span>
        <h2>Install it like an app. Keep the privacy promise clear.</h2>
        <div className="mission-brief-grid">
          <div><span>App name</span><strong>Iron Habit</strong></div>
          <div><span>Storage</span><strong>Local on device</strong></div>
          <div><span>Beta</span><strong>Private tester build</strong></div>
        </div>
        <p>iPhone: Share → Add to Home Screen. Android/Chrome: menu → Install app. Data stays in this browser unless exported from Settings. Private beta only — Iron Habit is support, not emergency care.</p>
        <div className="hero-actions">
          <Link className="btn btn-primary" to="/settings">Open backup/privacy</Link>
          <Link className="btn btn-secondary" to="/setup-profile">Setup profile</Link>
        </div>
      </Card>

      <Card className="stack-sm tester-handoff-card">
        <span className="tag danger-tag">Tester handoff</span>
        <h2>Send this to 2–5 people.</h2>
        <p className="caption-box">{testerMessage}</p>
        <div className="launch-step-strip">
          {testerChecklist.map((item, index) => (
            <div className="launch-step" key={item}>
              <span>{index + 1}</span>
              <b>{item}</b>
            </div>
          ))}
        </div>
        <div className="hero-actions">
          <Button variant="primary" onClick={() => copyText(testerMessage, 'Tester message copied.')}>Copy tester message</Button>
          <a className="btn btn-secondary" href={`sms:?&body=${encodeURIComponent(testerMessage)}`}>Open SMS draft</a>
        </div>
      </Card>

      <Card className="stack-sm tester-feedback-card">
        <span className="tag">Feedback capture</span>
        <h2>Ask for these 3 notes. Nothing more.</h2>
        <div className="proof-angle-strip">
          {feedbackQuestions.map((question) => <span key={question}>{question}</span>)}
        </div>
        <p className="caption-box">{feedbackPrompt}</p>
        <div className="hero-actions">
          <Button variant="secondary" onClick={() => copyText(feedbackPrompt, 'Feedback prompt copied.')}>Copy feedback prompt</Button>
          <a className="btn btn-secondary" href={`sms:?&body=${encodeURIComponent(feedbackPrompt)}`}>Open feedback SMS</a>
        </div>
      </Card>

      <Card className="stack-sm founder-launch-card">
        <span className="tag danger-tag">Founder launch caption</span>
        <h2>One year ago I got sober. Today I’m launching the app I wish I had on day one.</h2>
        <p className="caption-box">{launchCaption}</p>
        <div className="proof-angle-strip">
          <span>Hook: sober founder story</span>
          <span>Show: craving → rescue → proof</span>
          <span>Close: ask testers for feedback</span>
        </div>
        <div className="hero-actions">
          <Button variant="secondary" onClick={() => copyText(launchCaption, 'Founder launch caption copied.')}>Copy launch caption</Button>
          <Link className="btn btn-primary" to="/share-progress?template=milestone">Make launch card</Link>
        </div>
      </Card>

      {copyStatus && <p className="success-msg">{copyStatus}</p>}
    </div>
  );
};

export default LaunchKit;
