import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Field, PageHeader } from '../components/UI';
import { loadData, saveData } from '../utils/storage';
import { buildSupportSmsHref, buildSupportTelHref, getSupportContactLabel, hasSupportContact } from '../utils/support';

const buildSearchUrl = (query: string, type: 'aa' | 'na' | 'smart' | 'maps') => {
  const location = query.trim();
  const terms = {
    aa: location ? `${location} AA meetings` : 'AA meetings near me',
    na: location ? `${location} NA meetings` : 'NA meetings near me',
    smart: location ? `${location} SMART Recovery meetings` : 'SMART Recovery meetings near me',
    maps: location ? `${location} recovery meetings` : 'recovery meetings near me',
  }[type];

  return type === 'maps'
    ? `https://www.google.com/maps/search/${encodeURIComponent(terms)}`
    : `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
};

const buildSupportCards = (query: string) => [
  {
    title: 'AA meetings',
    body: 'Alcohol recovery rooms. Start here when you need sober voices around you.',
    cta: 'Search AA',
    href: buildSearchUrl(query, 'aa'),
  },
  {
    title: 'NA meetings',
    body: 'Recovery support for substance cravings, isolation, and old-pattern thinking.',
    cta: 'Search NA',
    href: buildSearchUrl(query, 'na'),
  },
  {
    title: 'SMART Recovery',
    body: 'Practical tools, peer support, and structured recovery groups if you want another lane besides AA/NA.',
    cta: 'Search SMART',
    href: buildSearchUrl(query, 'smart'),
  },
];

const Meetings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(() => loadData().profile);
  const savedSupportLocation = profile.supportLocation;
  const supportReady = hasSupportContact(profile);
  const supportContactLabel = getSupportContactLabel(profile);
  const [query, setQuery] = useState(() => searchParams.get('q') || savedSupportLocation || '');

  useEffect(() => {
    const refreshProfile = () => setProfile(loadData().profile);
    window.addEventListener('iron-habit-data-updated', refreshProfile);
    window.addEventListener('storage', refreshProfile);
    return () => {
      window.removeEventListener('iron-habit-data-updated', refreshProfile);
      window.removeEventListener('storage', refreshProfile);
    };
  }, []);

  const cleanQuery = query.trim();
  const supportCards = useMemo(() => buildSupportCards(query), [query]);
  const helperLabel = cleanQuery ? `Searching around ${cleanQuery}.` : 'Enter a city/postal code or use near-me search.';
  const primarySearchLabel = cleanQuery ? `Find meetings near ${cleanQuery}` : 'Find meetings near me';

  const saveSupportLocation = (location: string) => {
    const cleanLocation = location.trim();
    if (!cleanLocation) return '';
    const current = loadData();
    const next = saveData({ profile: { ...current.profile, supportLocation: cleanLocation } });
    setProfile(next.profile);
    return cleanLocation;
  };

  const openMeetingMap = () => {
    const cleanLocation = saveSupportLocation(query);
    setQuery(cleanLocation);
    if (cleanLocation) {
      setSearchParams({ q: cleanLocation });
    } else {
      setSearchParams({});
    }
    window.open(buildSearchUrl(cleanLocation, 'maps'), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page warrior-page meetings-page stack-lg">
      <PageHeader eyebrow="Meetings" title="Find human support before the old life gets a vote.">
        Search by city or postal code, then jump straight into AA, NA, SMART Recovery, or map-based meeting results.
      </PageHeader>

      <section className="meetings-search-card card stack-md">
        <span className="tag danger-tag">Support locator</span>
        <Field label="City or postal code">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Your city or postal code" />
        </Field>
        <p className="meetings-note">{helperLabel} Open the map first, then use the room type below that feels safest right now.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={openMeetingMap}>{primarySearchLabel}</button>
          <button className="btn btn-secondary" type="button" onClick={openMeetingMap}>Open meeting map</button>
          <Link to="/rescue" className="btn btn-danger">Open Rescue now</Link>
        </div>
        <div className="split-strip" aria-label="Quick location ideas">
          {['Vancouver, BC', 'Burnaby, BC', 'Surrey, BC', 'Richmond, BC'].map((location) => (
            <button
              key={location}
              className="meeting-chip"
              type="button"
              onClick={() => {
                const cleanLocation = saveSupportLocation(location);
                setQuery(cleanLocation);
                setSearchParams({ q: cleanLocation });
              }}
            >
              {location}
            </button>
          ))}
        </div>
        <p className="meetings-note">Saved support base: {savedSupportLocation || 'Not set yet — search once or choose a chip.'} Rescue and Talk will reuse it when you do not type a city.</p>
      </section>

      <section className="support-grid meetings-grid" aria-label="Recovery support options">
        {supportCards.map((card) => (
          <article className="support-card" key={card.title}>
            <b>{card.title}</b>
            <span>{card.body}</span>
            <a className="btn btn-ghost" href={card.href} target="_blank" rel="noreferrer">{card.cta}</a>
          </article>
        ))}
      </section>

      <section className="safety-card stack-sm">
        <b>If the urge is loud, do not browse alone.</b>
        <span>Open Rescue, text someone safe, or tell Talk: “Find meetings near me” or “I’m craving.” Human support beats white-knuckling.</span>
        <div className="hero-actions">
          <Link to="/talk" className="btn btn-secondary">Talk to Coach</Link>
          {supportReady ? (
            <>
              <a className="btn btn-danger" href={buildSupportTelHref(profile)}>Call {supportContactLabel}</a>
              <a className="btn btn-ghost" href={buildSupportSmsHref(profile, 'I’m riding out a craving and need support for the next 10 minutes.')}>Text {supportContactLabel}</a>
            </>
          ) : (
            <Link to="/setup-profile" className="btn btn-ghost">Set support contact</Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Meetings;
