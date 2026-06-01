export type AaCanadaMeetingIndexRow = {
  id: string;
  program: 'aa';
  name: string;
  day: string;
  time: string;
  endTime: string;
  timezone: string;
  location: string;
  address: string;
  city: string;
  province: string;
  country: 'CA';
  latitude: number | null;
  longitude: number | null;
  types: string[];
  conferenceUrl: string;
  sourceId: string;
  sourceName: string;
  sourceUrl: string;
  sourceMeetingId: string;
  sourceSlug: string;
  meetingUrl: string;
  updated: string;
  checkedAt: string;
};

export type AaCanadaMeetingIndexSummary = {
  checkedAt: string;
  sourceManifest: string;
  sourceCount: number;
  fetchedSourceCount: number;
  failedSourceCount: number;
  rawRows: number;
  normalizedRows: number;
  provinces: string[];
  warning: string;
  indexedRows: number;
  indexPolicy: string;
};

export type AaCanadaMeetingIndexPayload = {
  summary: AaCanadaMeetingIndexSummary;
  meetings: AaCanadaMeetingIndexRow[];
};

const emptyAaCanadaMeetingIndexSummary: AaCanadaMeetingIndexSummary = {
  checkedAt: '',
  sourceManifest: '',
  sourceCount: 0,
  fetchedSourceCount: 0,
  failedSourceCount: 0,
  rawRows: 0,
  normalizedRows: 0,
  provinces: [],
  warning: 'AA Canada starter data loads on demand. Verify schedules with source links before going.',
  indexedRows: 0,
  indexPolicy: 'AA Canada starter data is fetched only on meeting-support screens to keep the app shell light.',
};

export type MeetingProgram = 'all' | 'aa' | 'na' | 'smart' | 'other';
export type MeetingSearchTarget = Exclude<MeetingProgram, 'all'> | 'maps';

export type LoadedMeeting = {
  type: Exclude<MeetingProgram, 'all'>;
  badge: string;
  name: string;
  address: string;
  time: string;
  distance: string;
  meta: string;
  tag: string;
  intensity: string;
  nextStep: string;
  href: string;
  sourceName?: string;
  checkedAt?: string;
  isImported?: boolean;
};

export type CityMeetingLoadout = {
  city: string;
  sourceNote: string;
  meetings: LoadedMeeting[];
  isFallback: boolean;
  hasImportedData?: boolean;
};

const searchTerms: Record<MeetingSearchTarget, string> = {
  aa: 'AA meetings',
  na: 'NA meetings',
  smart: 'SMART Recovery meetings',
  other: 'recovery support meetings',
  maps: 'recovery meetings',
};

export const meetingProgramLabels: Record<MeetingProgram, string> = {
  all: 'All',
  aa: 'AA',
  na: 'NA',
  smart: 'SMART',
  other: 'Other',
};

export const cleanMeetingLocation = (location: string) => location.trim().replace(/\s+/g, ' ');

const normalizeMeetingLocation = (location: string) =>
  cleanMeetingLocation(location)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b([a-z])\.\s*([a-z])\.\s*([a-z])\./g, '$1$2$3')
    .replace(/\b([a-z])\.\s*([a-z])\./g, '$1$2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const AA_FINDER_URL = 'https://www.aa.org/find-aa';
const NA_FINDER_URL = 'https://www.na.org/meetingsearch/';
const SMART_FINDER_URL = 'https://meetings.smartrecovery.org/meetings/';
const SMART_CANADA_FINDER_URL = 'https://meetings.smartrecovery-canada.ca/meetings/';

const canadianProvinceSignals = [
  'bc',
  'ab',
  'sk',
  'mb',
  'on',
  'ont',
  'qc',
  'pq',
  'nb',
  'ns',
  'pe',
  'pei',
  'nl',
  'nt',
  'yt',
  'nu',
  'canada',
  'british columbia',
  'alberta',
  'saskatchewan',
  'manitoba',
  'ontario',
  'quebec',
  'new brunswick',
  'nova scotia',
  'prince edward island',
  'newfoundland',
  'labrador',
  'northwest territories',
  'yukon',
  'nunavut',
];

const canadianCitySignals = [
  'burnaby',
  'vancouver',
  'surrey',
  'richmond',
  'victoria',
  'kelowna',
  'west kelowna',
  'toronto',
  'gta',
  'greater toronto area',
  'calgary',
  'edmonton',
  'ottawa',
  'gatineau',
  'montreal',
  'mtl',
  'winnipeg',
  'halifax',
  'hrm',
  'mississauga',
  'brampton',
  'hamilton',
  'london',
  'kitchener',
  'waterloo',
  'windsor',
  'quebec city',
  'regina',
  'saskatoon',
  'moncton',
  'fredericton',
  'charlottetown',
  'st johns',
  'yellowknife',
  'whitehorse',
  'iqaluit',
];

const hasLocationSignal = (normalized: string, signal: string) => normalized === signal || normalized.startsWith(`${signal} `) || normalized.endsWith(` ${signal}`) || normalized.includes(` ${signal} `);

const isLikelyCanadianLocation = (location: string) => {
  const normalized = normalizeMeetingLocation(location);
  if (!normalized) return false;
  return [...canadianProvinceSignals, ...canadianCitySignals].some((signal) => hasLocationSignal(normalized, signal));
};

const aaCanadaProvinceAliases: Record<string, string> = {
  bc: 'BC',
  'british columbia': 'BC',
  ab: 'AB',
  alberta: 'AB',
  sk: 'SK',
  saskatchewan: 'SK',
  mb: 'MB',
  manitoba: 'MB',
  on: 'ON',
  ont: 'ON',
  ontario: 'ON',
  qc: 'QC',
  pq: 'QC',
  quebec: 'QC',
  nb: 'NB',
  'new brunswick': 'NB',
  ns: 'NS',
  'nova scotia': 'NS',
  pe: 'PE',
  pei: 'PE',
  'prince edward island': 'PE',
  nl: 'NL',
  newfoundland: 'NL',
  labrador: 'NL',
  yt: 'YT',
  yukon: 'YT',
  nt: 'NT',
  'northwest territories': 'NT',
  nu: 'NU',
  nunavut: 'NU',
};

const getProvinceFromLocation = (location: string) => {
  const normalized = normalizeMeetingLocation(location);
  const match = Object.entries(aaCanadaProvinceAliases).find(([signal]) => hasLocationSignal(normalized, signal));
  return match?.[1];
};

const getMeetingUrl = (meeting: AaCanadaMeetingIndexRow) => meeting.meetingUrl || meeting.sourceUrl || buildMeetingSearchUrl(`${meeting.name} ${meeting.address}`, 'maps');

const getAaCanadaDataMeetings = (location: string, aaCanadaData?: AaCanadaMeetingIndexPayload | null, limit = 8): LoadedMeeting[] => {
  const normalized = normalizeMeetingLocation(location);
  const province = getProvinceFromLocation(location);
  if (!aaCanadaData?.meetings.length || !normalized || (!province && !isLikelyCanadianLocation(location))) return [];

  const matches = aaCanadaData.meetings
    .filter((meeting) => {
      const meetingCity = normalizeMeetingLocation(meeting.city);
      const meetingAddress = normalizeMeetingLocation(meeting.address);
      const cityMatch = meetingCity && (normalized === meetingCity || normalized.includes(meetingCity) || meetingCity.includes(normalized));
      const addressMatch = meetingAddress && normalized.length >= 4 && meetingAddress.includes(normalized);
      const provinceMatch = province ? meeting.province === province : false;
      return cityMatch || addressMatch || (provinceMatch && normalized.length <= 3);
    })
    .slice(0, limit);

  return matches.map((meeting) => ({
    type: 'aa',
    badge: 'A',
    name: meeting.name,
    address: meeting.address,
    time: `${meeting.day} ${meeting.time}`,
    distance: meeting.city,
    meta: `AA Canada data • ${meeting.sourceName}`,
    tag: 'Imported source',
    intensity: 'Verify schedule',
    nextStep: 'Open source',
    href: getMeetingUrl(meeting),
    sourceName: meeting.sourceName,
    checkedAt: meeting.checkedAt,
    isImported: true,
  }));
};

export const getAaCanadaMeetingDataSummary = (aaCanadaData?: AaCanadaMeetingIndexPayload | null) => aaCanadaData?.summary || emptyAaCanadaMeetingIndexSummary;


export const buildMeetingSearchUrl = (location: string, target: MeetingSearchTarget = 'maps') => {
  const cleanLocation = cleanMeetingLocation(location);
  const query = cleanLocation ? `${cleanLocation} ${searchTerms[target]}` : `${searchTerms[target]} near me`;
  return target === 'maps'
    ? `https://www.google.com/maps/search/${encodeURIComponent(query)}`
    : `https://www.google.com/search?q=${encodeURIComponent(query)}`;
};

const buildAddressMapUrl = (name: string, address: string) => `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${address}`)}`;

export const buildMeetingSourceUrl = (program: Exclude<MeetingProgram, 'all'>, location: string) => {
  const cleanLocation = cleanMeetingLocation(location);
  if (program === 'aa') return AA_FINDER_URL;
  if (program === 'na') return NA_FINDER_URL;
  if (program === 'smart') return isLikelyCanadianLocation(cleanLocation) ? SMART_CANADA_FINDER_URL : SMART_FINDER_URL;
  return buildMeetingSearchUrl(cleanLocation, 'other');
};

export const getMeetingSearchLabel = (location: string) => {
  const cleanLocation = cleanMeetingLocation(location);
  return cleanLocation ? `Open map near ${cleanLocation}` : 'Open map near me';
};

export const getMeetingSupportSummary = (loadout: CityMeetingLoadout) => {
  const hasStarterCards = !loadout.isFallback;
  return {
    eyebrow: loadout.hasImportedData ? 'MEETING DATA LOADED' : hasStarterCards ? 'HANDOFFS LOADED' : 'MEETING HANDOFF',
    headline: loadout.hasImportedData ? `AA options near ${loadout.city}` : hasStarterCards ? `Trusted handoffs for ${loadout.city}` : `Find a room near ${loadout.city}`,
    todayLine: loadout.hasImportedData
      ? `AA meeting rows are loaded for ${loadout.city}. Verify the schedule before going.`
      : hasStarterCards
        ? `Finder cards are ready for ${loadout.city}. Verify the schedule before going.`
        : `Open trusted finder/map results for ${loadout.city}.`,
    rescueLine: hasStarterCards
      ? `Do not browse alone — open the ${loadout.city} room list and move toward people.`
      : `Do not browse alone — open map/finder results for ${loadout.city} and move toward people.`,
  };
};

const buildCanadianFinderMeetings = (city: string, aaName: string, aaHref: string, aaMeta = 'AA official local finder handoff'): LoadedMeeting[] => [
  {
    type: 'aa',
    badge: 'A',
    name: aaName,
    address: `${city} area`,
    time: 'Finder',
    distance: 'City',
    meta: aaMeta,
    tag: 'Official source',
    intensity: 'Verify schedule',
    nextStep: 'Open finder',
    href: aaHref,
  },
  {
    type: 'na',
    badge: 'NA',
    name: 'NA World Services search',
    address: `${city} area`,
    time: 'Finder',
    distance: 'Finder',
    meta: 'NA official finder handoff',
    tag: 'Trusted source',
    intensity: 'Verify schedule',
    nextStep: 'Open finder',
    href: NA_FINDER_URL,
  },
  {
    type: 'smart',
    badge: 'S',
    name: 'SMART Recovery Canada finder',
    address: `${city} / online options`,
    time: 'Finder',
    distance: 'Finder',
    meta: 'SMART Recovery Canada official finder',
    tag: 'Tools-based',
    intensity: 'Check schedule',
    nextStep: 'Open finder',
    href: SMART_CANADA_FINDER_URL,
  },
  {
    type: 'other',
    badge: '+',
    name: 'Recovery support map handoff',
    address: `${city} area`,
    time: 'Check schedule',
    distance: 'Map',
    meta: 'Map search backup for nearby support options',
    tag: 'Backup path',
    intensity: 'Confirm source',
    nextStep: 'Open map',
    href: buildMeetingSearchUrl(`${city} recovery support`, 'maps'),
  },
];

const buildCanadianStarterLoadout = (city: string, aaName: string, aaHref: string, aaMeta?: string): Omit<CityMeetingLoadout, 'isFallback'> => ({
  city,
  sourceNote: 'Canada starter handoffs use official finder/intergroup pages where available. Verify the schedule before going.',
  meetings: buildCanadianFinderMeetings(city, aaName, aaHref, aaMeta),
});

const verifiedCityMeetings: Record<string, Omit<CityMeetingLoadout, 'isFallback'>> = {
  burnaby: {
    city: 'Burnaby, BC',
    sourceNote: 'Starter cards loaded from public finder/search results. Verify time before going.',
    meetings: [
      {
        type: 'aa',
        badge: 'A',
        name: 'Burnaby Fellowship Centre',
        address: '7638 6th St, Burnaby, BC V3N 3M5',
        time: 'Daily',
        distance: 'Local',
        meta: 'AA / NA / CA meetings • 7 days',
        tag: 'Address loaded',
        intensity: 'Check schedule',
        nextStep: 'Open map first',
        href: 'https://www.burnabyfellowship.com',
      },
      {
        type: 'aa',
        badge: 'A',
        name: 'Burnaby New Life',
        address: '5050 E Hastings St, Burnaby, BC',
        time: '7:00 PM',
        distance: 'Nearby',
        meta: 'AA meeting • public finder listing',
        tag: 'Tonight option',
        intensity: 'Verify time',
        nextStep: 'Use official finder',
        href: buildAddressMapUrl('Burnaby New Life AA', '5050 E Hastings St, Burnaby, BC'),
      },
      {
        type: 'smart',
        badge: 'S',
        name: 'SMART Recovery search',
        address: 'Burnaby, BC area',
        time: 'Check current',
        distance: 'Search',
        meta: 'SMART Recovery finder',
        tag: 'Science-based',
        intensity: 'Find current room',
        nextStep: 'Open finder',
        href: SMART_CANADA_FINDER_URL,
      },
    ],
  },
  vancouver: {
    city: 'Vancouver, BC',
    sourceNote: 'Starter cards loaded from public finder/search results. Verify time before going.',
    meetings: [
      {
        type: 'aa',
        badge: 'A',
        name: 'Greater Vancouver AA Intergroup',
        address: '3457 Kingsway, Vancouver, BC V5R 5L5',
        time: 'Finder',
        distance: 'City',
        meta: 'AA meeting office / official local finder',
        tag: 'Official source',
        intensity: 'Choose room',
        nextStep: 'Open finder',
        href: 'https://vancouveraa.ca/meetings',
      },
      {
        type: 'smart',
        badge: 'S',
        name: 'SMART Recovery — Commercial Dr',
        address: '1145 Commercial Dr, Vancouver, BC',
        time: '1st/3rd Thu 1:30 PM',
        distance: 'City',
        meta: 'SMART Recovery meeting listing',
        tag: 'Tools-based',
        intensity: 'Verify date',
        nextStep: 'Check schedule',
        href: buildAddressMapUrl('SMART Recovery', '1145 Commercial Dr, Vancouver, BC'),
      },
      {
        type: 'smart',
        badge: 'S',
        name: 'SMART Recovery — East Broadway',
        address: '1669 E Broadway, Vancouver, BC',
        time: 'Mon 3:30 PM',
        distance: 'City',
        meta: 'Robert & Lily Lee Family CHC listing',
        tag: 'In-person',
        intensity: 'Verify holidays',
        nextStep: 'Open map',
        href: buildAddressMapUrl('Robert & Lily Lee Family Community Health Centre', '1669 E Broadway, Vancouver, BC'),
      },
    ],
  },
  surrey: {
    city: 'Surrey, BC',
    sourceNote: 'Starter cards loaded from public finder/search results. Verify time before going.',
    meetings: [
      {
        type: 'na',
        badge: 'NA',
        name: 'Sur-Del Easy Does It Club',
        address: '7277 King George Blvd, Surrey, BC',
        time: 'Check schedule',
        distance: 'Local',
        meta: 'AA / NA recovery clubhouse',
        tag: 'Address loaded',
        intensity: 'Verify time',
        nextStep: 'Open schedule',
        href: 'https://www.easydoesitclub.org/meetings',
      },
      {
        type: 'aa',
        badge: 'A',
        name: 'AA Surrey search',
        address: 'Surrey, BC area',
        time: 'Tonight',
        distance: 'Search',
        meta: 'AA meeting finder handoff',
        tag: 'Closest room',
        intensity: 'Verify current',
        nextStep: 'Open map',
        href: buildMeetingSearchUrl('Surrey, BC AA meetings', 'maps'),
      },
      {
        type: 'smart',
        badge: 'S',
        name: 'SMART Recovery search',
        address: 'Surrey, BC area',
        time: 'Check current',
        distance: 'Search',
        meta: 'SMART Recovery finder',
        tag: 'Backup lane',
        intensity: 'Find current room',
        nextStep: 'Open finder',
        href: SMART_CANADA_FINDER_URL,
      },
    ],
  },
  richmond: {
    city: 'Richmond, BC',
    sourceNote: 'Starter cards loaded from public finder/search results. Verify time before going.',
    meetings: [
      {
        type: 'aa',
        badge: 'A',
        name: 'AA Richmond — No. 2 Road',
        address: '7111 No. 2 Rd, Richmond, BC',
        time: 'Check schedule',
        distance: 'Local',
        meta: 'AA venue listing',
        tag: 'Address loaded',
        intensity: 'Verify time',
        nextStep: 'Open map',
        href: buildAddressMapUrl('AA meeting', '7111 No. 2 Rd, Richmond, BC'),
      },
      {
        type: 'aa',
        badge: 'A',
        name: 'Parkhouse',
        address: '5400 River Rd, Richmond, BC V7C 1A4',
        time: 'Check schedule',
        distance: 'Local',
        meta: 'AA venue listing',
        tag: 'Address loaded',
        intensity: 'Verify current',
        nextStep: 'Open map',
        href: buildAddressMapUrl('Parkhouse AA', '5400 River Rd, Richmond, BC V7C 1A4'),
      },
      {
        type: 'smart',
        badge: 'S',
        name: 'SMART Recovery Richmond search',
        address: 'Richmond, BC area',
        time: 'Check current',
        distance: 'Search',
        meta: 'SMART Recovery finder',
        tag: 'Tools-based',
        intensity: 'Find current room',
        nextStep: 'Open finder',
        href: SMART_CANADA_FINDER_URL,
      },
    ],
  },
  toronto: buildCanadianStarterLoadout(
    'Toronto, ON',
    'GTA AA Intergroup meeting finder',
    'https://www.aatoronto.org/meetings/',
  ),
  calgary: buildCanadianStarterLoadout(
    'Calgary, AB',
    'Calgary AA meeting finder',
    'https://calgaryaa.org/meetings/',
  ),
  edmonton: buildCanadianStarterLoadout(
    'Edmonton, AB',
    'Edmonton AA meeting finder',
    'https://edmontonaa.org/meetings/',
  ),
  ottawa: buildCanadianStarterLoadout(
    'Ottawa, ON',
    'Ottawa Area Intergroup finder',
    'https://ottawaaa.org/meet/',
  ),
  montreal: buildCanadianStarterLoadout(
    'Montreal, QC',
    'AA Area 87 Montreal finder',
    'https://m.aa87.org/meetings/?region=montreal',
    'AA Area 87 official finder handoff',
  ),
  winnipeg: buildCanadianStarterLoadout(
    'Winnipeg, MB',
    'AA Manitoba meeting finder',
    'https://aamanitoba.org/meetings/',
    'AA Manitoba official finder handoff',
  ),
  halifax: buildCanadianStarterLoadout(
    'Halifax, NS',
    'Halifax AA meeting finder',
    'https://www.aahalifax.org/meetings/',
  ),
  victoria: buildCanadianStarterLoadout(
    'Victoria, BC',
    'Greater Victoria AA finder',
    'https://aavictoria.ca/meetings/',
  ),
  kelowna: buildCanadianStarterLoadout(
    'Kelowna, BC',
    'BC/Yukon Area 79 Kelowna finder',
    'https://bcyukonaa.org/meetings/?tsml-day=any&tsml-region=kelowna',
    'BC/Yukon Area 79 official finder handoff',
  ),
};

const cityAliases: Record<string, keyof typeof verifiedCityMeetings> = {
  burnaby: 'burnaby',
  'burnaby bc': 'burnaby',
  'burnaby british columbia': 'burnaby',
  vancouver: 'vancouver',
  'vancouver bc': 'vancouver',
  'vancouver british columbia': 'vancouver',
  surrey: 'surrey',
  'surrey bc': 'surrey',
  'surrey british columbia': 'surrey',
  richmond: 'richmond',
  'richmond bc': 'richmond',
  'richmond british columbia': 'richmond',
  toronto: 'toronto',
  'toronto on': 'toronto',
  'toronto ont': 'toronto',
  'toronto ontario': 'toronto',
  'greater toronto area': 'toronto',
  gta: 'toronto',
  yyz: 'toronto',
  calgary: 'calgary',
  'calgary ab': 'calgary',
  'calgary alberta': 'calgary',
  yyc: 'calgary',
  edmonton: 'edmonton',
  'edmonton ab': 'edmonton',
  'edmonton alberta': 'edmonton',
  yeg: 'edmonton',
  ottawa: 'ottawa',
  'ottawa on': 'ottawa',
  'ottawa ont': 'ottawa',
  'ottawa ontario': 'ottawa',
  'ottawa gatineau': 'ottawa',
  yow: 'ottawa',
  montreal: 'montreal',
  'montreal qc': 'montreal',
  'montreal pq': 'montreal',
  'montreal quebec': 'montreal',
  mtl: 'montreal',
  yul: 'montreal',
  winnipeg: 'winnipeg',
  'winnipeg mb': 'winnipeg',
  'winnipeg manitoba': 'winnipeg',
  ywg: 'winnipeg',
  halifax: 'halifax',
  'halifax ns': 'halifax',
  'halifax nova scotia': 'halifax',
  'halifax regional municipality': 'halifax',
  hrm: 'halifax',
  yhz: 'halifax',
  victoria: 'victoria',
  'victoria bc': 'victoria',
  'victoria british columbia': 'victoria',
  'greater victoria': 'victoria',
  yyj: 'victoria',
  kelowna: 'kelowna',
  'kelowna bc': 'kelowna',
  'kelowna british columbia': 'kelowna',
  'west kelowna': 'kelowna',
  ylw: 'kelowna',
};

export const getMeetingCityKey = (location: string) => {
  const normalized = normalizeMeetingLocation(location);
  if (cityAliases[normalized]) return cityAliases[normalized];
  return Object.keys(verifiedCityMeetings).find((city) => normalized.includes(city)) as keyof typeof verifiedCityMeetings | undefined;
};

const buildFallbackMeetings = (location: string): LoadedMeeting[] => {
  const cleanLocation = cleanMeetingLocation(location) || 'your area';
  const canadaMode = isLikelyCanadianLocation(cleanLocation);
  return [
    {
      type: 'aa',
      badge: 'A',
      name: canadaMode ? 'AA Canada finder handoff' : 'AA meetings near you',
      address: `${cleanLocation} — finder/search handoff`,
      time: 'Finder',
      distance: canadaMode ? 'Finder' : 'Search',
      meta: canadaMode ? 'AA official finder handoff' : 'AA meeting map handoff',
      tag: canadaMode ? 'Trusted source' : 'Closest room',
      intensity: 'Verify schedule',
      nextStep: canadaMode ? 'Open finder' : 'Open map',
      href: canadaMode ? AA_FINDER_URL : buildMeetingSearchUrl(`${cleanLocation} AA meetings`, 'maps'),
    },
    {
      type: 'na',
      badge: 'NA',
      name: canadaMode ? 'NA World Services search' : 'NA meetings near you',
      address: `${cleanLocation} — finder/search handoff`,
      time: 'Finder',
      distance: canadaMode ? 'Finder' : 'Search',
      meta: canadaMode ? 'NA official finder handoff' : 'NA meeting map handoff',
      tag: 'Peer support',
      intensity: 'Verify schedule',
      nextStep: canadaMode ? 'Open finder' : 'Open map',
      href: canadaMode ? NA_FINDER_URL : buildMeetingSearchUrl(`${cleanLocation} NA meetings`, 'maps'),
    },
    {
      type: 'smart',
      badge: 'S',
      name: canadaMode ? 'SMART Recovery Canada finder' : 'SMART Recovery finder',
      address: `${cleanLocation} / online options`,
      time: 'Finder',
      distance: 'Finder',
      meta: canadaMode ? 'SMART Recovery Canada official finder' : 'SMART official finder handoff',
      tag: 'Tools-based',
      intensity: 'Check schedule',
      nextStep: 'Open finder',
      href: canadaMode ? SMART_CANADA_FINDER_URL : SMART_FINDER_URL,
    },
    {
      type: 'other',
      badge: '+',
      name: canadaMode ? 'Canada recovery map backup' : 'Recovery support map handoff',
      address: `${cleanLocation} — map handoff`,
      time: 'Check schedule',
      distance: 'Map',
      meta: 'Map search backup for nearby support options',
      tag: 'Backup path',
      intensity: 'Confirm source',
      nextStep: 'Open map',
      href: buildMeetingSearchUrl(`${cleanLocation} recovery support`, 'maps'),
    },
  ];
};

export const getMeetingsForLocation = (location: string, aaCanadaData?: AaCanadaMeetingIndexPayload | null): CityMeetingLoadout => {
  const cleanLocation = cleanMeetingLocation(location);
  const cityKey = getMeetingCityKey(cleanLocation);
  const aaDataMeetings = getAaCanadaDataMeetings(cleanLocation, aaCanadaData);
  const hasImportedData = aaDataMeetings.length > 0;
  if (cityKey) {
    const loadout = verifiedCityMeetings[cityKey];
    const starterMeetings = loadout.meetings.map((meeting) => ({ ...meeting })).filter((meeting) => !hasImportedData || meeting.type !== 'aa');
    return {
      ...loadout,
      sourceNote: hasImportedData
        ? `AA Canada local data loaded from ${getAaCanadaMeetingDataSummary(aaCanadaData).fetchedSourceCount} public source feeds. Verify the schedule before going.`
        : loadout.sourceNote,
      meetings: [...aaDataMeetings, ...starterMeetings],
      isFallback: false,
      hasImportedData,
    };
  }

  const city = cleanLocation || 'Add your city';
  const canadaMode = isLikelyCanadianLocation(cleanLocation);
  const fallbackMeetings = buildFallbackMeetings(cleanLocation);
  return {
    city,
    sourceNote: hasImportedData
      ? `AA Canada local data loaded from ${getAaCanadaMeetingDataSummary(aaCanadaData).fetchedSourceCount} public source feeds. Verify the schedule before going.`
      : cleanLocation
        ? canadaMode
          ? 'Canada-wide finder mode: trusted AA, NA, SMART, and map handoffs are loaded. Verify the schedule before going.'
          : 'Trusted finder/map handoffs are loaded automatically. Verify the schedule before going.'
        : 'Enter a city during setup to load meeting handoffs automatically.',
    meetings: hasImportedData ? [...aaDataMeetings, ...fallbackMeetings.filter((meeting) => meeting.type !== 'aa')] : fallbackMeetings,
    isFallback: !hasImportedData,
    hasImportedData,
  };
};
