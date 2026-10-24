import { describe, it, expect } from 'vitest';
import { isDateBlockedForService, getAvailableSlotsForDate } from '../lib/slots';

describe('Workshop Service Slots & Capacity Engine', () => {
  it('blocks Sunday bookings according to dealership policy', () => {
    // 2026-10-25 is a Sunday
    expect(isDateBlockedForService('2026-10-25')).toBe(true);
    // 2026-10-26 is a Monday
    expect(isDateBlockedForService('2026-10-26')).toBe(false);
  });

  it('calculates available bays for a weekday based on existing appointments', () => {
    const existingAppointments = [
      { date: '2026-10-26', timeSlot: '08:30 - 09:30', status: 'CONFIRMED' },
      { date: '2026-10-26', timeSlot: '08:30 - 09:30', status: 'CONFIRMED' },
    ];

    const slots = getAvailableSlotsForDate('2026-10-26', existingAppointments);
    expect(slots.length).toBeGreaterThan(0);

    const firstSlot = slots.find((s) => s.slot === '08:30 - 09:30');
    expect(firstSlot).toBeDefined();
    expect(firstSlot.bookedCount).toBe(2);
    expect(firstSlot.availableBays).toBe(firstSlot.capacity - 2);
    expect(firstSlot.isFull).toBe(false);
  });

  it('returns empty array when querying a blocked Sunday', () => {
    const slots = getAvailableSlotsForDate('2026-10-25', []);
    expect(slots).toEqual([]);
  });
});
