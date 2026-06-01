import assert from 'node:assert/strict';
import {
  buildMockFoodScanEstimate,
  canRunMockFoodScan,
  getFoodScanDailyLimit,
  getFoodScanUsage,
  recordMockFoodScan,
} from '../src/utils/aiFoodScan.ts';

const makeStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  };
};

const date = '2026-06-01';
const storage = makeStorage();

assert.equal(getFoodScanDailyLimit(), 3);
assert.deepEqual(getFoodScanUsage(date, storage), {
  date,
  count: 0,
  limit: 3,
  remaining: 3,
});
assert.equal(canRunMockFoodScan(date, storage), true);

recordMockFoodScan(date, storage);
recordMockFoodScan(date, storage);
const third = recordMockFoodScan(date, storage);
assert.deepEqual(third, {
  date,
  count: 3,
  limit: 3,
  remaining: 0,
});
assert.equal(canRunMockFoodScan(date, storage), false);

const chicken = buildMockFoodScanEstimate('chicken-rice-bowl.jpg');
assert.equal(chicken.name, 'Chicken rice bowl');
assert.equal(chicken.calories, 650);
assert.equal(chicken.confidence, 'Medium');
assert.match(chicken.estimateNote, /Mock scan|mock scan/i);
assert.match(chicken.estimateNote, /API key/);

const unknown = buildMockFoodScanEstimate('restaurant-photo.jpg');
assert.equal(unknown.name, 'Reviewed meal estimate');
assert.equal(unknown.confidence, 'Low');

console.log('food scan mock-mode guardrails passed');
