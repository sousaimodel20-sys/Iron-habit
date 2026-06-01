import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { aaCanadaImportSummary, aaCanadaMeetings } from '../src/data/aaCanadaMeetings.generated.ts';
import { aaCanadaMeetingIndex, aaCanadaMeetingIndexSummary } from '../src/data/aaCanadaMeetingIndex.generated.ts';

assert.equal(aaCanadaImportSummary.checkedAt, '2026-06-01');
assert.equal(aaCanadaImportSummary.sourceManifest, 'docs/handoffs/aa-canada-source-manifest-2026-06-01.json');
assert.ok(aaCanadaImportSummary.sourceCount >= 20);
assert.ok(aaCanadaImportSummary.fetchedSourceCount >= 20);
assert.ok(aaCanadaImportSummary.rawRows >= aaCanadaImportSummary.normalizedRows);
assert.equal(aaCanadaImportSummary.normalizedRows, aaCanadaMeetings.length);
assert.ok(aaCanadaMeetings.length > 5000);
assert.ok(aaCanadaImportSummary.provinces.includes('BC'));
assert.ok(aaCanadaImportSummary.provinces.includes('ON'));
assert.ok(aaCanadaImportSummary.provinces.includes('QC'));
assert.ok(aaCanadaImportSummary.warning.includes('Verify schedules'));

const ids = new Set(aaCanadaMeetings.map((meeting) => meeting.id));
assert.equal(ids.size, aaCanadaMeetings.length);

const requiredFields = ['id', 'program', 'name', 'day', 'time', 'address', 'city', 'province', 'sourceId', 'sourceName', 'sourceUrl', 'checkedAt'];
for (const meeting of aaCanadaMeetings) {
  for (const field of requiredFields) {
    assert.ok(String(meeting[field]).length > 0, `missing ${field} for ${meeting.id}`);
  }
  assert.equal(meeting.program, 'aa');
  assert.equal(meeting.country, 'CA');
  assert.equal(meeting.checkedAt, aaCanadaImportSummary.checkedAt);
  assert.ok(meeting.sourceUrl.startsWith('https://'));
}

assert.ok(aaCanadaMeetings.some((meeting) => meeting.sourceId === 'bcyukon-area79' && meeting.province === 'BC'));
assert.ok(aaCanadaMeetings.some((meeting) => meeting.sourceId === 'toronto' && meeting.province === 'ON'));
assert.ok(aaCanadaMeetings.some((meeting) => meeting.sourceId === 'calgary' && meeting.province === 'AB'));
assert.ok(aaCanadaMeetings.some((meeting) => meeting.sourceId === 'aa-quebec' && meeting.province === 'QC'));
assert.ok(aaCanadaMeetings.some((meeting) => meeting.conferenceUrl || meeting.latitude !== null));

assert.equal(aaCanadaMeetingIndexSummary.checkedAt, aaCanadaImportSummary.checkedAt);
assert.equal(aaCanadaMeetingIndexSummary.normalizedRows, aaCanadaImportSummary.normalizedRows);
assert.equal(aaCanadaMeetingIndexSummary.indexedRows, aaCanadaMeetingIndex.length);
assert.ok(aaCanadaMeetingIndex.length > 1000);
assert.ok(aaCanadaMeetingIndex.length < aaCanadaMeetings.length);
assert.ok(aaCanadaMeetingIndexSummary.indexPolicy.includes('starter AA rows'));
assert.ok(aaCanadaMeetingIndex.every((meeting) => meeting.program === 'aa' && meeting.checkedAt === aaCanadaImportSummary.checkedAt));
assert.ok(aaCanadaMeetingIndex.some((meeting) => meeting.sourceId === 'toronto' && meeting.province === 'ON'));
assert.ok(aaCanadaMeetingIndex.some((meeting) => meeting.sourceId === 'calgary' && meeting.province === 'AB'));
assert.ok(aaCanadaMeetingIndex.some((meeting) => meeting.sourceId === 'regina' && meeting.province === 'SK'));

const publicIndex = JSON.parse(await readFile('public/data/aa-canada-meeting-index.json', 'utf8'));
assert.equal(publicIndex.summary.indexedRows, aaCanadaMeetingIndexSummary.indexedRows);
assert.equal(publicIndex.meetings.length, aaCanadaMeetingIndex.length);
assert.ok(publicIndex.meetings.some((meeting) => meeting.sourceId === 'toronto' && meeting.province === 'ON'));

const indexBucketCounts = new Map();
for (const meeting of aaCanadaMeetingIndex) {
  const key = [meeting.sourceId, meeting.city.toLowerCase(), meeting.province].join('|');
  indexBucketCounts.set(key, (indexBucketCounts.get(key) || 0) + 1);
}
assert.ok([...indexBucketCounts.values()].every((count) => count <= 8));

const dedupeKeys = new Set();
for (const meeting of aaCanadaMeetings) {
  const key = [meeting.program, meeting.name.toLowerCase(), meeting.day, meeting.time, meeting.address.toLowerCase()].join('|');
  assert.ok(!dedupeKeys.has(key), `duplicate normalized meeting key: ${key}`);
  dedupeKeys.add(key);
}

console.log(`AA Canada import tests passed for ${aaCanadaMeetings.length} meetings`);
