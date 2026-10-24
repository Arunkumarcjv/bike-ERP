import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  Layers,
  Calendar
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';

const DEPARTMENT_BUDGETS = [
  { dept: 'Vehicle Sales & Showroom', budgetPaise: 85000000, actualPaise: 79200000, type: 'REVENUE' },
  { dept: 'Service Center & Labour', budgetPaise: 18000000, actualPaise: 19400000, type: 'REVENUE' },
  { dept: 'Spare Parts & Accessories Counter', budgetPaise: 12000000, actualPaise: 11100000, type: 'REVENUE' },
  { dept: 'Marketing & Digital Ads', budgetPaise: 1200000, actualPaise: 1050000, type: 'EXPENSE' },
  { dept: 'Staff Salaries & HR Incentives', budgetPaise: 6500000, actualPaise: 6300000, type: 'EXPENSE' },
  { dept: 'Showroom Rent & Electricity Utilities', budgetPaise: 3500000, actualPaise: 3450000, type: 'EXPENSE' },
];

export function BudgetCashFlowPage() {
  const [scenario, setScenario] = useState('BASE'); // 'CONSERVATIVE' (70%), 'BASE' (100%), 'AGGRESSIVE' (120%)

  const multiplier = scenario === 'CONSERVATIVE' ? 0.7 : scenario === 'AGGRESSIVE' ? 1.2 : 1.0;

  // Forecast cash flow for 30, 60, 90 days
  const baseInflows = { d30: 95000000, d60: 185000000, d90: 275000000 };
  const baseOutflows = { d30: 78000000, d60: 154000000, d90: 228000000 };

  const projectedInflow30 = Math.round(baseInflows.d30 * multiplier);
  const projectedInflow60 = Math.round(baseInflows.d60 * multiplier);
  const projectedInflow90 = Math.round(baseInflows.d90 * multiplier);

  const netCashFlow30 = projectedInflow30 - baseOutflows.d30;
  const netCashFlow60 = projectedInflow60 - baseOutflows.d60;
  const netCashFlow90 = projectedInflow90 - baseOutflows.d90;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Budget Variance &amp; 30/60/90-Day Cash Flow Forecast
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Departmental budget vs actuals, receivables liquidity modeling &amp; conservative vs aggressive scenario confidence bands.
          </p>
        </div>

        {/* Scenario Selector */}
        <div className="flex items-center gap-2">
          {['CONSERVATIVE', 'BASE', 'AGGRESSIVE'].map(sc => (
            <button
              key={sc}
              onClick={() => setScenario(sc)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${
                scenario === sc
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {sc === 'CONSERVATIVE' ? '70% Conservative' : sc === 'BASE' ? 'Base Case' : '120% Aggressive'}
            </button>
          ))}
        </div>
      </div>

      {/* 30/60/90 Days Horizon Forecast Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase">30-Day Liquidity Forecast</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">High Confidence</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Projected Inflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(projectedInflow30)}</strong></div>
            <div className="text-xs text-slate-500">Projected Outflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(baseOutflows.d30)}</strong></div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Surplus:</span>
              <span className="text-lg font-black text-emerald-600 font-mono">{formatMoney(netCashFlow30)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase">60-Day Liquidity Forecast</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">Medium Confidence</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Projected Inflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(projectedInflow60)}</strong></div>
            <div className="text-xs text-slate-500">Projected Outflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(baseOutflows.d60)}</strong></div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Surplus:</span>
              <span className="text-lg font-black text-blue-600 font-mono">{formatMoney(netCashFlow60)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-500 uppercase">90-Day Liquidity Forecast</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold">Strategic Horizon</span>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Projected Inflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(projectedInflow90)}</strong></div>
            <div className="text-xs text-slate-500">Projected Outflow: <strong className="font-mono text-slate-900 dark:text-white">{formatMoney(baseOutflows.d90)}</strong></div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Net Surplus:</span>
              <span className="text-lg font-black text-purple-600 font-mono">{formatMoney(netCashFlow90)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Departmental Budget vs Actual Variance Table */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-500 uppercase tracking-wider">
          Departmental Budget vs Actual Performance
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 font-semibold text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Department / Cost Center</th>
                <th className="p-3.5">Stream Type</th>
                <th className="p-3.5">Monthly Budget</th>
                <th className="p-3.5">Actual Recorded</th>
                <th className="p-3.5">Variance (₹)</th>
                <th className="p-3.5 text-right">Fulfillment %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {DEPARTMENT_BUDGETS.map(dept => {
                const variance = dept.actualPaise - dept.budgetPaise;
                const percent = Math.round((dept.actualPaise / dept.budgetPaise) * 100);
                const isGood = dept.type === 'REVENUE' ? variance >= 0 : variance <= 0;
                return (
                  <tr key={dept.dept} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {dept.dept}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        dept.type === 'REVENUE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {dept.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono">{formatMoney(dept.budgetPaise)}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(dept.actualPaise)}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className={isGood ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                        {variance > 0 ? '+' : ''}{formatMoney(variance)}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-black text-sm">
                      <span className={percent >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                        {percent}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default BudgetCashFlowPage;
