import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store';
import { getInitialSeedData } from '../data/seed';

describe('Store regression fixes', () => {
  beforeEach(() => {
    useAppStore.setState({ ...getInitialSeedData() });
  });

  it('never reuses an existing invoice number when posting', () => {
    const before = useAppStore.getState().invoices.map((i) => i.invoiceNumber);
    const posted = useAppStore.getState().postInvoice({ type: 'SERVICE', customerName: 'Walk-in', grandTotalPaise: 100 });
    expect(before).not.toContain(posted.invoiceNumber);
    expect(posted.date).toBeTruthy(); // shows up in "today" KPIs
  });

  it('refuses to put a job card into a bay occupied by another job card', () => {
    const { bays, jobCards, assignBayToJobCard } = useAppStore.getState();
    const occupied = bays.find((b) => b.activeJobCardId);
    const waiting = jobCards.find((jc) => !jc.bayNumber);
    expect(() => assignBayToJobCard(occupied.bayNumber, waiting.id)).toThrow(/occupied/);
    expect(useAppStore.getState().bays.find((b) => b.bayNumber === occupied.bayNumber).activeJobCardId).toBe(
      occupied.activeJobCardId
    );
  });

  it('frees the previous bay when a job card moves to another bay', () => {
    const { bays, jobCards, assignBayToJobCard } = useAppStore.getState();
    const [first, second] = bays.filter((b) => b.status === 'FREE');
    const waiting = jobCards.find((jc) => !jc.bayNumber);
    assignBayToJobCard(first.bayNumber, waiting.id);
    assignBayToJobCard(second.bayNumber, waiting.id);
    const after = useAppStore.getState().bays;
    expect(after.find((b) => b.bayNumber === first.bayNumber).status).toBe('FREE');
    expect(after.filter((b) => b.activeJobCardId === waiting.id)).toHaveLength(1);
  });

  it('clears the job card bay number when its bay is released', () => {
    const { bays, releaseBay } = useAppStore.getState();
    const occupied = bays.find((b) => b.activeJobCardId);
    releaseBay(occupied.bayNumber);
    const card = useAppStore.getState().jobCards.find((jc) => jc.id === occupied.activeJobCardId);
    expect(card?.bayNumber ?? null).toBeNull();
  });
});
