import assert from 'node:assert/strict';
import {
  buildMeetingSearchUrl,
  buildMeetingSourceUrl,
  cleanMeetingLocation,
  getMeetingSearchLabel,
  getMeetingsForLocation,
} from '../src/utils/meetings.ts';

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
assert.equal(buildMeetingSourceUrl('smart', 'Burnaby, BC'), 'https://meetings.smartrecovery.org/meetings/');
assert.equal(
  buildMeetingSourceUrl('other', 'Burnaby, BC'),
  'https://www.google.com/search?q=Burnaby%2C%20BC%20recovery%20support%20meetings',
);

const burnaby = getMeetingsForLocation('Burnaby, BC');
assert.equal(burnaby.isFallback, false);
assert.equal(burnaby.city, 'Burnaby, BC');
assert.ok(burnaby.meetings.some((meeting) => meeting.address.includes('7638 6th St')));
assert.ok(burnaby.meetings.every((meeting) => meeting.address.length > 0));

const burnabyAlias = getMeetingsForLocation('burnaby british columbia');
assert.equal(burnabyAlias.city, 'Burnaby, BC');

const vancouver = getMeetingsForLocation('Vancouver');
assert.equal(vancouver.isFallback, false);
assert.ok(vancouver.meetings.some((meeting) => meeting.address.includes('3457 Kingsway')));
assert.ok(vancouver.meetings.some((meeting) => meeting.type === 'smart'));

const unknown = getMeetingsForLocation('Kelowna, BC');
assert.equal(unknown.isFallback, true);
assert.equal(unknown.city, 'Kelowna, BC');
assert.ok(unknown.meetings.every((meeting) => meeting.address.includes('Kelowna, BC')));
assert.ok(unknown.meetings.every((meeting) => meeting.href.startsWith('https://')));

console.log('meeting locator tests passed');
