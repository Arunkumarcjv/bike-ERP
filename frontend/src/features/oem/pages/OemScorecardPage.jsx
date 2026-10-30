import React, { useState } from 'react';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  DollarSign, 
  Layers, 
  Building2,
  Calendar
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';

const OEM_TARGETS = [
  {
    oemName: 'Royal Enfield',
    targetUnits: 45,
    wholesaleLifted: 48,
    retailAchieved: 42,
    baseTargetPayoutPaise: 120000, // ₹1,200/unit at 100%
    slabs: [
      { slab: 'Tier 1 (80% - 99%)', minPercent: 80, ratePerUnitPaise: 50000 },
      { slab: 'Tier 2 (100% - 119%)', minPercent: 100, ratePerUnitPaise: 120000 },
      { slab: 'Tier 3 (120%+ Super Incentive)', minPercent: 120, ratePerUnitPaise: 200000 },
    ]
  },
  {
    oemName: 'Honda 2-Wheelers (HMSI)',
    targetUnits: 30,
    wholesaleLifted: 32,
    retailAchieved: 31,
    baseTargetPayoutPaise: 100000,
    slabs: [
      { slab: 'Tier 1 (80% - 99%)', minPercent: 80, ratePerUnitPaise: 40000 },
      { slab: 'Tier 2 (100% - 119%)', minPercent: 100, ratePerUnitPaise: 100000 },
      { slab: 'Tier 3 (120%+ Super Incentive)', minPercent: 120, ratePerUnitPaise: 180000 },
    ]
  },
  {
    oemName: 'Ather & TVS EV',
    targetUnits: 20,
    wholesaleLifted: 22,
    retailAchieved: 19,
    baseTargetPayoutPaise: 150000,
    slabs: [
      { slab: 'Tier 1 (80% - 99%)', minPercent: 80, ratePerUnitPaise: 60000 },
      { slab: 'Tier 2 (100% - 119%)', minPercent: 100, ratePerUnitPaise: 150000 },
      { slab: 'Tier 3 (120%+ Super Incentive)', minPercent: 120, ratePerUnitPaise: 250000 },
    ]
  }
];

const OEM_SCORECARD_METRICS = [
  { name: 'Customer Satisfaction Index (CSI)', score: 928, max: 1000, benchmark: 900, unit: '/ 1000', status: 'GREEN' },
  { name: 'Sales Satisfaction Index (SSI)', score: 945, max: 1000, benchmark: 910, unit: '/ 1000', status: 'GREEN' },
  { name: 'First-Time-Fix Rate (FTFR)', score: 94.2, max: 100, benchmark: 90, unit: '%', status: 'GREEN' },
  { name: 'OEM Warranty Rejection Rate', score: 1.8, max: 10, benchmark: 3.0, unit: '%', status: 'GREEN', lowerIsBetter: true },
  { name: 'Genuine Parts Off-The-Shelf Availability', score: 96.5, max: 100, benchmark: 95, unit: '%', status: 'GREEN' },
  { name: 'Dealership Statutory Audit Compliance', score: 98.0, max: 100, benchmark: 95, unit: '%', status: 'GREEN' },
];

export function OemScorecardPage() {
  const [selectedOem, setSelectedOem] = useState(OEM_TARGETS[0]);

  // Calculations for incentive ladder
  const achievementPercent = Math.round((selectedOem.retailAchieved / selectedOem.targetUnits) * 100);

  let activeRatePaise = 0;
  if (achievementPercent >= 120) activeRatePaise = selectedOem.slabs[2].ratePerUnitPaise;
  else if (achievementPercent >= 100) activeRatePaise = selectedOem.slabs[1].ratePerUnitPaise;
  else if (achievementPercent >= 80) activeRatePaise = selectedOem.slabs[0].ratePerUnitPaise;

  const projectedPayoutPaise = activeRatePaise * selectedOem.retailAchieved;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            OEM Target Slabs &amp; Performance Scorecard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monthly manufacturer volume targets, incentive slab ladder projections &amp; CSI / SSI audit benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {OEM_TARGETS.map(oem => (
            <button
              key={oem.oemName}
              onClick={() => setSelectedOem(oem)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                selectedOem.oemName === oem.oemName
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {oem.oemName}
            </button>
          ))}
        </div>
      </div>

      {/* Target Progress Summary Card */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Manufacturer Target</span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              {selectedOem.oemName} — October 2026 Volume Target
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Projected Incentive Payout</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {formatMoney(projectedPayoutPaise)}
            </span>
          </div>
        </div>

        {/* 3 Metric Cards: Target, Retail, Wholesale */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Monthly Retail Target</span>
            <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
              {selectedOem.targetUnits} Units
            </div>
            <span className="text-[11px] text-slate-400">Assigned by OEM Regional Office</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Actual Retail Invoiced</span>
            <div className="text-xl font-black text-blue-600 mt-1">
              {selectedOem.retailAchieved} Units ({achievementPercent}%)
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Tier 1 Threshold Achieved</span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-500">Wholesale Stock Lifted</span>
            <div className="text-xl font-black text-purple-600 mt-1">
              {selectedOem.wholesaleLifted} Units
            </div>
            <span className="text-[11px] text-slate-400">Factory dispatch to Bangalore warehouse</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-300">Retail Target Fulfillment</span>
            <span className={achievementPercent >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
              {achievementPercent}% of Target
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                achievementPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(achievementPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Incentive Ladder & Scorecard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Incentive Slab Ladder */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Incentive Slab Ladder
          </h3>
          <p className="text-xs text-slate-500">
            Incremental per-unit payout released by OEM upon reaching monthly slab milestones.
          </p>

          <div className="space-y-3 pt-1">
            {selectedOem.slabs.map((slab, idx) => {
              const isQualified = achievementPercent >= slab.minPercent;
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition flex items-center justify-between ${
                    isQualified
                      ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800'
                      : 'bg-slate-50/50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{slab.slab}</span>
                      {isQualified && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Rate: <strong className="font-mono text-emerald-600">{formatMoney(slab.ratePerUnitPaise)}</strong> / unit
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                    {isQualified ? formatMoney(slab.ratePerUnitPaise * selectedOem.retailAchieved) : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* OEM Audit & Satisfaction Scorecard */}
        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            OEM Quality &amp; Satisfaction Scorecard
          </h3>
          <p className="text-xs text-slate-500">
            Monthly dealer performance ratings submitted to the OEM principal.
          </p>

          <div className="space-y-3 pt-1">
            {OEM_SCORECARD_METRICS.map((metric, idx) => (
              <div 
                key={idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{metric.name}</span>
                  <span className="text-[10px] text-slate-400">Benchmark: {metric.benchmark} {metric.unit}</span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black font-mono text-emerald-600 block">
                    {metric.score} {metric.unit}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Top Quartile</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OemScorecardPage;
