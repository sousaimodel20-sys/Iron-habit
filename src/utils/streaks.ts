// Calculate sobriety streak based on daily check-ins
import { loadData } from './storage';

export const calculateSobrietyStreak = () => {
  const data = loadData();
  if (!data.checkIns) return 0;

  const dates = Object.keys(data.checkIns).sort((a, b) => (a < b ? 1 : -1));
  let streak = 0;
  let currentDate = new Date();

  for (const d of dates) {
    const checkInDate = new Date(d);
    // Calculate difference in days
    const diffTime = currentDate.getTime() - checkInDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > streak) {
      // If there is a gap in days, streak is broken
      break;
    }

    if (data.checkIns[d].sober) {
      streak += 1;
    } else {
      break;
    }

    // Move to the previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};
