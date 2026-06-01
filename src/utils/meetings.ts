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
};

export type CityMeetingLoadout = {
  city: string;
  sourceNote: string;
  meetings: LoadedMeeting[];
  isFallback: boolean;
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

const normalizeMeetingLocation = (location: string) => cleanMeetingLocation(location).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

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
  if (program === 'aa') return 'https://www.aa.org/find-aa';
  if (program === 'na') return 'https://www.na.org/meetingsearch/';
  if (program === 'smart') return 'https://meetings.smartrecovery.org/meetings/';
  return buildMeetingSearchUrl(cleanLocation, 'other');
};

export const getMeetingSearchLabel = (location: string) => {
  const cleanLocation = cleanMeetingLocation(location);
  return cleanLocation ? `Open map near ${cleanLocation}` : 'Open map near me';
};

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
        href: 'https://meetings.smartrecovery.org/meetings/',
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
        href: 'https://meetings.smartrecovery.org/meetings/',
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
        href: 'https://meetings.smartrecovery.org/meetings/',
      },
    ],
  },
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
};

export const getMeetingCityKey = (location: string) => {
  const normalized = normalizeMeetingLocation(location);
  if (cityAliases[normalized]) return cityAliases[normalized];
  return Object.keys(verifiedCityMeetings).find((city) => normalized.includes(city)) as keyof typeof verifiedCityMeetings | undefined;
};

const buildFallbackMeetings = (location: string): LoadedMeeting[] => {
  const cleanLocation = cleanMeetingLocation(location) || 'your area';
  return [
    {
      type: 'aa',
      badge: 'A',
      name: 'AA meetings near you',
      address: `${cleanLocation} — open map for exact addresses`,
      time: 'Tonight',
      distance: 'Search',
      meta: 'AA meeting map handoff',
      tag: 'Closest room',
      intensity: 'Verify current',
      nextStep: 'Open map',
      href: buildMeetingSearchUrl(`${cleanLocation} AA meetings`, 'maps'),
    },
    {
      type: 'na',
      badge: 'NA',
      name: 'NA meetings near you',
      address: `${cleanLocation} — open map for exact addresses`,
      time: 'Tonight',
      distance: 'Search',
      meta: 'NA meeting map handoff',
      tag: 'Peer support',
      intensity: 'Verify current',
      nextStep: 'Open map',
      href: buildMeetingSearchUrl(`${cleanLocation} NA meetings`, 'maps'),
    },
    {
      type: 'smart',
      badge: 'S',
      name: 'SMART Recovery finder',
      address: `${cleanLocation} / online options`,
      time: 'Check current',
      distance: 'Finder',
      meta: 'SMART official finder handoff',
      tag: 'Tools-based',
      intensity: 'Find current room',
      nextStep: 'Open finder',
      href: 'https://meetings.smartrecovery.org/meetings/',
    },
  ];
};

export const getMeetingsForLocation = (location: string): CityMeetingLoadout => {
  const cleanLocation = cleanMeetingLocation(location);
  const cityKey = getMeetingCityKey(cleanLocation);
  if (cityKey) {
    const loadout = verifiedCityMeetings[cityKey];
    return { ...loadout, meetings: loadout.meetings.map((meeting) => ({ ...meeting })), isFallback: false };
  }

  const city = cleanLocation || 'Add your city';
  return {
    city,
    sourceNote: cleanLocation
      ? 'No starter address list for this city yet. Map/search handoffs are loaded automatically.'
      : 'Enter a city during setup to load meeting handoffs automatically.',
    meetings: buildFallbackMeetings(cleanLocation),
    isFallback: true,
  };
};
