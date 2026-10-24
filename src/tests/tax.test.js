import { describe, it, expect } from 'vitest';
import { findTaxRule, computeLineTax, computeInvoiceTaxTotals } from '../lib/tax';

describe('GST Tax Engine & Rule Lookup', () => {
  it('identifies 18% GST for petrol vehicles <= 350cc', () => {
    const rule = findTaxRule({
      category: 'VEHICLE',
      fuelType: 'PETROL',
      displacementCc: 349, // Royal Enfield Hunter / Classic
    });

    expect(rule.gstRatePercent).toBe(18.0);
    expect(rule.hsn).toBe('8711');
    expect(rule.complianceNote).toContain('CONFIRM WITH CA');
  });

  it('identifies 40% GST for luxury motorcycles > 350cc', () => {
    const rule = findTaxRule({
      category: 'VEHICLE',
      fuelType: 'PETROL',
      displacementCc: 452, // Himalayan 450
    });

    expect(rule.gstRatePercent).toBe(40.0);
    expect(rule.hsn).toBe('8711');
  });

  it('identifies 5% concessional GST for Electric Vehicles (EV)', () => {
    const rule = findTaxRule({
      category: 'VEHICLE',
      fuelType: 'EV',
      displacementCc: 0,
    });

    expect(rule.gstRatePercent).toBe(5.0);
  });

  it('identifies 18% SAC 9987 for workshop labour', () => {
    const rule = findTaxRule({
      category: 'LABOUR',
      sac: '9987',
    });

    expect(rule.gstRatePercent).toBe(18.0);
    expect(rule.sac).toBe('9987');
  });

  it('throws an explicit error when no tax rule matches (never defaults silently)', () => {
    expect(() => {
      findTaxRule({
        category: 'NON_EXISTENT_CATEGORY',
        fuelType: 'HYDROGEN',
      });
    }).toThrow(/GST Tax Rule Missing/i);
  });

  it('computes exact half-up CGST and SGST 50-50 split for intra-state (Karnataka 29)', () => {
    const rule = {
      id: 'test-rule-18',
      gstRatePercent: 18.0,
      hsn: '8711',
      complianceNote: 'CONFIRM WITH CA',
    };

    // ₹1,00,000 (10000000 paise) -> 18% = ₹18,000 -> CGST ₹9,000 + SGST ₹9,000
    const result = computeLineTax({
      taxableAmountPaise: 10000000,
      taxRule: rule,
      buyerStateCode: '29',
      sellerStateCode: '29',
    });

    expect(result.isIntraState).toBe(true);
    expect(result.cgstRatePercent).toBe(9.0);
    expect(result.sgstRatePercent).toBe(9.0);
    expect(result.cgstPaise).toBe(900000);
    expect(result.sgstPaise).toBe(900000);
    expect(result.igstPaise).toBe(0);
    expect(result.totalTaxPaise).toBe(1800000);
    expect(result.grossAmountPaise).toBe(11800000);
  });

  it('computes IGST for inter-state customer (Tamil Nadu 33)', () => {
    const rule = {
      id: 'test-rule-18',
      gstRatePercent: 18.0,
      hsn: '8711',
      complianceNote: 'CONFIRM WITH CA',
    };

    const result = computeLineTax({
      taxableAmountPaise: 10000000,
      taxRule: rule,
      buyerStateCode: '33',
      sellerStateCode: '29',
    });

    expect(result.isIntraState).toBe(false);
    expect(result.cgstPaise).toBe(0);
    expect(result.sgstPaise).toBe(0);
    expect(result.igstPaise).toBe(1800000);
    expect(result.totalTaxPaise).toBe(1800000);
  });

  it('computes statutory round-off line so grand total is exact whole rupee', () => {
    const lines = [
      {
        taxableAmountPaise: 100033, // ₹1,000.33
        taxRule: { id: 'r1', gstRatePercent: 18.0, hsn: '8714' },
      },
    ];

    const result = computeInvoiceTaxTotals(lines, { buyerStateCode: '29', sellerStateCode: '29' });
    // Total taxable: 100033, Tax (18%): 18006 -> unrounded: 118039 (₹1180.39)
    // Nearest whole rupee: 118000 (₹1180.00) -> round-off = -39 paise
    expect(result.unroundedGrandTotalPaise).toBe(118039);
    expect(result.grandTotalPaise % 100).toBe(0);
    expect(result.grandTotalPaise).toBe(result.unroundedGrandTotalPaise + result.roundOffPaise);
  });
});
