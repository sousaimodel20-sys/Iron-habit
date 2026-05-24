import type { CheckIn, CompletedLoadout } from './storage';

export const isCravingRescueReceipt = (entry: CheckIn) => {
  const note = entry.note.toLowerCase();
  return entry.sober && (entry.craving >= 7 || note.includes('rescue') || note.includes('craving'));
};

export const getCravingReceipts = (checkIns: Record<string, CheckIn>, limit = 3) => Object.values(checkIns)
  .filter(isCravingRescueReceipt)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, limit);

export const getProofStack = (completedLoadouts: CompletedLoadout[], limit = 5) => [...completedLoadouts]
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, limit);

export const getLatestProof = (selectedProof: CompletedLoadout | null, completedLoadouts: CompletedLoadout[]) =>
  selectedProof || getProofStack(completedLoadouts, 1)[0] || null;
