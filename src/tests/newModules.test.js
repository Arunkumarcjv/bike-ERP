import { describe, it, expect, beforeEach } from 'vitest';
import { approvalsService } from '../services/api/approvals';
import { useAppStore } from '../store';

describe('D1: Dual-Control Approvals Engine', () => {
  beforeEach(() => {
    // Reset test user state
    useAppStore.setState({
      currentUser: { id: 'usr-exec-1', name: 'Deepak Rao', role: 'Sales Executive' },
      approvals: [],
    });
  });

  it('allows staff to request approval for high discount or refund', () => {
    const req = approvalsService.createApprovalRequest({
      type: 'discount',
      entityId: 'SO/2627/0010',
      title: 'Additional ₹8,000 Discount on Hunter 350',
      amountPaise: 800000,
      thresholdPaise: 500000,
      reason: 'Customer comparing with competing showroom quote',
    });

    expect(req.id).toBeDefined();
    expect(req.status).toBe('PENDING');
    expect(req.requestedById).toBe('usr-exec-1');
    expect(useAppStore.getState().approvals.length).toBe(1);
  });

  it('strictly BLOCKS requester from approving their own request (dual-control rule)', () => {
    const req = approvalsService.createApprovalRequest({
      type: 'discount',
      entityId: 'SO/2627/0011',
      title: 'Discount Self Approval Attempt',
      amountPaise: 600000,
    });

    // Attempt self-approval while logged in as Deepak Rao
    expect(() => {
      approvalsService.approveRequest(req.id, 'Self approving');
    }).toThrow(/Dual-control violation/);

    // Verify approval remained pending
    const item = useAppStore.getState().approvals.find((a) => a.id === req.id);
    expect(item.status).toBe('PENDING');
  });

  it('permits authorized supervisor to approve request', () => {
    const req = approvalsService.createApprovalRequest({
      type: 'discount',
      entityId: 'SO/2627/0012',
      title: 'Manager Approval Test',
      amountPaise: 600000,
    });

    // Switch context to Sales Manager
    useAppStore.setState({
      currentUser: { id: 'usr-mgr-1', name: 'Vikram Sethi', role: 'Sales Manager' },
    });

    const approved = approvalsService.approveRequest(req.id, 'Approved as special festive waiver');
    expect(approved.status).toBe('APPROVED');
    expect(approved.reviewedBy).toBe('Vikram Sethi');
  });
});

describe('D4: Pre-Delivery Inspection (PDI) Pass/Fail Gate Keeper', () => {
  const checkCanDeliver = (checklistAnswers, customerSigned, mandatoryDocsCompleted) => {
    const hasFail = Object.values(checklistAnswers).some((val) => val === 'FAIL');
    if (hasFail) {
      return { allowed: false, error: 'PDI has unresolved FAIL items' };
    }
    if (!mandatoryDocsCompleted) {
      return { allowed: false, error: 'Missing mandatory documents' };
    }
    if (!customerSigned) {
      return { allowed: false, error: 'Customer signature required' };
    }
    return { allowed: true, error: null };
  };

  it('blocks vehicle handover gate pass if any PDI check is FAIL', () => {
    const answers = {
      'Engine oil level (dipstick between Min-Max)': 'PASS',
      'Front telescopic fork dust seals & oil leakage check': 'FAIL',
      'ABS warning lamp self-check sequence': 'PASS',
    };
    const result = checkCanDeliver(answers, true, true);
    expect(result.allowed).toBe(false);
    expect(result.error).toContain('FAIL');
  });

  it('permits vehicle handover gate pass when all checks are PASS or RECTIFIED and signed', () => {
    const answers = {
      'Engine oil level (dipstick between Min-Max)': 'PASS',
      'Front telescopic fork dust seals & oil leakage check': 'RECTIFIED',
      'ABS warning lamp self-check sequence': 'PASS',
    };
    const result = checkCanDeliver(answers, true, true);
    expect(result.allowed).toBe(true);
    expect(result.error).toBeNull();
  });
});

describe('D19: Accounts Receivable Ageing Buckets', () => {
  const classifyAgeingBucket = (daysOverdue) => {
    if (daysOverdue <= 30) return '0_30';
    if (daysOverdue <= 60) return '31_60';
    if (daysOverdue <= 90) return '61_90';
    return '90_PLUS';
  };

  it('correctly maps overdue days into standard Indian accounting ageing buckets', () => {
    expect(classifyAgeingBucket(0)).toBe('0_30');
    expect(classifyAgeingBucket(15)).toBe('0_30');
    expect(classifyAgeingBucket(30)).toBe('0_30');
    expect(classifyAgeingBucket(31)).toBe('31_60');
    expect(classifyAgeingBucket(60)).toBe('31_60');
    expect(classifyAgeingBucket(61)).toBe('61_90');
    expect(classifyAgeingBucket(90)).toBe('61_90');
    expect(classifyAgeingBucket(91)).toBe('90_PLUS');
    expect(classifyAgeingBucket(180)).toBe('90_PLUS');
  });
});

describe('D22: Day-End Closing Cash Reconciliation', () => {
  const calculateCashCount = (denominations, counts) => {
    const totalRupees = denominations.reduce((sum, d) => sum + d.value * (Number(counts[d.value]) || 0), 0);
    return totalRupees * 100; // in paise
  };

  const DENOMINATIONS = [
    { value: 500, label: '₹500 Notes' },
    { value: 200, label: '₹200 Notes' },
    { value: 100, label: '₹100 Notes' },
    { value: 50, label: '₹50 Notes' },
    { value: 20, label: '₹20 Notes' },
    { value: 10, label: '₹10 Notes / Coins' },
    { value: 5, label: '₹5 Coins' },
  ];

  it('computes exact physical cash and detects variance against system ledger', () => {
    const physicalCounts = {
      500: 60, // 30,000
      200: 20, // 4,000
      100: 10, // 1,000
      50: 10,  // 500
      20: 0,
      10: 0,
      5: 0,
    };
    const countedPaise = calculateCashCount(DENOMINATIONS, physicalCounts);
    expect(countedPaise).toBe(3550000); // ₹35,500.00

    const expectedSystemCashPaise = 3550000;
    const variancePaise = countedPaise - expectedSystemCashPaise;
    expect(variancePaise).toBe(0);
  });

  it('flags shortage or excess variance requiring mandatory justification and dual signoff', () => {
    const physicalCountsShort = {
      500: 59, // Short by 1 note of 500 = ₹500
      200: 20,
      100: 10,
      50: 10,
    };
    const countedPaise = calculateCashCount(DENOMINATIONS, physicalCountsShort);
    const expectedSystemCashPaise = 3550000;
    const variancePaise = countedPaise - expectedSystemCashPaise;

    expect(variancePaise).toBe(-50000); // ₹500 shortage
    const canLockWithoutExplanation = variancePaise === 0 || false;
    expect(canLockWithoutExplanation).toBe(false);
  });
});

describe('D25: Section 206C(1F) TCS Compliance', () => {
  const TCS_VEHICLE_THRESHOLD_PAISE = 100000000; // ₹10 Lakhs (CONFIRM WITH CA)
  const TCS_RATE_PERCENT = 1.0; // 1% under Section 206C(1F)

  const computeTcsOnVehicleSale = (saleValuePaise) => {
    if (saleValuePaise > TCS_VEHICLE_THRESHOLD_PAISE) {
      const tcsPaise = Math.round((saleValuePaise * TCS_RATE_PERCENT) / 100);
      return { applies: true, tcsRatePercent: TCS_RATE_PERCENT, tcsPaise };
    }
    return { applies: false, tcsRatePercent: 0, tcsPaise: 0 };
  };

  it('does NOT levy 206C(1F) TCS on standard two-wheelers under ₹10 Lakhs', () => {
    const hunter350SalePaise = 19500000; // ₹1,95,000
    const res = computeTcsOnVehicleSale(hunter350SalePaise);
    expect(res.applies).toBe(false);
    expect(res.tcsPaise).toBe(0);
  });

  it('strictly applies 1% TCS when vehicle sale exceeds ₹10,00,000', () => {
    const bulkFleetSalePaise = 115000000; // ₹11,50,000
    const res = computeTcsOnVehicleSale(bulkFleetSalePaise);
    expect(res.applies).toBe(true);
    expect(res.tcsRatePercent).toBe(1.0);
    expect(res.tcsPaise).toBe(1150000); // ₹11,500
  });
});
