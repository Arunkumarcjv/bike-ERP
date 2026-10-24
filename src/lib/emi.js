/**
 * Standard Reducing Balance EMI Calculator for Two-Wheeler Financing
 */

export function calculateEmi({
  principalPaise,
  annualInterestRatePercent = 10.5,
  tenureMonths = 36,
}) {
  if (!principalPaise || principalPaise <= 0 || !tenureMonths || tenureMonths <= 0) {
    return {
      monthlyEmiPaise: 0,
      totalInterestPaise: 0,
      totalPayablePaise: 0,
      principalPaise: 0,
      tenureMonths: 0,
      annualInterestRatePercent: 0,
    };
  }

  const monthlyRate = annualInterestRatePercent / 12 / 100;
  let monthlyEmiPaise = 0;

  if (monthlyRate === 0) {
    monthlyEmiPaise = Math.round(principalPaise / tenureMonths);
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = (principalPaise * monthlyRate * factor) / (factor - 1);
    monthlyEmiPaise = Math.round(emi);
  }

  const totalPayablePaise = monthlyEmiPaise * tenureMonths;
  const totalInterestPaise = Math.max(0, totalPayablePaise - principalPaise);

  return {
    monthlyEmiPaise,
    totalInterestPaise,
    totalPayablePaise,
    principalPaise,
    tenureMonths,
    annualInterestRatePercent,
  };
}
