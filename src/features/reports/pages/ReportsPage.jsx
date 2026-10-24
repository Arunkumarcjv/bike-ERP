import React, { useState } from 'react';
import { useAppStore } from '../../../store';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { exportToExcel } from '../../../lib/download';
import { exportToCsv } from '../../../lib/csv';
import { formatMoney } from '../../../lib/format';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  Award,
  Users,
  Wrench,
  Bike,
} from 'lucide-react';
import { toast } from 'sonner';

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState('SALES_LEADERBOARD');
  const invoices = useAppStore((state) => state.invoices || []);
  const customers = useAppStore((state) => state.customers || []);

  const leaderboard = [
    { rank: 1, name: 'Deepak Rao', unitsSold: 14, revenuePaise: 2980000000, conversionRate: '42%' },
    { rank: 2, name: 'Vikram Sethi', unitsSold: 12, revenuePaise: 3890000000, conversionRate: '48%' },
    { rank: 3, name: 'Pooja Hegde', unitsSold: 9, revenuePaise: 1840000000, conversionRate: '36%' },
  ];

  const modelMargins = [
    { model: 'Royal Enfield Hunter 350', unitsSold: 18, avgMarginPercent: '18.4%', totalGrossMarginPaise: 54000000 },
    { model: 'Royal Enfield Himalayan 450', unitsSold: 9, avgMarginPercent: '24.2%', totalGrossMarginPaise: 68000000 },
    { model: 'Honda Activa 125', unitsSold: 24, avgMarginPercent: '14.8%', totalGrossMarginPaise: 31000000 },
    { model: 'TVS iQube EV', unitsSold: 11, avgMarginPercent: '19.5%', totalGrossMarginPaise: 26000000 },
  ];

  const handleExportXlsx = () => {
    exportToExcel(leaderboard, 'ExecutiveLeaderboard', 'Vennila_Sales_Report_FY2627.xlsx');
    toast.success('Downloaded Executive Excel BI report (Vennila_Sales_Report_FY2627.xlsx)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main">Executive BI, Performance Reports & Analytics</h1>
          <p className="text-xs text-text-muted mt-0.5">
            Cross-department margins, salesperson leaderboards, bay revenue yield and Excel export suite
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Printer}
            onClick={() => window.print()}
          >
            Print Executive Summary
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={FileSpreadsheet}
            onClick={handleExportXlsx}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex border-b border-border space-x-2">
        {[
          { id: 'SALES_LEADERBOARD', label: 'Salesperson Leaderboard' },
          { id: 'MODEL_MARGINS', label: 'Model-wise Gross Margins' },
          { id: 'BAY_REVENUE', label: 'Service Revenue per Bay' },
          { id: 'CUSTOMER_LTV', label: 'Customer Lifetime Value (LTV)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-4 py-2 font-semibold text-xs border-b-2 transition-colors ${
              activeReport === tab.id
                ? 'border-primary text-primary bg-primary/5 rounded-t'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Sales Leaderboard */}
      {activeReport === 'SALES_LEADERBOARD' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Rank</th>
                  <th className="p-3.5">Sales Executive</th>
                  <th className="p-3.5">Vehicles Delivered</th>
                  <th className="p-3.5">Invoiced Turnover</th>
                  <th className="p-3.5">Lead Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {leaderboard.map((lead) => (
                  <tr key={lead.rank} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                        #{lead.rank}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-text-main">{lead.name}</td>
                    <td className="p-3.5 font-bold text-text-main tabular-nums">{lead.unitsSold} Units</td>
                    <td className="p-3.5 tabular-nums font-bold text-primary">
                      {formatMoney(lead.revenuePaise)}
                    </td>
                    <td className="p-3.5 font-semibold text-status-green">{lead.conversionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 2: Model Margins */}
      {activeReport === 'MODEL_MARGINS' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-subtle border-b border-border text-text-muted font-semibold uppercase text-[11px]">
                  <th className="p-3.5">Vehicle Model</th>
                  <th className="p-3.5">Delivered Units</th>
                  <th className="p-3.5">Average Margin %</th>
                  <th className="p-3.5 text-right">Cumulative Gross Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {modelMargins.map((m) => (
                  <tr key={m.model} className="hover:bg-surface-subtle/70 transition-colors">
                    <td className="p-3.5 font-bold text-text-main">{m.model}</td>
                    <td className="p-3.5 font-bold text-text-main tabular-nums">{m.unitsSold} Units</td>
                    <td className="p-3.5 font-bold text-status-green">{m.avgMarginPercent}</td>
                    <td className="p-3.5 text-right font-bold tabular-nums text-primary">
                      {formatMoney(m.totalGrossMarginPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Fallback */}
      {['BAY_REVENUE', 'CUSTOMER_LTV'].includes(activeReport) && (
        <Card className="p-8 text-center text-xs text-text-muted">
          Detailed metrics compiled across {customers.length} customer records and {invoices.length} billing logs.
        </Card>
      )}
    </div>
  );
}
