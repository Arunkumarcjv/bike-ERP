import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { formatMoney, formatDate } from '../../../lib/format';
import { calculateEmi } from '../../../lib/emi';
import {
  Landmark,
  PlusCircle,
  Clock,
  CheckCircle,
  FileText,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

export function VehicleFinancePage() {
  const financiers = useAppStore((state) => state.catalogs.financiers || []);

  const [loanApplications, setLoanApplications] = useState([
    {
      id: 'loan-001',
      appNumber: 'LN/2627/00042',
      customerName: 'Karthik Narayanan',
      vehicleModel: 'Hunter 350 Dapper',
      financierName: 'HDFC Bank Auto Loans',
      loanAmountPaise: 16000000, // ₹1,60,000
      tenureMonths: 36,
      interestRatePercent: 9.75,
      stage: 'SANCTIONED', // APPLIED, DOCUMENTS_VERIFIED, SANCTIONED, DISBURSED, REJECTED
      disbursementRef: 'HDFC-DISB-99120',
      appliedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'loan-002',
      appNumber: 'LN/2627/00043',
      customerName: 'Vikas Swaminathan',
      vehicleModel: 'Ather 450X EV',
      financierName: 'Bajaj Finserv Auto',
      loanAmountPaise: 11000000, // ₹1,10,000
      tenureMonths: 24,
      interestRatePercent: 11.5,
      stage: 'DOCUMENTS_VERIFIED',
      disbursementRef: null,
      appliedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Vehicle Retail Financing & Bank Tie-ups</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Financier integrations (HDFC, ICICI, Bajaj, Tata), loan sanction tracking and instant disbursement receipts
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => toast.info('New Loan Application wizard')}
        >
          New Finance Application
        </Button>
      </div>

      {/* Financier Partners Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {financiers.map((fin) => (
          <Card key={fin.id} className="p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-primary">{fin.code}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-status-green">
                  {fin.tatHours}h Approval TAT
                </span>
              </div>
              <h4 className="font-bold text-sm text-text-main mt-1">{fin.name}</h4>
              <p className="text-xs text-text-muted mt-1">
                Interest starting from <strong>{fin.interestRatePercent}% p.a.</strong>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-border text-[11px] text-text-muted flex justify-between">
              <span>Max: {fin.maxTenureMonths} Mos</span>
              <span>Fee: {formatMoney(fin.processingFeePaise)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Loan Applications Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Active Two-Wheeler Loan Applications</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                <th className="p-3.5">Application #</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Vehicle Model</th>
                <th className="p-3.5">Financing Bank</th>
                <th className="p-3.5">Loan Principal</th>
                <th className="p-3.5">Tenure & Rate</th>
                <th className="p-3.5">Disbursement Ref</th>
                <th className="p-3.5">Sanction Stage</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loanApplications.map((loan) => (
                <tr key={loan.id} className="hover:bg-surface-subtle/70 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-primary">{loan.appNumber}</td>
                  <td className="p-3.5 font-bold text-text-main">{loan.customerName}</td>
                  <td className="p-3.5 font-medium text-text-main">{loan.vehicleModel}</td>
                  <td className="p-3.5 font-semibold text-text-muted">{loan.financierName}</td>
                  <td className="p-3.5 tabular-nums font-bold text-text-main">
                    {formatMoney(loan.loanAmountPaise)}
                  </td>
                  <td className="p-3.5 text-text-muted">
                    {loan.tenureMonths} Mos @ {loan.interestRatePercent}%
                  </td>
                  <td className="p-3.5 font-mono text-text-muted">
                    {loan.disbursementRef || 'Pending Release'}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge status={loan.stage} />
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toast.success(`Pushed sanction letter for ${loan.appNumber}`)}
                    >
                      Sanction Letter
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
