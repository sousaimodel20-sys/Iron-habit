import assert from 'node:assert/strict';
import {
  estimateSobrietyDate,
  normalizeSoberDateInput,
  resolveSobrietyDate,
} from '../src/utils/launchOnboarding.ts';

const fixedToday = new Date(2026, 5, 1);

assert.equal(normalizeSoberDateInput('2025-06-01'), '2025-06-01');
assert.equal(normalizeSoberDateInput('2025-6-1'), '2025-06-01');
assert.equal(normalizeSoberDateInput('06/01/2025'), '2025-06-01');
assert.equal(normalizeSoberDateInput('6/1/25'), '2025-06-01');
assert.equal(normalizeSoberDateInput('2025-02-31'), '');
assert.equal(normalizeSoberDateInput(''), '');

assert.equal(estimateSobrietyDate('today', fixedToday), '2026-06-01');
assert.equal(estimateSobrietyDate('few-days', fixedToday), '2026-05-29');
assert.equal(estimateSobrietyDate('weeks', fixedToday), '2026-05-11');
assert.equal(estimateSobrietyDate('months', fixedToday), '2026-03-03');

assert.equal(
  resolveSobrietyDate({ enteredDate: '6/1/25', baseline: 'today', savedDate: '2024-01-01', todayKey: '2026-06-01' }),
  '2025-06-01',
);
assert.equal(
  resolveSobrietyDate({ enteredDate: '', baseline: 'weeks', savedDate: '2024-01-01', todayKey: '2026-06-01' }),
  estimateSobrietyDate('weeks'),
);

console.log('launch onboarding date tests passed');
