import { subDays, addDays, format, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Returns an ISO timestamp relative to right now
 * Solves the critical requirement: "All seed dates are relative to today (new Date()), never fixed years"
 */
export function relativeDateIso(offsetDays = 0, hour = 10, minute = 0) {
  const now = new Date();
  const d = offsetDays >= 0 ? addDays(now, offsetDays) : subDays(now, Math.abs(offsetDays));
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function relativeDateString(offsetDays = 0) {
  return relativeDateIso(offsetDays).slice(0, 10);
}

export { subDays, addDays, format, parseISO, isAfter, isBefore };
