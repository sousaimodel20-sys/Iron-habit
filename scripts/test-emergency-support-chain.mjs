import assert from 'node:assert/strict';
import {
  buildEmergencyCommandCheckIn,
  emergencyRescuePath,
  isEmergencySupportCommand,
  parseEmergencyCravingLevel,
  wantsEmergencyMeetings,
  wantsEmergencySupportCall,
  wantsEmergencySupportText,
} from '../src/utils/emergencySupportChain.ts';

assert.equal(emergencyRescuePath, '/rescue?chain=1');
assert.equal(parseEmergencyCravingLevel('craving 8/10', 10), 8);
assert.equal(parseEmergencyCravingLevel('urge is 10', 7), 10);
assert.equal(parseEmergencyCravingLevel('I am about to drink', 10), 10);

assert.equal(isEmergencySupportCommand('I am about to drink text my support person'), true);
assert.equal(wantsEmergencySupportText('I am about to drink text my support person'), true);
assert.equal(wantsEmergencySupportCall('Call my sponsor I might drink'), true);
assert.equal(wantsEmergencyMeetings('emergency meetings near Surrey'), true);
assert.equal(isEmergencySupportCommand('build me a workout'), false);

const checkIn = buildEmergencyCommandCheckIn({
  todayKey: '2026-05-24',
  rawCommand: 'I am about to drink text my support person',
  existing: {
    date: '2026-05-24',
    sober: true,
    mood: 'Restless',
    craving: 4,
    habitsCompleted: ['Water'],
    note: 'Earlier check-in',
  },
});

assert.equal(checkIn.sober, true);
assert.equal(checkIn.mood, 'Emergency rescue');
assert.equal(checkIn.craving, 10);
assert.deepEqual(checkIn.habitsCompleted, ['Water', 'No alcohol', 'Emergency support chain']);
assert.match(checkIn.note, /Earlier check-in/);
assert.match(checkIn.note, /Emergency command from Talk/);

console.log('emergency support chain tests passed');
