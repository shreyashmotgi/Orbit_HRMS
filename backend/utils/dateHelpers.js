// Normalizes any Date to midnight UTC - used as a consistent key for day-based comparisons.
function toDateKey(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function isSunday(date) {
  return new Date(date).getUTCDay() === 0;
}

// Inclusive count of calendar days between two dates.
function daysBetweenInclusive(fromDate, toDate) {
  const from = toDateKey(fromDate);
  const to = toDateKey(toDate);
  const diffMs = to.getTime() - from.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

// Total leave days for a leave application: half day = 0.5, otherwise inclusive day count.
function calculateLeaveTotalDays({ fromDate, toDate, isHalfDay }) {
  if (isHalfDay) return 0.5;
  return daysBetweenInclusive(fromDate, toDate);
}

module.exports = { toDateKey, isSunday, daysBetweenInclusive, calculateLeaveTotalDays };
