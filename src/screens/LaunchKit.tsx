import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, PageHeader } from '../components/UI';

const testerChecklist = [
  'Open the app on your phone and tap Load demo mode if you want the fastest tour.',
  'Save a daily check-in, then try a high-craving Rescue flow.',
  'Ask Talk: “help me create my first proof” or “I need help now”.',
  'Start Train, finish/log a routine, then open Proof and Victory Card.',
  'Send feedback on what felt confusing, what felt useful, and what would make you come back tomorrow.',
];

const demoPath = [
  { label: '0–10s', title: 'Today', detail: 'Day sober hero, one next mission, Rescue always visible.' },
  { label: '10–25s', title: 'Talk', detail: 'Type one plain-English command and show the app route the next move.' },
  { label: '25–45s', title: 'Rescue / Train', detail: 'Show emergency support or finish a starter routine into proof.' },
  { label: '45–60s', title: 'Proof', detail: 'Open Victory Card and copy the founder launch caption.' },
];

const LaunchKit = () => {
  const [copyStatus, setCopyStatus] = useState('');
  const liveUrl = window.location.origin;
  const testerMessage = `Can you test Iron Habit on your phone? ${liveUrl}\n\nTry this path:\n1. Setup or Load demo mode\n2. Save a check-in\n3. Use Rescue for a craving\n4. Ask Talk what to do next\n5. Start Train and make a Victory Card\n\nSend me 3 things: what confused you, what felt useful, and what would make you come back tomorrow.`;
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
        <p>Keep it customer-facing: Today → Talk → Rescue/Train → Proof. No internal roadmap talk, no feature explaining before the screen earns it.</p>
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
        <p>iPhone: Share → Add to Home Screen. Android/Chrome: menu → Install app. Data stays in this browser unless exported from Settings.</p>
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
