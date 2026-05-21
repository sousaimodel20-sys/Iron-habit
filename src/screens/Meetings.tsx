import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Field, PageHeader } from '../components/UI';
import { loadData, saveData } from '../utils/storage';

const defaultSearch = 'Vancouver, BC';

const buildSearchUrl = (query: string, type: 'aa' | 'na' | 'smart' | 'maps') => {
  const location = query.trim() || defaultSearch;
  const terms = {
    aa: `${location} AA meetings`,
    na: `${location} NA meetings`,
    smart: `${location} SMART Recovery meetings`,
    maps: `${location} recovery meetings`,
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
  const savedSupportLocation = loadData().profile.supportLocation;
  const [query, setQuery] = useState(() => searchParams.get('q') || savedSupportLocation || defaultSearch);

  const supportCards = useMemo(() => buildSupportCards(query), [query]);
  const mapsUrl = useMemo(() => buildSearchUrl(query, 'maps'), [query]);
  const helperLabel = query.trim() ? `Searching around ${query.trim()}.` : `Searching around ${defaultSearch}.`;

  const saveSupportLocation = (location: string) => {
    const cleanLocation = location.trim() || defaultSearch;
    const current = loadData();
    saveData({ profile: { ...current.profile, supportLocation: cleanLocation } });
    return cleanLocation;
  };

  const runSearch = () => {
    const cleanQuery = saveSupportLocation(query);
    setQuery(cleanQuery);
    setSearchParams({ q: cleanQuery });
    window.open(buildSearchUrl(cleanQuery, 'maps'), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="page warrior-page meetings-page stack-lg">
      <PageHeader eyebrow="Meetings" title="Find human support before the old life gets a vote.">
        Search by city or postal code, then jump straight into AA, NA, SMART Recovery, or map-based meeting results.
      </PageHeader>

      <section className="meetings-search-card card stack-md">
        <span className="tag danger-tag">Support locator</span>
        <Field label="City or postal code">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Vancouver, BC or V6B" />
        </Field>
        <p className="meetings-note">{helperLabel} Open the map first, then use the room type below that feels safest right now.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={runSearch}>Find meetings near me</button>
          <a className="btn btn-secondary" href={mapsUrl} target="_blank" rel="noreferrer">Open meeting map</a>
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
        <p className="meetings-note">Saved support base: {savedSupportLocation || defaultSearch}. Rescue and Talk will reuse it when you do not type a city.</p>
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
        <span>Open Rescue, text someone safe, or tell Talk: “Find meetings in Vancouver” or “I’m craving.” Human support beats white-knuckling.</span>
        <div className="hero-actions">
          <Link to="/talk" className="btn btn-secondary">Talk to Coach</Link>
          <a className="btn btn-ghost" href="sms:?body=I’m riding out a craving and need support for the next 10 minutes.">Text support</a>
        </div>
      </section>
    </div>
  );
};

export default Meetings;
