import { SLOT_RULES } from '../config/slotRules';
import { parseISO, isSunday, isValid } from 'date-fns';

export function isDateBlockedForService(dateInput) {
  try {
    const d = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (!isValid(d)) return true;
    if (isSunday(d)) return true; // Blocked on Sundays
    return false;
  } catch {
    return true;
  }
}

/** True when the slot's start time has already passed (past dates count as passed). */
export function isSlotInPast(dateStr, slot, now = new Date()) {
  const [h, m] = slot.split(' - ')[0].split(':').map(Number);
  const start = new Date(`${dateStr}T00:00:00`);
  start.setHours(h, m, 0, 0);
  return start < now;
}

export function getAvailableSlotsForDate(dateStr, existingAppointments = []) {
  if (isDateBlockedForService(dateStr)) {
    return [];
  }

  const appointmentsOnDate = existingAppointments.filter((a) => {
    const aDate = a.date || (a.scheduledAt ? a.scheduledAt.slice(0, 10) : '');
    return aDate === dateStr && a.status !== 'CANCELLED';
  });

  const slotCapacityPerWindow = Math.floor(SLOT_RULES.DAILY_MAX_APPOINTMENTS / SLOT_RULES.TIME_SLOTS.length); // ~5-6 bikes per slot window

  return SLOT_RULES.TIME_SLOTS.map((slot) => {
    const bookedCount = appointmentsOnDate.filter((a) => a.timeSlot === slot).length;
    const availableBays = Math.max(0, slotCapacityPerWindow - bookedCount);

    return {
      slot,
      bookedCount,
      capacity: slotCapacityPerWindow,
      availableBays,
      isFull: availableBays === 0,
    };
  });
}
