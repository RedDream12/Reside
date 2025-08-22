export const getDateString = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const calculateStreak = (log: Record<string, boolean>): number => {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getDateString(d);
    if (log[dateStr]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};
