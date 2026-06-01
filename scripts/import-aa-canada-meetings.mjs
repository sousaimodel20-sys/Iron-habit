import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const manifestPath = 'docs/handoffs/aa-canada-source-manifest-2026-06-01.json';
const generatedPath = 'src/data/aaCanadaMeetings.generated.ts';
const indexGeneratedPath = 'src/data/aaCanadaMeetingIndex.generated.ts';
const publicIndexPath = 'public/data/aa-canada-meeting-index.json';
const summaryPath = 'docs/handoffs/aa-canada-import-summary-2026-06-01.json';
const CHECKED_AT = '2026-06-01';
const FETCH_TIMEOUT_MS = 12_000;
const USER_AGENT = 'IronHabitMeetingImporter/0.1 (+https://iron-habit-vite.vercel.app)';

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const cleanText = (value) => String(value || '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const provinceFromAddress = (row, source) => {
  const haystack = `${row.formatted_address || ''} ${row.address || ''} ${row.region || ''} ${source.province_or_region || ''}`;
  const match = haystack.match(/\b(BC|YT|AB|SK|MB|ON|QC|NB|NS|NL|PE|NU|NT)\b/i);
  if (match) return match[1].toUpperCase();
  const province = String(source.province_or_region || '').split('/')[0].trim();
  return province || 'CA';
};

const firstNonEmpty = (...values) => values.find((value) => cleanText(value));

const normalizeMeeting = (row, source) => {
  const name = cleanText(row.name || 'AA meeting');
  const city = cleanText(row.city || row.region || row.regions?.[0] || source.coverage || 'Canada');
  const address = cleanText(firstNonEmpty(row.formatted_address, row.address, row.location, row.source_formatted_address, city));
  const sourceMeetingId = row.id == null ? '' : String(row.id);
  const slug = cleanText(row.slug || row.source_slug || '');
  const dayNumber = Number.isInteger(row.day) ? row.day : Number.parseInt(row.day, 10);
  const day = dayLabels[dayNumber] || cleanText(row.day || 'Check schedule');
  const time = cleanText(row.time_formatted || row.time || 'Check schedule');
  const latitude = typeof row.latitude === 'number' ? row.latitude : Number.parseFloat(row.latitude);
  const longitude = typeof row.longitude === 'number' ? row.longitude : Number.parseFloat(row.longitude);

  return {
    id: `${source.id}:${sourceMeetingId || slug || normalizeText(`${name}-${day}-${time}-${address}`)}`,
    program: 'aa',
    name,
    day,
    time,
    endTime: cleanText(row.end_time || ''),
    timezone: cleanText(row.timezone || ''),
    location: cleanText(row.location || ''),
    address,
    city,
    province: provinceFromAddress(row, source),
    country: 'CA',
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    types: Array.isArray(row.types) ? row.types.map(cleanText).filter(Boolean).sort() : [],
    conferenceUrl: cleanText(row.conference_url || ''),
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.endpoint,
    sourceMeetingId,
    sourceSlug: slug,
    meetingUrl: cleanText(row.url || ''),
    updated: cleanText(row.updated || ''),
    checkedAt: CHECKED_AT,
  };
};

const dedupeKey = (meeting) => [
  meeting.program,
  normalizeText(meeting.name),
  normalizeText(meeting.day),
  normalizeText(meeting.time),
  normalizeText(meeting.address || meeting.conferenceUrl),
].join('|');

const preferMeeting = (current, incoming) => {
  const currentScore = (current.address ? 2 : 0) + (current.meetingUrl ? 1 : 0) + (current.updated ? 1 : 0);
  const incomingScore = (incoming.address ? 2 : 0) + (incoming.meetingUrl ? 1 : 0) + (incoming.updated ? 1 : 0);
  return incomingScore > currentScore ? incoming : current;
};

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const fetchSourceRows = async (source) => {
  const attempted = [];
  for (const url of [source.endpoint, source.fallback_endpoint].filter(Boolean)) {
    attempted.push(url);
    try {
      const payload = await fetchJson(url);
      const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.meetings) ? payload.meetings : [];
      if (!rows.length) throw new Error('empty/non-array payload');
      return { rows, endpoint: url, attempted };
    } catch (error) {
      if (url === source.fallback_endpoint || !source.fallback_endpoint) {
        return { rows: [], endpoint: '', attempted, error: error instanceof Error ? error.message : String(error) };
      }
    }
  }
  return { rows: [], endpoint: '', attempted, error: 'no endpoint' };
};

const buildGeneratedModule = (meetings, summary) => `// Generated by scripts/import-aa-canada-meetings.mjs. Do not edit by hand.\n\nexport type AaCanadaMeeting = {\n  id: string;\n  program: 'aa';\n  name: string;\n  day: string;\n  time: string;\n  endTime: string;\n  timezone: string;\n  location: string;\n  address: string;\n  city: string;\n  province: string;\n  country: 'CA';\n  latitude: number | null;\n  longitude: number | null;\n  types: string[];\n  conferenceUrl: string;\n  sourceId: string;\n  sourceName: string;\n  sourceUrl: string;\n  sourceMeetingId: string;\n  sourceSlug: string;\n  meetingUrl: string;\n  updated: string;\n  checkedAt: string;\n};\n\nexport const aaCanadaImportSummary = ${JSON.stringify(summary, null, 2)} as const;\n\nexport const aaCanadaMeetings = ${JSON.stringify(meetings, null, 2)} satisfies AaCanadaMeeting[];\n`;

const INDEX_ROW_LIMIT_PER_BUCKET = 8;

const buildStarterIndex = (meetings) => {
  const buckets = new Map();
  for (const meeting of meetings) {
    const key = [meeting.sourceId, normalizeText(meeting.city), meeting.province].join('|');
    const bucket = buckets.get(key) || [];
    if (bucket.length < INDEX_ROW_LIMIT_PER_BUCKET) {
      bucket.push(meeting);
      buckets.set(key, bucket);
    }
  }
  return [...buckets.values()].flat();
};

const buildPublicIndexJson = (meetings, summary) => `${JSON.stringify({ summary, meetings }, null, 2)}\n`;

const buildIndexGeneratedModule = (meetings, summary) => `// Generated by scripts/import-aa-canada-meetings.mjs for test/import verification. Runtime fetches public/data/aa-canada-meeting-index.json so the starter index stays out of the app shell bundle. Do not edit by hand.\n\nexport type AaCanadaMeetingIndexRow = {\n  id: string;\n  program: 'aa';\n  name: string;\n  day: string;\n  time: string;\n  endTime: string;\n  timezone: string;\n  location: string;\n  address: string;\n  city: string;\n  province: string;\n  country: 'CA';\n  latitude: number | null;\n  longitude: number | null;\n  types: string[];\n  conferenceUrl: string;\n  sourceId: string;\n  sourceName: string;\n  sourceUrl: string;\n  sourceMeetingId: string;\n  sourceSlug: string;\n  meetingUrl: string;\n  updated: string;\n  checkedAt: string;\n};\n\nexport const aaCanadaMeetingIndexSummary = ${JSON.stringify(summary, null, 2)} as const;\n\nexport const aaCanadaMeetingIndex = ${JSON.stringify(meetings, null, 2)} satisfies AaCanadaMeetingIndexRow[];\n`;

const main = async () => {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const sources = manifest.sources.filter((source) => source.import_priority === 'primary');
  const byDedupeKey = new Map();
  const sourceResults = [];

  for (const source of sources) {
    const result = await fetchSourceRows(source);
    sourceResults.push({
      id: source.id,
      name: source.name,
      priority: source.import_priority,
      endpointUsed: result.endpoint,
      attempted: result.attempted,
      rawRows: result.rows.length,
      expectedRows: source.observed_count || null,
      error: result.error || '',
    });

    for (const row of result.rows) {
      const meeting = normalizeMeeting(row, { ...source, endpoint: result.endpoint || source.endpoint });
      const key = dedupeKey(meeting);
      const current = byDedupeKey.get(key);
      byDedupeKey.set(key, current ? preferMeeting(current, meeting) : meeting);
    }
  }

  const meetings = [...byDedupeKey.values()].sort((a, b) =>
    a.province.localeCompare(b.province) || a.city.localeCompare(b.city) || a.day.localeCompare(b.day) || a.time.localeCompare(b.time) || a.name.localeCompare(b.name),
  );

  const summary = {
    checkedAt: CHECKED_AT,
    sourceManifest: manifestPath,
    sourceCount: sources.length,
    fetchedSourceCount: sourceResults.filter((source) => source.rawRows > 0).length,
    failedSourceCount: sourceResults.filter((source) => source.rawRows === 0).length,
    rawRows: sourceResults.reduce((total, source) => total + source.rawRows, 0),
    normalizedRows: meetings.length,
    provinces: [...new Set(meetings.map((meeting) => meeting.province))].sort(),
    warning: 'Starter AA Canada local dataset. Verify schedules with source links before going; feeds can change.',
  };

  const meetingIndex = buildStarterIndex(meetings);
  const indexSummary = {
    ...summary,
    indexedRows: meetingIndex.length,
    indexPolicy: `Up to ${INDEX_ROW_LIMIT_PER_BUCKET} starter AA rows per source/city/province bucket for the shipped client bundle.`,
  };

  await mkdir(path.dirname(generatedPath), { recursive: true });
  await mkdir(path.dirname(summaryPath), { recursive: true });
  await mkdir(path.dirname(publicIndexPath), { recursive: true });
  await writeFile(generatedPath, buildGeneratedModule(meetings, summary));
  await writeFile(indexGeneratedPath, buildIndexGeneratedModule(meetingIndex, indexSummary));
  await writeFile(publicIndexPath, buildPublicIndexJson(meetingIndex, indexSummary));
  await writeFile(summaryPath, `${JSON.stringify({ ...summary, sources: sourceResults }, null, 2)}\n`);
  console.log(`Imported ${summary.normalizedRows} AA Canada meetings from ${summary.fetchedSourceCount}/${summary.sourceCount} primary sources (${summary.failedSourceCount} failed/skipped).`);
  console.log(`Wrote ${generatedPath}`);
  console.log(`Wrote ${indexGeneratedPath} (${meetingIndex.length} starter rows)`);
  console.log(`Wrote ${publicIndexPath} (${meetingIndex.length} starter rows)`);
  console.log(`Wrote ${summaryPath}`);
};

await main();
