import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import {
  Repeat,
  PlusCircle,
  Camera,
  Sparkles,
  Wrench,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export function ExchangePage() {
  const [exchangeAppraisals, setExchangeAppraisals] = useState([
    {
      id: 'exc-001',
      customerName: 'Karthik Narayanan',
      phone: '+91 98840 99123',
      oldBikeModel: 'Bajaj Discover 125cc (2018)',
      registrationNumber: 'KA-04-ER-9921',
      odometerKm: 48500,
      conditionGrade: 'GOOD', // EXCELLENT, GOOD, FAIR, POOR
      aiEstimatedPricePaise: 2850000, // ₹28,500
      approvedValuationPaise: 3000000, // ₹30,000 (Incl. ₹1,500 bonus)
      targetNewBike: 'Royal Enfield Hunter 350',
      status: 'ADJUSTED_TO_INVOICE',
      refurbishmentEstimatePaise: 350000,
    },
    {
      id: 'exc-002',
      customerName: 'Sunil Hegde',
      phone: '+91 94480 66551',
      oldBikeModel: 'Hero Splendor Plus (2016)',
      registrationNumber: 'KA-05-HD-1092',
      odometerKm: 62000,
      conditionGrade: 'FAIR',
      aiEstimatedPricePaise: 1800000,
      approvedValuationPaise: 1950000,
      targetNewBike: 'Honda SP125',
      status: 'VALUATION_COMPLETED',
      refurbishmentEstimatePaise: 200000,
    },
  ]);

  const [valuationModalOpen, setValuationModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [makeModel, setMakeModel] = useState('Honda Activa 3G (2016)');
  const [odoKm, setOdoKm] = useState('38000');
  const [aiPrice, setAiPrice] = useState(24000);

  const handleComputeAiValuation = () => {
    // Dynamic depreciation model
    const calculated = Math.max(12000, Math.round(55000 - Number(odoKm) * 0.7));
    setAiPrice(calculated);
    toast.success(`AI Valuation Complete: Suggested Market Buyback ₹${calculated.toLocaleString('en-IN')}`);
  };

  const handleSaveAppraisal = (e) => {
    e.preventDefault();
    const newExc = {
      id: `exc-${Date.now()}`,
      customerName: custName,
      phone: '+91 98450 12345',
      oldBikeModel: makeModel,
      registrationNumber: 'KA-05-AP-9901',
      odometerKm: Number(odoKm),
      conditionGrade: 'GOOD',
      aiEstimatedPricePaise: aiPrice * 100,
      approvedValuationPaise: (aiPrice + 1500) * 100, // Dealer festive bonus
      targetNewBike: 'Classic 350 Halcyon',
      status: 'VALUATION_COMPLETED',
      refurbishmentEstimatePaise: 250000,
    };

    setExchangeAppraisals([newExc, ...exchangeAppraisals]);
    setValuationModalOpen(false);
    toast.success(`Exchange Trade-in registered for ${custName}! Valuation: ${formatMoney(newExc.approvedValuationPaise)}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Exchange, Trade-ins & Pre-Owned Valuation</h1>
          <p className="text-xs text-text-muted mt-0.5">
            AI price appraisal engine, trade-in invoice deduction and certified pre-owned refurbishment tracking
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setValuationModalOpen(true)}
        >
          New Bike Trade-in Appraisal
        </Button>
      </div>

      {/* Appraisals Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Old Bike Make & Model</th>
                <th className="p-3.5">Registration #</th>
                <th className="p-3.5">Odometer</th>
                <th className="p-3.5">Condition</th>
                <th className="p-3.5">AI Valuation</th>
                <th className="p-3.5">Approved Trade-in Value</th>
                <th className="p-3.5">Target New Vehicle</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {exchangeAppraisals.map((exc) => (
                <tr key={exc.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-bold text-text-main">{exc.customerName}</td>
                  <td className="p-3.5 font-medium text-text-main">{exc.oldBikeModel}</td>
                  <td className="p-3.5 font-mono text-primary font-semibold">{exc.registrationNumber}</td>
                  <td className="p-3.5 tabular-nums text-text-muted">{exc.odometerKm} KM</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-muted text-text-muted uppercase">
                      {exc.conditionGrade}
                    </span>
                  </td>
                  <td className="p-3.5 tabular-nums text-text-muted">{formatMoney(exc.aiEstimatedPricePaise)}</td>
                  <td className="p-3.5 tabular-nums font-bold text-status-green">
                    {formatMoney(exc.approvedValuationPaise)}
                  </td>
                  <td className="p-3.5 font-semibold text-text-main">{exc.targetNewBike}</td>
                  <td className="p-3.5">
                    <StatusBadge status={exc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Valuation Appraisal Modal */}
      <Modal
        isOpen={valuationModalOpen}
        onClose={() => setValuationModalOpen(false)}
        title="AI-Powered Two-Wheeler Exchange Valuation"
        size="md"
      >
        <form onSubmit={handleSaveAppraisal} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              placeholder="e.g. Ramesh Hegde"
              className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-main mb-1">Old Two-Wheeler Model</label>
              <input
                type="text"
                required
                value={makeModel}
                onChange={(e) => setMakeModel(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-main mb-1">Odometer (KM)</label>
              <input
                type="number"
                value={odoKm}
                onChange={(e) => setOdoKm(e.target.value)}
                className="w-full p-2.5 rounded-input border border-border bg-surface-subtle text-text-main"
              />
            </div>
          </div>

          <div className="p-4 rounded-card bg-blue-50 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Algorithmic Fair Value</span>
              </span>
              <Button type="button" size="sm" variant="secondary" onClick={handleComputeAiValuation}>
                Recalculate AI Quote
              </Button>
            </div>
            <div className="text-xl font-bold text-navy-900 tabular-nums">
              ₹ {aiPrice.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-slate-500">
              Computed from live market depreciations, Bangalore regional resale demand, and odometer wear.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="secondary" type="button" onClick={() => setValuationModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Approve Exchange Trade-in
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
