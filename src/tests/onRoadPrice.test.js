import { describe, it, expect } from 'vitest';
import { calculateOnRoadPrice } from '../lib/onRoadPrice';

describe('On-Road Price Engine', () => {
  it('calculates on-road price for standard petrol bike with 18% Road Tax (> 1 Lakh)', () => {
    const result = calculateOnRoadPrice({
      exShowroomPaise: 16990000, // ₹1,69,900
      displacementCc: 349,
      fuelType: 'PETROL',
      selectedAccessories: [],
      applicableOffers: [],
      approvedDiscountPaise: 0,
    });

    expect(result.exShowroomPaise).toBe(16990000);
    // 18% of 1,69,900 = ₹30,582 (3058200 paise)
    expect(result.roadTaxPaise).toBe(3058200);
    expect(result.insurancePaise).toBe(980000); // 151-350cc tier = ₹9,800
    expect(result.rtoFeePaise).toBe(145000);
    expect(result.handlingPaise).toBe(150000);
    expect(result.netOnRoadPricePaise).toBe(16990000 + 3058200 + 980000 + 145000 + 150000);
  });

  it('exempts EV from road tax under Karnataka EV incentive policy', () => {
    const result = calculateOnRoadPrice({
      exShowroomPaise: 11700000, // ₹1,17,000 (iQube)
      displacementCc: 0,
      fuelType: 'EV',
    });

    expect(result.roadTaxPaise).toBe(0);
    expect(result.insurancePaise).toBe(520000); // EV insurance tier = ₹5,200
  });

  it('correctly applies approved discount and auto offers as deductions', () => {
    const result = calculateOnRoadPrice({
      exShowroomPaise: 16990000,
      displacementCc: 349,
      fuelType: 'PETROL',
      applicableOffers: [
        { id: 'off-festive', code: 'FEST5K', title: 'Festive Bonus', discountPaise: 500000 },
      ],
      approvedDiscountPaise: 200000, // ₹2,000
    });

    expect(result.totalOffersPaise).toBe(500000);
    expect(result.approvedDiscountPaise).toBe(200000);
    expect(result.totalDeductionsPaise).toBe(700000);
    expect(result.netOnRoadPricePaise).toBe(result.totalAdditionsPaise - 700000);
  });
});
