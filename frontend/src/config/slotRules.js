export const SLOT_RULES = {
  OPERATING_HOURS: {
    start: '08:30',
    end: '19:00',
  },
  SLOT_DURATION_MINUTES: 60,
  DAILY_MAX_APPOINTMENTS: 48, // 12 bays * 4 scheduled slots per day + emergency walk-ins
  TOTAL_BAYS: 12,
  EXPRESS_BAYS: [1, 2], // 60-minute express service bays
  GENERAL_BAYS: [3, 4, 5, 6, 7, 8, 9, 10],
  MAJOR_REPAIR_BAYS: [11, 12],
  BLOCKED_WEEKDAYS: [0], // 0 = Sunday (Closed for general service, emergency towing only)
  TIME_SLOTS: [
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '11:30 - 12:30',
    '13:30 - 14:30',
    '14:30 - 15:30',
    '15:30 - 16:30',
    '16:30 - 17:30',
    '17:30 - 18:30',
  ],
};
