import assert from 'node:assert/strict';
import { getCravingReceipts, getLatestProof, getProofStack } from '../src/utils/proofReceipts.ts';

const checkIns = {
  '2026-05-21': { date: '2026-05-21', sober: true, mood: 'Steady', craving: 2, note: 'Normal day', habitsCompleted: [] },
  '2026-05-22': { date: '2026-05-22', sober: true, mood: 'Emergency rescue', craving: 10, note: 'Emergency rescue started.', habitsCompleted: [] },
  '2026-05-23': { date: '2026-05-23', sober: false, mood: 'Restarting', craving: 9, note: 'Craving happened but I slipped.', habitsCompleted: [] },
  '2026-05-24': { date: '2026-05-24', sober: true, mood: 'Rescue win', craving: 3, note: 'Rescue win logged: craving wave passed.', habitsCompleted: [] },
};

const receipts = getCravingReceipts(checkIns, 3);
assert.deepEqual(receipts.map((receipt) => receipt.date), ['2026-05-24', '2026-05-22']);
assert.equal(receipts[0].mood, 'Rescue win');
assert.equal(receipts[1].craving, 10);

const proofA = { id: 'a', date: '2026-05-20', title: 'Older Lift', label: 'PPL', activeDay: 'Push', durationMinutes: 35, intensity: 'Hard', exercises: ['Press'], completedSets: 5, totalSets: 6, finisher: 'Walk', proofCopy: 'Older proof.' };
const proofB = { id: 'b', date: '2026-05-24', title: 'Newest Lift', label: 'PPL', activeDay: 'Pull', durationMinutes: 45, intensity: 'Hard', exercises: ['Row'], completedSets: 6, totalSets: 6, finisher: 'Walk', proofCopy: 'Newest proof.' };
const proofC = { id: 'c', date: '2026-05-22', title: 'Middle Lift', label: 'PPL', activeDay: 'Legs', durationMinutes: 40, intensity: 'Moderate', exercises: ['Squat'], completedSets: 4, totalSets: 5, finisher: 'Walk', proofCopy: 'Middle proof.' };

assert.deepEqual(getProofStack([proofA, proofB, proofC], 2).map((proof) => proof.id), ['b', 'c']);
assert.equal(getLatestProof(null, [proofA, proofB, proofC])?.id, 'b');
assert.equal(getLatestProof(proofA, [proofB, proofC])?.id, 'a');

console.log('proof receipt tests passed');
