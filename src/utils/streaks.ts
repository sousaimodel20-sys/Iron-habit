import { loadData } from './storage';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const daysBetween = (start: string, end = toDateKey(new Date())) => {
  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1);
};

export const calculateSobrietyStreak = () => {
  const data = loadData();
  const today = new Date();
  let streak = 0;

  for (let offset = 0; offset < 3660; offset += 1) {
    const cursor = new Date(today);
    cursor.setDate(today.getDate() - offset);
    const key = toDateKey(cursor);
    const checkIn = data.checkIns[key];

    if (!checkIn) {
      if (offset === 0) continue;
      break;
    }

    if (!checkIn.sober) break;
    streak += 1;
  }

  const profileDays = data.profile.sobrietyDate ? daysBetween(data.profile.sobrietyDate) : 0;
  return Math.max(streak, profileDays);
};

export const getCompletionRate = () => {
  const data = loadData();
  const checkIns = Object.values(data.checkIns);
  if (!checkIns.length) return 0;
  const completed = checkIns.filter((entry) => entry.sober && entry.habitsCompleted.length > 0).length;
  return Math.round((completed / checkIns.length) * 100);
};
