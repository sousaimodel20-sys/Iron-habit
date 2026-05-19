import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const coachModes = [
  {
    id: 'craving',
    label: 'I’m craving',
    response: 'Do not negotiate with the craving. Drink water, change rooms, start a 10-minute timer, and hit Rescue. You only need to win the next 10 minutes.',
    action: '/craving-rescue',
    actionLabel: 'Start Rescue',
  },
  {
    id: 'workout',
    label: 'Build a workout',
    response: 'Push Day: 3 rounds — push-ups, dumbbell press, shoulder press, triceps dips. Keep it clean, hard, and finished in 35 minutes.',
    action: '/fitness-tracker',
    actionLabel: 'Log Training',
  },
  {
    id: 'meeting',
    label: 'Find a meeting',
    response: 'Tell me your city or neighborhood, then verify the meeting before you go. In-person support beats isolation when the fight gets real.',
    action: '/daily-check-in',
    actionLabel: 'Check In First',
  },
  {
    id: 'reset',
    label: 'I need a reset',
    response: 'No shame. No spiral. Clean the room, shower, eat protein, walk 10 minutes, then write one honest line. Reset the body before judging the mind.',
    action: '/habit-tracker',
    actionLabel: 'Stack Basics',
  },
];

const TalkCoach = () => {
  const [selected, setSelected] = useState(coachModes[0]);
  const [message, setMessage] = useState('');

  const coachReply = useMemo(() => {
    if (!message.trim()) return selected.response;

    return `Heard. Here’s the battle plan: ${selected.response} Then write this down: “I do not need to become perfect today. I need to stay in command for one more rep.”`;
  }, [message, selected]);

  return (
    <div className="page warrior-page talk-page stack-lg">
      <section className="talk-hero">
        <div className="talk-orb" aria-label="Talk microphone">
          <span />
        </div>
        <span className="talk-kicker">Battle Comms</span>
        <h1>Talk to Warrior Coach</h1>
        <p>Craving, training, meetings, motivation — say what’s happening. No judgment. Just the next move.</p>
      </section>

      <section className="talk-mode-grid" aria-label="Talk quick prompts">
        {coachModes.map((mode) => (
          <button
            key={mode.id}
            className={selected.id === mode.id ? 'selected' : ''}
            onClick={() => setSelected(mode)}
          >
            {mode.label}
          </button>
        ))}
      </section>

      <section className="coach-card">
        <div className="coach-head">
          <span>AI Sober-Fitness Coach</span>
          <b>Premium Preview</b>
        </div>
        <p>{coachReply}</p>
        <Link to={selected.action} className="btn btn-primary">{selected.actionLabel}</Link>
      </section>

      <section className="talk-input-card">
        <label htmlFor="coach-message">What’s going on?</label>
        <textarea
          id="coach-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          placeholder="Example: I’m stressed after work and want to drink. I need a plan."
        />
        <button className="btn btn-danger" onClick={() => setMessage((current) => current || selected.label)}>
          Generate Battle Plan
        </button>
      </section>

      <section className="safety-card">
        <b>If you might relapse or you feel unsafe</b>
        <span>Contact a real person now — sponsor, trusted friend, meeting, local crisis line, or emergency services. Iron Habit helps you plan the next move, but you do not fight serious moments alone.</span>
      </section>
    </div>
  );
};

export default TalkCoach;
