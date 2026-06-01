import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  buildMeetingSearchUrl,
  buildMeetingSourceUrl,
  cleanMeetingLocation,
  getMeetingSearchLabel,
  getMeetingSupportSummary,
  getAaCanadaMeetingDataSummary,
  getMeetingsForLocation,
  meetingTimeFilterLabels,
  filterMeetingsByTimeIntent,
} from '../src/utils/meetings.ts';

const aaCanadaData = JSON.parse(await readFile('public/data/aa-canada-meeting-index.json', 'utf8'));

assert.equal(cleanMeetingLocation('  Vancouver   BC  '), 'Vancouver BC');
assert.equal(getMeetingSearchLabel('Burnaby, BC'), 'Open map near Burnaby, BC');
assert.equal(getMeetingSearchLabel(''), 'Open map near me');
assert.equal(
  buildMeetingSearchUrl('Burnaby, BC', 'maps'),
  'https://www.google.com/maps/search/Burnaby%2C%20BC%20recovery%20meetings',
);
assert.equal(
  buildMeetingSearchUrl('', 'aa'),
  'https://www.google.com/search?q=AA%20meetings%20near%20me',
);
assert.equal(
  buildMeetingSearchUrl('Open AA Room Burnaby, BC', 'aa'),
  'https://www.google.com/search?q=Open%20AA%20Room%20Burnaby%2C%20BC%20AA%20meetings',
);
assert.equal(buildMeetingSourceUrl('aa', 'Burnaby, BC'), 'https://www.aa.org/find-aa');
assert.equal(buildMeetingSourceUrl('na', 'Burnaby, BC'), 'https://www.na.org/meetingsearch/');
assert.equal(buildMeetingSourceUrl('smart', 'Burnaby, BC'), 'https://meetings.smartrecovery-canada.ca/meetings/');
assert.equal(buildMeetingSourceUrl('smart', 'Austin, TX'), 'https://meetings.smartrecovery.org/meetings/');
assert.equal(
  buildMeetingSourceUrl('other', 'Burnaby, BC'),
  'https://www.google.com/search?q=Burnaby%2C%20BC%20recovery%20support%20meetings',
);

const burnaby = getMeetingsForLocation('Burnaby, BC');
assert.equal(burnaby.isFallback, false);
assert.equal(burnaby.city, 'Burnaby, BC');
assert.ok(burnaby.meetings.some((meeting) => meeting.address.includes('7638 6th St')));
assert.ok(burnaby.meetings.every((meeting) => meeting.address.length > 0));
const burnabySupport = getMeetingSupportSummary(burnaby);
assert.equal(burnabySupport.eyebrow, 'TRUSTED HANDOFFS');
assert.equal(burnabySupport.headline, 'Trusted handoffs for Burnaby, BC');
assert.ok(burnabySupport.todayLine.includes('Verify the schedule'));
assert.ok(burnabySupport.rescueLine.includes('Do not browse alone'));

const burnabyAlias = getMeetingsForLocation('burnaby british columbia');
assert.equal(burnabyAlias.city, 'Burnaby, BC');

const vancouver = getMeetingsForLocation('Vancouver');
assert.equal(vancouver.isFallback, false);
assert.ok(vancouver.meetings.some((meeting) => meeting.address.includes('3457 Kingsway')));
assert.ok(vancouver.meetings.some((meeting) => meeting.type === 'smart'));

const finderOnlyTimes = new Set(['Finder', 'Check schedule']);
const canadaStarterCities = [
  ['Toronto ON', 'Toronto, ON'],
  ['Calgary, Alberta', 'Calgary, AB'],
  ['Montréal, Québec', 'Montreal, QC'],
  ['Regina, SK', 'Regina, SK'],
];

for (const [input, expectedCity] of canadaStarterCities) {
  const loadout = getMeetingsForLocation(input, aaCanadaData);
  assert.equal(loadout.isFallback, false);
  assert.equal(loadout.city, expectedCity);
  assert.equal(loadout.hasImportedData, true);
  assert.ok(loadout.sourceNote.includes('AA Canada starter data'));
  assert.ok(loadout.meetings.some((meeting) => meeting.type === 'aa' && meeting.isImported));
  assert.ok(loadout.meetings.some((meeting) => meeting.type === 'na' && meeting.href === 'https://www.na.org/meetingsearch/'));
  assert.ok(loadout.meetings.some((meeting) => meeting.type === 'smart' && meeting.href === 'https://meetings.smartrecovery-canada.ca/meetings/'));
  assert.ok(loadout.meetings.filter((meeting) => !meeting.isImported).every((meeting) => finderOnlyTimes.has(meeting.time)));
}

assert.equal(getMeetingsForLocation('yyc').city, 'Calgary, AB');
assert.equal(getMeetingsForLocation('YHZ').city, 'Halifax, NS');
assert.equal(getMeetingsForLocation('Victoria, B.C.').city, 'Victoria, BC');
assert.equal(getMeetingsForLocation('west kelowna').city, 'Kelowna, BC');

const kelowna = getMeetingsForLocation('Kelowna, BC', aaCanadaData);
assert.equal(kelowna.isFallback, false);
assert.equal(kelowna.city, 'Kelowna, BC');
assert.equal(kelowna.hasImportedData, true);
assert.ok(kelowna.sourceNote.includes('AA Canada starter data'));
assert.ok(kelowna.meetings.some((meeting) => meeting.isImported && meeting.href.includes('bcyukonaa.org/meetings')));
const kelownaSupport = getMeetingSupportSummary(kelowna);
assert.equal(kelownaSupport.eyebrow, 'LOCAL AA DATA');
assert.equal(kelownaSupport.headline, 'AA options near Kelowna, BC');

const unknown = getMeetingsForLocation('Moose Jaw, SK', aaCanadaData);
assert.equal(unknown.isFallback, true);
assert.equal(unknown.city, 'Moose Jaw, SK');
assert.ok(unknown.sourceNote.includes('Canada-wide finder mode'));
assert.ok(unknown.meetings.every((meeting) => meeting.address.includes('Moose Jaw, SK')));
assert.ok(unknown.meetings.every((meeting) => meeting.href.startsWith('https://')));
assert.ok(unknown.meetings.every((meeting) => finderOnlyTimes.has(meeting.time)));
assert.ok(unknown.meetings.some((meeting) => meeting.name === 'AA Canada finder handoff'));
assert.ok(unknown.meetings.some((meeting) => meeting.href === 'https://meetings.smartrecovery-canada.ca/meetings/'));
const unknownSupport = getMeetingSupportSummary(unknown);
assert.equal(unknownSupport.eyebrow, 'MEETING HANDOFF');
assert.equal(unknownSupport.headline, 'Find a room near Moose Jaw, SK');

const regina = getMeetingsForLocation('Regina, SK', aaCanadaData);
assert.equal(regina.isFallback, false);
assert.equal(regina.hasImportedData, true);
assert.ok(regina.meetings.some((meeting) => meeting.isImported && meeting.sourceName.includes('Regina')));

assert.equal(meetingTimeFilterLabels.all, 'All');
assert.equal(meetingTimeFilterLabels.today, 'Today');
const mondayMeetings = [
  { type: 'aa', badge: 'A', name: 'Monday noon room', address: '123 Main St', time: 'Monday 12:00 PM', distance: 'Local', meta: 'AA Canada data', tag: 'Imported', intensity: 'Verify schedule', nextStep: 'Open source', href: 'https://example.com/mon' },
  { type: 'aa', badge: 'A', name: 'Tuesday room', address: '123 Main St', time: 'Tuesday 12:00 PM', distance: 'Local', meta: 'AA Canada data', tag: 'Imported', intensity: 'Verify schedule', nextStep: 'Open source', href: 'https://example.com/tue' },
  { type: 'aa', badge: 'A', name: 'Night room', address: '456 Main St', time: 'Friday 8:30 PM', distance: 'Local', meta: 'AA Canada data', tag: 'Imported', intensity: 'Verify schedule', nextStep: 'Open source', href: 'https://example.com/night' },
  { type: 'smart', badge: 'S', name: 'Online SMART', address: 'Online / phone', time: 'Check schedule', distance: 'Online', meta: 'SMART Recovery online finder', tag: 'Tools', intensity: 'Check schedule', nextStep: 'Open finder', href: 'https://meetings.smartrecovery.org/meetings/' },
  { type: 'other', badge: '+', name: 'Map handoff', address: '789 Main St', time: 'Finder', distance: 'Map', meta: 'Map search backup', tag: 'Backup', intensity: 'Confirm source', nextStep: 'Open map', href: 'https://www.google.com/maps/search/test' },
];
const monday = new Date('2026-06-01T12:00:00-07:00');
assert.deepEqual(filterMeetingsByTimeIntent(mondayMeetings, 'today', monday).map((meeting) => meeting.name), ['Monday noon room']);
assert.deepEqual(filterMeetingsByTimeIntent(mondayMeetings, 'tonight', monday).map((meeting) => meeting.name), ['Night room']);
assert.deepEqual(filterMeetingsByTimeIntent(mondayMeetings, 'online', monday).map((meeting) => meeting.name), ['Online SMART']);
assert.deepEqual(filterMeetingsByTimeIntent(mondayMeetings, 'inPerson', monday).map((meeting) => meeting.name), ['Monday noon room', 'Tuesday room', 'Night room', 'Map handoff']);

const unloadedSummary = getAaCanadaMeetingDataSummary();
assert.equal(unloadedSummary.indexedRows, 0);

const dataSummary = getAaCanadaMeetingDataSummary(aaCanadaData);
assert.equal(dataSummary.normalizedRows, 5770);
assert.ok(dataSummary.warning.includes('Verify schedules'));

console.log('meeting locator tests passed');
