import { Link } from 'react-router-dom';
import { Field, PageHeader } from '../components/UI';

const supportCards = [
  {
    title: 'AA meetings',
    body: 'Alcohol recovery rooms. Start here when you need sober voices around you.',
  },
  {
    title: 'NA meetings',
    body: 'Recovery support for substance cravings, isolation, and old-pattern thinking.',
  },
  {
    title: 'Recovery groups',
    body: 'SMART, peer support, church/community groups, or any room that keeps you alive and honest.',
  },
];

const Meetings = () => (
  <div className="page warrior-page meetings-page stack-lg">
    <PageHeader eyebrow="Meetings" title="Find human support before the old life gets a vote.">
      Search by city or postal code. Live map search is coming next; for now this keeps the recovery lane obvious and one tap away.
    </PageHeader>

    <section className="meetings-search-card card stack-md">
      <span className="tag danger-tag">Support locator</span>
      <Field label="City or postal code">
        <input placeholder="Vancouver, BC or V6B" />
      </Field>
      <div className="hero-actions">
        <button className="btn btn-primary" type="button">Find meetings near me</button>
        <Link to="/rescue" className="btn btn-danger">Open Rescue now</Link>
      </div>
      <p className="meetings-note">MVP note: meeting search is a guided placeholder until we connect a free recovery meeting directory or location source.</p>
    </section>

    <section className="support-grid meetings-grid" aria-label="Recovery support options">
      {supportCards.map((card) => (
        <article className="support-card" key={card.title}>
          <b>{card.title}</b>
          <span>{card.body}</span>
        </article>
      ))}
    </section>

    <section className="safety-card stack-sm">
      <b>If the urge is loud, do not browse alone.</b>
      <span>Open Rescue, text someone safe, or tell Talk: “I’m craving.” Human support beats white-knuckling.</span>
      <div className="hero-actions">
        <Link to="/talk" className="btn btn-secondary">Talk to Coach</Link>
        <a className="btn btn-ghost" href="sms:?body=I’m riding out a craving and need support for the next 10 minutes.">Text support</a>
      </div>
    </section>
  </div>
);

export default Meetings;
