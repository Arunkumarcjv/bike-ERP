import { describe, it, expect } from 'vitest';
import { selectBayStats } from '../store/selectors/bayStats';

describe('A2: Bay Statistics Mutually Exclusive Sum Invariant', () => {
  it('guarantees that categories are mutually exclusive and ALWAYS sum to total bays', () => {
    const mockState = {
      bays: [
        { bayNumber: 1, activeJobCardId: 'jc-1', status: 'OCCUPIED' },
        { bayNumber: 2, activeJobCardId: 'jc-2', status: 'OCCUPIED' },
        { bayNumber: 3, activeJobCardId: 'jc-3', status: 'OCCUPIED' },
        { bayNumber: 4, activeJobCardId: 'jc-4', status: 'OCCUPIED' },
        { bayNumber: 5, activeJobCardId: 'jc-5', status: 'OCCUPIED' },
        { bayNumber: 6, activeJobCardId: 'jc-6', status: 'OCCUPIED' },
        { bayNumber: 7, activeJobCardId: null, status: 'FREE' },
        { bayNumber: 8, activeJobCardId: null, status: 'FREE' },
        { bayNumber: 9, activeJobCardId: null, status: 'FREE' },
        { bayNumber: 10, activeJobCardId: null, status: 'FREE' },
        { bayNumber: 11, activeJobCardId: null, status: 'FREE' },
        { bayNumber: 12, activeJobCardId: null, status: 'MAINTENANCE' },
      ],
      jobCards: [
        { id: 'jc-1', stage: 'IN_PROGRESS' },
        { id: 'jc-2', stage: 'IN_PROGRESS' },
        { id: 'jc-3', stage: 'IN_PROGRESS' },
        { id: 'jc-4', stage: 'WAITING_PARTS' },
        { id: 'jc-5', stage: 'QUALITY_CHECK' },
        { id: 'jc-6', stage: 'READY_FOR_DELIVERY' },
      ],
    };

    const stats = selectBayStats(mockState);

    expect(stats.total).toBe(12);
    expect(stats.occupied).toBe(3);
    expect(stats.waitingParts).toBe(1);
    expect(stats.qualityCheck).toBe(1);
    expect(stats.readyForDelivery).toBe(1);
    expect(stats.available).toBe(6);

    // CRITICAL INVARIANT: Sum of mutually exclusive categories equals total
    const sum =
      stats.occupied +
      stats.waitingParts +
      stats.qualityCheck +
      stats.readyForDelivery +
      stats.available;
    expect(sum).toBe(stats.total);

    // Utilisation = occupied / total = 3 / 12 = 25%
    expect(stats.utilisation).toBe(25);
  });

  it('handles edge case when all bays are available or empty', () => {
    const emptyState = {
      bays: Array.from({ length: 12 }, (_, i) => ({
        bayNumber: i + 1,
        activeJobCardId: null,
        status: 'FREE',
      })),
      jobCards: [],
    };

    const stats = selectBayStats(emptyState);
    expect(stats.total).toBe(12);
    expect(stats.available).toBe(12);
    expect(stats.occupied).toBe(0);
    expect(stats.utilisation).toBe(0);

    const sum =
      stats.occupied +
      stats.waitingParts +
      stats.qualityCheck +
      stats.readyForDelivery +
      stats.available;
    expect(sum).toBe(12);
  });
});
