import { describe, it, expect } from 'vitest';
import { generateInvoiceNumber, generateJobCardNumber, generateBookingNumber } from '../lib/ids';

describe('Document Identification & Statutory Numbering', () => {
  it('generates compliant, gap-free invoice number <= 16 characters', () => {
    const inv1 = generateInvoiceNumber(1, '2627');
    expect(inv1).toBe('VI/2627/00001');
    expect(inv1.length).toBeLessThanOrEqual(16);

    const inv9999 = generateInvoiceNumber(9999, '2627');
    expect(inv9999).toBe('VI/2627/09999');
    expect(inv9999.length).toBeLessThanOrEqual(16);
  });

  it('generates standardized Job Card and Booking numbers', () => {
    const jc = generateJobCardNumber(42, '2627');
    expect(jc).toBe('JC/2627/00042');
    expect(jc.length).toBeLessThanOrEqual(16);

    const bk = generateBookingNumber(108, '2627');
    expect(bk).toBe('BK/2627/00108');
  });
});
