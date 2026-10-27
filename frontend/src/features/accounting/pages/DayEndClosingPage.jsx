import React, { useState, useRef } from 'react';
import { 
  LockKeyhole, 
  Coins, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  PenTool, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  Lock
} from 'lucide-react';
import { formatMoney } from '../../../lib/format';
import { toast } from 'sonner';

const DENOMINATIONS = [
  { value: 500, label: '₹500 Notes' },
  { value: 200, label: '₹200 Notes' },
  { value: 100, label: '₹100 Notes' },
  { value: 50, label: '₹50 Notes' },
  { value: 20, label: '₹20 Notes' },
  { value: 10, label: '₹10 Notes / Coins' },
  { value: 5, label: '₹5 Coins' },
];

export function DayEndClosingPage() {
  const [counts, setCounts] = useState({
    500: 48,
    200: 25,
    100: 40,
    50: 20,
    20: 30,
    10: 40,
    5: 20,
  });

  const [expectedSystemCashPaise] = useState(3550000); // ₹35,500 expected
  const [explanation, setExplanation] = useState('');
  const [isDayLocked, setIsDayLocked] = useState(false);
  const [cashierSigned, setCashierSigned] = useState(false);
  const [managerSigned, setManagerSigned] = useState(false);

  // Compute total counted cash
  const totalCountedRupees = DENOMINATIONS.reduce((sum, d) => sum + (d.value * (Number(counts[d.value]) || 0)), 0);
  const totalCountedPaise = totalCountedRupees * 100;
  const variancePaise = totalCountedPaise - expectedSystemCashPaise;

  const handleCloseAndLock = (e) => {
    e.preventDefault();
    if (variancePaise !== 0 && !explanation.trim()) {
      toast.error('Cash variance detected! Explanation is strictly mandatory before locking cash book.');
      return;
    }

    if (!cashierSigned || !managerSigned) {
      toast.error('Both Cashier and Branch Manager dual digital signatures are required.');
      return;
    }

    setIsDayLocked(true);
    toast.success('Day-end cash closing committed and locked! System entry disabled for today.');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LockKeyhole className="w-6 h-6 text-blue-600" />
              Day-End Cash Closing &amp; Physical Vault Reconciliation
            </h1>
            {isDayLocked ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Day Locked
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Active Till Open
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Physical denomination counting, system expected cash variance audit &amp; dual-signature lock.
          </p>
        </div>

        <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono">
          Closing Date: <strong>{new Date().toLocaleDateString('en-IN')}</strong> (Bangalore Central)
        </div>
      </div>

      {isDayLocked && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200">
            <p className="font-bold text-sm">Today’s Financial Books are Officially Locked</p>
            <p className="mt-0.5">
              Vault balance settled and signed off. Any retrospective entries require Super Admin audit unlock.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Denomination Counter vs System Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Physical Denomination Counter */}
        <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-500" />
              Physical Currency Denomination Counter
            </h2>
            <span className="text-xs text-slate-400">Cashier Vault</span>
          </div>

          <div className="space-y-3">
            {DENOMINATIONS.map(d => {
              const qty = counts[d.value] || '';
              const lineRupees = d.value * (Number(qty) || 0);
              return (
                <div key={d.value} className="flex items-center justify-between gap-3 text-xs">
                  <div className="w-32 font-bold text-slate-700 dark:text-slate-300">
                    {d.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">x</span>
                    <input
                      type="number"
                      min="0"
                      disabled={isDayLocked}
                      value={qty}
                      onChange={(e) => setCounts({ ...counts, [d.value]: e.target.value })}
                      className="w-20 px-2 py-1 text-center font-mono font-bold bg-slate-50 dark:bg-slate-800 border rounded-lg"
                    />
                  </div>
                  <div className="w-24 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{lineRupees.toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold">
            <span className="text-slate-700 dark:text-slate-300">Total Physical Cash Counted:</span>
            <span className="text-blue-600 font-mono text-base">{formatMoney(totalCountedPaise)}</span>
          </div>
        </div>

        {/* Right: Variance Analysis & Dual Sign-Off */}
        <div className="space-y-6">
          {/* Comparison Card */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              Expected Cash Reconciliation
            </h2>

            <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                <span>Opening Cash Float:</span>
                <span className="font-mono">₹10,000</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                <span>Cash Inflow (Counter Sales &amp; Advances):</span>
                <span className="font-mono">+₹27,350</span>
              </div>
              <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                <span>Petty Cash Disbursements Out:</span>
                <span className="font-mono">-₹1,850</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900 dark:text-white">
                <span>System Expected Cash in Till:</span>
                <span className="font-mono text-blue-600">{formatMoney(expectedSystemCashPaise)}</span>
              </div>
            </div>

            {/* Variance Box */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${
              variancePaise === 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 border-red-300 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
            }`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">Reconciliation Variance</span>
                <span className="text-lg font-black font-mono">
                  {variancePaise === 0 ? 'Exact Match (₹0 Variance)' : `${variancePaise > 0 ? '+Excess ' : '-Shortage '}${formatMoney(Math.abs(variancePaise))}`}
                </span>
              </div>
              {variancePaise === 0 ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-red-600" />}
            </div>

            {variancePaise !== 0 && (
              <div>
                <label className="block text-xs font-bold text-red-600 mb-1">
                  Variance Justification / Explanation *
                </label>
                <textarea
                  rows={2}
                  disabled={isDayLocked}
                  placeholder="Explain shortage/excess reason (e.g. customer coin shortage, round-off)..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-red-300 rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Dual Sign-Off */}
          {!isDayLocked && (
            <div className="bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-600" />
                Dual Digital Sign-Off (Cashier &amp; Branch Manager)
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setCashierSigned(!cashierSigned)}
                  className={`p-3 rounded-xl border text-center transition ${
                    cashierSigned ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {cashierSigned ? '✓ Cashier Suresh Iyer Signed' : 'Click to Sign as Cashier'}
                </button>

                <button
                  type="button"
                  onClick={() => setManagerSigned(!managerSigned)}
                  className={`p-3 rounded-xl border text-center transition ${
                    managerSigned ? 'bg-purple-50 border-purple-500 text-purple-800 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  {managerSigned ? '✓ Manager Vikram Sethi Signed' : 'Click to Sign as Manager'}
                </button>
              </div>

              <button
                onClick={handleCloseAndLock}
                className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <LockKeyhole className="w-4 h-4" />
                Commit Day-End Closing &amp; Lock Books
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DayEndClosingPage;
